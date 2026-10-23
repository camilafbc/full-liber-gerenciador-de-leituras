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
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-primary px-4 py-8 [--background:oklch(99.65%_0.002_247.84)] [--foreground:oklch(0.145_0_0)] [--card:oklch(1_0_0)] [--card-foreground:oklch(0.145_0_0)] [--popover:oklch(1_0_0)] [--popover-foreground:oklch(0.145_0_0)] [--primary:oklch(20.7%_0.038_265.07)] [--primary-foreground:oklch(0.97_0.014_254.604)] [--secondary:oklch(78.79%_0.029_265.41)] [--secondary-foreground:oklch(0.21_0.006_285.885)] [--muted:oklch(0.97_0_0)] [--muted-foreground:oklch(0.556_0_0)] [--accent:oklch(64.57%_0.193_41.56)] [--accent-foreground:oklch(0.205_0_0)] [--border:oklch(0.922_0_0)] [--input:oklch(0.922_0_0)] [--ring:oklch(0.708_0_0)]">
      <div className="dark mb-2 space-y-2 sm:mb-8">
        <Logo size={80} />
        <TextLogo width={80} className="fill-white" />
      </div>
      <LoginForm />
    </div>
  );
}
