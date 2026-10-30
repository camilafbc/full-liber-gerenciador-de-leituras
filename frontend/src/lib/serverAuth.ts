import { cookies } from "next/headers";
import { getApiUrl } from "./apiUrl";

/**
 * Obtém o access token em componentes de servidor (Server Components).
 * Se o access token tiver expirado na sessão do cookie (após 15 minutos),
 * mas o refresh token ainda for válido, busca silenciosamente um novo access token
 * no backend para permitir a renderização da página sem deslogar indevidamente o usuário.
 */
export async function getServerAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("liber_access_token")?.value;

  if (accessToken) {
    return accessToken;
  }

  const refreshToken = cookieStore.get("liber_refresh_token")?.value;
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(
      `${getApiUrl()}/auth/refresh`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `liber_bk_refresh_token=${refreshToken}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.accessToken ?? null;
  } catch (error) {
    console.error("Erro ao renovar token de acesso no servidor:", error);
    return null;
  }
}
