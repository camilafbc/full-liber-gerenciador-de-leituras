"use client";

import { ChevronLeft, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/useSidebarStore";

type ButtonsMenu = {
  icon: ReactNode;
  title: string;
  href: string;
};

interface SidebarLayoutProps {
  ButtonsMenu?: ButtonsMenu[];
  sidebarFooter?: ReactNode;
  headerTitle: string;
  children: ReactNode;
  userMenu: ReactNode;
  logo: ReactNode;
}

export default function SidebarLayout({
  ButtonsMenu,
  sidebarFooter,
  headerTitle,
  children,
  userMenu,
  logo,
}: SidebarLayoutProps) {
  const { isCollapsed, toggle } = useSidebarStore();
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Fecha o menu mobile caso a janela seja redimensionada para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isHydrated) {
    return <div className="flex min-h-screen w-full bg-background" />;
  }

  const renderDesktopNavItem = (button: ButtonsMenu) => {
    const isActive =
      button.href === "/home"
        ? pathname === "/home"
        : pathname.startsWith(button.href);

    const linkContent = (
      <Link
        href={button.href}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "group relative flex items-center gap-3.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 outline-none select-none",
          isActive
            ? "bg-accent/15 text-accent font-semibold dark:bg-accent/20 dark:text-accent-foreground"
            : "text-slate-300 hover:bg-white/10 hover:text-white dark:text-muted-foreground dark:hover:bg-muted/50 dark:hover:text-foreground",
          isCollapsed && "justify-center px-0 py-3",
        )}
      >
        {/* Indicador lateral sutil no item ativo */}
        {isActive && (
          <span
            className={cn(
              "absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-accent transition-all",
              isCollapsed && "left-0 top-2 bottom-2",
            )}
            aria-hidden="true"
          />
        )}

        <span
          className={cn(
            "flex shrink-0 items-center justify-center transition-transform duration-200 group-hover:scale-105 [&_svg]:size-5",
            isActive ? "text-accent" : "text-inherit",
          )}
        >
          {button.icon}
        </span>

        {!isCollapsed && (
          <span className="truncate tracking-normal transition-opacity duration-200">
            {button.title}
          </span>
        )}
      </Link>
    );

    if (isCollapsed) {
      return (
        <Tooltip key={button.href}>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent
            side="right"
            sideOffset={12}
            className="font-medium shadow-md"
          >
            {button.title}
          </TooltipContent>
        </Tooltip>
      );
    }

    return <div key={button.href}>{linkContent}</div>;
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* ============================================================== */}
      {/* 1. SIDEBAR DESKTOP (md:flex)                                   */}
      {/* ============================================================== */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden md:flex flex-col transition-all duration-300 ease-in-out select-none",
          "border-r border-slate-800/80 bg-slate-950 text-slate-100",
          "dark:border-border/80 dark:bg-card/95 dark:text-card-foreground dark:backdrop-blur-md",
          isCollapsed ? "w-20" : "w-64",
        )}
      >
        {/* Cabeçalho da Sidebar */}
        <div
          className={cn(
            "flex h-20 items-center border-b border-slate-800/80 px-4 transition-all duration-300 dark:border-border/80",
            isCollapsed ? "justify-center" : "justify-between",
          )}
        >
          {!isCollapsed && (
            <Link
              href="/home"
              className="flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md py-1"
              aria-label="Ir para a página inicial"
            >
              <div className="relative flex items-center">{logo}</div>
            </Link>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggle}
                className={cn(
                  "rounded-lg text-slate-300 hover:bg-white/10 hover:text-white dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-foreground cursor-pointer transition-colors",
                  isCollapsed && "mx-auto",
                )}
                aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
              >
                <ChevronLeft
                  className={cn(
                    "size-4 transition-transform duration-300",
                    isCollapsed && "rotate-180",
                  )}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {isCollapsed ? "Expandir menu" : "Recolher menu"}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Navegação Principal */}
        <nav
          className="flex-1 space-y-1.5 overflow-y-auto p-3 scrollbar-thin"
          aria-label="Menu principal"
        >
          {ButtonsMenu?.map((button) => renderDesktopNavItem(button))}
        </nav>

        {/* Rodapé da Sidebar */}
        {sidebarFooter && (
          <div className="border-t border-slate-800/80 p-3 dark:border-border/80">
            {sidebarFooter}
          </div>
        )}
      </aside>

      {/* ============================================================== */}
      {/* 2. DRAWER MOBILE LATERAL (Sheet do Shadcn)                      */}
      {/* ============================================================== */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="left"
          className="w-72 max-w-[85vw] border-r border-slate-800/80 bg-slate-950 p-0 text-slate-100 dark:border-border dark:bg-card dark:text-card-foreground flex flex-col"
        >
          <SheetHeader className="border-b border-slate-800/80 p-5 text-left dark:border-border">
            <SheetTitle className="sr-only">Navegação mobile</SheetTitle>
            <div className="flex items-center gap-2">{logo}</div>
          </SheetHeader>

          <nav
            className="flex-1 space-y-1.5 overflow-y-auto p-4"
            aria-label="Menu mobile completo"
          >
            {ButtonsMenu?.map((button) => {
              const isActive =
                button.href === "/home"
                  ? pathname === "/home"
                  : pathname.startsWith(button.href);

              return (
                <Link
                  key={button.href}
                  href={button.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-accent/15 text-accent font-semibold dark:bg-accent/20 dark:text-accent-foreground"
                      : "text-slate-300 hover:bg-white/10 hover:text-white dark:text-muted-foreground dark:hover:bg-muted/50 dark:hover:text-foreground",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="shrink-0 [&_svg]:size-5">{button.icon}</span>
                  <span className="truncate">{button.title}</span>
                </Link>
              );
            })}
          </nav>

          {sidebarFooter && (
            <div className="border-t border-slate-800/80 p-4 dark:border-border">
              {sidebarFooter}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ============================================================== */}
      {/* 3. ÁREA DE CONTEÚDO E HEADER                                  */}
      {/* ============================================================== */}
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col transition-[margin] duration-300 ease-in-out",
          isCollapsed ? "md:ml-20" : "md:ml-64",
        )}
      >
        {/* Header Superior */}
        <header className="sticky top-0 z-30 flex h-16 sm:h-20 items-center justify-between border-b border-border/80 bg-background/85 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
          {/* Lado Esquerdo do Header */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Botão Hambúrguer Mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-foreground hover:bg-muted cursor-pointer shrink-0"
              aria-label="Abrir menu lateral"
            >
              <Menu className="size-5" />
            </Button>

            <h1 className="truncate text-base sm:text-lg md:text-xl font-semibold tracking-tight text-foreground">
              {headerTitle}
            </h1>
          </div>

          {/* Lado Direito do Header (UserMenu / Ações) */}
          <div className="flex shrink-0 items-center gap-2">{userMenu}</div>
        </header>

        {/* Conteúdo Principal */}
        <main className="flex-1 bg-background pb-24 md:pb-10">
          <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>

        {/* ============================================================ */}
        {/* 4. BARRA DE NAVEGAÇÃO INFERIOR MOBILE (Bottom Bar)            */}
        {/* ============================================================ */}
        {ButtonsMenu && ButtonsMenu.length > 0 && (
          <nav
            className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-border/80 bg-background/90 px-2 pb-[max(0.25rem,env(safe-area-inset-bottom))] backdrop-blur-lg md:hidden shadow-lg"
            aria-label="Navegação rápida inferior"
          >
            {ButtonsMenu.map((button) => {
              const isActive =
                button.href === "/home"
                  ? pathname === "/home"
                  : pathname.startsWith(button.href);

              return (
                <Link
                  key={button.href}
                  href={button.href}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={button.title}
                  className={cn(
                    "flex flex-1 flex-col items-center justify-center gap-1 py-1.5 transition-all duration-200 select-none",
                    isActive
                      ? "text-accent font-semibold"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center rounded-xl px-3 py-1 transition-all duration-200 [&_svg]:size-5",
                      isActive && "bg-accent/15 scale-105",
                    )}
                  >
                    {button.icon}
                  </div>
                  <span className="text-[10px] sm:text-[11px] leading-tight truncate max-w-[64px]">
                    {button.title}
                  </span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
