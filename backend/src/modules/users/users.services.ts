import { prisma } from "../../libs/prisma";
import bcrypt from "bcrypt";

export const getUserByUuid = async (uuid: string) => {
  const user = await prisma.user.findUnique({
    where: {
      uuid: uuid,
    },
  });
  return user;
};

export const updateUser = async (
  userId: string,
  data: { name?: string; password?: string },
) => {
  const updateData: any = {};

  const user = await prisma.user.findUnique({
    where: { uuid: userId },
  });

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  if (data.name) {
    updateData.name = data.name;
  }

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: updateData,
    select: {
      uuid: true,
      name: true,
    },
  });

  return updatedUser;
};
