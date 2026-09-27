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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuthContext } from "@/context/authContext";
import { Book, ReadingStatus } from "@/types/Book";
import { formatDate } from "@/utils/formatDatet";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  BookOpen,
  Loader2,
  Plus,
  Save,
  Star,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const statusLabels: Record<ReadingStatus, string> = {
  WANT_TO_READ: "Quero ler",
  READING: "Lendo",
  COMPLETED: "Concluído",
  DROPPED: "Abandonei",
};

const formSchema = z.object({
  currentPage: z.coerce.number().int().min(0, "Informe uma página válida"),
  status: z.enum(["WANT_TO_READ", "READING", "COMPLETED", "DROPPED"]),
});
type FormValues = z.infer<typeof formSchema>;

export function BookManager({ initialBook }: { initialBook: Book }) {
  const { token } = useAuthContext();
  const router = useRouter();
  const [book, setBook] = useState(initialBook);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [rating, setRating] = useState(initialBook.review?.rating ?? 0);
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
      ? (libraryInfo.currentPage / pageCount) * 100
      : 0;

  return (
    <main className=" w-full  px-4 py-6 sm:px-6 lg:px-8">
      {/* Ação de Retorno */}
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

      {/* Layout 8 colunas (Livro) x 4 colunas (Painel Lateral de Leitura) */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* COLUNA ESQUERDA: Detalhes Completos do Livro (8 Colunas) */}
        <article className="flex flex-col gap-8 lg:col-span-8">
          {/* Bloco Superior: Capa + Apresentação */}
          <section className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
            <div className="relative mx-auto aspect-2/3 w-48 shrink-0 overflow-hidden rounded-xl border bg-muted shadow-md sm:mx-0 sm:w-56">
              {book.imageUrl ? (
                <Image
                  src={book.imageUrl}
                  alt={`Capa de ${book.title}`}
                  fill
                  sizes="(max-width: 640px) 192px, 224px"
                  priority
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  Sem capa
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-3 text-center sm:text-left">
              {book.categories.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1.5 sm:justify-start">
                  {book.categories.map((category) => (
                    <Badge
                      key={category}
                      variant="secondary"
                      className="text-xs"
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              )}

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

              {book.authors.length > 0 && (
                <p className="text-sm font-medium text-primary sm:text-base">
                  {book.authors.join(", ")}
                </p>
              )}

              {/* Destaques Rápidos */}
              {/* <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground sm:justify-start">
                {book.pageCount && <span>{book.pageCount} páginas</span>}
                {book.publisher && <span>• {book.publisher}</span>}
                {book.publishedDate && <span>• {book.publishedDate}</span>}
              </div> */}

              {/* Ficha Técnica Detalhada */}
              <section className="">
                <h2 className="text-base font-semibold tracking-tight text-foreground mb-4">
                  Informações Detalhadas
                </h2>
                <dl className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-3">
                  {book.publisher && (
                    <div>
                      <dt className="text-muted-foreground">Editora</dt>
                      <dd className="mt-0.5 font-medium text-foreground">
                        {book.publisher}
                      </dd>
                    </div>
                  )}
                  {book.publishedDate && (
                    <div>
                      <dt className="text-muted-foreground">
                        Data de Publicação
                      </dt>
                      <dd className="mt-0.5 font-medium text-foreground">
                        {formatDate(book.publishedDate)}
                      </dd>
                    </div>
                  )}
                  {book.pageCount && (
                    <div>
                      <dt className="text-muted-foreground">
                        Total de Páginas
                      </dt>
                      <dd className="mt-0.5 font-medium text-foreground">
                        {book.pageCount}
                      </dd>
                    </div>
                  )}
                  {book.isbn13 && (
                    <div>
                      <dt className="text-muted-foreground">ISBN-13</dt>
                      <dd className="mt-0.5 font-mono font-medium text-foreground">
                        {book.isbn13}
                      </dd>
                    </div>
                  )}
                  {book.isbn10 && (
                    <div>
                      <dt className="text-muted-foreground">ISBN-10</dt>
                      <dd className="mt-0.5 font-mono font-medium text-foreground">
                        {book.isbn10}
                      </dd>
                    </div>
                  )}
                </dl>
              </section>
            </div>
          </section>

          {/* Sinopse Editorial */}
          {book.description && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Sinopse
              </h2>
              <div
                className="prose prose-sm dark:prose-invert max-w-none leading-relaxed text-muted-foreground [&>p]:mb-3"
                dangerouslySetInnerHTML={{ __html: book.description }}
              />
            </section>
          )}
        </article>

        {/* COLUNA DIREITA: Card Lateral de Leitura (4 Colunas, Sticky) */}
        <aside className="lg:col-span-4 lg:sticky lg:top-6">
          {libraryInfo ? (
            <div className="flex flex-col gap-6 rounded-2xl border bg-card p-6 shadow-sm">
              {/* Cabeçalho do Painel Lateral */}
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    Minha Leitura
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Registro e métricas
                  </p>
                </div>
                <Badge variant="outline" className="px-2.5 py-0.5 font-medium">
                  {statusLabels[libraryInfo.status]}
                </Badge>
              </div>

              {/* Progresso Dinâmico */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Pág. {libraryInfo.currentPage} de {pageCount || "?"}
                  </span>
                  <span className="font-semibold text-primary">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress value={progress} className="h-2.5" />
              </div>

              {/* Formulário de Atualização */}
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
                  <FieldLabel htmlFor="status" className="text-xs font-medium">
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
                  className="w-full gap-2"
                >
                  <Save className="size-4" />
                  {saving ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </form>

              {/* Seção de Avaliação (Ativa ao Concluir) */}
              {libraryInfo.status === "COMPLETED" && (
                <div className="space-y-3 border-t pt-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Avaliação
                    </h3>
                  </div>

                  <div
                    className="flex gap-1"
                    role="radiogroup"
                    aria-label="Avaliação do livro"
                  >
                    {Array.from({ length: 5 }, (_, index) => {
                      const value = index + 1;
                      return (
                        <button
                          key={value}
                          type="button"
                          aria-label={`${value} estrela${value > 1 ? "s" : ""}`}
                          onClick={() => setRating(value)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`size-5 ${
                              value <= rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  <Textarea
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    rows={3}
                    maxLength={5000}
                    placeholder="Escreva sua opinião rápida..."
                    className="min-h-20 resize-none text-xs"
                  />

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="w-full text-xs"
                    onClick={saveReview}
                    disabled={saving}
                  >
                    {saving ? "Gravando..." : "Salvar Avaliação"}
                  </Button>
                </div>
              )}

              {/* Ação Destrutiva */}
              <div className="border-t pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full gap-2 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  onClick={removeBook}
                  disabled={removing}
                >
                  <Trash2 className="size-3.5" />
                  {removing ? "Removendo..." : "Remover da Biblioteca"}
                </Button>
              </div>
            </div>
          ) : (
            /* Caso o livro não pertença à biblioteca */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card p-8 text-center shadow-xs">
              <BookOpen className="size-10 text-muted-foreground/60 mb-3" />
              <h3 className="text-sm font-semibold text-foreground">
                Fora da Biblioteca
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Adicione este livro à sua coleção para registrar seu progresso e
                notas.
              </p>
              <Button
                onClick={addToLibrary}
                className="mt-5 w-full gap-2 text-xs"
              >
                <Plus className="size-4" /> Adicionar à Minha Biblioteca
              </Button>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
