import express from "express";
import * as LibraryController from "./library.controller";

export const libraryRouter = express.Router();

libraryRouter.get("/list", LibraryController.getBooks);
libraryRouter.post("/book", LibraryController.addBookToLibrary);
libraryRouter.delete("/book/:bookId", LibraryController.deleteBookFromLibrary);
libraryRouter.get("/book/:bookId", LibraryController.getBookItem);
libraryRouter.patch(
  "/book/:bookId/status",
  LibraryController.updateBookStatusInLibrary,
);
