import { RequestHandler } from "express";
import { getBookFromGoogleBooks, searchGoogleBooks } from "./books.services";

export const searchBooks: RequestHandler = async (req, res) => {
  try {
    const query = req.query;

    if (!query.q) {
      return res
        .status(400)
        .json({ error: "Termo de busca incorreto ou ausente" });
    }

    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;

    const result = await searchGoogleBooks(query.q as string, page, limit);

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
    const id = req.params.id as string;

    if (!id) {
      return res.status(400).json({
        error: "ID do livro incorreto ou ausente incorreto ou ausente",
      });
    }

    const book = await getBookFromGoogleBooks(id);

    return res.status(200).json(book);
  } catch (error) {
    console.error("Erro ao buscar livro no GoogleBooks: ", error);
    return res.status(500).json({ error: "Erro ao buscar livro" });
  }
};
