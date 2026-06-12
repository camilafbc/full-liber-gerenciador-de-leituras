import z from "zod";

export const signInSchema = z.object({
  email: z.email("Email inválido").trim(),
  password: z
    .string("Campo obrigatório")
    .trim()
    .min(1, "A senha deve ter entre 6 e 10 caracteres"),
});

export type SignInInput = z.infer<typeof signInSchema>;
