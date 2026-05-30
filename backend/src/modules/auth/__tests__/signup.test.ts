import request from "supertest";
import server from "../../../server";
import { prisma } from "../../../libs/prisma";

describe("Módulo de Autenticação - Cadastro", () => {
  beforeAll(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("Deve rodar o primeiro teste com sucesso", async () => {
    const response = await request(server).post("/auth/signup").send({
      name: "Leitor Teste",
      email: "leitor.teste@example.com",
      password: "senhaSegura123",
    });

    expect(response.status).toBe(201);
  });
});
