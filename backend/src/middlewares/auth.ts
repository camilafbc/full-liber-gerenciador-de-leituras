import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { getUserByUuid } from "../modules/auth/auth.services";
import { ExtendedRequest } from "../types/extended-request";

export async function ensureAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Usuário não autenticado!" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Usuário não autenticado!" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    if (typeof decoded === "string" || typeof decoded.uuid !== "string") {
      return res.status(401).json({ error: "Token inválido ou expirado." });
    }

    const user = await getUserByUuid(decoded.uuid);
    if (!user) {
      return res.status(401).json({ error: "Usuário não autenticado!" });
    }

    (req as ExtendedRequest).user = user;

    return next();
  } catch (error) {
    console.error("Erro na validação do JWT: ", error);
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
}
