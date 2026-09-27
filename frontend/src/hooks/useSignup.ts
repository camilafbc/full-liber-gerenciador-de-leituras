import { useAuthContext } from "@/context/authContext";
import { SignUpInput } from "@/schemas/signUp.schema";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function useSignup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser, setToken } = useAuthContext();
  const router = useRouter();

  const signup = async ({ name, email, password }: SignUpInput) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        const message =
          typeof data.error === "string"
            ? data.error
            : "Não foi possível criar sua conta.";
        throw new Error(message);
      }

      setUser({
        uuid: data.user.uuid,
        name: data.user.name,
        email: data.user.email,
        avatarUrl: data.user.imageUrl,
      });
      setToken(data.accessToken);
      router.push("/home");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível criar sua conta.",
      );
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, signup };
}
