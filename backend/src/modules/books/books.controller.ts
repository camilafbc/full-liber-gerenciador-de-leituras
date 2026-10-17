import { RequestHandler } from "express";
import { getBookFromGoogleBooks, searchGoogleBooks } from "./books.services";
import { ExtendedRequest } from "../../types/extended-request";

export const searchBooks: RequestHandler = async (req, res) => {
  try {
    const rawQuery = (req.query.q as string) || "";
    const searchTerm = rawQuery.replace(/^\?q=/, "").trim();

    if (!searchTerm) {
      return res
        .status(400)
        .json({ error: "Termo de busca incorreto ou ausente" });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await searchGoogleBooks(searchTerm, page, limit);

    return res.status(200).json({
      meta: {
        page,
        limit,
        totalItems: result.totalItems,
        totalPages: Math.ceil(result.totalItems / limit),
      },
      data: result.books,
    });
  } catch (error) {
    console.error("Erro ao buscar livros no GoogleBooks: ", error);
    return res.status(500).json({ error: "Erro ao buscar livros" });
  }
};

export const getBookFromGoogle: RequestHandler = async (req, res) => {
  try {
    const user = (req as ExtendedRequest).user;
    const id = req.params.id as string;

    if (!user) {
      return res.status(401).json({ error: "Usuário não identificado" });
    }

    if (!id) {
      return res.status(400).json({
        error: "ID do livro incorreto ou ausente incorreto ou ausente",
      });
    }

    const book = await getBookFromGoogleBooks(id, user.uuid);

    return res.status(200).json(book);
  } catch (error) {
    console.error("Erro ao buscar livro no GoogleBooks: ", error);
    return res.status(500).json({ error: "Erro ao buscar livro" });
  }
};
