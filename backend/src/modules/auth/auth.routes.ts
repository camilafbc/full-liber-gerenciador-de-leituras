import express from "express";
import * as AuthController from "./auth.controller";
import passport from "passport";
import { ensureAuth } from "../../middlewares/auth";
import { authLimiter } from "../../config/rateLimit";

const authRouter = express.Router();

authRouter.post("/signup", authLimiter, AuthController.signUp);
authRouter.post("/signin", authLimiter, AuthController.signIn);
authRouter.get("/me", ensureAuth, AuthController.userData);
authRouter.post("/refresh", AuthController.refreshSession);

authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  AuthController.googleCallback,
);

export default authRouter;
