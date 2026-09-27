"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
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
  const [isHydrated, setIsHydrated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileMenuOpen(false);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    isMobile ? setMobileMenuOpen(!mobileMenuOpen) : toggle();
  };

  if (!isHydrated) {
    return <div className="flex min-h-screen w-full overflow-hidden" />;
  }

  const renderNavItem = (button: ButtonsMenu) => {
    const isActive = pathname.startsWith(button.href);
    const linkButton = (
      <Button
        variant="ghost"
        asChild
        className={cn(
          "w-full justify-start gap-3 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground",
          isActive && "bg-secondary text-accent",
          isCollapsed && !isMobile && "justify-center px-0",
        )}
        onClick={() => isMobile && setMobileMenuOpen(false)}
      >
        <Link href={button.href} aria-current={isActive ? "page" : undefined}>
          {button.icon}
          {(!isCollapsed || isMobile) && (
            <span className="truncate">{button.title}</span>
          )}
        </Link>
      </Button>
    );

    if (isCollapsed && !isMobile) {
      return (
        <Tooltip key={button.href}>
          <TooltipTrigger asChild>{linkButton}</TooltipTrigger>
          <TooltipContent side="right">{button.title}</TooltipContent>
        </Tooltip>
      );
    }

    return <div key={button.href}>{linkButton}</div>;
  };

  return (
    <div className="flex min-h-screen w-full overflow-hidden">
      <aside
        className={cn(
          "fixed z-40 h-screen border-r border-white/10 bg-primary text-primary-foreground transition-all duration-300 dark:bg-background",
          isMobile
            ? cn("w-64", mobileMenuOpen ? "translate-x-0" : "-translate-x-full")
            : isCollapsed
              ? "w-16"
              : "w-64",
        )}
      >
        <div className="flex h-full flex-col">
          <div
            className={cn(
              "flex h-[85px] items-center border-b border-white/10 p-4",
              isCollapsed && !isMobile ? "justify-center" : "justify-between",
            )}
          >
            {(!isCollapsed || isMobile) && (
              <div className="relative h-8 w-[60%]">{logo}</div>
            )}

            {!isMobile && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleSidebar}
                className="text-primary-foreground hover:bg-white/10"
                aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
              >
                <ChevronLeft
                  className={cn(
                    "size-4 transition-transform",
                    isCollapsed && "rotate-180",
                  )}
                />
              </Button>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto p-2" aria-label="Principal">
            <div className="space-y-1">
              {ButtonsMenu?.map((button) => renderNavItem(button))}
            </div>
          </nav>

          {sidebarFooter && (
            <div className="border-t border-white/10 p-2">{sidebarFooter}</div>
          )}
        </div>
      </aside>

      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          isMobile ? "ml-0" : isCollapsed ? "ml-16" : "ml-64",
        )}
      >
        <header className="sticky top-0 z-30 flex h-[85px] items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6">
          <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">
            {headerTitle}
          </h1>
          <div className="flex shrink-0 items-center gap-2">{userMenu}</div>
        </header>

        <main
          className={cn(
            "flex-1 overflow-x-hidden bg-background",
            isMobile && "pb-20",
          )}
        >
          <div
            className={`w-full overflow-hidden ${isMobile && "max-w-[100vw]"} ${!isMobile && !isCollapsed && "max-w-[calc(100vw-16rem)]"} ${isCollapsed && "max-w-[calc(100vw-4rem)]"} p-6`}
          >
            {children}
          </div>
        </main>

        {isMobile && ButtonsMenu && (
          <nav
            className="fixed bottom-0 z-30 flex h-16 w-full items-stretch justify-around border-t bg-background/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur"
            aria-label="Navegação mobile"
          >
            {ButtonsMenu.map((button, index) => {
              const isActive = pathname.startsWith(button.href);
              return (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-full min-w-0 flex-1 flex-col gap-0.5 rounded-none py-2 text-[10px] font-medium",
                    isActive && "text-accent",
                  )}
                  asChild
                >
                  <Link
                    href={button.href}
                    aria-current={isActive ? "page" : undefined}
                    aria-label={button.title}
                  >
                    {button.icon}
                    <span className="truncate">{button.title}</span>
                  </Link>
                </Button>
              );
            })}
          </nav>
        )}
      </div>

      {isMobile && mobileMenuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          aria-label="Fechar menu"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
