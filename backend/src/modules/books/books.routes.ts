import express from "express";
import * as BooksController from "./books.controller";

const booksRouter = express.Router();

booksRouter.get("/search:q", BooksController.searchBooks);
booksRouter.get("/search/:id", BooksController.getBookFromGoogle);

export default booksRouter;
