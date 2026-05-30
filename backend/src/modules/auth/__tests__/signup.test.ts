import request from "supertest";
import server from "../../../server";
import { prisma } from "../../../libs/prisma";

describe("Módulo de Autenticação - Cadastro", () => {
  const name = "Leitor Teste";
  const email = "cadastroteste@example.com";
  const password = "@Teste123";

  beforeAll(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("User registration must be successful.", async () => {
    const response = await request(server).post("/auth/signup").send({
      name: name,
      email: email,
      password: password,
    });

    expect(response.status).toBe(201);
  });

  it("Should not be allowed registration with an inconsistent password", async () => {
    const response = await request(server).post("/auth/signup").send({
      name: name,
      email: email,
      password: "teste123",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).not.toBeUndefined();
  });

  it("Should not be allowed registration with an empty email", async () => {
    const response = await request(server).post("/auth/signup").send({
      name: name,
      email: "",
      password: password,
    });

    expect(response.status).toBe(400);
    expect(response.body.error).not.toBeUndefined();
  });

  it("Should not be allowed registration with an empty password", async () => {
    const response = await request(server).post("/auth/signup").send({
      name: name,
      email: email,
      password: "",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).not.toBeUndefined();
  });

  it("Should not be allowed registration with an email registered", async () => {
    const response = await request(server).post("/auth/signup").send({
      name: name,
      email: email,
      password: password,
    });

    expect(response.status).toBe(400);
    expect(response.body.error).not.toBeUndefined();
  });
});
