import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("liber_refresh_token")?.value;

    if (!refreshToken) {
      const errorResponse = NextResponse.json(
        { error: "Refresh token não encontrado nos cookies do front-end" },
        { status: 401 },
      );
      errorResponse.cookies.delete("liber_access_token");
      return errorResponse;
    }

    const refreshResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `liber_bk_refresh_token=${refreshToken}`,
        },
      },
    );

    const data = await refreshResponse.json();

    if (!refreshResponse.ok) {
      const errorResponse = NextResponse.json(
        { error: data.error || "Sessão expirada no backend" },
        { status: 401 },
      );
      errorResponse.cookies.delete("liber_refresh_token");
      errorResponse.cookies.delete("liber_access_token");
      return errorResponse;
    }

    const response = NextResponse.json({
      success: true,
      accessToken: data.accessToken,
    });

    response.cookies.set("liber_access_token", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Erro na rota de API de refresh do Next.js:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor do Next" },
      { status: 500 },
    );
  }
}
