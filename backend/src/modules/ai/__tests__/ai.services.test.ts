import { prisma } from "../../../libs/prisma";
import { googleBooksGateway } from "../../../gateway/googleBooks.gateway";
import {
  getUserReadingContext,
  buildSystemInstruction,
  enrichRecommendedBooks,
  chatWithAdvisor,
} from "../ai.services";
import * as aiController from "../ai.controller";
import { ExtendedRequest } from "../../../types/extended-request";
import { Response } from "express";

jest.mock("../ai.services", () => {
  const actual = jest.requireActual("../ai.services");
  return {
    ...actual,
    chatWithAdvisor: jest.fn(),
  };
});

describe("Módulo de IA - Consultor de Leitura (Testes Unitários)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserReadingContext", () => {
    it("deve carregar e categorizar favoritos, abandonados e estante do usuário", async () => {
      const mockLibraryEntries = [
        {
          id: 1,
          userId: 10,
          bookId: 100,
          status: "COMPLETED" as const,
          active: true,
          currentPage: 300,
          addedAt: new Date(),
          updatedAt: new Date(),
          finishedAt: new Date(),
          book: {
            id: 100,
            uuid: "uuid-1",
            externalId: "ext-1",
            title: "Cem Anos de Solidão",
            subtitle: null,
            authors: ["Gabriel García Márquez"],
            publishedDate: "1967",
            description: "Clássico",
            pageCount: 400,
            categories: ["Ficção"],
            imageUrl: "http://capa.com/cem-anos.jpg",
            isbn13: null,
            createdAt: new Date(),
            reviews: [{ rating: 5, comment: "Obra prima!" }],
          },
        },
        {
          id: 2,
          userId: 10,
          bookId: 101,
          status: "DROPPED" as const,
          active: true,
          currentPage: 30,
          addedAt: new Date(),
          updatedAt: new Date(),
          finishedAt: null,
          book: {
            id: 101,
            uuid: "uuid-2",
            externalId: "ext-2",
            title: "Livro Muito Cansativo",
            subtitle: null,
            authors: ["Autor Sonolento"],
            publishedDate: "2020",
            description: "História cansativa",
            pageCount: 500,
            categories: ["Ficção"],
            imageUrl: null,
            isbn13: null,
            createdAt: new Date(),
            reviews: [],
          },
        },
      ];

      jest
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(prisma.library, "findMany")
        .mockResolvedValueOnce(mockLibraryEntries as any);

      const context = await getUserReadingContext(10);

      expect(context.favorites).toHaveLength(1);
      expect(context.favorites[0].title).toBe("Cem Anos de Solidão");
      expect(context.favorites[0].rating).toBe(5);

      expect(context.dropped).toHaveLength(1);
      expect(context.dropped[0].title).toBe("Livro Muito Cansativo");

      expect(context.alreadyInLibrary).toHaveLength(2);
      expect(context.alreadyInLibrary[0].title).toBe("Cem Anos de Solidão");
      expect(context.alreadyInLibrary[1].title).toBe("Livro Muito Cansativo");
    });
  });

  describe("buildSystemInstruction", () => {
    it("deve construir a system instruction contendo nome, preferências, abandonados e restrição de duplicidade", () => {
      const mockContext = {
        favorites: [
          {
            title: "Orgulho e Preconceito",
            authors: ["Jane Austen"],
            rating: 5,
            comment: "Perfeito!",
          },
        ],
        dropped: [
          {
            title: "O Silmarillion",
            authors: ["J.R.R. Tolkien"],
          },
        ],
        alreadyInLibrary: [
          {
            title: "Orgulho e Preconceito",
            authors: ["Jane Austen"],
            status: "COMPLETED",
          },
        ],
      };

      const instruction = buildSystemInstruction("Camila", mockContext);

      expect(instruction).toContain("Camila");
      expect(instruction).toContain("Orgulho e Preconceito");
      expect(instruction).toContain("O Silmarillion");
      expect(instruction).toContain("DROPPED");
      expect(instruction).toContain("REGRA ABSOLUTA: NUNCA recomende");
      expect(instruction).toContain("recommendedBooks");
    });
  });

  describe("enrichRecommendedBooks", () => {
    it("deve enriquecer os livros recomendados utilizando o Google Books Gateway", async () => {
      jest.spyOn(googleBooksGateway, "searchBooks").mockResolvedValueOnce({
        totalItems: 1,
        books: [
          {
            externalId: "gbooks-123",
            title: "Ficções",
            authors: ["Jorge Luis Borges"],
            publishedDate: "1944",
            description: "Contos clássicos do labirinto.",
            pageCount: "200",
            categories: ["Ficção"],
            imageUrl: "http://books.google.com/ficcoes.jpg",
          },
        ],
      });

      const raw = [
        {
          title: "Ficções",
          author: "Jorge Luis Borges",
          rationale: "Porque você amou realismo fantástico.",
        },
      ];

      const enriched = await enrichRecommendedBooks(raw);

      expect(enriched).toHaveLength(1);
      expect(enriched[0].externalId).toBe("gbooks-123");
      expect(enriched[0].title).toBe("Ficções");
      expect(enriched[0].imageUrl).toBe("http://books.google.com/ficcoes.jpg");
      expect(enriched[0].rationale).toBe("Porque você amou realismo fantástico.");
    });
  });

  describe("chatWithAdvisor", () => {
    it("deve retornar mensagem amigável quando GEMINI_API_KEY não estiver configurada", async () => {
      const originalActual = jest.requireActual("../ai.services");
      const originalKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;

      const result = await originalActual.chatWithAdvisor(1, "Camila", "Olá!");

      expect(result.reply).toContain("GEMINI_API_KEY");
      expect(result.recommendedBooks).toEqual([]);

      process.env.GEMINI_API_KEY = originalKey;
    });
  });

  describe("Controller: handleChat", () => {
    it("deve responder 400 se a mensagem enviada for vazia", async () => {
      const req = {
        user: { id: 1, name: "Camila" },
        body: { message: "   " },
      } as unknown as ExtendedRequest;

      const jsonMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
      const res = { status: statusMock } as unknown as Response;

      await aiController.handleChat(req, res, () => {});

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(String) }),
      );
    });

    it("deve chamar chatWithAdvisor e retornar 200 com a resposta formatada", async () => {
      const req = {
        user: { id: 1, name: "Camila" },
        body: {
          message: "Quero uma boa indicação de ficção",
          history: [],
        },
      } as unknown as ExtendedRequest;

      const mockResponse = {
        reply: "Aqui está uma ótima recomendação!",
        recommendedBooks: [
          {
            externalId: "ext-123",
            title: "Ficções",
            authors: ["Jorge Luis Borges"],
            description: "Contos",
          },
        ],
      };

      (chatWithAdvisor as jest.Mock).mockResolvedValueOnce(mockResponse);

      const jsonMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
      const res = { status: statusMock } as unknown as Response;

      await aiController.handleChat(req, res, () => {});

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockResponse);
    });
  });
});
