"use client";

import { getLibraryBooks } from "@/api/books";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthContext } from "@/context/authContext";
import { LibraryBook } from "@/types/Book";
import { AlertCircle, BookOpen, Search, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

function RatingStars({ rating }: { rating?: number }) {
  return (
    <div
      className="flex items-center gap-1"
      aria-label={rating ? `Avaliação: ${rating} de 5` : "Livro sem avaliação"}
    >
      <div className="flex" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            className={
              index < (rating ?? 0)
                ? "size-4 fill-accent text-accent"
                : "size-4 text-muted-foreground/25"
            }
          />
        ))}
      </div>
      {rating ? (
        <span className="text-xs text-muted-foreground">{rating}/5</span>
      ) : (
        <span className="text-xs text-muted-foreground">Sem avaliação</span>
      )}
    </div>
  );
}

function LibraryCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="mx-auto aspect-2/3 w-full max-w-42 rounded-none" />
      <CardContent className="space-y-2 pt-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-16" />
      </CardContent>
    </Card>
  );
}

function LibraryCard({ item }: { item: LibraryBook }) {
  const { book } = item;

  return (
    <Link href={`/books/${book.externalId}`} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden transition-shadow duration-200 hover:shadow-md">
        <div className="relative mx-auto aspect-2/3 w-full max-w-42 overflow-hidden rounded-md bg-muted">
          {book.imageUrl ? (
            <Image
              src={book.imageUrl}
              alt={`Capa de ${book.title}`}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 200px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <BookOpen className="size-8" aria-hidden />
            </div>
          )}
        </div>
        <CardContent className="flex flex-1 flex-col gap-2 pt-4">
          <h2 className="line-clamp-2 font-semibold leading-tight">
            {book.title}
          </h2>
          <RatingStars rating={book.review?.rating} />
        </CardContent>
      </Card>
    </Link>
  );
}

export default function BibliotecaPage() {
  const { token, loading: authLoading } = useAuthContext();
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !token) return;

    setLoading(true);
    getLibraryBooks(token)
      .then((result) => setBooks(result.books))
      .catch(() => setError("Não foi possível carregar sua biblioteca."))
      .finally(() => setLoading(false));
  }, [authLoading, token]);

  if (authLoading || loading) {
    return (
      <section className="flex flex-col gap-6">
        <PageHeader
          description="Seus livros salvos para acompanhar"
          title="Minha biblioteca"
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <LibraryCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex flex-col gap-6">
        <PageHeader title="Minha biblioteca" />
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Erro ao carregar</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        description="Seus livros salvos para acompanhar"
        title="Minha biblioteca"
        actions={
          books.length > 0 ? (
            <span className="text-sm text-muted-foreground">
              {books.length} {books.length === 1 ? "livro" : "livros"}
            </span>
          ) : undefined
        }
      />

      {books.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Sua biblioteca está vazia"
          description="Busque um livro e adicione à coleção para acompanhar sua leitura."
          action={
            <Button asChild>
              <Link href="/buscar">
                <Search className="size-4" />
                Buscar livros
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {books.map((item) => (
            <LibraryCard
              key={item.book.uuid ?? item.book.externalId}
              item={item}
            />
          ))}
        </div>
      )}
    </section>
  );
}
