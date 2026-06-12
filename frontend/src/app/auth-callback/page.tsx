"use client";

import { useAuthContext } from "@/context/authContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setToken } = useAuthContext();

  useEffect(() => {
    const accessToken = searchParams.get("token");
    const refreshToken = searchParams.get("refresh");

    if (!accessToken || !refreshToken) {
      console.error("Tokens ausentes na rota de callback");
      router.push("/login?error=oauth_failed");
    }

    async function saveTokens() {
      try {
        const response = await fetch("/api/auth/social-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken, refreshToken }),
        });

        if (!response.ok) {
          router.push("/login?error=cookie_saving_failed");
        }

        const data = await response.json();

        setUser(data.user);
        setToken(accessToken);

        router.push("/home");
      } catch (error) {
        console.error("Erro ao salvar cookies sociais:", error);
        router.push("/login?error=internal_error");
      }
    }

    saveTokens();
  }, [searchParams, router, setUser, setToken]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100 gap-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-slate-200" />
      <p className="text-sm text-slate-400 animate-pulse">
        Sincronizando sua conta do Google...
      </p>
    </div>
  );
}
