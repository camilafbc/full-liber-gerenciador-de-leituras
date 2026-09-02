"use client";

import {
  addBookToLibrary,
  getBook,
  removeBookFromLibrary,
  updateBookStatus,
} from "@/api/books";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuthContext } from "@/context/authContext";
import { Book, ReadingStatus } from "@/types/Book";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
  const [book, setBook] = useState<Book | null>(initialBook);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<z.input<typeof formSchema>, unknown, FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { currentPage: 0, status: "WANT_TO_READ" },
  });

  useEffect(() => {
    setBook(initialBook);
    if (!open || !initialBook || !token) return;

    setLoading(true);
    setError(null);
    getBook(initialBook.externalId, token)
      .then((details) => {
        setBook(details);
        if (details.libraryInfo)
          form.reset({
            currentPage: details.libraryInfo.currentPage,
            status: details.libraryInfo.status,
          });
      })
      .catch(() => setError("Não foi possível carregar os detalhes do livro."))
      .finally(() => setLoading(false));
  }, [initialBook, open, token, form]);

  const updateBook = (updated: Book) => {
    setBook(updated);
    onUpdated(updated);
  };

  const addToLibrary = async () => {
    if (!book || !token) return;
    setSaving(true);
    setError(null);
    try {
      await addBookToLibrary(book, token);
      const details = await getBook(book.externalId, token);
      updateBook(details);
      if (details.libraryInfo)
        form.reset({
          currentPage: details.libraryInfo.currentPage,
          status: details.libraryInfo.status,
        });
    } catch {
      setError("Não foi possível adicionar o livro à biblioteca.");
    } finally {
      setSaving(false);
    }
  };

  const saveChanges = async (values: FormValues) => {
    if (!book?.libraryInfo?.bookUuid || !token) return;
    const pageCount = book.pageCount ?? 0;
    if (values.currentPage > pageCount) {
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
      const details = await getBook(book.externalId, token);
      updateBook(details);
      if (details.libraryInfo)
        form.reset({
          currentPage: details.libraryInfo.currentPage,
          status: details.libraryInfo.status,
        });
    } catch {
      setError("Não foi possível salvar as alterações.");
    } finally {
      setSaving(false);
    }
  };

  const removeFromLibrary = async () => {
    if (!book?.libraryInfo?.bookUuid || !token) return;
    if (!window.confirm("Remover este livro da sua biblioteca?")) return;
    setRemoving(true);
    setError(null);
    try {
      await removeBookFromLibrary(book.libraryInfo.bookUuid, token);
      updateBook({ ...book, libraryInfo: null });
      form.reset({ currentPage: 0, status: "WANT_TO_READ" });
    } catch {
      setError("Não foi possível remover o livro da biblioteca.");
    } finally {
      setRemoving(false);
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
                    {book.isbn10 && (
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          ISBN-10
                        </dt>
                        <dd className="mt-0.5 font-medium">{book.isbn10}</dd>
                      </div>
                    )}
                  </dl>
                  {book.categories?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {book.categories.map((category) => (
                        <Badge
                          key={category}
                          variant="secondary"
                          className="text-xs font-normal"
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                  )}
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
                  <>
                    <div className="flex items-center justify-between">
                      <Badge>{statusLabels[libraryInfo.status]}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {libraryInfo.currentPage}/{pageCount || "?"} páginas
                      </span>
                    </div>
                    <Progress value={progress} />
                    <form
                      onSubmit={form.handleSubmit(saveChanges)}
                      className="flex flex-col gap-4"
                    >
                      <FieldGroup>
                        <Field>
                          <FieldLabel htmlFor="currentPage">
                            Página atual
                          </FieldLabel>
                          <Input
                            id="currentPage"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            min={0}
                            max={pageCount || undefined}
                            {...form.register("currentPage")}
                          />
                          <FieldError
                            errors={[form.formState.errors.currentPage]}
                          />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="status">Status</FieldLabel>
                          <select
                            id="status"
                            className="h-9 rounded-md border bg-background px-3 text-sm"
                            {...form.register("status")}
                          >
                            {Object.entries(statusLabels).map(
                              ([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ),
                            )}
                          </select>
                        </Field>
                      </FieldGroup>
                      <Button type="submit" disabled={saving}>
                        <Save />
                        {saving ? "Salvando..." : "Salvar Alterações"}
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={removeFromLibrary}
                        disabled={removing}
                      >
                        <Trash2 />
                        {removing ? "Removendo..." : "Remover da Biblioteca"}
                      </Button>
                    </form>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
