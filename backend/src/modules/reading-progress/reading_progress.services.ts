import { prisma } from "../../libs/prisma";
import { getUserByUuid } from "../users/users.services";

export const addProgress = async (
  userUuid: string,
  bookId: number,
  currentPage: number,
) => {
  if (!userUuid || !bookId || !currentPage) {
    throw new Error("Parâmetros obrigatórios ausentes");
  }

  const user = await getUserByUuid(userUuid);

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  return prisma.$transaction(async (tx) => {
    const libraryItem = await tx.library.findUnique({
      where: {
        userId_bookId: { userId: user.id, bookId },
      },
      include: {
        book: true,
      },
    });

    if (!libraryItem) {
      throw new Error("Este livro não está adicionado à biblioteca do usuário");
    }

    const pagesRead = currentPage - libraryItem.currentPage;

    if (currentPage <= libraryItem.currentPage) {
      throw new Error(
        "A nova página atual deve ser maior do que a página registrada anteriormente.",
      );
    }

    const progress = await tx.readingProgress.create({
      data: {
        libraryId: libraryItem.id,
        pagesRead,
        currentPage,
      },
    });

    let newStatus = libraryItem.status;
    let finishedAt = libraryItem.finishedAt;

    if (
      currentPage >= libraryItem.book.pageCount &&
      libraryItem.book.pageCount > 0
    ) {
      newStatus = "COMPLETED";
      finishedAt = new Date();
    }

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
