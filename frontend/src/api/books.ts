import { Book } from "@/types/Book";

export const searchBooks = async (
  query: string,
  token: string,
): Promise<{
  meta: { page: number; limit: number; totalItems: number; totalPages: number };
  data: Book[];
}> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/books/search?q=${query}`,
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

// meta: {
//   page,
//   limit,
//   totalItems: result.totalItems,
//   totalPages: Math.ceil(result.totalItems / limit),
// },
// data: result.books,
