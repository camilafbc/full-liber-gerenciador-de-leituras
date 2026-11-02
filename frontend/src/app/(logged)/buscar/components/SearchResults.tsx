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
    if (authLoading || !token || !query) return;

    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await searchBooks(query, page, 15, token ?? "");
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
        const msg =
          error instanceof Error ? error.message : "Erro ao buscar livros";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [authLoading, page, query, token]);

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
            <div
              key={i}
              className="flex gap-4 rounded-xl border border-border/60 bg-card p-4"
            >
              <Skeleton className="h-36 w-[110px] shrink-0 rounded-lg" />
              <div className="flex flex-1 flex-col gap-2 pt-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="mt-auto h-3 w-1/3" />
              </div>
            </div>
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
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-full flex items-center justify-between pb-1">
          <p className="text-sm text-muted-foreground">
            {totalItems}{" "}
            {totalItems === 1
              ? "resultado encontrado"
              : "resultados encontrados"}{" "}
            para{" "}
            <span className="font-semibold text-foreground">
              &quot;{query}&quot;
            </span>
          </p>
        </div>

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
