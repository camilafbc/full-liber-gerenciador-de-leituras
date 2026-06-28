import { SearchInput } from "@/components/SearchInput";
import { SearchResults } from "./components/SearchResults";

interface BuscaPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function BuscarPage({ searchParams }: BuscaPageProps) {
  const { q: query } = await searchParams;

  return (
    <>
      <SearchInput placeholder="Buscar livro, autor..." className="w-full" />
      <SearchResults query={query || ""} />
    </>
  );
}
