import { prisma } from "../../libs/prisma";
import { getUserByUuid } from "../users/users.services";

export const addProgress = async (
  userUuid: string,
  bookUuid: string,
  currentPage: number,
) => {
  if (!userUuid || !bookUuid || !currentPage) {
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
    const libraryItem = await tx.library.findUnique({
      where: {
        userId_bookId: { userId: user.id, bookId: book.id },
        active: true,
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
      omit: {
        id: true,
        libraryId: true,
      },
    });

    let newStatus = libraryItem.status;
    let finishedAt = libraryItem.finishedAt;

    // atualiza status no primeiro registro de leitura
    if (libraryItem.status === "WANT_TO_READ" && currentPage > 0) {
      newStatus = "READING";
    }
    // atualiza status ao páginas lidas = páginas do livro
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
