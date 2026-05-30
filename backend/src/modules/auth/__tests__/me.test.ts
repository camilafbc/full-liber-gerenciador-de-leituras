import { prisma } from "../../../libs/prisma";
import bcrypt from "bcrypt";
import server from "../../../server";
import request from "supertest";

describe("Módulo de Usuário - Rota Protegida", () => {
  const name = "Leitor Teste";
  const email = "usuarioteste@example.com";
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

    token = loginResponse.body;
  });

  afterAll(async () => await prisma.$disconnect());

  it("Should be access data successfully", async () => {
    const response = await request(server)
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
  });

  it("Should not be allowed access without token", async () => {
    const response = await request(server).get("/auth/me");

    expect(response.status).toBe(401);
  });

  it("Should not be allowed access with an invalid token", async () => {
    const response = await request(server)
      .get("/auth/me")
      .set("Authorization", "Bearer token_aleatorio_123");

    expect(response.status).toBe(401);
  });
});
