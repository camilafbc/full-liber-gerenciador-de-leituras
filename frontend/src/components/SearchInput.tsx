"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

type SearchInputProps = {
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
};

export function SearchInput({
  placeholder = "Buscar...",
  icon = <Search size={14} />,
  className = "",
}: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }

    router.push(`/buscar?${params.toString()}`);
  }, 300);

  return (
    <div
      className={`group flex  items-center rounded-md border border-input bg-card px-2 shadow-sm focus-within:ring-1 focus-within:ring-orange-500 ${className}`}
    >
      {icon && <span className="text-muted-foreground">{icon}</span>}
      <Input
        type="search"
        placeholder={placeholder}
        className="border-none bg-transparent px-2 focus:outline-none focus-visible:ring-0"
        defaultValue={searchParams.get("q")?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  );
}
