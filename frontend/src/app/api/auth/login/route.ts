import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  try {
    const { email, password } = await request.json();

    const response = await fetch(`${API_URL}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Credenciais Inválidas" },
        { status: response.status },
      );
    }

    const cookieStore = await cookies();
    const setCookieHeader = response.headers.get("liber_bk_refresh_token");

    if (setCookieHeader) {
      const match = setCookieHeader.match(/liber_refresh_token=([^;]+)/);
      if (match && match[1]) {
        const tokenValue = match[1];

        cookieStore.set("liber_refresh_token", tokenValue, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
        });
      }
    }

    return NextResponse.json({
      user: data.user,
      accessToken: data.accessToken,
    });
  } catch (error) {
    console.error("Erro na rota interna de login: ", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
