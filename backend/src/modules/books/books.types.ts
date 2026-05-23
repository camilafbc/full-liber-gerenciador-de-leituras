export interface Book {
  id: number;
  externalId: string;
  title: string;
  subtitle: string;
  authors: string[];
  publishedDate: string;
  description: string;
  pageCount?: string;
  categories: string[];
  imageUrl?: string;
  isbn13?: string;
}
