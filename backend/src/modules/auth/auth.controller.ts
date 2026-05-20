import { RequestHandler } from "express";
import { createUserSchema, signInSchema } from "./auth.schemas";
import { createUser, getUserByEmail } from "./auth.services";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../../types/User";
import { ExtendedRequest } from "../../types/extended-request";

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
    return res.status(500).json({ error: "Erro ao criar usuário" });
  }
};

export const signIn: RequestHandler = async (req, res) => {
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
      user.passwordHash,
    );

    if (!passwordCompare) {
      return res.status(400).json({ error: "Usuário ou senha inválidos" });
    }

    const token = jwt.sign({ uuid: user.uuid }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json(token);
  } catch (error) {
    console.error("Erro ao realizar login: ", error);
    return res
      .status(500)
      .json({ error: "Erro ao realizar login. Tente novamente mais tarde." });
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
    console.error("Erro ao buscar dados do usuário: ", error);
    return res.status(500).json({ error: "Erro ao buscar dados do usuário" });
  }
};

export const googleCallback: RequestHandler = async (req, res) => {
  try {
    const user = (req as ExtendedRequest).user;

    if (!user) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    const token = jwt.sign({ uuid: user.uuid }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.redirect(`http://localhost:3000/auth-callback?token=${token}`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno" });
  }
};
