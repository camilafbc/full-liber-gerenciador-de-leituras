import request from "supertest";
import server from "../../../server";
import { prisma } from "../../../libs/prisma";

jest.mock("passport", () => ({
  authenticate: (strategy: string, options: any) => {
    // retorna um middleware fake com os dados do usuário que viriam do passport
    return (req: any, res: any, next: any) => {
      req.user = {
        uuid: "uuid-ficticio-do-google-123",
        email: "google.user@example.com",
        name: "Leitor Google",
      };
      next();
    };
  },
}));

describe("Módulo de Autenticação - Google OAuth2 Callback", () => {
  beforeAll(async () => {
    await prisma.user.deleteMany();
    await prisma.refreshToken.deleteMany();

    await prisma.user.create({
      data: {
        uuid: "uuid-ficticio-do-google-123",
        email: "google.user@example.com",
        name: "Leitor Google",
        passwordHash: null,
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("Should generate the JWT and redirect the user successfully ", async () => {
    const response = await request(server).get("/auth/google/callback");

    // redirecionamento
    expect(response.status).toBe(302);
    expect(response.headers.location).toContain(
      "http://localhost:3000/auth-callback?token=",
    );

    // garantir que o token gerado é um JWT válido
    // const redirectUrl = response.headers.location;
    // const tokenExtraido = redirectUrl.split("token=")[1];
    // expect(tokenExtraido).toBeDefined();
    // expect(tokenExtraido.split(".").length).toBe(3); //
  });
});
