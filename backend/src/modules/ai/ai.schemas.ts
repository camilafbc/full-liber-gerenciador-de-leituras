import { z } from "zod";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "model"]),
  content: z.string().min(1, "O conteúdo da mensagem não pode ser vazio.").max(2000, "Mensagem muito longa."),
});

export const chatRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "A mensagem não pode ser vazia.")
    .max(1000, "A mensagem deve ter no máximo 1000 caracteres."),
  history: z.array(chatMessageSchema).optional().default([]),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
