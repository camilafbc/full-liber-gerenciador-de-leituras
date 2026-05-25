import express from "express";
import * as ReadingProgressController from "./reading_progress.controller";

const readingProgressRouter = express.Router();

readingProgressRouter.post(
  "/update",
  ReadingProgressController.addReadingProgress,
);

export default readingProgressRouter;
