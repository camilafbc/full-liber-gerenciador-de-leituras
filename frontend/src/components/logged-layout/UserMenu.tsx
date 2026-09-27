"use client";

import { Laptop, LogOut, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { ReactNode, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";

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

const icons = {
  light: Sun,
  dark: Moon,
  system: Laptop,
};

export const ThemeSwitcher = ({
  setTheme,
}: {
  setTheme: (theme: string) => void;
}) => (
  <div className="space-y-1 px-1 py-2">
    <p className="px-2 text-xs font-medium text-muted-foreground">Aparência</p>
    {[
      { theme: "light", icon: "light", label: "Claro" },
      { theme: "dark", icon: "dark", label: "Escuro" },
      { theme: "system", icon: "system", label: "Sistema" },
    ].map((item) => {
      const Icon = icons[item.icon as keyof typeof icons];
      return (
        <Button
          key={item.theme}
          variant="ghost"
          size="sm"
          onClick={() => setTheme(item.theme)}
          className="w-full justify-start gap-2"
        >
          <Icon className="size-4" />
          {item.label}
        </Button>
      );
    })}
  </div>
);

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
        <Button
          variant="ghost"
          size="icon-lg"
          className="rounded-full"
          aria-label="Menu do usuário"
        >
          <Avatar className="size-10">
            {avatarImage && (
              <AvatarImage
                src={avatarImage}
                alt={`Foto de ${name ?? "usuário"}`}
              />
            )}
            <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground dark:bg-accent dark:text-accent-foreground">
              {initials || "?"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="end">
        {userInfo && name && (
          <div className="space-y-0.5 px-4 py-3">
            <p className="truncate text-sm font-semibold">{name}</p>
            {email && (
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            )}
          </div>
        )}
        {userInfo && <Separator className="-my-2.5" />}
        {buttons?.map((btn, index) => (
          <div key={index} className="p-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              asChild
              onClick={() => setOpen(false)}
            >
              <Link href={btn.href}>
                {btn.icon}
                {btn.title}
              </Link>
            </Button>
          </div>
        ))}
        {buttons && buttons.length > 0 && <Separator />}
        <ThemeSwitcher setTheme={setTheme} />
        <Separator className="-my-2.5" />
        <div className="p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="size-4" />
            Sair
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
