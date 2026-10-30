import { prisma } from "../../libs/prisma";
import { createRefreshToken } from "../../utils/createRefreshToken";

export const getUserByEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  return user;
};

export const getUserByUuid = async (uuid: string) => {
  const user = await prisma.user.findUnique({
    where: { uuid },
  });
  return user;
};

export const existingAccount = async (
  provider: string,
  providerAccountId: string,
) => {
  const account = await prisma.account.findUnique({
    where: { provider_providerAccountId: { provider, providerAccountId } },
    include: { user: true },
  });
  return account;
};

export const createAccount = async (
  userId: number,
  provider: string,
  providerAccountId: string,
) => {
  const account = await prisma.account.create({
    data: { userId, provider, providerAccountId },
  });
  return account;
};

export const createUser = async (
  name: string,
  email: string,
  passwordHash: string | null,
  provider: string,
  providerAccountId: string,
  imageUrl?: string,
) => {
  return prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        name,
        email,
        avatarUrl: imageUrl,
        ...(passwordHash != null ? { passwordHash } : {}),
      },
    });

    const account = await tx.account.create({
      data: { userId: newUser.id, provider, providerAccountId },
    });

    const refreshToken = await tx.refreshToken.create({
      data: {
        userId: newUser.id,
        token: createRefreshToken(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: {
        id: newUser.id,
        name,
        email,
        uuid: newUser.uuid,
        avatarUrl: newUser.avatarUrl,
        imageUrl: newUser.avatarUrl,
      },
      account: { uuid: account.uuid },
      refreshToken: refreshToken.token,
    };
  });
};

export const generateRefreshToken = async (userUuid: string) => {
  const user = await prisma.user.findUnique({
    where: { uuid: userUuid },
  });

  if (!user) {
    throw new Error("Usuário não identificado");
  }

  const refreshToken = await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: createRefreshToken(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return refreshToken;
};

export const findRefreshToken = async (refreshToken: string) => {
  const token = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });
  return token;
};

export const removeRefreshToken = async (refreshToken: string) => {
  await prisma.refreshToken.delete({ where: { token: refreshToken } });
  return true;
};
