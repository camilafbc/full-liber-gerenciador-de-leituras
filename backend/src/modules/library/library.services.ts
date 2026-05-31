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

  let filters: { userId: number; status?: ReadingStatus } = {
    userId: user?.id,
  };

  if (status) {
    filters.status = status;
  }

  const books = await prisma.library.findMany({
    where: filters,
    include: {
      book: true,
    },
    omit: {
      id: true,
      bookId: true,
      userId: true,
    },
    skip,
    take: limit,
    orderBy: {
      id: "desc",
    },
  });

  const totalCount = await prisma.library.count({
    where: { userId: user.id, status },
  });

  const totalPages = Math.ceil(totalCount / limit);

  return {
    totalItems: totalCount,
    totalPages,
    currentPage: page,
    limit,
    books,
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
    update: {},
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

  const libraryItem = await prisma.library.findUnique({
    where: {
      userId_bookId: { userId: user.id, bookId: book.id },
    },
  });

  if (!libraryItem) {
    throw new Error("Este livro não foi encontrado na biblioteca do usuário.");
  }

  return prisma.library.delete({
    where: { id: libraryItem.id },
  });
};

export const updateBookStatus = async (
  userUuid: string,
  bookId: number,
  status: ReadingStatus,
) => {
  let finishedAt: Date | null = null;
  let currentPageUpdate: number | undefined = undefined;

  const user = await getUserByUuid(userUuid);

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  const currentLibraryItem = await prisma.library.findUnique({
    where: {
      userId_bookId: { userId: user.id, bookId },
    },
    include: { book: true },
  });

  if (!currentLibraryItem) {
    throw new Error("Este livro não está na biblioteca do usuário");
  }

  if (status === "COMPLETED") {
    finishedAt = new Date();
    currentPageUpdate = currentLibraryItem.book.pageCount;
  }

  return prisma.library.update({
    where: { userId_bookId: { userId: user.id, bookId } },
    data: {
      status,
      finishedAt,
      currentPage: currentPageUpdate,
    },
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

  const libraryItem = await prisma.library.findUnique({
    where: {
      userId_bookId: { userId: user.id, bookId: book.id },
    },
    include: {
      book: true,
    },
    omit: {
      id: true,
      bookId: true,
      userId: true,
    },
  });

  return libraryItem;
};
