import { prisma } from "../../libs/prisma";

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
  userId: string,
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
      data: { userId: newUser.uuid, provider, providerAccountId },
    });

    return {
      user: {
        name,
        email,
        uuid: newUser.uuid,
        imageUrl: newUser.avatarUrl,
      },
      account: { uuid: account.uuid },
    };
  });
};
