/**
 * Retorna a URL base para comunicação com a API backend.
 *
 * - No lado do servidor (Server Components, Route Handlers do Next.js), prioriza INTERNAL_API_URL.
 *   Isso é essencial em ambientes com Docker, onde a comunicação interna entre containers
 *   ocorre pela rede interna (ex: http://backend:3000) e não por localhost do container.
 * - No lado do cliente (navegador), utiliza sempre NEXT_PUBLIC_API_URL (ex: http://localhost:3000).
 */
export function getApiUrl(): string {
  if (typeof window === "undefined") {
    return (
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3000"
    );
  }

  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
}
