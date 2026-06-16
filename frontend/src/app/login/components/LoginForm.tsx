"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { SignInInput, signInSchema } from "@/schemas/signIn.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Controller, useForm } from "react-hook-form";

export const LoginForm = () => {
  const { loading, loginWithCredentials, error: authError } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInInput) => {
    await loginWithCredentials(data.email, data.password);
  };

  return (
    <Card className="w-full max-w-md bg-white">
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          <FieldSet className="w-full">
            <FieldGroup className="w-full">
              <Controller
                name="email"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email" className="text-slate-900">
                      Email
                    </FieldLabel>
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      placeholder="seuemail@email.com"
                      className="border-slate-300 shadow-sm text-slate-900"
                    />
                    {errors.email && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="password"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="password" className="text-slate-900">
                      Senha
                    </FieldLabel>
                    <Input
                      {...field}
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="border-slate-300 shadow-sm text-slate-900"
                    />
                    {errors.password && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                    {authError && !errors.password && (
                      <FieldError errors={[{ message: authError }]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 mt-4">
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0F172A] hover:bg-[#0F172A]/90 hover:scale-95 transition-all"
          >
            Entrar
          </Button>
          <Button
            type="button"
            className="w-full border-slate-600 text-slate-900 bg-white hover:text-slate-900 hover:bg-white/90 hover:scale-95 transition-all"
            asChild
          >
            <a href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}>
              <Image
                src="/google-color-svgrepo-com.svg"
                alt="Logo do Google"
                width={16}
                height={16}
              />
              Entrar com o Google
            </a>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
