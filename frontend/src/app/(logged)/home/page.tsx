"use client";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthContext } from "@/context/authContext";
import { BookSearchIcon, LibraryBigIcon, UserRoundIcon } from "lucide-react";
import Link from "next/link";

const quickLinks = [
  {
    title: "Buscar livros",
    description: "Encontre títulos e autores na base do Liber.",
    href: "/buscar",
    icon: BookSearchIcon,
  },
  {
    title: "Minha biblioteca",
    description: "Veja o que você já salvou e continue lendo.",
    href: "/biblioteca",
    icon: LibraryBigIcon,
  },
  {
    title: "Meu perfil",
    description: "Atualize nome, senha e preferências da conta.",
    href: "/perfil",
    icon: UserRoundIcon,
  },
] as const;

export default function HomePage() {
  const { loading, user } = useAuthContext();

  if (loading || !user) {
    return (
      <section className="flex flex-col gap-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  const firstName = user.name?.split(" ")[0] ?? "leitor";

  return (
    <section className="flex flex-col gap-8">
      <PageHeader
        description="Organize suas leituras em um só lugar."
        title={`Olá, ${firstName}!`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map(({ title, description, href, icon: Icon }) => (
          <Card key={href} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-muted">
                <Icon className="size-5 text-foreground" aria-hidden />
              </div>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
              <Button variant="link" className="h-auto w-fit px-0" asChild>
                <Link href={href}>Acessar →</Link>
              </Button>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
