import { z } from "zod";

export const updateUserSchema = z.object({
  name: z
    .string("Campo obrigatório")
    .trim()
    .min(3, "Name deve ter no mínimo 3 caracteres")
    .optional(),
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
    )
    .optional(),
});
