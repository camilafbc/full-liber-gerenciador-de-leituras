import { prisma } from "../../libs/prisma";

export const getUserByUuid = async (uuid: string) => {
  const user = await prisma.user.findUnique({
    where: {
      uuid: uuid,
    },
  });
  return user;
};
