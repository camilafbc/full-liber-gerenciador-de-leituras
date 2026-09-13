export type LibraryInfo = {
  id: number;
  bookUuid: string;
  status: "WANT_TO_READ" | "READING" | "COMPLETED" | "DROPPED";
  currentPage: number;
  updatedAt: string;
};

export type BookReview = {
  rating: number;
  comment: string | null;
  createdAt: string;
};

export type Book = {
  id: number;
  uuid: string;
  externalId: string;
  title: string;
  subtitle?: string;
  authors: string[];
  publishedDate: string;
  description: string;
  pageCount?: string;
  publisher?: string;
  categories: string[];
  imageUrl?: string;
  isbn13?: string;
  isbn10?: string;
  libraryInfo?: LibraryInfo | null;
  review?: BookReview | null;
};
