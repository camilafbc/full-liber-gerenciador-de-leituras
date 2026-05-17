import jwt from "jsonwebtoken";
import { getUserByUuid } from "../modules/auth/auth.services";

export async function ensureAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Usuário não autenticado!" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Usuário não autenticado!" });
  }

  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET as string);

    const user = await getUserByUuid(decoded.uuid);
    if (!user) {
      return res.status(401).json({ error: "Usuário não autenticado!" });
    }

    req.user = user;

    return next();
  } catch (error) {
    console.error("Erro na validação do JWT: ", error);
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
}
