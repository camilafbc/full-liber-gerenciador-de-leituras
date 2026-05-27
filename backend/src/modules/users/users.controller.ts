import { RequestHandler } from "express";
import { ExtendedRequest } from "../../types/extended-request";

export const updateUserData: RequestHandler = async (req, res) => {
  try {
    const user = (req as ExtendedRequest).user;
    // AJUSTAR PARA ATUALIZAÇÃO COM PATCH
  } catch (error) {}
};
