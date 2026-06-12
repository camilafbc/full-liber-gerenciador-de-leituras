import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieStore = await cookies();

    cookieStore.delete("liber_access_token");
    cookieStore.delete("liber_refresh_token");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao processar logout:", error);
    return NextResponse.json(
      { error: "Erro interno ao deslogar" },
      { status: 500 },
    );
  }
}
