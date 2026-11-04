import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRouter from "./modules/auth/auth.routes";
import booksRouter from "./modules/books/books.routes";
import { libraryRouter } from "./modules/library/library.routes";
import { ensureAuth } from "./middlewares/auth";
import readingProgressRouter from "./modules/reading-progress/reading_progress.routes";
import { userRouter } from "./modules/users/users.routes";
import { globalLimiter } from "./config/rateLimit";
import passport from "passport";

import "./libs/passport-google-oauth20";
import cookieParser from "cookie-parser";

const server = express();

// config de deploy
server.set("trust proxy", 1);

server.use(
  cors({
    origin: process.env.ACCESS_URL,
    credentials: true,
  }),
);
server.use(helmet());
server.use(express.json());
server.use(cookieParser());

if (process.env.NODE_ENV !== "test") {
  server.use(globalLimiter);
}

server.use(passport.initialize());

server.use("/auth", authRouter);
server.use("/books", ensureAuth, booksRouter);
server.use("/library", ensureAuth, libraryRouter);
server.use("/reading-progress", ensureAuth, readingProgressRouter);
server.use("/users", ensureAuth, userRouter);

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "test") {
  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

export default server;
