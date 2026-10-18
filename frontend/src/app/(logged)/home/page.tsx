"use client";

import { getLibraryBooks } from "@/api/books";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthContext } from "@/context/authContext";
import { LibraryBook } from "@/types/Book";
import { getCleanBookCover } from "@/utils/cleanBookCover";
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  BookmarkCheck,
  CheckCircle2,
  Clock,
  Compass,
  Library,
  Plus,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function CurrentlyReadingCard({ item }: { item: LibraryBook }) {
  const { book, currentPage } = item;
  const cleanCover = getCleanBookCover(book.imageUrl);
  const totalPages =
    book.pageCount && book.pageCount > 0 ? book.pageCount : null;
  const progressPercent = totalPages
    ? Math.min(100, Math.round((currentPage / totalPages) * 100))
    : 0;

  return (
    <Link href={`/books/${book.externalId}`} className="group block">
      <Card className="overflow-hidden border border-border/70 bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lg">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
          {/* Capa do Livro */}
          <div className="relative aspect-2/3 w-24 shrink-0 overflow-hidden rounded-md bg-muted shadow-sm ring-1 ring-border/50 sm:w-28">
            {cleanCover ? (
              <Image
                src={cleanCover}
                alt={`Capa de ${book.title}`}
                fill
                sizes="(max-width: 640px) 96px, 112px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-2 text-center text-muted-foreground">
                <BookOpen className="size-6 opacity-40 mb-1" aria-hidden />
                <span className="line-clamp-2 text-[10px] font-medium leading-tight">
                  {book.title}
                </span>
              </div>
            )}
          </div>

          {/* Dados e Progresso */}
          <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="gap-1 border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent dark:text-accent-foreground"
                >
                  <Clock className="size-3" />
                  Em andamento
                </Badge>
                {totalPages && (
                  <span className="text-xs text-muted-foreground">
                    {currentPage} de {totalPages} págs
                  </span>
                )}
              </div>

              <h3
                className="line-clamp-1 text-base font-bold text-foreground transition-colors group-hover:text-accent sm:text-lg"
                title={book.title}
              >
                {book.title}
              </h3>

              {book.authors && book.authors.length > 0 && (
                <p className="line-clamp-1 text-xs text-muted-foreground sm:text-sm">
                  {book.authors.join(", ")}
                </p>
              )}

              {book.publisher && (
                <p className="line-clamp-1 text-xs text-muted-foreground/80">
                  {book.publisher}
                </p>
              )}
            </div>

            {/* Barra de Progresso com estilo em destaque e porcentagem */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-3">
                <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-accent sm:text-sm">
                  {progressPercent}%
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>
                  {totalPages && totalPages - currentPage > 0
                    ? `Faltam ${totalPages - currentPage} páginas para concluir`
                    : "Atualize seu progresso na leitura"}
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-accent hover:underline">
                  Continuar lendo <ArrowRight className="size-3" />
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  accentColor,
}: {
  icon: typeof BookOpen;
  label: string;
  value: number;
  description: string;
  accentColor: string;
}) {
  return (
    <Card className="overflow-hidden border border-border/70 transition-all hover:shadow-md">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            {label}
          </span>
          <div
            className={`flex size-8 items-center justify-center rounded-lg ${accentColor}`}
          >
            <Icon className="size-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {value}
          </span>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  const { loading: authLoading, token } = useAuthContext();
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [loadingBooks, setLoadingBooks] = useState<boolean>(true);

  useEffect(() => {
    if (authLoading || !token) return;

    let isMounted = true;

    getLibraryBooks(token, 1, 100)
      .then((res) => {
        if (isMounted) setBooks(res.books);
      })
      .catch((err) => {
        console.error("Erro ao carregar biblioteca na Home:", err);
      })
      .finally(() => {
        if (isMounted) setLoadingBooks(false);
      });

    return () => {
      isMounted = false;
    };
  }, [authLoading, token]);

  const stats = useMemo(() => {
    const reading = books.filter((b) => b.status === "READING");
    const wantToRead = books.filter((b) => b.status === "WANT_TO_READ");
    const completed = books.filter((b) => b.status === "COMPLETED");
    const totalPagesRead = books.reduce(
      (acc, curr) => acc + (curr.currentPage || 0),
      0,
    );

    return {
      total: books.length,
      reading,
      wantToRead,
      completed,
      totalPagesRead,
    };
  }, [books]);

  // Livros recém-adicionados (últimos 4)
  const recentBooks = useMemo(() => {
    return [...books]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, 4);
  }, [books]);

  if (authLoading || loadingBooks) {
    return (
      <section className="flex flex-col gap-8 pb-8">
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-64" />
        </div>

        {/* Skeleton dos cards de estatísticas */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>

        {/* Skeleton de lendo agora */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-36 w-full rounded-xl" />
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-8 pb-8">
      {/* Header com boas-vindas acolhedora */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          description="Acompanhe o ritmo das suas leituras e descubra novas histórias."
          title="Visão Geral"
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="gap-1.5 shadow-xs"
          >
            <Link href="/biblioteca">
              <Library className="size-4" />
              Ver biblioteca
            </Link>
          </Button>
          <Button
            size="sm"
            asChild
            className="gap-1.5 shadow-xs dark:bg-accent"
          >
            <Link href="/buscar">
              <Plus className="size-4" />
              Adicionar livro
            </Link>
          </Button>
        </div>
      </div>

      {/* Métricas Rápidas / Dashboard */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Lendo agora"
          value={stats.reading.length}
          description="livro(s) em andamento"
          icon={BookOpen}
          accentColor="bg-accent/15 text-accent"
        />
        <StatCard
          label="Quero ler"
          value={stats.wantToRead.length}
          description="na sua lista de desejos"
          icon={BookMarked}
          accentColor="bg-blue-500/15 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          label="Concluídos"
          value={stats.completed.length}
          description="leitura(s) finalizada(s)"
          icon={BookmarkCheck}
          accentColor="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="Páginas lidas"
          value={stats.totalPagesRead}
          description="registradas no total"
          icon={TrendingUp}
          accentColor="bg-purple-500/15 text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Seção "Lendo Agora" com Card no estilo solicitado */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Lendo Agora
          </h2>
          {stats.reading.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {stats.reading.length}{" "}
              {stats.reading.length === 1 ? "leitura ativa" : "leituras ativas"}
            </span>
          )}
        </div>

        {stats.reading.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {stats.reading.map((item) => (
              <CurrentlyReadingCard
                key={item.book.uuid ?? item.book.externalId}
                item={item}
              />
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-border bg-muted/20 p-6 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Sparkles className="size-6" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-foreground">
              Nenhuma leitura em andamento
            </h3>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Escolha um livro da sua coleção ou busque novos títulos para
              começar a ler hoje.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {stats.wantToRead.length > 0 && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/biblioteca">Escolher da lista Quero Ler</Link>
                </Button>
              )}
              <Button size="sm" asChild>
                <Link href="/buscar">
                  <Compass className="size-4" /> Explorar novos livros
                </Link>
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Ações Rápidas em destaque com gradiente suave */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/buscar" className="group block">
          <Card className="h-full border border-border/70 bg-gradient-to-br from-card to-accent/5 transition-all hover:border-accent/30 hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent group-hover:scale-105 transition-transform">
                <Compass className="size-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-foreground">
                  Buscar Livros
                </h4>
                <p className="text-xs text-muted-foreground">
                  Encontre novos títulos e autores
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/biblioteca" className="group block">
          <Card className="h-full border border-border/70 bg-gradient-to-br from-card to-emerald-500/5 transition-all hover:border-emerald-500/30 hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <Library className="size-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-foreground">
                  Minha Coleção
                </h4>
                <p className="text-xs text-muted-foreground">
                  Gerencie seus livros por status
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/perfil" className="group block">
          <Card className="h-full border border-border/70 bg-gradient-to-br from-card to-purple-500/5 transition-all hover:border-purple-500/30 hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="size-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-foreground">
                  Meu Perfil
                </h4>
                <p className="text-xs text-muted-foreground">
                  Preferências e dados da conta
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Leituras recentes / Adicionados recentemente à biblioteca */}
      {recentBooks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
              Atualizados recentemente
            </h2>
            <Link
              href="/biblioteca"
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Ver todos <ArrowRight className="size-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-7">
            {recentBooks.map((item) => {
              const cover = getCleanBookCover(item.book.imageUrl);
              return (
                <Link
                  key={item.book.uuid ?? item.book.externalId}
                  href={`/books/${item.book.externalId}`}
                  className="group block"
                  // className="group block w-40 sm:w-45 shrink-0"
                >
                  <Card className="overflow-hidden border border-border/70 transition-all hover:-translate-y-1 hover:shadow-md">
                    <div className="relative aspect-2/3 w-full overflow-hidden bg-muted">
                      {cover ? (
                        <Image
                          src={cover}
                          alt={item.book.title}
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          <BookOpen className="size-8 opacity-40" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <p
                        className="line-clamp-1 text-xs font-semibold text-foreground group-hover:text-accent"
                        title={item.book.title}
                      >
                        {item.book.title}
                      </p>
                      <p className="line-clamp-1 text-[11px] text-muted-foreground">
                        {item.book.authors?.[0] ?? "Autor desconhecido"}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
