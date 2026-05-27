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
  categories: string[];
  imageUrl?: string;
  isbn13?: string;
};
