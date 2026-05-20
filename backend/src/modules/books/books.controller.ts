import { RequestHandler } from "express";
import { getBookFromGoogleBooks, searchGoogleBooks } from "./books.services";

export const searchBooks: RequestHandler = async (req, res) => {
  try {
    const query = req.params.q as string;

    if (!query) {
      return res
        .status(400)
        .json({ error: "Termo de busca incorreto ou ausente" });
    }

    const books = await searchGoogleBooks(query);

    return res.status(200).json(books);
  } catch (error) {
    console.error("Erro ao buscar livros no GoogleBooks: ", error);
    return res.status(500).json({ error: "Erro ao buscar livros" });
  }
};

export const getBookFromGoogle: RequestHandler = async (req, res) => {
  console.log("PARAMS: ", req.params);
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
