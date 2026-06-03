import request from "supertest";
import server from "../../../server";
import { prisma } from "../../../libs/prisma";
import bcrypt from "bcrypt";

describe("Módulo de Autenticação - Rota de Refresh Token", () => {
  let validRefreshToken: string =
    "mYIwrfmRiA2MbCwMJRTr8BU4TeyWKsgBHjL0TblEWmGpkdpsUzTCbv9m8hlC833D";
  let expiredRefreshToken: string =
    "BgMeTao9hBZyxyI8F0rcZwU1ymVqEtuYwJST1M29t2p91GPtwJAX4FYIVOorMGh8";

  beforeAll(async () => {
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();

    // cria um usuário de teste
    const hashedPassword = await bcrypt.hash("ljvh6U#6", 10);
    const user = await prisma.user.create({
      data: {
        name: "Refresh Teste",
        email: "refresh.token@example.com",
        passwordHash: hashedPassword,
      },
    });

    // insere um Refresh Token válido no banco
    await prisma.refreshToken.create({
      data: {
        token: validRefreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // insere um Refresh Token expirado no banco
    await prisma.refreshToken.create({
      data: {
        token: expiredRefreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() - 60 * 60 * 1000),
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("Should be  renew the Access Token using a valid Refresh Token successfully", async () => {
    const response = await request(server)
      .post("/auth/refresh")
      .send({ refreshToken: validRefreshToken });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("accessToken");
    expect(response.body.accessToken.split(".").length).toBe(3);
  });

  it("Should be returned 401 if the Refresh Token does not exist", async () => {
    const response = await request(server)
      .post("/auth/refresh")
      .send({ refreshToken: "token-que-nao-existe" });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Refresh token inválido");
  });

  it("Should be returned 401 if the Refresh Token has expired", async () => {
    const response = await request(server)
      .post("/auth/refresh")
      .send({ refreshToken: expiredRefreshToken });

    expect(response.status).toBe(401);

    // garante que o sistema deletou o token do banco
    const tokenNoBanco = await prisma.refreshToken.findUnique({
      where: { token: expiredRefreshToken },
    });
    expect(tokenNoBanco).toBeNull();
  });

  it("Should be returned 400 if the Refresh Token has not been sent", async () => {
    const response = await request(server).post("/auth/refresh").send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Refresh token é obrigatório!");
  });
});
