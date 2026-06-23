"use client";

import { searchBooks } from "@/api/books";
import { BookCard } from "@/components/BookCard";
import { useAuthContext } from "@/context/authContext";
import { Book } from "@/types/Book";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface SearchResultProps {
  query: string;
}

export const SearchResults = ({ query }: SearchResultProps) => {
  const { token } = useAuthContext();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResult() {
      if (!query) {
        return setBooks([]);
      }

      setLoading(true);
      setError(null);

      try {
        const data = await searchBooks(query, token || "");
        setBooks(data.data);
        console.log("BOOKS: ", data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchResult();
  }, [query, token]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
        <span>Buscando livros...</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (!query) {
    return (
      <p className="text-sm text-muted-foreground">
        Digite algo acima para iniciar a pesquisa.
      </p>
    );
  }

  return (
    <>
      {books &&
        books?.map((book) => (
          <BookCard
            key={book.externalId}
            title={book.title}
            author={"TESTE"}
            pages={book.pageCount || 0}
            description={book.description}
            coverUrl={book.imageUrl}
            variant="list"
          />
        ))}
    </>
  );
};
