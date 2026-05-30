import { prisma } from "../../../libs/prisma";
import bcrypt from "bcrypt";
import server from "../../../server";
import request from "supertest";

describe("Módulo de Autenticação - Login (SignIn)", () => {
  const name = "Leitor Teste";
  const email = "loginteste@example.com";
  const password = "@Teste123";

  beforeAll(async () => await prisma.user.deleteMany());

  afterAll(async () => await prisma.$disconnect());

  it("Should be login successfully", async () => {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
      },
    });

    const response = await request(server).post("/auth/signin").send({
      email,
      password,
      name,
    });

    expect(response.status).toBe(200);
  });

  it("Should not be allowed login with a different password", async () => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const response = await request(server).post("/auth/signin").send({
      email,
      password: "teste123",
      name,
    });

    expect(response.status).toBe(400);
    expect(response.body.error).not.toBeUndefined();
  });

  it("Should not be allowed login with an empty password", async () => {
    const response = await request(server).post("/auth/signin").send({
      email,
      password: "",
      name,
    });

    expect(response.status).toBe(400);
    expect(response.body.error).not.toBeUndefined();
  });
});
