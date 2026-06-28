import { z } from "zod";

export const updateUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Nome deve ter ao menos 3 caracteres")
      .optional()
      .or(z.literal("")), // Permite string vazia se o usuário não mexer no input

    password: z
      .string()
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
      .optional()
      .or(z.literal("")), // Permite string vazia caso o usuário não queira alterar a senha

    confirmPassword: z.string().trim().optional().or(z.literal("")),
  })
  // 🔥 Regra de Refinamento: Aplica a validação cruzada entre os campos
  .superRefine(({ password, confirmPassword }, ctx) => {
    // Se a senha foi preenchida (existe e não é uma string vazia)
    if (password && password.length > 0) {
      // 1. Verifica se a confirmação está vazia ou não foi enviada
      if (!confirmPassword || confirmPassword.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Confirmação de senha é obrigatória",
          path: ["confirmPassword"], // Aponta o erro diretamente para o campo certo
        });
        return;
      }

      // 2. Verifica se as duas senhas são idênticas
      if (password !== confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "As senhas não coincidem",
          path: ["confirmPassword"],
        });
      }
    }
  });

export type UserUpdateInput = z.infer<typeof updateUserSchema>;
