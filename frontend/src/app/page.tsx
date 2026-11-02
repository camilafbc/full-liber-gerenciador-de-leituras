import { Logo } from "@/components/Logo";
import { TextLogo } from "@/components/TextLogo";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Library, Sparkles } from "lucide-react";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("liber_refresh_token");

  if (refreshToken) redirect("/home");

  return (
    <main className="min-h-screen overflow-hidden bg-primary text-primary-foreground [--background:oklch(99.65%_0.002_247.84)] [--foreground:oklch(0.145_0_0)] [--primary:oklch(20.7%_0.038_265.07)] [--primary-foreground:oklch(0.97_0.014_254.604)]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between py-6">
          <Link
            href="/"
            aria-label="Página inicial do Líber"
            className="flex items-center gap-3"
          >
            <div className="dark">
              <Logo size={38} />
            </div>
            <TextLogo width={70} className="fill-white" />
          </Link>
          <nav
            aria-label="Navegação principal"
            className="flex items-center gap-2 sm:gap-4"
          >
            <Link
              href="/login"
              className="rounded-md px-3 py-2 text-sm font-medium text-primary-foreground/80 transition-colors hover:bg-white/10 hover:text-primary-foreground"
            >
              Entrar
            </Link>
            <Button
              asChild
              variant="secondary"
              className="bg-accent font-semibold text-accent-foreground hover:bg-accent/90"
            >
              <Link href="/signup">Criar conta</Link>
            </Button>
          </nav>
        </header>

        <section className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1fr_0.92fr] lg:gap-20 lg:py-16">
          <div className="max-w-2xl">
            <p className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
              <Sparkles className="size-4" aria-hidden="true" />
              Seu espaço para ler melhor
            </p>
            <h1 className="max-w-xl text-5xl leading-[1.05] font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              Toda leitura merece um lugar.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-primary-foreground/75 sm:text-xl">
              Organize sua biblioteca, acompanhe seu progresso e descubra o
              próximo livro que vai fazer parte da sua história.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="h-12 bg-accent px-6 font-semibold text-accent-foreground hover:bg-accent/90"
              >
                <Link href="/signup">
                  Começar agora
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 border-white/25 bg-transparent px-6 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
              >
                <Link href="/login">Já tenho uma conta</Link>
              </Button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:mr-0">
            <div
              className="absolute -inset-4 rounded-[2rem] border border-white/10 bg-white/5 rotate-3"
              aria-hidden="true"
            />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-white/20 bg-slate-800 shadow-2xl shadow-black/20">
              <Image
                src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1000&q=85"
                alt="Livro aberto sobre uma mesa de madeira"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 42vw"
                className="object-cover"
              />
              <div className="absolute inset-x-5 bottom-5 rounded-xl border border-white/20 bg-slate-950/70 p-4 text-white backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Seu próximo capítulo
                </p>
                <p className="mt-1 text-lg font-semibold">Começa no Líber.</p>
              </div>
            </div>
          </div>
        </section>

        <section
          aria-label="Recursos do Líber"
          className="grid gap-4 border-t border-white/15 py-8 sm:grid-cols-3 sm:gap-8"
        >
          <div className="flex items-start gap-3">
            <BookOpen className="mt-1 size-5 text-accent" aria-hidden="true" />
            <div>
              <h2 className="font-semibold">Acompanhe seu ritmo</h2>
              <p className="mt-1 text-sm leading-6 text-primary-foreground/65">
                Registre páginas e veja sua evolução.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Library className="mt-1 size-5 text-accent" aria-hidden="true" />
            <div>
              <h2 className="font-semibold">Sua biblioteca</h2>
              <p className="mt-1 text-sm leading-6 text-primary-foreground/65">
                Tenha seus livros organizados em um só lugar.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Sparkles className="mt-1 size-5 text-accent" aria-hidden="true" />
            <div>
              <h2 className="font-semibold">Leia com intenção</h2>
              <p className="mt-1 text-sm leading-6 text-primary-foreground/65">
                Transforme metas de leitura em hábito.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
