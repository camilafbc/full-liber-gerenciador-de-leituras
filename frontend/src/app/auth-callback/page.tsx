"use client";

import { useAuthContext } from "@/context/authContext";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function AuthCallbackFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-primary text-primary-foreground">
      <Loader2 className="size-8 animate-spin" aria-hidden />
      <p className="animate-pulse text-sm text-primary-foreground/80">
        Sincronizando sua conta do Google...
      </p>
    </div>
  );
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setToken } = useAuthContext();

  useEffect(() => {
    const accessToken = searchParams.get("token");
    const refreshToken = searchParams.get("refresh");

    if (!accessToken || !refreshToken) {
      console.error("Tokens ausentes na rota de callback");
      router.push("/login?error=oauth_failed");
      return;
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
          return;
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

  return <AuthCallbackFallback />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackFallback />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
