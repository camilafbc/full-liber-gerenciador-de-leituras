import request from "supertest";
import server from "../../../server";
import { prisma } from "../../../libs/prisma";
import bcrypt from "bcrypt";

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
    expect(response.body.accessToken).not.toBeUndefined();
    expect(response.body.user.email).toBe(email);
    expect(response.body.refreshToken).toBeUndefined();

    const createdUser = await prisma.user.findUnique({ where: { email } });
    expect(createdUser?.passwordHash).not.toBe(password);
    expect(await bcrypt.compare(password, createdUser?.passwordHash ?? "")).toBe(
      true,
    );
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
