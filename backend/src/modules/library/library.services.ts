import { Book } from "../../types/Book";
import { prisma } from "../../libs/prisma";
import { ReadingStatus } from "./library.types";
import { addBookData } from "../books/books.services";
import { getUserByUuid } from "../users/users.services";

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
