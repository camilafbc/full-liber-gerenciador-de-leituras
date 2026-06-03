import { z } from "zod";

export const createUserSchema = z.object({
  name: z
    .string("Campo obrigatório")
    .trim()
    .min(3, "Name deve ter no mínimo 3 caracteres"),
  email: z.email("Email inválido").trim().min(1, "Email é obrigatório"),
  password: z
    .string("Campo obrigatório")
    .trim()
    .min(6, "A senha deve ter no mínimo 6 caracteres")
    .max(10, "A senha deve ter no máximo 10 caracteres")
    .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
    .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
    .regex(/[0-9]/, "A senha deve conter pelo menos um número")
    .regex(
      /[^a-zA-Z0-9]/,
      "A senha deve conter pelo menos um caractere especial (@, #, $, etc.)",
    ),
  imageUrl: z.string().optional(),
});

export const signInSchema = z.object({
  email: z.email("Email inválido").trim(),
  password: z
    .string("Campo obrigatório")
    .trim()
    .min(1, "A senha é obrigatória"),
});

export type CreateUserSchema = z.infer<typeof createUserSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
