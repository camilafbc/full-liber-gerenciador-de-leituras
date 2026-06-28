"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { usePathname } from "next/navigation";

type ButtonsMenu = {
  icon: ReactNode;
  title: string;
  href: string;
};

interface SidebarLayoutProps {
  // buttonsMenu?: ReactNode;
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

  // // Detecta responsividade
  // useEffect(() => {
  //   const checkScreenSize = () => {
  //     const mobile = window.innerWidth < 768;
  //     setIsMobile(mobile);
  //     if (!mobile) setMobileMenuOpen(false);
  //   };

  //   checkScreenSize();
  //   window.addEventListener("resize", checkScreenSize);
  //   return () => window.removeEventListener("resize", checkScreenSize);
  // }, []);

  // // Sincroniza estado inicial em mobile
  // useEffect(() => {
  //   if (isMobile) {
  //     useSidebarStore.getState().setCollapsed(false);
  //   }
  // }, [isMobile]);

  // const toggleSidebar = () => {
  //   isMobile ? setMobileMenuOpen(!mobileMenuOpen) : toggle();
  // };

  // Garante que o estado está sincronizado com o localStorage
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Detecta responsividade
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

  // const toggleSidebar = () => {
  //   return false;
  // };

  // Evita renderização antes da hidratação
  if (!isHydrated) {
    return (
      <div className="flex min-h-screen w-full overflow-hidden">
        {/* Layout de carregamento ou null */}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full overflow-hidden">
      {/* Sidebar Fixa */}
      <aside
        className={`fixed z-40 h-screen ${
          isMobile
            ? `w-64 transform ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`
            : `${isCollapsed ? "w-16" : "w-64"}`
        } border-r bg-primary dark:bg-background text-white transition-all duration-300`}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div
            className={`flex h-[85px] items-center border-b p-4 ${isCollapsed && !isMobile ? "justify-center" : "justify-between"}`}
          >
            {(!isCollapsed || isMobile) && (
              // <h2 className="text-lg font-semibold">Meu Painel</h2>
              <div className="relative h-8 w-[60%]">{logo}</div>
            )}

            {!isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-8 w-8"
              >
                <ChevronLeft
                  size={18}
                  className={`transition-transform ${isCollapsed ? "rotate-180" : ""}`}
                />
              </Button>
            )}
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {ButtonsMenu?.map(
                (button, index) => {
                  const isActive = pathname.startsWith(button.href);

                  return (
                    <Button
                      key={index}
                      variant="ghost"
                      asChild
                      className={`w-full justify-start gap-3 transition-colors ${isActive ? "bg-secondary text-accent" : ""}`}
                      onClick={() => isMobile && setMobileMenuOpen(false)}
                    >
                      <Link href={button.href}>
                        {button.icon}
                        {(!isCollapsed || isMobile) && button.title}
                      </Link>
                    </Button>
                  );
                },

                // return isCollapsed && !isMobile ? (
                //   <Tooltip key={index}>
                //     <TooltipTrigger asChild>{buttonComponent}</TooltipTrigger>
                //     <TooltipContent
                //       side="right"
                //       className="mb-2 border-none bg-slate-950/70 text-white"
                //     >
                //       {button.title}
                //     </TooltipContent>
                //   </Tooltip>
                // ) : (
                //   buttonComponent
                // );
              )}
            </div>
          </nav>

          {/* Sidebar Footer */}
          {sidebarFooter && <div className="border-t p-2">{sidebarFooter}</div>}
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${isMobile ? "ml-0" : isCollapsed ? "ml-16" : "ml-64"} `}
      >
        {/* Header com Menu Button */}
        <header className="sticky top-0 z-30 flex h-[85px] items-center justify-between border-b bg-background px-6 py-4">
          <div className="flex items-center gap-4">
            {/* {isMobile && (
              <Button
                variant="outline"
                size="icon"
                onClick={toggleSidebar}
                className="h-8 w-8"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            )} */}
            <h1 className="hidden text-xl font-semibold md:block">
              {headerTitle}
            </h1>
          </div>

          <div className="flex items-center gap-4">{userMenu}</div>
        </header>

        {/* Page Content */}
        <main className="max-w-[100vw] flex-1 overflow-x-hidden transition-all duration-300 bg-background">
          <div
            className={`w-full overflow-hidden ${isMobile && "max-w-[100vw]"} ${!isMobile && !isCollapsed && "max-w-[calc(100vw-16rem)]"} ${isCollapsed && "max-w-[calc(100vw-4rem)]"} p-6`}
          >
            {children}
          </div>
        </main>
        {/* MENU MOBILE */}
        {isMobile && (
          <div className="w-full h-18 border-t-2 shadow-lg fixed bottom-0 flex justify-around items-center bg-background">
            {ButtonsMenu?.map((button, index) => {
              const isActive = pathname.startsWith(button.href);
              return (
                <Link
                  key={index}
                  href={button.href}
                  className={isActive ? "bg-accent" : ""}
                >
                  {button.icon}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Overlay para mobile */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
