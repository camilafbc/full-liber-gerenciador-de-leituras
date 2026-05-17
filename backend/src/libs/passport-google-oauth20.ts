import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import {
  createAccount,
  createUser,
  existingAccount,
  getUserByEmail,
} from "../modules/auth/auth.services";

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
        // Conta google já cadastrada
        const existingGoogleAccount = await existingAccount(
          "google",
          profile.id,
        );
        if (existingGoogleAccount)
          return done(null, existingGoogleAccount.user);
        // E-mail cadastrado, mas não via google
        const existingEmailUser = await getUserByEmail(email);
        if (existingEmailUser) {
          await createAccount(existingEmailUser.uuid, "google", profile.id);
          return done(null, existingEmailUser);
        }
        //  Nova conta
        const newUser = await createUser(
          profile.displayName,
          email,
          "google",
          profile.id,
          profile.photos?.[0].value || "",
        );

        return done(null, newUser.user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);
