import { Book } from "../../types/Book";
import { prisma } from "../../libs/prisma";
import { ReadingStatus } from "./library.types";
import { addBookData } from "../books/books.services";

export const addBook = async (userId: string, data: Book) => {
  const book = await addBookData(data);

  return prisma.library.upsert({
    where: {
      userId_bookId: {
        userId,
        bookId: book.id,
      },
    },
    create: {
      userId,
      bookId: book.id,
      status: "WANT_TO_READ",
    },
    update: {},
  });
};

export const updateBookStatus = async (
  userId: string,
  bookId: number,
  status: ReadingStatus,
) => {
  let finishedAt: Date | null = null;
  let currentPageUpdate: number | undefined = undefined;

  const currentLibraryItem = await prisma.library.findUnique({
    where: {
      userId_bookId: { userId, bookId },
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
    where: { userId_bookId: { userId, bookId } },
    data: {
      status,
      finishedAt,
      currentPage: currentPageUpdate,
    },
  });
};
