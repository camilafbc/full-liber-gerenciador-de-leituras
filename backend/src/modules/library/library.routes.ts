import express from "express";
import * as LibraryController from "./library.controller";

export const libraryRouter = express.Router();

libraryRouter.post("/book", LibraryController.addBookToLibrary);
