import { BookOpen } from "lucide-react";

export const ImageNotFound = () => {
  return (
    <div className="flex aspect-2/3 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/40 p-4 text-center text-muted-foreground">
      <BookOpen className="size-8 opacity-40" />
      <span className="text-xs font-medium">Sem capa disponível</span>
    </div>
  );
};
