import { prisma } from "../../libs/prisma";

export const addProgress = async (
  userId: string,
  bookId: number,
  currentPage: number,
) => {
  if (!userId || !bookId || !currentPage) {
    throw new Error("Parâmetros obrigatórios ausentes");
  }

  return prisma.$transaction(async (tx) => {
    const libraryItem = await tx.library.findUnique({
      where: {
        userId_bookId: { userId, bookId },
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
