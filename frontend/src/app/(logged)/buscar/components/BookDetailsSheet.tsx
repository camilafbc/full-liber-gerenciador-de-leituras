"use client";

import { addBookToLibrary, getBook } from "@/api/books";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuthContext } from "@/context/authContext";
import { Book, ReadingStatus } from "@/types/Book";
import { Loader2, Plus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const statusLabels: Record<ReadingStatus, string> = {
  WANT_TO_READ: "Quero ler",
  READING: "Lendo",
  COMPLETED: "Concluído",
  DROPPED: "Abandonei",
};

interface BookDetailsSheetProps {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (book: Book) => void;
}

export function BookDetailsSheet({
  book: initialBook,
  open,
  onOpenChange,
  onUpdated,
}: BookDetailsSheetProps) {
  const { token } = useAuthContext();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(initialBook);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setBook(initialBook);
    if (!open || !initialBook || !token) return;

    setLoading(true);
    setError(null);
    getBook(initialBook.externalId, token)
      .then(setBook)
      .catch(() => setError("Não foi possível carregar os detalhes do livro."))
      .finally(() => setLoading(false));
  }, [initialBook, open, token]);

  const addToLibrary = async () => {
    if (!book || !token) return;
    setSaving(true);
    setError(null);
    try {
      await addBookToLibrary(book, token);
      const details = await getBook(book.externalId, token);
      onUpdated(details);
      onOpenChange(false);
      router.push(`/books/${book.externalId}`);
    } catch {
      setError("Não foi possível adicionar o livro à biblioteca.");
    } finally {
      setSaving(false);
    }
  };

  const libraryInfo = book?.libraryInfo;
  const pageCount = book?.pageCount ?? 0;
  const progress =
    libraryInfo && pageCount > 0
      ? (libraryInfo.currentPage / pageCount) * 100
      : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-xl">
        {book && (
          <>
            <SheetHeader className="pr-8">
              <div className="relative mx-auto aspect-2/3 w-40 overflow-hidden rounded-md bg-muted sm:mx-0">
                {book.imageUrl ? (
                  <Image
                    src={book.imageUrl}
                    alt={`Capa de ${book.title}`}
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Sem capa
                  </div>
                )}
              </div>
              <SheetTitle>{book.title}</SheetTitle>
              <SheetDescription>
                {book.authors?.join(", ") || "Autor desconhecido"}
              </SheetDescription>
            </SheetHeader>

            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Carregando detalhes...
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {book.description && (
                  <div
                    className="text-sm leading-6 text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: book.description }}
                  />
                )}
                <div className="flex flex-col gap-3 border-y py-4">
                  <h3 className="text-sm font-semibold">
                    Informações do livro
                  </h3>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    {book.publisher && (
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          Editora
                        </dt>
                        <dd className="mt-0.5 font-medium">{book.publisher}</dd>
                      </div>
                    )}
                    {book.publishedDate && (
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          Publicação
                        </dt>
                        <dd className="mt-0.5 font-medium">
                          {book.publishedDate}
                        </dd>
                      </div>
                    )}
                    {pageCount > 0 && (
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          Páginas
                        </dt>
                        <dd className="mt-0.5 font-medium">{pageCount}</dd>
                      </div>
                    )}
                    {book.isbn13 && (
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          ISBN-13
                        </dt>
                        <dd className="mt-0.5 font-medium">{book.isbn13}</dd>
                      </div>
                    )}
                  </dl>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}

                {!libraryInfo ? (
                  <Button
                    onClick={addToLibrary}
                    disabled={saving}
                    className="w-full"
                  >
                    <Plus />
                    {saving ? "Adicionando..." : "Adicionar à Minha Biblioteca"}
                  </Button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <Badge>{statusLabels[libraryInfo.status]}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {libraryInfo.currentPage}/{pageCount || "?"} páginas (
                        {Math.round(progress)}%)
                      </span>
                    </div>
                    <Button
                      onClick={() => router.push(`/books/${book.externalId}`)}
                    >
                      Acessar Gerenciador de Leitura →
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
