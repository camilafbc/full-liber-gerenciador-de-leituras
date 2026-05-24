import { RequestHandler } from "express";
import { addBook } from "./library.services";
import { ExtendedRequest } from "../../types/extended-request";
import { addBookSchema } from "./library.schemas";
import { Book } from "../../types/Book";

export const addBookToLibrary: RequestHandler = async (req, res) => {
  try {
    const userId = (req as ExtendedRequest).user.uuid;
    const book = req.body;

    if (!userId) {
      return res.status(400).json({ error: "ID do usuário não enviado" });
    }

    const data = addBookSchema.safeParse(book);

    if (!data.success) {
      return res.status(400).json({ error: data.error.flatten().fieldErrors });
    }

    const addItem = await addBook(userId, data.data.book as Book);

    return res.status(201).json({
      message: "Livro adicionado à biblioteca com sucesso!",
      item: addItem,
    });
  } catch (error) {
    console.error("Erro ao adicionar livro à biblioteca: ", error);
    return res
      .status(500)
      .json({ error: "Erro ao adicionar livro à biblioteca" });
  }
};
