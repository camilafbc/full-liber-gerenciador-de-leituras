"use client";

import { getLibraryBooks } from "@/api/books";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthContext } from "@/context/authContext";
import { LibraryBook, ReadingStatus } from "@/types/Book";
import { getCleanBookCover } from "@/utils/cleanBookCover";
import {
  AlertCircle,
  BookOpen,
  Bookmark,
  CheckCircle2,
  LucideIcon,
  Search,
  Star,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type TabFilter = "ALL" | ReadingStatus;

interface StatusConfigItem {
  label: string;
  badgeVariant: "default" | "secondary" | "outline";
  icon: LucideIcon;
}

const STATUS_CONFIG: Record<ReadingStatus, StatusConfigItem> = {
  READING: {
    label: "Lendo",
    badgeVariant: "default",
    icon: BookOpen,
  },
  WANT_TO_READ: {
    label: "Quero ler",
    badgeVariant: "secondary",
    icon: Bookmark,
  },
  COMPLETED: {
    label: "Concluído",
    badgeVariant: "outline",
    icon: CheckCircle2,
  },
  DROPPED: {
    label: "Abandonei",
    badgeVariant: "outline",
    icon: XCircle,
  },
};

const TAB_EMPTY_STATES: Record<
  TabFilter,
  {
    icon: LucideIcon;
    title: string;
    description: string;
    showSearchButton?: boolean;
  }
> = {
  ALL: {
    icon: BookOpen,
    title: "Sua biblioteca está vazia",
    description:
      "Busque um livro e adicione à sua coleção para acompanhar sua leitura.",
    showSearchButton: true,
  },
  READING: {
    icon: BookOpen,
    title: "Nenhuma leitura em andamento",
    description:
      "Que tal começar a ler algum livro da sua lista ou adicionar um novo?",
    showSearchButton: true,
  },
  WANT_TO_READ: {
    icon: Bookmark,
    title: "Lista de desejos vazia",
    description:
      "Pesquise novos títulos e salve na lista dos que você quer ler.",
    showSearchButton: true,
  },
  COMPLETED: {
    icon: CheckCircle2,
    title: "Nenhum livro concluído",
    description:
      "Seus livros finalizados e histórico de leituras completadas aparecerão aqui.",
    showSearchButton: false,
  },
  DROPPED: {
    icon: XCircle,
    title: "Nenhum livro abandonado",
    description: "Você não tem leituras marcadas como abandonadas.",
    showSearchButton: false,
  },
};

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
                ? "size-3.5 fill-accent text-accent"
                : "size-3.5 text-muted-foreground/25"
            }
          />
        ))}
      </div>
      {rating ? (
        <span className="text-[11px] font-medium text-muted-foreground">
          {rating}/5
        </span>
      ) : (
        <span className="text-[11px] text-muted-foreground/80">
          Sem avaliação
        </span>
      )}
    </div>
  );
}

function LibraryCardSkeleton() {
  return (
    <Card className="flex flex-col overflow-hidden border-border/60">
      <Skeleton className="aspect-2/3 w-full rounded-none" />
      <CardContent className="space-y-2 p-3 sm:p-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-16 pt-2" />
      </CardContent>
    </Card>
  );
}

function LibraryCard({ item }: { item: LibraryBook }) {
  const { book, status, currentPage } = item;
  const cleanCover = getCleanBookCover(book.imageUrl);
  const statusInfo = STATUS_CONFIG[status];
  const StatusIcon = statusInfo?.icon;

  const totalPages =
    book.pageCount && book.pageCount > 0 ? book.pageCount : null;
  const progressPercent = totalPages
    ? Math.min(100, Math.round((currentPage / totalPages) * 100))
    : 0;

  return (
    <Link href={`/books/${book.externalId}`} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden border-border/60 bg-card transition-all duration-200 hover:-translate-y-1 hover:border-border hover:shadow-md">
        {/* Capa com proporção 2:3 de livro e tratamento de imagem */}
        <div className="relative aspect-2/3 w-full overflow-hidden bg-muted">
          {cleanCover ? (
            <Image
              src={cleanCover}
              alt={`Capa do livro ${book.title}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 200px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-3 text-center text-muted-foreground">
              <BookOpen className="size-8 opacity-40 mb-1" aria-hidden />
              <span className="line-clamp-2 text-xs font-medium text-muted-foreground">
                {book.title}
              </span>
            </div>
          )}

          {/* Badge de status flutuante */}
          {statusInfo && (
            <div className="absolute top-2 left-2 z-10">
              <Badge
                variant={statusInfo.badgeVariant}
                className="gap-1 border-background/20 bg-background/90 py-0.5 px-2 text-[10px] font-medium backdrop-blur-xs shadow-xs dark:bg-card/90"
              >
                {StatusIcon && <StatusIcon className="size-3" />}
                {statusInfo.label}
              </Badge>
            </div>
          )}
        </div>

        {/* Informações do livro */}
        <CardContent className="flex flex-1 flex-col justify-between gap-3 p-3 sm:p-4">
          <div className="space-y-1">
            <h3
              className="line-clamp-2 text-sm font-semibold leading-tight text-foreground transition-colors group-hover:text-primary"
              title={book.title}
            >
              {book.title}
            </h3>
            {book.authors && book.authors.length > 0 && (
              <p className="line-clamp-1 text-xs text-muted-foreground">
                {book.authors.join(", ")}
              </p>
            )}
          </div>

          <div className="space-y-2 pt-1 border-t border-border/40">
            {/* Barra de progresso para o status "Lendo" */}
            {status === "READING" && totalPages && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>
                    Pág. {currentPage} de {totalPages}
                  </span>
                  <span className="font-semibold text-foreground">
                    {progressPercent}%
                  </span>
                </div>
                <Progress value={progressPercent} className="h-1.5" />
              </div>
            )}

            <RatingStars rating={book.review?.rating} />
          </div>
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
  const [activeTab, setActiveTab] = useState<TabFilter>("ALL");

  useEffect(() => {
    if (authLoading || !token) return;

    let isMounted = true;

    getLibraryBooks(token, 1, 100)
      .then((result) => {
        if (isMounted) {
          setBooks(result.books);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Não foi possível carregar sua biblioteca.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [authLoading, token]);

  // Contadores por status para os badges das abas
  const counts = useMemo(() => {
    return {
      ALL: books.length,
      READING: books.filter((b) => b.status === "READING").length,
      WANT_TO_READ: books.filter((b) => b.status === "WANT_TO_READ").length,
      COMPLETED: books.filter((b) => b.status === "COMPLETED").length,
      DROPPED: books.filter((b) => b.status === "DROPPED").length,
    };
  }, [books]);

  // Livros filtrados pela aba selecionada
  const filteredBooks = useMemo(() => {
    if (activeTab === "ALL") return books;
    return books.filter((b) => b.status === activeTab);
  }, [books, activeTab]);

  if (authLoading || loading) {
    return (
      <section className="flex flex-col gap-6">
        <PageHeader
          description="Seus livros salvos para acompanhar"
          title="Minha biblioteca"
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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

  const emptyStateConfig = TAB_EMPTY_STATES[activeTab];

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        description="Seus livros salvos para acompanhar"
        title="Minha biblioteca"
      />

      {/* Se a biblioteca inteira estiver vazia, exibe o fallback geral */}
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
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabFilter)}
          className="w-full gap-6"
        >
          {/* Abas estilizadas com suporte a rolagem em telas menores */}
          <div className="w-full overflow-x-auto pb-1 scrollbar-none">
            <TabsList className="inline-flex h-10 w-auto bg-muted/60 p-1">
              <TabsTrigger
                value="ALL"
                className="gap-2 px-3 text-xs sm:text-sm"
              >
                Todos
                <span className="rounded-full bg-muted-foreground/15 px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                  {counts.ALL}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="READING"
                className="gap-1.5 px-3 text-xs sm:text-sm"
              >
                <BookOpen className="size-3.5" />
                Lendo
                <span className="rounded-full bg-muted-foreground/15 px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                  {counts.READING}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="WANT_TO_READ"
                className="gap-1.5 px-3 text-xs sm:text-sm"
              >
                <Bookmark className="size-3.5" />
                Quero ler
                <span className="rounded-full bg-muted-foreground/15 px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                  {counts.WANT_TO_READ}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="COMPLETED"
                className="gap-1.5 px-3 text-xs sm:text-sm"
              >
                <CheckCircle2 className="size-3.5" />
                Concluídos
                <span className="rounded-full bg-muted-foreground/15 px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                  {counts.COMPLETED}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="DROPPED"
                className="gap-1.5 px-3 text-xs sm:text-sm"
              >
                <XCircle className="size-3.5" />
                Abandonados
                <span className="rounded-full bg-muted-foreground/15 px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                  {counts.DROPPED}
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Grid de livros ou Fallback contextual da aba selecionada */}
          {filteredBooks.length === 0 ? (
            <EmptyState
              icon={emptyStateConfig.icon}
              title={emptyStateConfig.title}
              description={emptyStateConfig.description}
              action={
                emptyStateConfig.showSearchButton ? (
                  <Button variant="outline" asChild>
                    <Link href="/buscar">
                      <Search className="size-4" />
                      Buscar livros
                    </Link>
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filteredBooks.map((item) => (
                <LibraryCard
                  key={item.book.uuid ?? item.book.externalId}
                  item={item}
                />
              ))}
            </div>
          )}
        </Tabs>
      )}
    </section>
  );
}
