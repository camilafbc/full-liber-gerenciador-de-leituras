import { prisma } from "../../../libs/prisma";
import request from "supertest";
import server from "../../../server";
import bcrypt from "bcrypt";

describe("Módulo de Usuários", () => {
  const name = "User Update Test";
  const email = "user.update.test@example.com";
  const password = "@Teste123";
  let token = "";

  beforeAll(async () => {
    await prisma.user.deleteMany();
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    });

    const loginResponse = await request(server).post("/auth/signin").send({
      email,
      password,
    });

    token = loginResponse.body;
  });

  afterAll(async () => await prisma.$disconnect());

  it("Should update name successfully", async () => {
    const response = await request(server)
      .patch("/users/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name,
        password,
      });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Dados do perfil atualizados com sucesso!",
    );
  });

  it("Should update password successfully", async () => {
    const response = await request(server)
      .patch("/users/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({
        password: "@123Teste",
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Dados do perfil atualizados com sucesso!",
    );
  });

  it("Should not update with an empty name", async () => {
    const response = await request(server)
      .patch("/users/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "",
      });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("Should not update with an invalid password", async () => {
    const response = await request(server)
      .patch("/users/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({
        password: "123456",
      });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });
});
