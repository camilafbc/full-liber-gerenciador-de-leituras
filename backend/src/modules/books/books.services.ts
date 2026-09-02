import { googleBooksGateway } from "../../gateway/googleBooks.gateway";
import { prisma } from "../../libs/prisma";
import { Book } from "../../types/Book";
import { getUserByUuid } from "../users/users.services";

export const searchGoogleBooks = async (
  query: string,
  page: number = 1,
  limit: number = 10,
): Promise<{ totalItems: number; books: Omit<Book, "id" | "uuid">[] }> => {
  const response = await googleBooksGateway.searchBooks(query, page, limit);

  return { totalItems: response.totalItems || 0, books: response.books };
};

export const getBookFromGoogleBooks = async (
  id: string,
  userUuid: string,
): Promise<Omit<Book, "id" | "uuid"> | null> => {
  const book = await googleBooksGateway.getBookId(id);

  if (!book) return null;

  const user = await getUserByUuid(userUuid);

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  const storedBook = await prisma.book.findUnique({
    where: { externalId: id },
    select: { id: true, uuid: true },
  });

  const library = storedBook
    ? await prisma.library.findUnique({
        where: {
          userId_bookId: { userId: user.id, bookId: storedBook.id },
        },
        select: {
          id: true,
          book: { select: { uuid: true } },
          active: true,
          status: true,
          currentPage: true,
          updatedAt: true,
        },
      })
    : null;

  return {
    ...book,
    libraryInfo: library?.active
      ? {
          id: library.id,
          bookUuid: library.book.uuid,
          status: library.status,
          currentPage: library.currentPage,
          updatedAt: library.updatedAt.toISOString(),
        }
      : null,
  };
};

export const addBookData = async (data: Book) => {
  const book = await prisma.book.upsert({
    where: { externalId: data.externalId },
    create: {
      externalId: data.externalId,
      title: data.title,
      subtitle: data.subtitle || null,
      authors: data.authors,
      publishedDate: data.publishedDate || null,
      description: data.description,
      pageCount: data.pageCount ? Number(data.pageCount) : 0,
      categories: data.categories,
      imageUrl: data.imageUrl || null,
      isbn13: data.isbn13 || null,
    },
    update: {},
  });

  return book;
};
