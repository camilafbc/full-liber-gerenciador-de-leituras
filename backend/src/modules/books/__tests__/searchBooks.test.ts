import request from "supertest";
import server from "../../../server";
import { googleBooksGateway } from "../../../gateway/googleBooks.gateway";
import { prisma } from "../../../libs/prisma";
import bcrypt from "bcrypt";

describe("Módulo de Livros - Integração com Google Books", () => {
  const name = "Leitor Book Teste";
  const email = "testebook@example.com";
  const password = "@Teste123";
  let token = "";

  beforeAll(async () => {
    await prisma.library.deleteMany();
    await prisma.user.deleteMany();

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    const loginResponse = await request(server).post("/auth/signin").send({
      email,
      password,
    });

    token = loginResponse.body.accessToken;
  });

  // Limpa todos os mocks criados após cada caso de teste
  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => await prisma.$disconnect());

  describe("GET /books/search", () => {
    it("Should be able to successfully search for books on Google Books using mock data", async () => {
      const mockResponse = {
        totalItems: 1,
        books: [
          {
            externalId: "vA12DwAAQBAJ",
            title: "O Senhor dos Anéis",
            authors: ["J.R.R. Tolkien"],
            publishedDate: "1954",
            description: "Um grande clássico da fantasia.",
            pageCount: "1200",
            categories: ["Fiction"],
            imageUrl: "http://books.google.com/thumbnail.jpg",
            isbn13: "9788551002506",
          },
        ],
      };

      // simula o retorno esperado da chamada da API do Google (os dados mockados)
      jest
        .spyOn(googleBooksGateway, "searchBooks")
        .mockResolvedValue(mockResponse);

      const response = await request(server)
        .get("/books/search")
        .set("Authorization", `Bearer ${token}`)
        .query({ q: "Tolkien", page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("meta");
      expect(response.body.meta.totalItems).toBe(1);
      expect(response.body.meta.totalPages).toBe(1);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe("O Senhor dos Anéis");
    });

    it("Should return a 404 error if the query parameter does not exist.", async () => {
      const response = await request(server)
        .get("/books/search")
        .set("Authorization", `Bearer ${token}`)
        .query({ page: 1 });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "error",
        "Termo de busca incorreto ou ausente",
      );
    });

    it("Should return status 500 if the gateway encounters an unexpected error", async () => {
      // simula uma falha de conexão ou erro interno na API do Google
      jest
        .spyOn(googleBooksGateway, "searchBooks")
        .mockRejectedValue(new Error("API Timeout"));

      const response = await request(server)
        .get("/books/search")
        .set("Authorization", `Bearer ${token}`)
        .query({ q: "Harry Potter" });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error", "Erro ao buscar livros");
    });

    it("Should not be allowed access without a valid token", async () => {
      const response = await request(server).get("/books/search");

      expect(response.status).toBe(401);
    });
  });

  // SEARCH/ID

  describe("GET /books/search/:id", () => {
    it("Should return the details of a specific book by Google ID", async () => {
      const mockBook = {
        externalId: "vA12DwAAQBAJ",
        title: "O Senhor dos Anéis",
        authors: ["J.R.R. Tolkien"],
        publishedDate: "1954",
        description: "Um grande clássico da fantasia.",
        pageCount: "1200",
        categories: ["Fiction"],
        imageUrl: "http://books.google.com/thumbnail.jpg",
        isbn13: "9788551002506",
      };

      jest.spyOn(googleBooksGateway, "getBookId").mockResolvedValue(mockBook);

      const response = await request(server)
        .get("/books/search/vA12DwAAQBAJ")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("title", "O Senhor dos Anéis");
      expect(response.body).toHaveProperty("externalId", "vA12DwAAQBAJ");
    });

    it("Should return status 500 if the ID is not found or if there is an error in the service", async () => {
      jest
        .spyOn(googleBooksGateway, "getBookId")
        .mockRejectedValue(new Error("Livro não encontrado"));

      const response = await request(server)
        .get("/books/search/id_invalido")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error", "Erro ao buscar livro");
    });

    it("Should not be allowed access without a valid token", async () => {
      const response = await request(server).get("/books/search/vA12DwAAQBAJ");

      expect(response.status).toBe(401);
    });
  });
});
