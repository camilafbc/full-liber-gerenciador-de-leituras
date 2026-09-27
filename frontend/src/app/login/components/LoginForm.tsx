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
import { useAuth } from "@/hooks/useAuth";
import { SignInInput, signInSchema } from "@/schemas/signIn.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
    <Card className="w-full max-w-md shadow-lg">
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader className="border-b">
          <CardTitle className="text-xl">Entrar na sua conta</CardTitle>
          <CardDescription>
            Use seu e-mail ou continue com o Google.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <FieldSet className="w-full">
            <FieldGroup className="w-full gap-4">
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
                      autoComplete="current-password"
                      placeholder="••••••••"
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
        <CardFooter className="flex flex-col gap-3 border-t pt-6">
          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="animate-spin" />}
            {loading ? "Entrando..." : "Entrar"}
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
            Ainda não possui uma conta?{" "}
            <Link
              href="/signup"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Cadastre-se
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
};
