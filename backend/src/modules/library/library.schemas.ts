import { z } from "zod";

const bookDetailsSchema = z.object({
  externalId: z.string("O externalId é obrigatório").min(1),
  title: z.string("O título é obrigatório").min(1),
  subtitle: z.string().optional().nullable(),
  authors: z.array(z.string(), "O array de autores é obrigatório"),
  publishedDate: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  pageCount: z.union([z.number(), z.string()]).optional().nullable(),
  categories: z.array(z.string()).optional().default([]),
  imageUrl: z.url().optional().nullable(),
  isbn13: z.string().optional().nullable(),
});

export const addBookSchema = z.object({
  book: bookDetailsSchema,
});

export const updateBookStatusSchema = z.object({
  status: z.enum(["WANT_TO_READ", "READING", "COMPLETED", "DROPPED"]),
  currentPage: z.number().int().min(0).optional(),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(5000).nullable().optional(),
});

export type AddBookSchema = z.infer<typeof addBookSchema>;
