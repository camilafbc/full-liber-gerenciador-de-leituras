import request from "supertest";
import server from "../../../server";
import { prisma } from "../../../libs/prisma";
import bcrypt from "bcrypt";

describe("Módulo de Biblioteca (Library) - Rotas Protegidas", () => {
  let token: string;
  let userUuid: string;
  let bookIdMock = "";

  beforeAll(async () => {
    await prisma.library.deleteMany();
    await prisma.user.deleteMany();

    const email = "estante.teste@example.com";
    const password = "@Password123";
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: "Leitor Estante Teste",
        email,
        passwordHash,
      },
    });
    userUuid = user.uuid;

    const loginResponse = await request(server)
      .post("/auth/signin")
      .send({ email, password });

    token = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // 1. ADICIONAR LIVRO

  describe("POST /library", () => {
    it("Should be add a book to the library successfully", async () => {
      const response = await request(server)
        .post("/library/book")
        .set("Authorization", `Bearer ${token}`)
        .send({
          book: {
            externalId: "p3QlEQAAQBAJ",
            authors: ["Suzanne Collins"],
            title: "Jogos vorazes ilustrado",
            publishedDate: "2024-10-31",
            description:
              "<p>Katniss Everdeen tem apenas dezesseis anos, mas sabe que é preciso esforço, muita observação e resiliência para sobreviver em Panem. O Distrito 12, seu lar, vive sob o domínio implacável da Capital, continuamente forçado a pagar pelos pecados de uma guerra civil perdida há muito tempo.</p>",
            pageCount: 368,
            categories: [
              "Young Adult Fiction / Dystopian",
              "Young Adult Fiction / Action & Adventure / Survival Stories",
            ],
            imageUrl:
              "http://books.google.com/books/publisher/content?id=p3QlEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE73e51jlprUoDst8admoKSF1qYf2ngYPM2BMqlfVQ9IsfuPQQx83tZe-6hC2pMdE9XEZqlkTFSll1VUx6hcw8OkVrwPIPAOz_z5wBiFVJNJc1J-wwEm-zX-OkEAv6CtLlUTD35CG&source=gbs_api",
            isbn13: "9786555953008",
          },
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty(
        "message",
        "Livro adicionado à biblioteca com sucesso!",
      );
      expect(response.body.item).toHaveProperty("book");

      // Guarda o ID do livro criado para usar nos testes de listagem e exclusão
      bookIdMock = response.body.item.book.uuid;
    });

    it("Should return 400 if the request body fails Zod validation", async () => {
      const response = await request(server)
        .post("/library/book")
        .set("Authorization", `Bearer ${token}`)
        .send({ book: {} });

      expect(response.status).toBe(400);
    });

    it("Should be not able to add without a valid token", async () => {
      const response = await request(server)
        .post("/library/book")
        .send({ book: { title: "Livro Sem Token" } });

      expect(response.status).toBe(401);
    });
  });

  // 2 - LISTAR LIVROS

  describe("GET /library", () => {
    it("Should list the user's library books with pagination", async () => {
      const response = await request(server)
        .get("/library/list")
        .set("Authorization", `Bearer ${token}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body) || response.body).toBeDefined();
    });
  });

  describe("PATCH /library/book/:bookId/status", () => {
    it("Should record reading progress when the current page advances", async () => {
      const response = await request(server)
        .patch(`/library/book/${bookIdMock}/status`)
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "READING", currentPage: 50 });

      expect(response.status).toBe(200);

      const progress = await prisma.readingProgress.findFirst({
        where: { currentPage: 50 },
      });

      expect(progress).toEqual(
        expect.objectContaining({
          currentPage: 50,
          pagesRead: 50,
        }),
      );
    });

    it("Should force the total page and completed status", async () => {
      const response = await request(server)
        .patch(`/library/book/${bookIdMock}/status`)
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "COMPLETED", currentPage: 10 });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("COMPLETED");
      expect(response.body.currentPage).toBe(368);
    });
  });

  describe("PUT /library/book/:bookId/review", () => {
    it("Should reject a review when the book is not completed", async () => {
      await request(server)
        .patch(`/library/book/${bookIdMock}/status`)
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "READING", currentPage: 50 });

      const response = await request(server)
        .put(`/library/book/${bookIdMock}/review`)
        .set("Authorization", `Bearer ${token}`)
        .send({ rating: 5, comment: "Ainda estou lendo" });

      expect(response.status).toBe(404);
    });

    it("Should create and update a review after completing the book", async () => {
      await request(server)
        .patch(`/library/book/${bookIdMock}/status`)
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "COMPLETED" });

      const createResponse = await request(server)
        .put(`/library/book/${bookIdMock}/review`)
        .set("Authorization", `Bearer ${token}`)
        .send({ rating: 4, comment: "Boa leitura" });

      expect(createResponse.status).toBe(200);
      expect(createResponse.body).toMatchObject({
        rating: 4,
        comment: "Boa leitura",
      });

      const updateResponse = await request(server)
        .put(`/library/book/${bookIdMock}/review`)
        .set("Authorization", `Bearer ${token}`)
        .send({ rating: 5, comment: "Excelente leitura" });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body).toMatchObject({
        rating: 5,
        comment: "Excelente leitura",
      });

      const reviews = await prisma.review.findMany({
        where: {
          userId: (
            await prisma.user.findUniqueOrThrow({ where: { uuid: userUuid } })
          ).id,
        },
      });
      expect(reviews).toHaveLength(1);
    });
  });

  //  3 - BUSCA UM LIVRO DA BIBLIOTECA

  describe("GET /library/:bookId", () => {
    it("Should return the details of a specific item from the library", async () => {
      const response = await request(server)
        .get(`/library/book/${bookIdMock}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
    });
  });

  // 4 - DELETA UM LIVRO

  describe("DELETE /library/:bookId", () => {
    it("Should be delete a book from the library successfully", async () => {
      const response = await request(server)
        .delete(`/library/book/${bookIdMock}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Livro removido com sucesso!",
      );
    });

    it("Should not be delete a book from the library without a bokId", async () => {
      const response = await request(server)
        .delete(`/library/book`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });
});
