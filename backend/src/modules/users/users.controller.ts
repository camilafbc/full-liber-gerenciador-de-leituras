import { RequestHandler } from "express";
import { ExtendedRequest } from "../../types/extended-request";
import { handleDatabaseError } from "../../utils/handleDBErros";
import { updateUserSchema } from "./users.schema";
import { updateUser } from "./users.services";

export const updateUserData: RequestHandler = async (req, res) => {
  try {
    const user = (req as ExtendedRequest).user;

    if (!user) {
      return res
        .status(401)
        .json({ error: "Usuário não autenticado ou ID ausente" });
    }

    const data = updateUserSchema.safeParse(req.body);

    if (!data.success) {
      return res.status(400).json({ error: data.error.flatten().fieldErrors });
    }

    const userUpdated = await updateUser(user.uuid, data.data);

    return res
      .status(200)
      .json({
        message: "Dados do perfil atualizados com sucesso!",
        data: userUpdated,
      });
  } catch (error) {
    console.error("Erro ao adicionar livro à biblioteca: ", error);
    const dbError = handleDatabaseError(error);
    return res.status(dbError.status).json({ error: dbError.message });
  }
};
