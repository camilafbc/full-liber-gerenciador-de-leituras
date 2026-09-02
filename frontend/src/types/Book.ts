export type ReadingStatus =
  | "WANT_TO_READ"
  | "READING"
  | "COMPLETED"
  | "DROPPED";

export type LibraryInfo = {
  id: number;
  bookUuid: string;
  status: ReadingStatus;
  currentPage: number;
  updatedAt: string;
};

export type Book = {
  id: number;
  uuid?: string;
  externalId: string;
  title: string;
  subtitle: string;
  authors: string[];
  publishedDate: string;
  description: string;
  pageCount?: number;
  publisher?: string;
  categories: string[];
  imageUrl?: string;
  isbn13?: string;
  isbn10?: string;
  libraryInfo?: LibraryInfo | null;
};
