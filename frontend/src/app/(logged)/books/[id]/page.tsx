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

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/books/search/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    );

    if (!response.ok) throw new Error("Livro não encontrado");
    const book = (await response.json()) as Book;
    return <BookManager initialBook={book} />;
  } catch {
    redirect("/biblioteca");
  }
}
