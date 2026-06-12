const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface FetchOptions extends RequestInit {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
}

export async function apiFetch(endpoint: string, options: FetchOptions) {
  const { accessToken, setAccessToken, logout, ...initOptions } = options;

  // 1. Configura os headers padrão e injeta o Bearer Token
  const headers = new Headers(initOptions.headers);
  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const config: RequestInit = {
    ...initOptions,
    headers,
  };

  // 2. Faz a requisição inicial para o Backend Node
  let response = await fetch(`${BASE_URL}${endpoint}`, config);

  // 3. 🔥 O INTERCEPTOR NATIVO: Se der 401, o token de acesso expirou!
  if (response.status === 401) {
    try {
      // Bate na rota de refresh do Next para pegar um token novo usando o cookie httpOnly
      const refreshResponse = await fetch("/api/auth/refresh", {
        method: "POST",
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();

        // Atualiza o token na memória do contexto
        setAccessToken(refreshData.accessToken);

        // Atualiza o header da requisição original com o novo token
        headers.set("Authorization", `Bearer ${refreshData.accessToken}`);

        // 🔄 Refaz a requisição que tinha falhado originalmente e retorna ela!
        response = await fetch(`${BASE_URL}${endpoint}`, config);
      } else {
        // Se o refresh der errado (cookie expirou também), desloga o usuário
        logout();
      }
    } catch (error) {
      console.error("Erro ao tentar rodar o auto-refresh:", error);
      logout();
    }
  }

  return response;
}
