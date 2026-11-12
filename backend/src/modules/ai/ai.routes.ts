import express from "express";
import * as aiController from "./ai.controller";

export const aiRouter = express.Router();

aiRouter.post("/chat", aiController.handleChat);
