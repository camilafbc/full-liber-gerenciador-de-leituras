"use client";

import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/context/authContext";
import { useAuth } from "@/hooks/useAuth";

export default function HomePage() {
  const { loading, user, token } = useAuthContext();
  const { logout } = useAuth();

  if (loading) {
    return <div>carregando...</div>;
  }

  if (user) {
    return (
      <div>
        <p>Olá: {user.name}</p>
        <p>Uuid: {user.uuid}</p>
        <p>Token: {token}</p>
        <p>Email: {user.email}</p>
        <p>Image: {user.avatarUrl || "Sem imagem"}</p>
        <Button onClick={logout}>Sair</Button>
      </div>
    );
  }
}
