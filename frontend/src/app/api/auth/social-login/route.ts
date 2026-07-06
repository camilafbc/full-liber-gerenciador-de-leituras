import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { accessToken, refreshToken } = await request.json();

    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { error: "Tokens obrigatórios" },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();

    cookieStore.set("liber_refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    const me = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await me.json();

    return NextResponse.json({
      success: true,
      user: data.user,
      accessToken: data.accessToken,
    });
  } catch (error) {
    console.error("Erro ao criar token no login social: ", error);
    return NextResponse.json(
      { error: "Erro ao processar cookies sociais" },
      { status: 500 },
    );
  }
}
