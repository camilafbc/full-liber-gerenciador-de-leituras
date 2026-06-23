export type Book = {
  id: number;
  externalId: string;
  title: string;
  subtitle: string;
  authors: string[];
  publishedDate: string;
  description: string;
  pageCount?: number;
  categories: string[];
  imageUrl?: string;
  isbn13?: string;
};
