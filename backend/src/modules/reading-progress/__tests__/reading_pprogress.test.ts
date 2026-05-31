import request from "supertest";
import server from "../../../server";
import { prisma } from "../../../libs/prisma";
import bcrypt from "bcrypt";

describe("Módulo de Progresso de Leitura - Rotas Protegidas", () => {
  let token: string;
  let userUuid: string;
  let bookIdMock = "";

  beforeAll(async () => {
    await prisma.library.deleteMany();
    await prisma.book.deleteMany();
    await prisma.user.deleteMany();

    const email = "progresso.teste@example.com";
    const password = "@Password123";
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: "Progresso Leitura Teste",
        email,
        passwordHash,
      },
    });
    userUuid = user.uuid;

    const addBook = await prisma.book.create({
      data: {
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

    const libraryItem = await prisma.library.create({
      data: {
        userId: user.id,
        status: "WANT_TO_READ",
        currentPage: 0,
        bookId: addBook.id,
      },
    });

    bookIdMock = addBook.uuid;

    const loginResponse = await request(server)
      .post("/auth/signin")
      .send({ email, password });

    token = loginResponse.body;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // 1 - REGISTRAR PROGRESSO
  it("Should be record reading progress successfully", async () => {
    const response = await request(server)
      .post("/reading-progress/update")
      .set("Authorization", `Bearer ${token}`)
      .send({
        bookId: bookIdMock,
        currentPage: 50,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty(
      "message",
      "Progresso de leitura registrado com sucesso!",
    );
    expect(response.body.data).toBeDefined();
  });

  it("Should be return 400 if the data sent violates the addProgressSchema", async () => {
    const response = await request(server)
      .post("/reading-progress/update")
      .set("Authorization", `Bearer ${token}`)
      .send({
        bookId: bookIdMock,
        currentPage: -10,
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("Should not be able to update without a valid token", async () => {
    const response = await request(server)
      .post("/reading-progress/update")
      .send({
        bookId: bookIdMock,
        currentPage: 20,
      });

    expect(response.status).toBe(401);
  });
});
