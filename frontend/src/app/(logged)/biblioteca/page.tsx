"use client";

import { getLibraryBooks } from "@/api/books";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthContext } from "@/context/authContext";
import { LibraryBook } from "@/types/Book";
import { BookOpen, Loader2, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

// const statusLabels = {
//   WANT_TO_READ: "Quero ler",
//   READING: "Lendo",
//   COMPLETED: "Concluído",
//   DROPPED: "Abandonei",
// } as const;

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

function LibraryCard({ item }: { item: LibraryBook }) {
  const { book } = item;

  return (
    <Link href={`/book/${book.externalId}`} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden border-border transition-shadow duration-200 group-hover:shadow-md">
        <div className="relative aspect-2/3 w-full max-w-42 overflow-hidden bg-muted mx-auto rounded-md">
          {book.imageUrl ? (
            <Image
              src={book.imageUrl}
              alt={`Capa de ${book.title}`}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 200px"
              className="object-cover transition-transform duration-300 group-hover:scale-105 "
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <BookOpen className="size-8" />
            </div>
          )}
        </div>
        <CardContent className="flex flex-1 flex-col gap-2">
          <div className="flex flex-col items-start justify-between gap-4">
            <h2 className="line-clamp-2 font-semibold leading-tight">
              {book.title}
            </h2>
            {/* <Badge variant="secondary" className="shrink-0 text-[10px]">
              {statusLabels[item.status]}
            </Badge> */}
            <RatingStars rating={book.review?.rating} />
            {/* <Badge variant="secondary" className="shrink-0 text-[10px]">
              {statusLabels[item.status]}
            </Badge> */}
          </div>
          {/* <p className="line-clamp-1 text-sm text-muted-foreground">
            {book.authors?.join(", ") || "Autor desconhecido"}
          </p> */}
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
      <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Carregando sua biblioteca...
      </div>
    );
  }

  if (error) return <p className="text-sm text-destructive">{error}</p>;

  return (
    <section className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Seus livros salvos para acompanhar
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Minha biblioteca
        </h1>
      </div>

      {books.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center">
          <BookOpen className="size-8 text-muted-foreground" />
          <div>
            <h2 className="font-medium">Sua biblioteca está vazia</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Busque um livro para começar sua coleção.
            </p>
          </div>
        </div>
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
