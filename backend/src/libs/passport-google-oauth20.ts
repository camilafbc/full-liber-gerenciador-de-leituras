import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import {
  createAccount,
  createUser,
  existingAccount,
  getUserByEmail,
} from "../modules/auth/auth.services";
import { prisma } from "./prisma";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value;
        if (!email) return done(new Error("Conta do Google não possui e-mail"));
        const photoUrl = profile.photos?.[0]?.value || null;

        // Conta google já cadastrada
        const existingGoogleAccount = await existingAccount(
          "google",
          profile.id,
        );
        if (existingGoogleAccount) {
          // Atualiza a foto do avatar se não existir ou se mudou no Google
          if (
            photoUrl &&
            (!existingGoogleAccount.user.avatarUrl ||
              existingGoogleAccount.user.avatarUrl !== photoUrl)
          ) {
            const updatedUser = await prisma.user.update({
              where: { id: existingGoogleAccount.user.id },
              data: { avatarUrl: photoUrl },
            });
            return done(null, updatedUser);
          }
          return done(null, existingGoogleAccount.user);
        }

        // E-mail cadastrado, mas não via google
        const existingEmailUser = await getUserByEmail(email);
        if (existingEmailUser) {
          await createAccount(existingEmailUser.id, "google", profile.id);
          if (
            photoUrl &&
            (!existingEmailUser.avatarUrl ||
              existingEmailUser.avatarUrl !== photoUrl)
          ) {
            const updatedUser = await prisma.user.update({
              where: { id: existingEmailUser.id },
              data: { avatarUrl: photoUrl },
            });
            return done(null, updatedUser);
          }
          return done(null, existingEmailUser);
        }

        // Nova conta
        const newUser = await createUser(
          profile.displayName,
          email,
          null,
          "google",
          profile.id,
          photoUrl || "",
        );

        return done(null, newUser.user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);
