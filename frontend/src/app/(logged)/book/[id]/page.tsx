import { getBook } from "@/api/books";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BookCard } from "@/components/BookCard";

interface BookPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookPage({ params }: BookPageProps) {
  const { id } = await params;

  if (!id) return <div>ID não encontrado</div>;

  const cookieStore = await cookies();
  const token = cookieStore.get("liber_access_token")?.value;

  if (!token) redirect("/login");

  const data = await getBook(id, token);
  return (
    <BookCard
      key={"1" + data.externalId}
      externalId={data.externalId}
      title={data.title}
      author={data.authors}
      pages={data.pageCount}
      description={data.description}
      coverUrl={data.imageUrl}
      categories={data?.categories}
      variant="only"
    />
  );
}
