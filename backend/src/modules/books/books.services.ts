import { googleBooksGateway } from "../../gateway/googleBooks.gateway";
import { prisma } from "../../libs/prisma";
import { Book } from "../../types/Book";

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
): Promise<Omit<Book, "id" | "uuid"> | null> => {
  const book = await googleBooksGateway.getBookId(id);

  return book;
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
