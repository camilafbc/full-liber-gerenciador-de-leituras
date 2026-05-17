import express from "express";
import * as AuthController from "./auth.controller";
import passport from "passport";
import { ensureAuth } from "../../middlewares/auth";

const authRouter = express.Router();

authRouter.post("/signup", AuthController.signUp);
authRouter.post("/signin", AuthController.signIn);
authRouter.get("/me", ensureAuth, AuthController.userData);

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
