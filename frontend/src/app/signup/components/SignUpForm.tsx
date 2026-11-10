"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useSignup } from "@/hooks/useSignup";
import { SignUpInput, signUpSchema } from "@/schemas/signUp.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";

export function SignUpForm() {
  const { loading, error: signupError, signup } = useSignup();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignUpInput) => {
    await signup(data);
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader className="border-b">
          <CardTitle className="text-xl">Criar conta</CardTitle>
          <CardDescription>
            Preencha os dados abaixo ou continue com o Google.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <FieldSet className="w-full">
            <FieldGroup className="w-full gap-4">
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="name">Nome</FieldLabel>
                    <Input
                      {...field}
                      id="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Seu nome"
                    />
                    {errors.name && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="email"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email">E-mail</FieldLabel>
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="seuemail@email.com"
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
                    <FieldLabel htmlFor="password">Senha</FieldLabel>
                    <Input
                      {...field}
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                    />
                    {errors.password && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="confirmPassword">
                      Confirmar senha
                    </FieldLabel>
                    <Input
                      {...field}
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                    />
                    {errors.confirmPassword && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                    {signupError && !fieldState.error && (
                      <FieldError errors={[{ message: signupError }]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 border-t pt-6">
          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="animate-spin" />}
            {loading ? "Criando conta..." : "Criar conta"}
          </Button>
          <Button type="button" variant="outline" className="w-full" asChild>
            <a href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}>
              <Image
                src="/google-color-svgrepo-com.svg"
                alt=""
                width={16}
                height={16}
                aria-hidden
              />
              Entrar com o Google
            </a>
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Já possui uma conta?{" "}
            <Link
              href="/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Entrar
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
