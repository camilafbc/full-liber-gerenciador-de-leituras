import crypto from "crypto";

export const createRefreshToken = () => {
  return crypto.randomBytes(40).toString("hex");
};
