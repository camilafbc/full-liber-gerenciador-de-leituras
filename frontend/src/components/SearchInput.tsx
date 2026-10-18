"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchInputProps = {
  placeholder?: string;
  className?: string;
};

export function SearchInput({
  placeholder = "Buscar por título, autor, editora...",
  className,
}: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const currentQuery = searchParams.get("q") ?? "";
  const [prevQuery, setPrevQuery] = useState(currentQuery);
  const [value, setValue] = useState(currentQuery);

  if (prevQuery !== currentQuery) {
    setPrevQuery(currentQuery);
    setValue(currentQuery);
  }

  const handleSearch = (term: string) => {
    const trimmed = term.trim();
    const params = new URLSearchParams(searchParams.toString());

    if (trimmed) {
      params.set("q", trimmed);
      params.delete("page"); // Reseta para a primeira página ao fazer nova busca
    } else {
      params.delete("q");
      params.delete("page");
    }

    startTransition(() => {
      router.push(`/buscar?${params.toString()}`);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch(value);
    }
  };

  return (
    <div
      className={cn(
        "relative flex w-full items-center gap-2 rounded-xl border border-input/80 bg-card p-1.5 shadow-xs transition-all focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20",
        className,
      )}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
        <Search className="size-4" aria-hidden />
      </div>

      <Input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 border-0 bg-transparent px-2 text-sm shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/70"
        onKeyDown={handleKeyDown}
      />

      <Button
        type="button"
        size="sm"
        onClick={() => handleSearch(value)}
        className="shrink-0 gap-1.5 px-4 font-medium shadow-xs dark:bg-accent"
      >
        Buscar
      </Button>
    </div>
  );
}
