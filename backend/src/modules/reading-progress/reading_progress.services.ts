import { prisma } from "../../libs/prisma";
import { getUserByUuid } from "../users/users.services";

export const addProgress = async (
  userUuid: string,
  bookUuid: string,
  currentPage: number,
) => {
  if (!userUuid || !bookUuid || currentPage < 0) {
    throw new Error("Parâmetros obrigatórios ausentes");
  }

  const user = await getUserByUuid(userUuid);

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  const book = await prisma.book.findUnique({ where: { uuid: bookUuid } });

  if (!book) {
    throw new Error("Livro não encontrado");
  }

  return prisma.$transaction(async (tx) => {
    const libraryItem = await tx.library.findFirst({
      where: {
        userId: user.id,
        bookId: book.id,
        active: true,
      },
      include: {
        book: true,
      },
    });

    if (!libraryItem) {
      throw new Error("Este livro não está adicionado à biblioteca do usuário");
    }

    if (
      libraryItem.book.pageCount > 0 &&
      currentPage > libraryItem.book.pageCount
    ) {
      throw new Error("A página atual não pode ultrapassar o total de páginas");
    }

    const progress =
      currentPage > libraryItem.currentPage
        ? await tx.readingProgress.create({
            data: {
              libraryId: libraryItem.id,
              pagesRead: currentPage - libraryItem.currentPage,
              currentPage,
            },
            omit: { id: true, libraryId: true },
          })
        : null;

    const newStatus =
      libraryItem.book.pageCount > 0 &&
      currentPage >= libraryItem.book.pageCount
        ? "COMPLETED"
        : currentPage > 0
          ? "READING"
          : "WANT_TO_READ";
    const finishedAt = newStatus === "COMPLETED" ? new Date() : null;

    await tx.library.update({
      where: { id: libraryItem.id },
      data: {
        currentPage,
        status: newStatus,
        finishedAt,
      },
    });

    return progress;
  });
};
