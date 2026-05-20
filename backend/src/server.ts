import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRouter from "./modules/auth/auth.routes";
import booksRouter from "./modules/books/books.routes";

const server = express();

server.use(cors());
server.use(helmet());
server.use(express.json());

server.use("/auth", authRouter);
server.use("/books", booksRouter);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on  http://localhost:${PORT}`);
});
