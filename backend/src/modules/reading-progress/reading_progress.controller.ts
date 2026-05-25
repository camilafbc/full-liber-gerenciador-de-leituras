import { RequestHandler } from "express";
import { handleDatabaseError } from "../../utils/handleDBErros";
import { ExtendedRequest } from "../../types/extended-request";
import { addProgressSchema } from "./reading_progress.schemas";
import { addProgress } from "./reading_progress.services";

export const addReadingProgress: RequestHandler = async (req, res) => {
  try {
    const userId = (req as ExtendedRequest).user.uuid;

    console.log("CHEGANDO: ", req.body);

    if (!userId) {
      return res
        .status(401)
        .json({ error: "Usuário não autenticado ou ID ausente" });
    }

    const data = addProgressSchema.safeParse(req.body);

    if (!data.success) {
      return res.status(400).json({ error: data.error.flatten().fieldErrors });
    }

    const progress = await addProgress(
      userId,
      data.data.bookId,
      data.data.currentPage,
    );

    return res.status(201).json({
      message: "Progresso de leitura registrado com sucesso!",
      data: progress,
    });
  } catch (error) {
    console.error("Erro ao registrar progresso de leitura: ", error);
    const dbError = handleDatabaseError(error);
    return res.status(dbError.status).json({ Error: dbError.message });
  }
};
