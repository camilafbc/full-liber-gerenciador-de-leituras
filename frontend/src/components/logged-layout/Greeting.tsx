"use client";

import { Moon, Sun, Sunset } from "lucide-react";
import { useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

export type DayPeriod = "morning" | "afternoon" | "evening";

export interface GreetingConfig {
  period: DayPeriod;
  greeting: string;
  Icon: typeof Sun;
  colorClass: string;
}

export const PERIOD_CONFIG: Record<DayPeriod, GreetingConfig> = {
  morning: {
    period: "morning",
    greeting: "Bom dia",
    Icon: Sun,
    colorClass: "text-amber-500 dark:text-amber-400",
  },
  afternoon: {
    period: "afternoon",
    greeting: "Boa tarde",
    Icon: Sunset,
    colorClass: "text-orange-500 dark:text-orange-400",
  },
  evening: {
    period: "evening",
    greeting: "Boa noite",
    Icon: Moon,
    colorClass: "text-indigo-400 dark:text-indigo-300",
  },
};

/**
 * Retorna o período do dia atual baseado na hora local:
 * - Manhã: 05:00 às 11:59
 * - Tarde: 12:00 às 17:59
 * - Noite: 18:00 às 04:59
 */
export function getDayPeriod(date = new Date()): DayPeriod {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return "morning";
  }

  if (hour >= 12 && hour < 18) {
    return "afternoon";
  }

  return "evening";
}

export function getDayPeriodConfig(date = new Date()): GreetingConfig {
  return PERIOD_CONFIG[getDayPeriod(date)];
}

// Assinatura para reavaliar o período do dia a cada minuto
function subscribe(onStoreChange: () => void) {
  const interval = setInterval(onStoreChange, 60_000);
  return () => clearInterval(interval);
}

function getClientSnapshot(): DayPeriod {
  return getDayPeriod(new Date());
}

function getServerSnapshot(): DayPeriod {
  return "morning";
}

export interface GreetingProps {
  name?: string;
  className?: string;
  showIcon?: boolean;
}

export function Greeting({
  name,
  className,
  showIcon = true,
}: GreetingProps) {
  // useSyncExternalStore sincroniza com a hora do navegador sem disparar renders em cascata
  const period = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const { greeting, Icon, colorClass } = PERIOD_CONFIG[period];

  // Extrai o primeiro nome para uma saudação mais elegante e concisa
  const firstName = name?.trim().split(/\s+/)[0];

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 min-w-0 select-none",
        className,
      )}
    >
      {showIcon && (
        <span
          className={cn(
            "flex size-7 sm:size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60 ring-1 ring-border/50",
            colorClass,
          )}
          aria-hidden="true"
        >
          <Icon className="size-4 sm:size-4.5" />
        </span>
      )}

      <h1 className="truncate text-base sm:text-lg md:text-xl font-semibold tracking-tight text-foreground">
        <span>{greeting}</span>
        {firstName && (
          <>
            <span className="text-muted-foreground font-normal">, </span>
            <span className="text-foreground">{firstName}</span>
          </>
        )}
        <span>!</span>
      </h1>
    </div>
  );
}

export default Greeting;
