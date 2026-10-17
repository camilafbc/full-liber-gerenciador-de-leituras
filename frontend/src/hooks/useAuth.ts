import { useAuthContext } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function useAuth() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser, setToken } = useAuthContext();
  const router = useRouter();

  const loginWithCredentials = async (email: string, password: string) => {
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao realizar login.");
      }

      setUser(data.user);
      setToken(data.accessToken);

      router.push("/home");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro inesperado ao realizar login.";
      console.error("Erro capturado no Hook:", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setToken(null);
      router.push("/login");
    } catch (err) {
      console.error("Erro ao deslogar:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    loginWithCredentials,
    logout,
  };
}
