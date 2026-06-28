import { getBook } from "@/api/books";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BookDetails } from "./components/BookDetails";

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
  return <BookDetails data={data} />;
}
