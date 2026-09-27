import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BookOpen, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ImageNotFound } from "./ImageNotFound";
import { Badge } from "./ui/badge";

interface BookCardProps {
  index?: number;
  externalId: string;
  title: string;
  author?: string[];
  pages?: number;
  description?: string;
  coverUrl?: string;
  rating?: number;
  categories?: string[];
  variant: "grid" | "list" | "only";
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const BookCard = ({
  index,
  externalId,
  title,
  author,
  pages,
  description,
  coverUrl,
  rating,
  categories,
  variant,
  onClick,
}: BookCardProps) => {
  const isPriority = index && index < 3;

  if (variant === "list") {
    return (
      <Link href={`/books/${externalId}`} onClick={onClick} className="block">
        <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
          <CardContent className="flex flex-col md:flex-row md:gap-4">
            <div className="relative w-[150px] aspect-2/3 transition-transform duration-200 hover:scale-105 rounded-md bg-muted">
              {coverUrl ? (
                <Image
                  src={coverUrl ?? "/teste"}
                  alt={`Capa do livro - ${title}`}
                  sizes="150px"
                  fill
                  priority={isPriority || false}
                  loading={isPriority ? undefined : "lazy"}
                  className="object-cover rounded-md"
                />
              ) : (
                <ImageNotFound />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-foreground line-clamp-2">
                {title}
              </h3>
              {author && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {author.join(", ")}
                </p>
              )}
              {pages && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {pages} páginas
                </p>
              )}
              {description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-5 text-justify">
                  {description}
                </p>
              )}
              <Button variant="link" className="mt-4 h-auto px-0" tabIndex={-1}>
                Ver detalhes
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  if (variant === "only") {
    return (
      <Card className=" gap-4 bg-card border-border items-start overflow-hidden">
        <CardContent className="flex flex-col md:flex-row md:gap-4">
          <div className="relative w-full max-w-[250px] aspect-2/3 transition-transform duration-200 hover:scale-105 rounded-md">
            {coverUrl ? (
              <Image
                src={coverUrl ?? "/teste"}
                alt={`Capa do livro - ${title}`}
                sizes="150px"
                fill
                priority={isPriority || false}
                loading={isPriority ? undefined : "lazy"}
                className="object-cover rounded-md"
              />
            ) : (
              <ImageNotFound />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-foreground line-clamp-2">
              {title}
            </h3>
            {author && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {author.join(", ")}
              </p>
            )}
            {pages && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {pages} páginas
              </p>
            )}
            {categories &&
              categories.map((c, i) => (
                <Badge key={i} className="mr-2 my-4 dark:bg-accent">
                  {c}
                </Badge>
              ))}
            {description && (
              <div
                className="
                [&_p]:mb-4
                [&_b]:font-semibold
                [&_br]:mb-2
              "
                dangerouslySetInnerHTML={{ __html: description }}
              />
            )}
            <Button variant="link" className="mt-4 h-auto px-0">
              Ver detalhes
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "group flex w-full max-w-[180px] flex-col p-3 transition-shadow hover:shadow-md",
      )}
    >
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
