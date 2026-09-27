import { Logo } from "@/components/Logo";
import { TextLogo } from "@/components/TextLogo";
import { LoginForm } from "./components/LoginForm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const cookieStore = await cookies();

  const refreshToken = cookieStore.get("liber_refresh_token");

  if (refreshToken) redirect("/home");

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-primary px-4">
      <div className="dark space-y-2 mb-8">
        <Logo size={80} />
        <TextLogo width={80} className="fill-white" />
      </div>
      <LoginForm />
    </div>
  );
}
