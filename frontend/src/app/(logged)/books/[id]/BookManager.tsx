"use client";

import {
  addBookToLibrary,
  getBook,
  removeBookFromLibrary,
  saveBookReview,
  updateBookStatus,
} from "@/api/books";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAuthContext } from "@/context/authContext";
import { Book, ReadingStatus } from "@/types/Book";
import { getCleanBookCover } from "@/utils/cleanBookCover";
import { formatDate } from "@/utils/formatDatet";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  BookOpen,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  Hash,
  Loader2,
  MessageSquareText,
  Plus,
  Save,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

// ─── Configurações de status ──────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  ReadingStatus,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  WANT_TO_READ: {
    label: "Quero ler",
    icon: Bookmark,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  READING: {
    label: "Lendo",
    icon: BookOpen,
    color: "text-accent",
    bg: "bg-accent/10",
  },
  COMPLETED: {
    label: "Concluído",
    icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  DROPPED: {
    label: "Abandonei",
    icon: XCircle,
    color: "text-muted-foreground",
    bg: "bg-muted",
  },
};

const statusLabels: Record<ReadingStatus, string> = {
  WANT_TO_READ: "Quero ler",
  READING: "Lendo",
  COMPLETED: "Concluído",
  DROPPED: "Abandonei",
};

// ─── Schema do formulário ─────────────────────────────────────────────────────
const formSchema = z.object({
  currentPage: z.coerce.number().int().min(0, "Informe uma página válida"),
  status: z.enum(["WANT_TO_READ", "READING", "COMPLETED", "DROPPED"]),
});
type FormValues = z.infer<typeof formSchema>;

// ─── Componente principal ─────────────────────────────────────────────────────
export function BookManager({ initialBook }: { initialBook: Book }) {
  const { token } = useAuthContext();
  const router = useRouter();
  const [book, setBook] = useState(initialBook);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [rating, setRating] = useState(initialBook.review?.rating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(initialBook.review?.comment ?? "");
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.input<typeof formSchema>, unknown, FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPage: initialBook.libraryInfo?.currentPage ?? 0,
      status: initialBook.libraryInfo?.status ?? "WANT_TO_READ",
    },
  });

  const refresh = async () => {
    if (!token) return;
    const details = await getBook(book.externalId, token);
    setBook(details);
    form.reset({
      currentPage: details.libraryInfo?.currentPage ?? 0,
      status: details.libraryInfo?.status ?? "WANT_TO_READ",
    });
    setRating(details.review?.rating ?? 0);
    setComment(details.review?.comment ?? "");
  };

  const saveChanges = async (values: FormValues) => {
    if (!book.libraryInfo?.bookUuid || !token) return;
    const pageCount = book.pageCount ?? 0;
    if (pageCount > 0 && values.currentPage > pageCount) {
      form.setError("currentPage", {
        message: `A página não pode ultrapassar ${pageCount}.`,
      });
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateBookStatus(
        book.libraryInfo.bookUuid,
        values.status,
        values.currentPage,
        token,
      );
      await refresh();
    } catch {
      setError("Não foi possível salvar as alterações.");
    } finally {
      setSaving(false);
    }
  };

  const saveReview = async () => {
    if (!book.libraryInfo?.bookUuid || !token || rating < 1) {
      setError("Escolha uma nota de 1 a 5 estrelas.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await saveBookReview(book.libraryInfo.bookUuid, rating, comment, token);
      await refresh();
    } catch {
      setError("Não foi possível salvar a avaliação.");
    } finally {
      setSaving(false);
    }
  };

  const addToLibrary = async () => {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      await addBookToLibrary(book, token);
      await refresh();
    } catch {
      setError("Não foi possível adicionar o livro à biblioteca.");
    } finally {
      setSaving(false);
    }
  };

  const removeBook = async () => {
    if (!book.libraryInfo?.bookUuid || !token) return;
    if (!window.confirm("Remover este livro da sua biblioteca?")) return;
    setRemoving(true);
    try {
      await removeBookFromLibrary(book.libraryInfo.bookUuid, token);
      router.push("/biblioteca");
    } catch {
      setError("Não foi possível remover o livro da biblioteca.");
      setRemoving(false);
    }
  };

  const libraryInfo = book.libraryInfo;
  const pageCount = book.pageCount ?? 0;
  const progress =
    libraryInfo && pageCount > 0
      ? Math.min(100, Math.round((libraryInfo.currentPage / pageCount) * 100))
      : 0;

  const statusConfig = libraryInfo ? STATUS_CONFIG[libraryInfo.status] : null;
  const StatusIcon = statusConfig?.icon;
  const coverUrl = getCleanBookCover(book.imageUrl) || book.imageUrl;

  return (
    <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
      {/* Botão Voltar */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => router.back()}
        >
          <ArrowLeft className="size-4" />
          Voltar
        </Button>
      </div>

      {/* Layout: detalhes do livro (8 colunas) + painel de leitura (4 colunas) */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* ── COLUNA ESQUERDA: Dados do livro ── */}
        <article className="flex flex-col gap-8 lg:col-span-8">
          {/* Hero: capa + título + metadados */}
          <section className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card to-accent/10 p-6 shadow-sm sm:p-8">
            {/* Blob decorativo */}
            <div className="pointer-events-none absolute -right-12 -top-12 size-64 rounded-full bg-accent/8 blur-3xl" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
              {/* Capa */}
              <div className="relative mx-auto aspect-2/3 w-44 shrink-0 overflow-hidden rounded-xl bg-muted shadow-lg ring-1 ring-border/40 sm:mx-0 sm:w-52">
                {coverUrl ? (
                  <Image
                    src={coverUrl}
                    alt={`Capa de ${book.title}`}
                    fill
                    sizes="(max-width: 640px) 176px, 208px"
                    priority
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                    <BookOpen className="size-8 opacity-40" />
                    <span className="px-3 text-center text-xs opacity-60">
                      Sem capa
                    </span>
                  </div>
                )}
              </div>

              {/* Informações principais */}
              <div className="flex flex-1 flex-col gap-3 text-center sm:text-left">
                {/* Categorias */}
                {book.categories.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1.5 sm:justify-start">
                    {book.categories.map((category) => (
                      <Badge
                        key={category}
                        variant="secondary"
                        className="text-[11px]"
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Título e subtítulo */}
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                    {book.title}
                  </h1>
                  {book.subtitle && (
                    <p className="mt-1 text-base text-muted-foreground sm:text-lg">
                      {book.subtitle}
                    </p>
                  )}
                </div>

                {/* Autores */}
                {book.authors.length > 0 && (
                  <p className="text-sm font-semibold text-accent sm:text-base">
                    {book.authors.join(", ")}
                  </p>
                )}

                {/* Badge de status da biblioteca */}
                {statusConfig && StatusIcon && (
                  <div className="flex justify-center sm:justify-start">
                    <Badge
                      variant="outline"
                      className={`gap-1.5 border-border/60 py-1 text-xs ${statusConfig.bg}`}
                    >
                      <StatusIcon
                        className={`size-3.5 ${statusConfig.color}`}
                      />
                      <span className={statusConfig.color}>
                        {statusConfig.label}
                      </span>
                    </Badge>
                  </div>
                )}

                {/* Ficha técnica inline */}
                <Separator className="my-1" />
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-left sm:grid-cols-3">
                  {book.publisher && (
                    <div>
                      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
                        Editora
                      </dt>
                      <dd className="mt-0.5 text-xs font-semibold text-foreground">
                        {book.publisher}
                      </dd>
                    </div>
                  )}
                  {book.publishedDate && (
                    <div>
                      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
                        Publicação
                      </dt>
                      <dd className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-foreground">
                        <CalendarDays className="size-3 text-accent" />
                        {formatDate(book.publishedDate)}
                      </dd>
                    </div>
                  )}
                  {pageCount > 0 && (
                    <div>
                      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
                        Páginas
                      </dt>
                      <dd className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-foreground">
                        <BookOpen className="size-3 text-accent" />
                        {pageCount}
                      </dd>
                    </div>
                  )}
                  {book.isbn13 && (
                    <div>
                      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
                        ISBN-13
                      </dt>
                      <dd className="mt-0.5 font-mono text-xs font-semibold text-foreground">
                        {book.isbn13}
                      </dd>
                    </div>
                  )}
                  {book.isbn10 && (
                    <div>
                      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
                        ISBN-10
                      </dt>
                      <dd className="mt-0.5 font-mono text-xs font-semibold text-foreground">
                        {book.isbn10}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </section>

          {/* Sinopse */}
          {book.description && (
            <section className="space-y-3 rounded-xl border border-border/60 bg-card p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Hash className="size-3.5" />
                Sinopse
              </h2>
              <div
                className="prose prose-sm dark:prose-invert max-w-none leading-relaxed text-muted-foreground [&_p]:mb-3"
                dangerouslySetInnerHTML={{ __html: book.description }}
              />
            </section>
          )}
        </article>

        {/* ── COLUNA DIREITA: Painel de leitura (sticky) ── */}
        <aside className="lg:col-span-4 lg:sticky lg:top-6">
          {libraryInfo ? (
            <Card className="overflow-hidden border-border/70 shadow-sm">
              {/* Cabeçalho do painel com gradiente sutil */}
              <CardHeader className="bg-gradient-to-br from-card to-accent/5 border-b border-border/60 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">
                    Minha Leitura
                  </CardTitle>
                  {statusConfig && StatusIcon && (
                    <Badge
                      variant="outline"
                      className={`gap-1.5 border-border/60 py-0.5 text-[11px] ${statusConfig.bg}`}
                    >
                      <StatusIcon className={`size-3 ${statusConfig.color}`} />
                      <span className={statusConfig.color}>
                        {statusConfig.label}
                      </span>
                    </Badge>
                  )}
                </div>

                {/* Barra de progresso */}
                {pageCount > 0 && (
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        Pág. {libraryInfo.currentPage} de {pageCount}
                      </span>
                      <span className="font-semibold text-accent">
                        {progress}%
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </CardHeader>

              <CardContent className="flex flex-col gap-5 p-5">
                {/* Formulário de atualização */}
                <form
                  onSubmit={form.handleSubmit(saveChanges)}
                  className="space-y-4"
                >
                  <Field>
                    <FieldLabel
                      htmlFor="currentPage"
                      className="text-xs font-medium"
                    >
                      Página atual
                    </FieldLabel>
                    <Input
                      id="currentPage"
                      type="number"
                      min={0}
                      max={pageCount || undefined}
                      className="mt-1"
                      {...form.register("currentPage")}
                    />
                    <FieldError errors={[form.formState.errors.currentPage]} />
                  </Field>

                  <Field>
                    <FieldLabel
                      htmlFor="status"
                      className="text-xs font-medium"
                    >
                      Status da leitura
                    </FieldLabel>
                    <Controller
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger id="status" className="mt-1">
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusLabels).map(
                              ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </Field>

                  {error && <p className="text-xs text-destructive">{error}</p>}

                  <Button
                    type="submit"
                    disabled={saving}
                    className="w-full gap-2 bg-accent text-white hover:bg-accent/90"
                  >
                    {saving ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Save className="size-4" />
                    )}
                    {saving ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </form>

                {/* Seção de avaliação — ativa apenas para status COMPLETED */}
                {libraryInfo.status === "COMPLETED" && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <MessageSquareText className="size-3.5" />
                        Avaliação
                      </h3>

                      {/* Estrelas interativas */}
                      <div
                        className="flex gap-1"
                        role="radiogroup"
                        aria-label="Avaliação do livro"
                      >
                        {Array.from({ length: 5 }, (_, i) => {
                          const value = i + 1;
                          const isActive = value <= (hoverRating || rating);
                          return (
                            <button
                              key={value}
                              type="button"
                              aria-label={`${value} estrela${value > 1 ? "s" : ""}`}
                              onClick={() => setRating(value)}
                              onMouseEnter={() => setHoverRating(value)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="transition-transform hover:scale-110"
                            >
                              <Star
                                className={`size-6 transition-colors ${
                                  isActive
                                    ? "fill-accent text-accent"
                                    : "text-muted-foreground/30"
                                }`}
                              />
                            </button>
                          );
                        })}
                        {rating > 0 && (
                          <span className="ml-1 self-center text-xs text-muted-foreground">
                            {rating}/5
                          </span>
                        )}
                      </div>

                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                        maxLength={5000}
                        placeholder="Escreva sua opinião rápida sobre o livro..."
                        className="min-h-20 resize-none text-xs"
                      />

                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="w-full gap-2 text-xs"
                        onClick={saveReview}
                        disabled={saving}
                      >
                        {saving ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Save className="size-3.5" />
                        )}
                        {saving ? "Gravando..." : "Salvar Avaliação"}
                      </Button>
                    </div>
                  </>
                )}

                {/* Remover da biblioteca */}
                <Separator />
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full gap-2 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  onClick={removeBook}
                  disabled={removing}
                >
                  {removing ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="size-3.5" />
                  )}
                  {removing ? "Removendo..." : "Remover da Biblioteca"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* Livro fora da biblioteca */
            <Card className="flex flex-col items-center justify-center gap-4 border-dashed bg-card p-8 text-center shadow-xs">
              <div className="flex size-14 items-center justify-center rounded-full bg-accent/10">
                <BookOpen className="size-7 text-accent" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">
                  Ainda não está na sua biblioteca
                </h3>
                <p className="text-xs text-muted-foreground">
                  Adicione para registrar seu progresso, anotar a página atual e
                  avaliar quando terminar.
                </p>
              </div>
              <Button
                onClick={addToLibrary}
                disabled={saving}
                className="mt-1 w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}
                {saving ? "Adicionando..." : "Adicionar à Minha Biblioteca"}
              </Button>
            </Card>
          )}
        </aside>
      </div>
    </main>
  );
}
