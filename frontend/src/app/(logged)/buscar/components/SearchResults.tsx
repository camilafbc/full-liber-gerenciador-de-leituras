"use client";

import { searchBooks } from "@/api/books";
import { BookCard } from "@/components/BookCard";
import { EmptyState } from "@/components/EmptyState";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthContext } from "@/context/authContext";
import { Book } from "@/types/Book";
import { AlertCircle, BookOpen, Loader2, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { BookDetailsSheet } from "./BookDetailsSheet";

interface SearchResultProps {
  query: string;
}

export const SearchResults = ({ query }: SearchResultProps) => {
  const { token } = useAuthContext();

  const [books, setBooks] = useState<Book[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Guarda a página atual SEM causar re-render (evita loop com o observer)
  const pageRef = useRef(1);
  const observerTarget = useRef<HTMLDivElement>(null);

  // ─── 1. Reset sempre que a query mudar ───────────────────────────────────
  useEffect(() => {
    setBooks([]);
    setTotalItems(0);
    setTotalPages(1);
    setHasMore(false);
    setError(null);
    pageRef.current = 1;
  }, [query]);

  // ─── 2. Função de fetch reutilizável ────────────────────────────────────
  const fetchPage = useCallback(
    async (pageToFetch: number) => {
      if (!query) return;

      const isFirstPage = pageToFetch === 1;
      isFirstPage ? setLoading(true) : setLoadingMore(true);

      try {
        const result = await searchBooks(query, pageToFetch, 10, token ?? "");
        if (!result?.data) return;

        setBooks((prev) =>
          isFirstPage ? result.data : [...prev, ...result.data],
        );
        setTotalItems(result.meta.totalItems);
        setTotalPages(result.meta.totalPages);
        setHasMore(pageToFetch < result.meta.totalPages);
      } catch (err) {
        console.error(err);
        setError("Erro ao buscar os livros.");
      } finally {
        isFirstPage ? setLoading(false) : setLoadingMore(false);
      }
    },
    [query, token],
  );

  // ─── 3. Carrega a página 1 sempre que query (ou fetchPage) mudar ────────
  useEffect(() => {
    if (!query) return;
    fetchPage(1);
  }, [query, fetchPage]);

  // ─── 4. Intersection Observer — só incrementa a página e busca ──────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          const nextPage = pageRef.current + 1;
          pageRef.current = nextPage;
          fetchPage(nextPage);
        }
      },
      { threshold: 0.1, rootMargin: "100px" },
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, fetchPage]);

  // ─── Renders ─────────────────────────────────────────────────────────────

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
          coverUrl={book?.imageUrl}
          variant="list"
          onClick={(event) => {
            event.preventDefault();
            setSelectedBook(book);
          }}
        />
      ))}

      {/* Sentinel do observer */}
      <div
        ref={observerTarget}
        className="h-10 flex justify-center items-center col-span-1 md:col-span-2 lg:col-span-3"
      >
        {loadingMore && (
          <div className="flex items-center gap-2 text-muted-foreground py-2">
            <Loader2 className="size-5 animate-spin text-accent" />
            <span className="text-xs">Buscando mais livros...</span>
          </div>
        )}
      </div>
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
  );
};
