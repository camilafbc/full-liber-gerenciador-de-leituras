import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Star } from "lucide-react";
import Image from "next/image";

interface BookCardProps {
  title: string;
  author?: string;
  pages?: number;
  description?: string;
  coverUrl?: string;
  rating?: number;
  variant: "grid" | "list";
}

export const BookCard = ({
  title,
  author,
  pages,
  description,
  coverUrl,
  rating,
  variant,
}: BookCardProps) => {
  if (variant === "list") {
    return (
      <Card className=" gap-4 bg-card border-border items-start">
        <CardContent className="flex flex-col md:flex-row md:gap-4">
          <Image
            src={coverUrl ?? "/teste"}
            alt={title}
            sizes="100%"
            width={0}
            height={0}
            className="w-[150px] h-full transition-transform duration-200 hover:scale-105 rounded-md"
          />

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-foreground truncate">
              {title}
            </h3>
            {author && (
              <p className="text-sm text-muted-foreground">{author}</p>
            )}
            {pages && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {pages} páginas
              </p>
            )}
            {description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-5">
                {description}
              </p>
            )}
            <div className="mt-4">Ver mais</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group flex flex-col p-3 bg-card border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 w-full max-w-[180px]">
      <div className="aspect-3/4 w-full overflow-hidden rounded-sm">
        <Image
          src={coverUrl ?? "/teste"}
          alt={title}
          sizes="100%"
          width={0}
          height={0}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <CardFooter className="flex flex-col items-start gap-2 p-0 pt-3">
        <h3
          className="font-semibold text-md text-foreground line-clamp-2"
          title={title}
        >
          {title}
        </h3>

        {author && (
          <p className="text-xs text-muted-foreground line-clamp-1">{author}</p>
        )}

        <div className="flex items-center gap-1">
          <div className="flex text-accent">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  rating && i < rating
                    ? "fill-current"
                    : "text-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          {rating && (
            <span className="text-xs text-muted-foreground">{rating}/5</span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
