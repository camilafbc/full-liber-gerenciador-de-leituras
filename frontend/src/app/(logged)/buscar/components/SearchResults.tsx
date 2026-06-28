"use client";

import { searchBooks } from "@/api/books";
import { BookCard } from "@/components/BookCard";
import { useAuthContext } from "@/context/authContext";
import { Book } from "@/types/Book";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

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

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground my-2">
        <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
        <span className="text-sm">Buscando livros...</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-4 w-full">
      {query && (
        <p className="text-sm text-muted-foreground col-span-1 md:col-span-2 lg:col-span-3">
          {totalItems} Resultados encontrados para:{" "}
          <span className="font-semibold text-foreground">
            &quot;{query}&quot;
          </span>
        </p>
      )}

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
        />
      ))}

      {/* Sentinel do observer */}
      <div
        ref={observerTarget}
        className="h-10 flex justify-center items-center col-span-1 md:col-span-2 lg:col-span-3"
      >
        {loadingMore && (
          <div className="flex items-center gap-2 text-muted-foreground py-2">
            <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
            <span className="text-xs">Buscando mais livros...</span>
          </div>
        )}
      </div>
    </div>
  );
};
