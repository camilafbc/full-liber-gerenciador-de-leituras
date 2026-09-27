import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  try {
    const body = await request.json();
    const response = await fetch(`${apiUrl}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Não foi possível criar sua conta." },
        { status: response.status },
      );
    }

    const cookieStore = await cookies();
    const setCookieHeader = response.headers.get("set-cookie");
    const match = setCookieHeader?.match(/liber_bk_refresh_token=([^;]+)/);

    if (match?.[1]) {
      cookieStore.set("liber_refresh_token", match[1], {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });
    }

    cookieStore.set("liber_access_token", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60,
      path: "/",
    });

    return NextResponse.json({
      user: data.user,
      accessToken: data.accessToken,
    });
  } catch (error) {
    console.error("Erro na rota interna de cadastro: ", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
