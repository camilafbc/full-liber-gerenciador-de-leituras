import { Book } from "@/types/Book";

export const searchBooks = async (
  query: string,
  page: number,
  limit: number,
  token: string,
): Promise<{
  meta: { page: number; limit: number; totalItems: number; totalPages: number };
  data: Book[];
}> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/books/search?q=${query}&limit=${limit}&page=${page}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );
  const books = await response.json();

  return books;
};

export const getBook = async (externalId: string, token: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/books/search/${externalId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );
  const book = await response.json();

  return book;
};
