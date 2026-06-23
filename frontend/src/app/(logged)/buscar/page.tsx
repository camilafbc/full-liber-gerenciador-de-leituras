import { SearchInput } from "@/components/SearchInput";
import { SearchResults } from "./components/SearchResults";

interface BuscaPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function BuscarPage({ searchParams }: BuscaPageProps) {
  const { q: query } = await searchParams;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      <SearchInput
        placeholder="Buscar livro, autor..."
        className="col-span-3"
      />

      <SearchResults query={query || ""} />
    </div>
  );
}
