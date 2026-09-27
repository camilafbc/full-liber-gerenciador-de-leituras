import { z } from "zod";

export const signUpSchema = z
  .object({
    name: z
      .string("Campo obrigatório")
      .trim()
      .min(3, "O nome deve ter no mínimo 3 caracteres"),
    email: z.email("E-mail inválido").trim(),
    password: z
      .string("Campo obrigatório")
      .min(6, "A senha deve ter no mínimo 6 caracteres")
      .max(10, "A senha deve ter no máximo 10 caracteres")
      .regex(/[a-z]/, "A senha deve conter uma letra minúscula")
      .regex(/[A-Z]/, "A senha deve conter uma letra maiúscula")
      .regex(/[0-9]/, "A senha deve conter um número")
      .regex(/[^a-zA-Z0-9]/, "A senha deve conter um caractere especial"),
    confirmPassword: z.string("Campo obrigatório"),
  })
  .superRefine(({ password, confirmPassword }, context) => {
    if (password !== confirmPassword) {
      context.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "As senhas precisam ser iguais",
      });
    }
  });

export type SignUpInput = z.infer<typeof signUpSchema>;
