import request from "supertest";

jest.mock("passport-google-oauth20", () => ({
  Strategy: jest.fn().mockImplementation(() => ({})),
}));

jest.mock("passport", () => {
  const mockPassport = {
    use: jest.fn(),
    initialize: jest.fn(() => (req: any, res: any, next: any) => next()),
    authenticate: jest.fn((strategy: string, options?: any) => {
      return (req: any, res: any, next: any) => {
        req.user = {
          uuid: "uuid-ficticio-do-google-123",
          email: "google.user@example.com",
          name: "Leitor Google",
        };
        next();
      };
    }),
  };

  return {
    __esModule: true,
    default: mockPassport,
    ...mockPassport,
  };
});

import server from "../../../server";
import { prisma } from "../../../libs/prisma";

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
  });
});
