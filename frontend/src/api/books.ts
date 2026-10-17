import { Book, LibraryBook, ReadingStatus } from "@/types/Book";
import { apiFetchClient } from "./client";

export const searchBooks = async (
  query: string,
  page: number,
  limit: number,
  token: string,
): Promise<{
  meta: { page: number; limit: number; totalItems: number; totalPages: number };
  data: Book[];
}> => {
  const sanitizedQuery = query.replace(/^\?q=/, "").trim();
  const response = await apiFetchClient(
    `/books/search?q=${encodeURIComponent(sanitizedQuery)}&limit=${limit}&page=${page}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.error || `Falha ao buscar livros (Status ${response.status})`,
    );
  }

  return response.json();
};

export const getLibraryBooks = async (
  token: string,
  page = 1,
  limit = 50,
): Promise<{
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  books: LibraryBook[];
}> => {
  const response = await apiFetchClient(
    `/library/list?page=${page}&limit=${limit}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!response.ok) throw new Error("Falha ao carregar a biblioteca");
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

export const saveBookReview = async (
  bookUuid: string,
  rating: number,
  comment: string,
  token: string,
) => {
  const response = await apiFetchClient(`/library/book/${bookUuid}/review`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ rating, comment: comment || null }),
  });

  if (!response.ok) throw new Error("Falha ao salvar a avaliação");
  return response.json();
};
