import { Logo } from "@/components/Logo";
import { TextLogo } from "@/components/TextLogo";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignUpForm } from "./components/SignUpForm";

export default async function SignUpPage() {
  const refreshToken = (await cookies()).get("liber_refresh_token");

  if (refreshToken) redirect("/home");

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-primary px-4 py-8">
      <div className="dark mb-2 space-y-2 sm:mb-8">
        <Logo size={80} />
        <TextLogo width={80} className="fill-white" />
      </div>
      <SignUpForm />
    </div>
  );
}
