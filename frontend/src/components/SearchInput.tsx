"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchInputProps = {
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
};

export function SearchInput({
  placeholder = "Buscar...",
  icon = <Search className="size-4 shrink-0" aria-hidden />,
  className,
}: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const term = (e.target as HTMLInputElement).value.trim();

      const params = new URLSearchParams(searchParams.toString());

      if (term) {
        params.set("q", term);
      } else {
        params.delete("q");
      }

      router.push(`/buscar?${params.toString()}`);
    }
  };

  return (
    <div
      className={cn(
        "flex h-10 items-center gap-2 rounded-lg border border-input bg-card px-3 shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        className,
      )}
    >
      <span className="text-muted-foreground">{icon}</span>
      <Input
        type="search"
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-auto border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
        defaultValue={searchParams.get("q")?.toString()}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
