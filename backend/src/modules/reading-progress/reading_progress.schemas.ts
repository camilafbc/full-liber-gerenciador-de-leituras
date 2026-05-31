import z from "zod";

export const addProgressSchema = z.object({
  bookId: z.string("O ID do livro é obrigatório").min(1),
  currentPage: z.number("A página atual é obrigatória").int().min(0),
});

export type AddProgressInput = z.infer<typeof addProgressSchema>;
