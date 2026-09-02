import { Book, ReadingStatus } from "@/types/Book";
import { apiFetchClient } from "./client";

// export const searchBooks = async (
//   query: string,
//   page: number,
//   limit: number,
//   token: string,
// ): Promise<{
//   meta: { page: number; limit: number; totalItems: number; totalPages: number };
//   data: Book[];
// }> => {
//   const response = await fetch(
//     `${process.env.NEXT_PUBLIC_API_URL}/books/search?q=${query}&limit=${limit}&page=${page}`,
//     {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     },
//   );
//   const books = await response.json();

//   return books;
// };

export const searchBooks = async (
  query: string,
  page: number,
  limit: number,
  token: string,
): Promise<{
  meta: { page: number; limit: number; totalItems: number; totalPages: number };
  data: Book[];
}> => {
  const response = await apiFetchClient(
    `/books/search?q=${query}&limit=${limit}&page=${page}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) throw new Error("Falha ao buscar livros");

  return response.json();
};

export const getBook = async (
  externalId: string,
  token: string,
): Promise<Book> => {
  const response = await apiFetchClient(`/books/search/${externalId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Falha ao buscar o livro");
  return response.json();
};

export const addBookToLibrary = async (book: Book, token: string) => {
  const response = await apiFetchClient("/library/book", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ book }),
  });

  if (!response.ok) throw new Error("Falha ao adicionar o livro");
  return response.json();
};

export const updateBookStatus = async (
  bookUuid: string,
  status: ReadingStatus,
  currentPage: number,
  token: string,
) => {
  const response = await apiFetchClient(`/library/book/${bookUuid}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status, currentPage }),
  });

  if (!response.ok) throw new Error("Falha ao atualizar o status");
  return response.json();
};

export const removeBookFromLibrary = async (
  bookUuid: string,
  token: string,
) => {
  const response = await apiFetchClient(`/library/book/${bookUuid}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Falha ao remover o livro");
};

// export const getBook = async (
//   externalId: string,
//   token: string,
// ): Promise<Book> => {
//   const response = await fetch(
//     `${process.env.NEXT_PUBLIC_API_URL}/books/search/${externalId}`,
//     {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     },
//   );
//   const book = await response.json();

//   return book;
// };
