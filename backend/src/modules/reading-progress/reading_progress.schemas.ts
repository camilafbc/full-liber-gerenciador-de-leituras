import z from "zod";

export const addProgressSchema = z.object({
  bookId: z.number("O ID do livro é obrigatório").int().min(1),
  currentPage: z.number("A página atual é obrigatória").int().min(0),
});

export type AddProgressInput = z.infer<typeof addProgressSchema>;
