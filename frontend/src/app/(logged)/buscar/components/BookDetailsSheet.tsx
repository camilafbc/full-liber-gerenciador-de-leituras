"use client";

import { addBookToLibrary, getBook } from "@/api/books";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuthContext } from "@/context/authContext";
import { Book, ReadingStatus } from "@/types/Book";
import { formatDate } from "@/utils/formatDatet";
import { getCleanBookCover } from "@/utils/cleanBookCover";
import {
  AlertCircle,
  BookOpen,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  FileText,
  Hash,
  Loader2,
  Plus,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Configuração centralizada de status, igual à usada na Biblioteca
const STATUS_CONFIG: Record<
  ReadingStatus,
  { label: string; icon: React.ElementType; color: string }
> = {
  WANT_TO_READ: {
    label: "Quero ler",
    icon: Bookmark,
    color: "text-blue-500",
  },
  READING: {
    label: "Lendo",
    icon: BookOpen,
    color: "text-accent",
  },
  COMPLETED: {
    label: "Concluído",
    icon: CheckCircle2,
    color: "text-green-500",
  },
  DROPPED: {
    label: "Abandonei",
    icon: XCircle,
    color: "text-muted-foreground",
  },
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
  const [prevInitialBook, setPrevInitialBook] = useState<Book | null>(
    initialBook,
  );
  const [book, setBook] = useState<Book | null>(initialBook);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (prevInitialBook !== initialBook) {
    setPrevInitialBook(initialBook);
    setBook(initialBook);
  }

  useEffect(() => {
    if (!open || !initialBook || !token) return;

    let isMounted = true;

    const loadBook = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getBook(initialBook.externalId, token);
        if (isMounted) {
          setBook(data);
        }
      } catch {
        if (isMounted) {
          setError("Não foi possível carregar os detalhes do livro.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadBook();

    return () => {
      isMounted = false;
    };
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
      ? Math.min(100, Math.round((libraryInfo.currentPage / pageCount) * 100))
      : 0;

  const statusConfig = libraryInfo ? STATUS_CONFIG[libraryInfo.status] : null;
  const StatusIcon = statusConfig?.icon;
  const coverUrl = book
    ? getCleanBookCover(book.imageUrl) || book.imageUrl
    : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0 overflow-y-auto p-0 sm:max-w-lg">
        {book && (
          <>
            {/* ── Hero: capa + gradiente ── */}
            <div className="relative overflow-hidden bg-gradient-to-br from-card via-card to-accent/10">
              {/* Blob decorativo de fundo */}
              <div className="pointer-events-none absolute -right-10 -top-10 size-52 rounded-full bg-accent/8 blur-3xl" />

              <SheetHeader className="relative flex flex-row gap-5 p-6 pr-12 sm:pr-14">
                {/* Capa do livro */}
                <div className="relative h-36 w-24 shrink-0 overflow-hidden rounded-xl bg-muted shadow-md ring-1 ring-border/40">
                  {coverUrl ? (
                    <Image
                      src={coverUrl}
                      alt={`Capa de ${book.title}`}
                      fill
                      sizes="96px"
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-1 text-muted-foreground">
                      <BookOpen className="size-6 opacity-40" />
                      <span className="px-2 text-center text-[10px] leading-tight opacity-60">
                        Sem capa
                      </span>
                    </div>
                  )}
                </div>

                {/* Título e autor */}
                <div className="flex min-w-0 flex-col justify-center gap-1">
                  <SheetTitle className="line-clamp-3 text-base font-bold leading-snug sm:text-lg">
                    {book.title}
                  </SheetTitle>
                  <SheetDescription className="line-clamp-2 text-xs text-muted-foreground sm:text-sm">
                    {book.authors?.join(", ") || "Autor desconhecido"}
                  </SheetDescription>

                  {/* Badge de status da biblioteca (se já estiver salvo) */}
                  {statusConfig && StatusIcon && (
                    <div className="mt-2">
                      <Badge
                        variant="secondary"
                        className="gap-1.5 py-0.5 text-xs"
                      >
                        <StatusIcon
                          className={`size-3 ${statusConfig.color}`}
                        />
                        {statusConfig.label}
                      </Badge>
                    </div>
                  )}
                </div>
              </SheetHeader>
            </div>

            <Separator />

            {/* ── Corpo: detalhes ── */}
            {loading ? (
              <div className="flex flex-1 items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin text-accent" />
                Carregando detalhes...
              </div>
            ) : (
              <div className="flex flex-col gap-6 p-6">
                {/* Sinopse */}
                {book.description && (
                  <div className="space-y-2">
                    <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <FileText className="size-3.5" />
                      Sinopse
                    </h3>
                    <div
                      className="text-sm leading-relaxed text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: book.description }}
                    />
                  </div>
                )}

                <Separator />

                {/* Informações técnicas */}
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Hash className="size-3.5" />
                    Informações
                  </h3>
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                    {book.publisher && (
                      <div className="space-y-0.5">
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
                          Editora
                        </dt>
                        <dd className="text-sm font-medium text-foreground">
                          {book.publisher}
                        </dd>
                      </div>
                    )}
                    {book.publishedDate && (
                      <div className="space-y-0.5">
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
                          Publicação
                        </dt>
                        <dd className="flex items-center gap-1 text-sm font-medium text-foreground">
                          <CalendarDays className="size-3 text-accent" />
                          {formatDate(book.publishedDate)}
                        </dd>
                      </div>
                    )}
                    {pageCount > 0 && (
                      <div className="space-y-0.5">
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
                          Páginas
                        </dt>
                        <dd className="flex items-center gap-1 text-sm font-medium text-foreground">
                          <BookOpen className="size-3 text-accent" />
                          {pageCount}
                        </dd>
                      </div>
                    )}
                    {book.isbn13 && (
                      <div className="space-y-0.5">
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
                          ISBN-13
                        </dt>
                        <dd className="font-mono text-sm font-medium text-foreground">
                          {book.isbn13}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Progresso de leitura (se livro já estiver na biblioteca e em leitura) */}
                {libraryInfo &&
                  libraryInfo.status === "READING" &&
                  pageCount > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <BookOpen className="size-3.5" />
                          Progresso de leitura
                        </h3>
                        <div className="space-y-2 rounded-xl border border-border/60 bg-muted/30 p-4">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>
                              Pág. {libraryInfo.currentPage} de {pageCount}
                            </span>
                            <span className="font-semibold text-foreground">
                              {progress}%
                            </span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      </div>
                    </>
                  )}

                {/* Mensagem de erro */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* CTA: adicionar ou acessar */}
                {!libraryInfo ? (
                  <Button
                    onClick={addToLibrary}
                    disabled={saving}
                    className="w-full gap-2 bg-accent text-white hover:bg-accent/90"
                  >
                    {saving ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Plus className="size-4" />
                    )}
                    {saving ? "Adicionando..." : "Adicionar à Minha Biblioteca"}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-accent/40 text-accent hover:bg-accent/10 hover:text-accent"
                    onClick={() => router.push(`/books/${book.externalId}`)}
                  >
                    <BookOpen className="size-4" />
                    Acessar gerenciador de leitura
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
