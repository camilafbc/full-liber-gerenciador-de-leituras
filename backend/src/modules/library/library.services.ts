import { Book } from "../../types/Book";
import { prisma } from "../../libs/prisma";
import { ReadingStatus } from "./library.types";
import { addBookData } from "../books/books.services";
import { getUserByUuid } from "../users/users.services";

export const listBooks = async (
  userUuid: string,
  page: number = 1,
  limit: number = 10,
  status?: ReadingStatus,
) => {
  const user = await prisma.user.findUnique({ where: { uuid: userUuid } });

  if (!user) {
    throw new Error("Usuário não encontrado.");
  }

  const skip = (page - 1) * limit;

  let filters: { userId: number; status?: ReadingStatus; active: boolean } = {
    userId: user?.id,
    active: true,
  };

  if (status) {
    filters.status = status;
  }

  const books = await prisma.library.findMany({
    where: filters,
    include: {
      book: {
        include: {
          reviews: {
            where: { userId: user.id },
            select: {
              rating: true,
              comment: true,
              createdAt: true,
            },
          },
        },
      },
    },
    omit: {
      id: true,
      bookId: true,
      userId: true,
      active: true,
    },
    skip,
    take: limit,
    orderBy: {
      id: "desc",
    },
  });

  const totalCount = await prisma.library.count({
    where: { userId: user.id, status, active: true },
  });

  const totalPages = Math.ceil(totalCount / limit);

  return {
    totalItems: totalCount,
    totalPages,
    currentPage: page,
    limit,
    books: books.map(({ book, ...libraryItem }) => ({
      ...libraryItem,
      book: {
        ...book,
        review: book.reviews[0]
          ? {
              rating: book.reviews[0].rating,
              comment: book.reviews[0].comment,
              createdAt: book.reviews[0].createdAt.toISOString(),
            }
          : null,
        reviews: undefined,
      },
    })),
  };
};

export const addBook = async (userUuid: string, data: Book) => {
  const book = await addBookData(data);
  const user = await getUserByUuid(userUuid);

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  return prisma.library.upsert({
    where: {
      userId_bookId: {
        userId: user?.id,
        bookId: book.id,
      },
    },
    create: {
      userId: user?.id,
      bookId: book.id,
      status: "WANT_TO_READ",
    },
    update: { active: true },
    include: {
      book: true,
    },
    omit: {
      userId: true,
      bookId: true,
      id: true,
    },
  });
};

export const deleteBook = async (userUuid: string, bookUuid: string) => {
  const user = await getUserByUuid(userUuid);
  const book = await prisma.book.findUnique({ where: { uuid: bookUuid } });

  if (!user) {
    throw new Error("Usuário não encontrado no sistema.");
  }

  if (!book) {
    throw new Error("Livro não encontrado no catálogo global.");
  }

  const libraryItem = await prisma.library.findFirst({
    where: {
      userId: user.id,
      bookId: book.id,
      active: true,
    },
  });

  if (!libraryItem) {
    throw new Error("Este livro não foi encontrado na biblioteca do usuário.");
  }

  return prisma.library.update({
    where: { id: libraryItem.id },
    data: { active: false },
  });
};

export const updateBookStatus = async (
  userUuid: string,
  bookUuid: string,
  status: ReadingStatus,
  currentPage?: number,
) => {
  const user = await getUserByUuid(userUuid);

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  const book = await prisma.book.findUnique({ where: { uuid: bookUuid } });

  if (!book) {
    throw new Error("Livro não encontrado");
  }

  const currentLibraryItem = await prisma.library.findFirst({
    where: {
      userId: user.id,
      bookId: book.id,
      active: true,
    },
    include: { book: true },
  });

  if (!currentLibraryItem) {
    throw new Error("Este livro não está na biblioteca do usuário");
  }

  const pageCount = currentLibraryItem.book.pageCount;
  const currentPageUpdate =
    status === "COMPLETED"
      ? pageCount
      : (currentPage ?? currentLibraryItem.currentPage);

  if (pageCount > 0 && currentPageUpdate > pageCount) {
    throw new Error("A página atual não pode ultrapassar o total de páginas");
  }

  const reachesEnd = pageCount > 0 && currentPageUpdate >= pageCount;
  const nextStatus = reachesEnd ? "COMPLETED" : status;
  const finishedAt = nextStatus === "COMPLETED" ? new Date() : null;

  return prisma.$transaction(async (tx) => {
    if (
      currentPageUpdate !== undefined &&
      currentPageUpdate > currentLibraryItem.currentPage
    ) {
      await tx.readingProgress.create({
        data: {
          libraryId: currentLibraryItem.id,
          pagesRead: currentPageUpdate - currentLibraryItem.currentPage,
          currentPage: currentPageUpdate,
        },
      });
    }

    return tx.library.update({
      where: { id: currentLibraryItem.id },
      data: {
        status: nextStatus,
        finishedAt,
        currentPage: currentPageUpdate,
      },
    });
  });
};

export const saveReview = async (
  userUuid: string,
  bookUuid: string,
  rating: number,
  comment?: string | null,
) => {
  const user = await getUserByUuid(userUuid);

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  const book = await prisma.book.findUnique({ where: { uuid: bookUuid } });

  if (!book) {
    throw new Error("Livro não encontrado");
  }

  const libraryItem = await prisma.library.findFirst({
    where: { userId: user.id, bookId: book.id, active: true },
  });

  if (!libraryItem) {
    throw new Error("Este livro não está na biblioteca do usuário");
  }

  if (libraryItem.status !== "COMPLETED") {
    throw new Error("A avaliação só pode ser feita após concluir o livro");
  }

  return prisma.review.upsert({
    where: { userId_bookId: { userId: user.id, bookId: book.id } },
    create: {
      userId: user.id,
      bookId: book.id,
      rating,
      comment: comment || null,
    },
    update: { rating, comment: comment || null },
    select: { rating: true, comment: true, createdAt: true },
  });
};

export const getLibraryItem = async (userUuid: string, bookUuid: string) => {
  const user = await getUserByUuid(userUuid);
  const book = await prisma.book.findUnique({ where: { uuid: bookUuid } });

  if (!user) {
    throw new Error("Usuário não encontrado no sistema.");
  }

  if (!book) {
    throw new Error("Livro não encontrado.");
  }

  const libraryItem = await prisma.library.findFirst({
    where: {
      userId: user.id,
      bookId: book.id,
      active: true,
    },
    include: {
      book: true,
    },
    omit: {
      id: true,
      bookId: true,
      userId: true,
      active: true,
    },
  });

  return libraryItem;
};
