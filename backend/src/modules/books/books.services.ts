import { Book } from "./books.types";

export const searchGoogleBooks = async (
  query: string,
  page: number = 1,
  limit: number = 10,
): Promise<{ totalItems: number; books: Omit<Book, "id">[] }> => {
  const API_KEY = process.env.GOOGLE_BOOKS_KEY as string;

  const startIndex = (page - 1) * limit;

  const URL = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=${limit}&printType=books&key=${API_KEY}`;

  const response = await fetch(URL);

  if (!response.ok) {
    throw new Error("Falha ao buscar livros na API do Google");
  }

  const data = await response.json();

  if (!data) return { totalItems: 0, books: [] };

  const books = data.items.map((item) => ({
    externalId: item.id,
    authors: item.volumeInfo.authors,
    title: item.volumeInfo.title,
    subtitle: item.volumeInfo.subtitle,
    publishedDate: item.volumeInfo.publishedDate,
    description: item.volumeInfo.description,
    pageCount: item.volumeInfo.pageCount,
    categories: item.volumeInfo.categories,
    imageUrl: item.volumeInfo.imageLinks?.thumbnail,
    isbn13: item.volumeInfo.industryIdentifiers?.[1]?.identifier,
  }));

  return { totalItems: data.totalItems || 0, books };
};

export const getBookFromGoogleBooks = async (
  id: string,
): Promise<Omit<Book, "id"> | null> => {
  const API_KEY = process.env.GOOGLE_BOOKS_KEY as string;
  const URL = `https://www.googleapis.com/books/v1/volumes/${id}?key=${API_KEY}`;

  const response = await fetch(URL);

  if (!response.ok) {
    throw new Error("Erro ao buscar livro");
  }

  const data = await response.json();

  if (!data) return null;

  return {
    externalId: data.id,
    authors: data.volumeInfo.authors,
    title: data.volumeInfo.title,
    subtitle: data.volumeInfo.subtitle,
    publishedDate: data.volumeInfo.publishedDate,
    description: data.volumeInfo.description,
    pageCount: data.volumeInfo.pageCount,
    categories: data.volumeInfo.categories,
    imageUrl: data.volumeInfo.imageLinks?.thumbnail,
    isbn13: data.volumeInfo.industryIdentifiers?.[1].identifier,
  };
};
