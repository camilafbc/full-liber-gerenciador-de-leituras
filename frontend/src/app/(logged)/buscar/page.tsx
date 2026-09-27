import { PageHeader } from "@/components/PageHeader";
import { SearchInput } from "@/components/SearchInput";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { SearchResults } from "./components/SearchResults";

interface BuscaPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function BuscarPage({ searchParams }: BuscaPageProps) {
  const { q: query } = await searchParams;

  return (
    <section className="flex flex-col gap-6 pb-4">
      <PageHeader
        title="Buscar livros"
        description="Pesquise por título, autor ou palavra-chave."
      />
      <Suspense
        fallback={<Skeleton className="h-10 w-full max-w-xl rounded-lg" />}
      >
        <SearchInput placeholder="Buscar livro, autor..." className="max-w-xl" />
      </Suspense>
      <SearchResults query={query || ""} />
    </section>
  );
}
