import { RequestHandler } from "express";
import {
  addBook,
  deleteBook,
  getLibraryItem,
  listBooks,
} from "./library.services";
import { ExtendedRequest } from "../../types/extended-request";
import { addBookSchema, updateBookStatusSchema } from "./library.schemas";
import { Book } from "../../types/Book";
import { handleDatabaseError } from "../../utils/handleDBErros";
import { ReadingStatus } from "./library.types";
import { updateBookStatus } from "./library.services";

export const getBooks: RequestHandler = async (req, res) => {
  try {
    const query = req.query;
    const user = (req as ExtendedRequest).user;

    if (!user) {
      return res.status(401).json({ error: "Usuário não identificado" });
    }

    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const status = query.status as ReadingStatus;

    const result = await listBooks(user.uuid, page, limit, status);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Erro ao listar itens da biblioteca: ", error);
    const dbError = handleDatabaseError(error);
    return res.status(dbError.status).json({ error: dbError.message });
  }
};

export const getBookItem: RequestHandler = async (req, res) => {
  try {
    const user = (req as ExtendedRequest).user;
    const bookId = req.params.bookId as string;

    if (!user) {
      return res.status(401).json({ error: "Usuário não identificado" });
    }

    if (!bookId) {
      return res.status(400).json({ error: "Parâmetro ID não enviado" });
    }

    const result = await getLibraryItem(user.uuid, bookId);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Erro ao remover livro da biblioteca: ", error);
    const dbError = handleDatabaseError(error);
    return res.status(dbError.status).json({ error: dbError.message });
  }
};

export const addBookToLibrary: RequestHandler = async (req, res) => {
  try {
    const user = (req as ExtendedRequest).user;
    const book = req.body;

    if (!user) {
      return res.status(401).json({ error: "Usuário não identificado" });
    }

    const data = addBookSchema.safeParse(book);

    if (!data.success) {
      return res.status(400).json({ error: data.error.flatten().fieldErrors });
    }

    const addItem = await addBook(user.uuid, data.data.book as Book);

    return res.status(201).json({
      message: "Livro adicionado à biblioteca com sucesso!",
      item: addItem,
    });
  } catch (error) {
    console.error("Erro ao adicionar livro à biblioteca: ", error);
    const dbError = handleDatabaseError(error);
    return res.status(dbError.status).json({ error: dbError.message });
  }
};

export const deleteBookFromLibrary: RequestHandler = async (req, res) => {
  try {
    const user = (req as ExtendedRequest).user;
    const bookId = req.params.bookId as string;

    if (!user) {
      return res.status(401).json({ error: "Usuário não identificado" });
    }

    if (!bookId) {
      return res.status(400).json({ error: "Parâmetro ID não enviado" });
    }

    await deleteBook(user.uuid, bookId);

    return res.status(200).json({ message: "Livro removido com sucesso!" });
  } catch (error) {
    console.error("Erro ao remover livro da biblioteca: ", error);
    const dbError = handleDatabaseError(error);
    return res.status(dbError.status).json({ error: dbError.message });
  }
};

export const updateBookStatusInLibrary: RequestHandler = async (req, res) => {
  try {
    const user = (req as ExtendedRequest).user;
    const bookUuid = req.params.bookId as string;

    if (!user) {
      return res.status(401).json({ error: "Usuário não identificado" });
    }

    const data = updateBookStatusSchema.safeParse(req.body);

    if (!data.success) {
      return res.status(400).json({ error: data.error.flatten().fieldErrors });
    }

    const item = await updateBookStatus(
      user.uuid,
      bookUuid,
      data.data.status as ReadingStatus,
      data.data.currentPage,
    );

    return res.status(200).json(item);
  } catch (error) {
    console.error("Erro ao atualizar status do livro: ", error);
    const dbError = handleDatabaseError(error);
    return res.status(dbError.status).json({ error: dbError.message });
  }
};
