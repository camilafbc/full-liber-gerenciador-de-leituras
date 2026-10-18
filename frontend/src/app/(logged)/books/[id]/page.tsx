import { Book } from "@/types/Book";
import { getServerAuthToken } from "@/lib/serverAuth";
import { redirect } from "next/navigation";
import { BookManager } from "./BookManager";

interface BookPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookPage({ params }: BookPageProps) {
  const { id } = await params;
  if (!id) redirect("/biblioteca");

  const token = await getServerAuthToken();
  if (!token) redirect("/login");

  let book: Book | null = null;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/books/search/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    );

    if (!response.ok) throw new Error("Livro não encontrado");
    book = (await response.json()) as Book;
  } catch {
    redirect("/biblioteca");
  }

  if (!book) redirect("/biblioteca");

  return <BookManager initialBook={book} />;
}
