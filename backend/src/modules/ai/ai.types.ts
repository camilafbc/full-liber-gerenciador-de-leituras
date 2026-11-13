export interface RecommendedBookCard {
  externalId: string;
  title: string;
  authors: string[];
  imageUrl?: string;
  description: string;
  pageCount?: string;
  publishedDate?: string;
  rationale?: string;
}

export interface ChatResponsePayload {
  reply: string;
  recommendedBooks: RecommendedBookCard[];
}

export interface UserReadingContext {
  favorites: Array<{
    title: string;
    authors: string[];
    rating?: number;
    comment?: string | null;
  }>;
  dropped: Array<{
    title: string;
    authors: string[];
  }>;
  alreadyInLibrary: Array<{
    title: string;
    authors: string[];
    status: string;
  }>;
}
