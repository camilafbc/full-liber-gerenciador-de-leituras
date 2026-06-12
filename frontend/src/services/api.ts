const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiPost<T>(endpoint: string, body: any): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Erro na requisição");
  }

  return data as T;
}
