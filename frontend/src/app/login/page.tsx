"use client";

import { Logo } from "@/components/Logo";
import { TextLogo } from "@/components/TextLogo";
import { LoginForm } from "./components/LoginForm";

export default function LoginPage() {
  return (
    <div className="w-full h-screen flex flex-col gap-6 justify-center items-center bg-[#0F172A] px-2">
      <div className="dark space-y-2 mb-8">
        <Logo size={80} />
        <TextLogo width={80} className="fill-white" />
      </div>
      <LoginForm />
    </div>
  );
}
