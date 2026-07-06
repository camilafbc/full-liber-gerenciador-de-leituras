// 📁 src/api/client.ts

type RefreshListener = (token: string | null) => void;

let isRefreshing = false;
let refreshSubscribers: ((token: string | null) => void)[] = [];
let onGlobalTokenUpdate: RefreshListener | null = null;

// O AuthContext usa isso para saber quando o client renovou o token sozinho
export const setOnTokenUpdate = (listener: RefreshListener) => {
  onGlobalTokenUpdate = listener;
};

const notifySubscribers = (newToken: string | null) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string | null) => void) => {
  refreshSubscribers.push(callback);
};

const buildUrl = (path: string) => `${process.env.NEXT_PUBLIC_API_URL}${path}`;

export const apiFetchClient = async (
  url: string,
  options: RequestInit = {},
): Promise<Response> => {
  const reqHeaders = new Headers(options.headers);
  if (!reqHeaders.has("Content-Type")) {
    reqHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(buildUrl(url), {
    ...options,
    headers: reqHeaders,
  });

  if (response.status !== 401) return response;

  // Já tem um refresh rolando: entra na fila e espera o resultado (sucesso OU falha)
  if (isRefreshing) {
    return new Promise<Response>((resolve) => {
      addRefreshSubscriber((newToken) => {
        if (!newToken) {
          resolve(response); // refresh falhou: devolve o 401 original em vez de travar
          return;
        }
        reqHeaders.set("Authorization", `Bearer ${newToken}`);
        resolve(fetch(buildUrl(url), { ...options, headers: reqHeaders }));
      });
    });
  }

  isRefreshing = true;

  try {
    const refreshResponse = await fetch("/api/auth/refresh", {
      method: "POST",
    });

    if (!refreshResponse.ok) {
      notifySubscribers(null);
      onGlobalTokenUpdate?.(null);
      if (typeof window !== "undefined") window.location.href = "/login";
      return response;
    }

    const refreshData = await refreshResponse.json();
    const newToken: string = refreshData.accessToken;

    notifySubscribers(newToken);
    onGlobalTokenUpdate?.(newToken);

    reqHeaders.set("Authorization", `Bearer ${newToken}`);
    return fetch(buildUrl(url), { ...options, headers: reqHeaders });
  } catch (error) {
    console.error("Erro ao processar fila de refresh:", error);
    notifySubscribers(null);
    onGlobalTokenUpdate?.(null);
    return response;
  } finally {
    isRefreshing = false;
  }
};
