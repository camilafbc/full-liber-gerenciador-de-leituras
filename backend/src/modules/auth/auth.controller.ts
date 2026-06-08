import { RequestHandler } from "express";
import { createUserSchema, signInSchema } from "./auth.schemas";
import {
  createUser,
  findRefreshToken,
  generateRefreshToken,
  getUserByEmail,
  removeRefreshToken,
} from "./auth.services";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../../types/User";
import { ExtendedRequest } from "../../types/extended-request";
import { handleDatabaseError } from "../../utils/handleDBErros";

export const signUp: RequestHandler = async (req, res) => {
  try {
    // Validar dados recebidos
    const data = createUserSchema.safeParse(req.body);
    if (!data.success) {
      return res.status(400).json({ error: data.error.flatten().fieldErrors });
    }

    // Verificar se usuário já existe
    const user = await getUserByEmail(data.data.email);
    if (user) {
      return res.status(400).json({ error: "Usuário já existe" });
    }

    // Criar usuário
    const passwordHash = await bcrypt.hash(data.data.password, 10);

    const newUser = await createUser(
      data.data.name,
      data.data.email,
      passwordHash,
      "credentials",
      "local",
      data.data.imageUrl,
    );

    // retornar os dados o usuário criado
    return res.status(201).json(newUser);
  } catch (error) {
    console.error("Erro ao criar usuário: ", error);
    const dbError = handleDatabaseError(error);
    return res.status(dbError.status).json({ error: dbError.message });
  }
};

export const signIn: RequestHandler = async (req, res) => {
  console.log("Chegando: ", req.body);
  try {
    // Validar dados recebidos
    const data = signInSchema.safeParse(req.body);
    if (!data.success) {
      return res.status(400).json({ error: data.error.flatten().fieldErrors });
    }
    // Verificar se usuario existe
    const user = await getUserByEmail(data.data.email);
    if (!user) {
      return res.status(400).json({ error: "E-mail não cadastrado" });
    }

    const passwordCompare = await bcrypt.compare(
      data.data.password,
      user.passwordHash as string,
    );

    if (!passwordCompare) {
      return res.status(400).json({ error: "Usuário ou senha inválidos" });
    }

    const accessToken = jwt.sign(
      { uuid: user.uuid },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "15m",
      },
    );

    const newRefreshToken = await generateRefreshToken(user.uuid);

    return res.status(200).json({
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        uuid: user.uuid,
        name: user.name,
        email: user.email,
        avatar: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Erro ao realizar login: ", error);
    const dbError = handleDatabaseError(error);
    return res.status(dbError.status).json({ error: dbError.message });
  }
};

export const userData: RequestHandler = async (req, res) => {
  try {
    const user = (req as ExtendedRequest).user as User;

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    return res.status(200).json({
      user: {
        uuid: user.uuid,
        name: user.name,
        email: user.email,
        avatar: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar dados do usuário autenticado: ", error);
    const dbError = handleDatabaseError(error);
    return res.status(dbError.status).json({ error: dbError.message });
  }
};

export const googleCallback: RequestHandler = async (req, res) => {
  try {
    const user = (req as ExtendedRequest).user;

    if (!user) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    const accessToken = jwt.sign(
      { uuid: user.uuid },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "15m",
      },
    );

    const refreshToken = await generateRefreshToken(user.uuid);

    return res.redirect(
      `http://localhost:3000/auth-callback?token=${accessToken}&refresh=${refreshToken}`,
    );
  } catch (error) {
    console.error(error);
    const dbError = handleDatabaseError(error);
    return res.status(dbError.status).json({ error: dbError.message });
  }
};

export const refreshSession: RequestHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token é obrigatório!" });
    }

    const savedToken = await findRefreshToken(refreshToken);

    if (!savedToken) {
      return res.status(401).json({ error: "Refresh token inválido" });
    }

    if (new Date() > savedToken.expiresAt) {
      await removeRefreshToken(refreshToken);
      return res
        .status(401)
        .json({ error: "Refresh token expirado. Faça login novamente." });
    }

    const newAccesToken = jwt.sign(
      { uuid: savedToken.user.uuid },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" },
    );

    return res.status(200).json({ accessToken: newAccesToken });
  } catch (error) {
    console.error("Erro ao gerar refreshSession: ", error);
    const dbError = handleDatabaseError(error);
    return res.status(dbError.status).json({ error: dbError.message });
  }
};
