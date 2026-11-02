import { getUser } from "@/api/user";
import { PageHeader } from "@/components/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getServerAuthToken } from "@/lib/serverAuth";
import {
  BookOpen,
  KeyRound,
  Mail,
  Sparkles,
  UserCheck,
  UserRound,
} from "lucide-react";
import { redirect } from "next/navigation";
import { FormProfile } from "./components/FormProfile";

export default async function ProfilePage() {
  const token = await getServerAuthToken();

  if (!token) redirect("/login");

  const { user } = await getUser(token);

  const initials =
    `${user.name?.split(" ")?.[0]?.[0] ?? ""}${user.name?.split(" ")?.[1]?.[0] ?? ""}`.toUpperCase() ||
    "U";

  return (
    <section className="flex w-full flex-col gap-8 pb-10">
      <PageHeader
        title="Meu perfil"
        description="Gerencie suas informações pessoais, segurança e credenciais de acesso."
      />

      {/* Hero Card de Identidade do Usuário com Gradiente Sutil */}
      <Card className="relative overflow-hidden border border-border/70 bg-gradient-to-r from-card via-card to-accent/10 shadow-sm">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 size-64 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

        <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="relative">
              <Avatar className="size-20 border-2 border-background shadow-md ring-2 ring-accent/30 sm:size-24">
                {user.avatarUrl && (
                  <AvatarImage
                    src={user.avatarUrl}
                    alt={`Foto de ${user.name}`}
                  />
                )}
                <AvatarFallback className="bg-primary text-xl font-bold tracking-wider text-primary-foreground sm:text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div
                className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-sm ring-2 ring-background"
                title="Conta ativa"
              >
                <Sparkles className="size-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl capitalize">
                  {user.name}
                </h2>
                <Badge
                  variant="outline"
                  className="gap-1 border-accent/40 bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent"
                >
                  <UserCheck className="size-3" />
                  Leitor Líber
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                <Mail className="size-3.5" />
                <span>{user.email}</span>
              </div>

              <p className="text-xs text-muted-foreground/80">
                Organizando e acompanhando o ritmo das leituras com o Líber.
              </p>
            </div>
          </div>

          {/* <div className="flex items-center gap-3 border-t border-border/40 pt-4 sm:border-t-0 sm:pt-0">
            <div className="rounded-lg bg-muted/60 p-3 text-center sm:min-w-32">
              <p className="text-[11px] font-medium text-muted-foreground">
                Status da Conta
              </p>
              <div className="mt-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="size-4" />
                <span>Ativa & Segura</span>
              </div>
            </div>
          </div> */}
        </CardContent>
      </Card>

      {/* Grid de Configurações do Perfil */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Coluna Lateral: Dicas de Segurança e Conta */}
        <div className="space-y-2 lg:col-span-1">
          <Card className="border border-border/70">
            <CardHeader className="pb-2">
              <div className="mb-1 flex size-9 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <UserRound className="size-4" />
              </div>
              <CardTitle className="text-base">Informações Pessoais</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Seu nome de exibição é como você será identificado na aplicação
                e nas mensagens de boas-vindas.
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardHeader className="pt-2 pb-2">
              <div className="mb-1 flex size-9 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
                <KeyRound className="size-4" />
              </div>
              <CardTitle className="text-base">Segurança de Acesso</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Para alterar sua senha, utilize uma combinação com letras
                maiúsculas, minúsculas, números e caracteres especiais. Se não
                deseja alterar, deixe os campos em branco.
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardHeader className="pt-2 pb-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent mt-0.5">
                <BookOpen className="size-4" />
              </div>
              <CardTitle className="text-base">Dica de leitura:</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Mantenha seu perfil atualizado para aproveitar recursos
                personalizados no seu dashboard.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Coluna Principal: Formulário de Atualização */}
        <div className="lg:col-span-2">
          <Card className="border border-border/70 shadow-xs">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    Editar Dados da Conta
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Atualize seus dados cadastrais e confirme as mudanças
                    abaixo.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <FormProfile defaultValues={user} token={token} />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
