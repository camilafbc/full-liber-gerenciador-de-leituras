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
    expect(response.body.accessToken).not.toBeUndefined();
    expect(response.headers["set-cookie"]).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^liber_bk_refresh_token=.+/),
      ]),
    );
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

  it("Should return 400 when user registered with social login has no passwordHash", async () => {
    const socialEmail = "social.user@example.com";
    await prisma.user.create({
      data: {
        name: "Social User",
        email: socialEmail,
        passwordHash: null,
      },
    });

    const response = await request(server).post("/auth/signin").send({
      email: socialEmail,
      password: "@Teste123",
      name: "Social User",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("Google");
  });
});
