import { RequestHandler } from "express";
import { ExtendedRequest } from "../../types/extended-request";
import { chatRequestSchema } from "./ai.schemas";
import { chatWithAdvisor } from "./ai.services";

export const handleChat: RequestHandler = async (req, res) => {
  try {
    const user = (req as ExtendedRequest).user;

    if (!user) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }

    const parseResult = chatRequestSchema.safeParse(req.body);

    if (!parseResult.success) {
      const firstError =
        parseResult.error.issues[0]?.message || "Dados da requisição inválidos.";
      return res.status(400).json({ error: firstError });
    }

    const { message, history } = parseResult.data;

    const response = await chatWithAdvisor(
      user.id,
      user.name || "Leitora",
      message,
      history,
    );

    return res.status(200).json(response);
  } catch (error) {
    console.error("Erro no controller do consultor de IA:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro interno no processamento da consulta.";
    return res.status(500).json({ error: errorMessage });
  }
};
