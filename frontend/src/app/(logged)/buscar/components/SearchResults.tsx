"use client";

import { searchBooks } from "@/api/books";
import { BookCard } from "@/components/BookCard";
import { EmptyState } from "@/components/EmptyState";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthContext } from "@/context/authContext";
import { Book } from "@/types/Book";
import { AlertCircle, BookOpen, Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { BookDetailsSheet } from "./BookDetailsSheet";
import { getCleanBookCover } from "@/utils/cleanBookCover";
import { useRouter, useSearchParams } from "next/navigation";
import Pagination from "@/components/Pagination";

interface SearchResultProps {
  query: string;
}

export const SearchResults = ({ query }: SearchResultProps) => {
  const { token, loading: authLoading } = useAuthContext();

  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = searchParams.get("page") ?? "1";
  const page = parseInt(currentPage);

  const [books, setBooks] = useState<Book[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    if (authLoading || !query) return;

    const fetchBooks = async () => {
      try {
        setLoading(true);

        const result = await searchBooks(query, page, 10, token ?? "");
        if (!result?.data) return;

        setBooks(result.data);
        if (result.meta?.totalItems) {
          setTotalItems((prevTotal) => {
            if (page === 1 || !prevTotal) {
              const calculatedTotalPages = Math.ceil(
                result.meta.totalItems / 10,
              );
              setTotalPages(calculatedTotalPages);
              return result.meta.totalItems;
            }
            return prevTotal;
          });
        }
      } catch (error) {
        console.error("Erro ao buscar livros: ", error);
        setError("Erro ao buscar livros");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [page, query, token]);

  const handleNextPage = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (page < totalPages) {
      const nextPage = page + 1;
      params.set("page", nextPage.toString());
      router.push(`/buscar?${params.toString()}`);
    }
  };

  const handlePreviousPage = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1 && page <= totalPages) {
      const nextPage = page - 1;
      params.set("page", nextPage.toString());
      router.push(`/buscar?${params.toString()}`);
    }
  };

  const handleFirstPage = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (page !== 1) {
      const nextPage = 1;
      params.set("page", nextPage.toString());
      router.push(`/buscar?${params.toString()}`);
    }
  };

  const handleLastPage = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (page !== totalPages) {
      const nextPage = totalPages;
      params.set("page", nextPage.toString());
      router.push(`/buscar?${params.toString()}`);
    }
  };

  if (!query) {
    return (
      <EmptyState
        icon={Search}
        title="Comece uma busca"
        description="Digite o nome de um livro ou autor no campo acima para ver os resultados."
      />
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-accent" />
          Buscando livros...
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>Busca indisponível</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (books.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Nenhum resultado"
        description={`Não encontramos livros para "${query}". Tente outro termo ou verifique a ortografia.`}
      />
    );
  }

  return (
    <>
      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <p className="text-sm text-muted-foreground col-span-full">
          {totalItems} {totalItems === 1 ? "resultado" : "resultados"} para{" "}
          <span className="font-semibold text-foreground">
            &quot;{query}&quot;
          </span>
        </p>

        {books.map((book, index) => (
          <BookCard
            key={index + "-" + book.externalId}
            index={index}
            externalId={book.externalId}
            title={book?.title}
            author={book?.authors}
            pages={book?.pageCount || 0}
            description={book?.description}
            coverUrl={getCleanBookCover(book?.imageUrl)}
            variant="list"
            onClick={(event) => {
              event.preventDefault();
              setSelectedBook(book);
            }}
          />
        ))}
        <BookDetailsSheet
          book={selectedBook}
          open={selectedBook !== null}
          onOpenChange={(open) => {
            if (!open) setSelectedBook(null);
          }}
          onUpdated={(updatedBook) => {
            setSelectedBook(updatedBook);
            setBooks((currentBooks) =>
              currentBooks.map((item) =>
                item.externalId === updatedBook.externalId ? updatedBook : item,
              ),
            );
          }}
        />
      </div>
      <div className="flex items-center justify-center mt-6">
        <Pagination
          currentPage={+currentPage}
          totalPages={totalPages}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
          onFirstPage={handleFirstPage}
          onLastPage={handleLastPage}
        />
      </div>
    </>
  );
};
