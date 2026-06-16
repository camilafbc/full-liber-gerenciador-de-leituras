"use client";

import { useAuthContext } from "@/context/authContext";
import { useAuth } from "@/hooks/useAuth";

export default function HomePage() {
  const { loading, user } = useAuthContext();
  const { logout } = useAuth();

  if (loading || !user) {
    return <div>carregando...</div>;
  }

  return <div>TESTE OI OI OI</div>;
}
