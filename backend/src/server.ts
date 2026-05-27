import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRouter from "./modules/auth/auth.routes";
import booksRouter from "./modules/books/books.routes";
import { libraryRouter } from "./modules/library/library.routes";
import { ensureAuth } from "./middlewares/auth";
import readingProgressRouter from "./modules/reading-progress/reading_progress.routes";
import { userRouter } from "./modules/users/users.routes";

const server = express();

server.use(cors());
server.use(helmet());
server.use(express.json());

server.use("/auth", authRouter);
server.use("/books", ensureAuth, booksRouter);
server.use("/library", ensureAuth, libraryRouter);
server.use("/reading-progress", ensureAuth, readingProgressRouter);
server.use("/users", ensureAuth, userRouter);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
