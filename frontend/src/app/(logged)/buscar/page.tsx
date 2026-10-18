import { PageHeader } from "@/components/PageHeader";
import { SearchInput } from "@/components/SearchInput";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { SearchResults } from "./components/SearchResults";

interface BuscaPageProps {
  searchParams: Promise<{ q?: string }>;
}

const POPULAR_SUGGESTIONS = [
  "Ficção Científica",
  "Fantasia",
  "Machado de Assis",
  "George Orwell",
  "Clarice Lispector",
  "Suspense",
  "Romance",
];

export default async function BuscarPage({ searchParams }: BuscaPageProps) {
  const { q: query } = await searchParams;

  return (
    <section className="flex flex-col gap-6 pb-8">
      {/* Cabeçalho */}
      <PageHeader
        title="Buscar livros"
        description="Pesquise por título, autor ou palavra-chave para explorar novas histórias."
      />

      {/* Caixa de Pesquisa Destacada */}
      <div className="flex flex-col gap-3">
        <Suspense
          fallback={<Skeleton className="h-12 w-full max-w-2xl rounded-xl" />}
        >
          <SearchInput
            placeholder="Ex: Harry Potter, Yuval Noah Harari, Torto Arado..."
            className="max-w-2xl"
          />
        </Suspense>

        {/* Sugestões Rápidas de Busca */}
        {!query && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 font-medium text-foreground/80">
              <Sparkles className="size-3 text-accent" />
              Sugestões:
            </span>
            {POPULAR_SUGGESTIONS.map((tag) => (
              <Link
                key={tag}
                href={`/buscar?q=${encodeURIComponent(tag)}`}
                className="rounded-full border border-border/80 bg-muted/40 px-2.5 py-0.5 text-xs text-muted-foreground transition-all hover:border-accent hover:bg-accent/10 hover:text-accent"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Resultados da Busca */}
      <SearchResults query={query || ""} />
    </section>
  );
}
