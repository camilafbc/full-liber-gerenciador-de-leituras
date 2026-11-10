"use client";

import { Laptop, LogOut, Moon, Sun, User } from "lucide-react";
import Link from "next/link";
import { ReactNode, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

type MenuButton = {
  title: string;
  icon: ReactNode;
  href: string;
};

interface UserMenuProps {
  avatarImage?: string;
  userInfo?: boolean;
  name?: string;
  email?: string;
  buttons?: MenuButton[];
  signOutCallbackUrl?: string;
}

const themeOptions = [
  { value: "light", icon: Sun, label: "Claro" },
  { value: "dark", icon: Moon, label: "Escuro" },
  { value: "system", icon: Laptop, label: "Sistema" },
] as const;

export const ThemeSwitcher = ({
  setTheme,
}: {
  setTheme: (theme: string) => void;
}) => {
  const { theme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  return (
    <div className="space-y-1.5 px-2 py-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-medium text-muted-foreground">
          Aparência
        </span>
        {mounted && (
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
            {theme === "light"
              ? "Claro"
              : theme === "dark"
                ? "Escuro"
                : "Sistema"}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted/60 p-1">
        {themeOptions.map((item) => {
          const Icon = item.icon;
          const isActive = mounted && theme === item.value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setTheme(item.value)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-md py-1.5 text-[11px] font-medium transition-all duration-150 cursor-pointer",
                isActive
                  ? "bg-background text-foreground shadow-xs ring-1 ring-border/50 font-semibold"
                  : "text-muted-foreground hover:bg-background/50 hover:text-foreground",
              )}
              aria-pressed={isActive}
              aria-label={`Alternar para tema ${item.label}`}
            >
              <Icon className="size-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default function UserMenu({
  userInfo = true,
  buttons,
  avatarImage,
  name,
  email,
}: UserMenuProps) {
  const { setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();

  const initials =
    `${name?.split(" ")?.[0]?.[0] ?? ""}${name?.split(" ")?.[1]?.[0] ?? ""}`.toUpperCase();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "group relative flex items-center gap-2 rounded-full p-0.5 outline-none transition-all duration-200 cursor-pointer",
            "ring-1 ring-border/70 hover:ring-2 hover:ring-accent/50 focus-visible:ring-2 focus-visible:ring-accent",
            open && "ring-2 ring-accent",
          )}
          aria-label="Menu da conta"
          aria-expanded={open}
        >
          <Avatar className="size-9 sm:size-10 transition-transform duration-200 group-hover:scale-105">
            {avatarImage && (
              <AvatarImage
                src={avatarImage}
                alt={`Foto de ${name ?? "usuário"}`}
                className="object-cover"
              />
            )}
            <AvatarFallback className="bg-primary text-xs sm:text-sm font-semibold text-primary-foreground dark:bg-accent dark:text-accent-foreground">
              {initials || <User className="size-4" />}
            </AvatarFallback>
          </Avatar>
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-72 p-1.5 shadow-xl border-border/80 bg-popover/95 backdrop-blur-md rounded-xl"
        align="end"
        sideOffset={8}
      >
        {userInfo && name && (
          <div className="flex items-center gap-3 p-2.5">
            <Avatar className="size-10 shrink-0 ring-1 ring-border/60">
              {avatarImage && (
                <AvatarImage
                  src={avatarImage}
                  alt={`Foto de ${name}`}
                  className="object-cover"
                />
              )}
              <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground dark:bg-accent dark:text-accent-foreground">
                {initials || <User className="size-4" />}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="truncate text-sm font-semibold text-foreground">
                {name}
              </p>
              {email && (
                <p className="truncate text-xs text-muted-foreground">
                  {email}
                </p>
              )}
            </div>
          </div>
        )}

        {userInfo && name && <Separator className="my-1 opacity-60" />}

        {buttons && buttons.length > 0 && (
          <div className="space-y-0.5 p-1">
            {buttons.map((btn, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2.5 text-foreground/80 hover:text-foreground hover:bg-accent/10 transition-colors"
                asChild
                onClick={() => setOpen(false)}
              >
                <Link href={btn.href}>
                  {btn.icon}
                  <span className="truncate">{btn.title}</span>
                </Link>
              </Button>
            ))}
          </div>
        )}

        {buttons && buttons.length > 0 && <Separator className="my-1 opacity-60" />}

        <ThemeSwitcher setTheme={setTheme} />

        <Separator className="my-1 opacity-60" />

        <div className="p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="w-full justify-start gap-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive focus-visible:bg-destructive/10 transition-colors cursor-pointer"
          >
            <LogOut className="size-4" />
            <span>Sair da conta</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
