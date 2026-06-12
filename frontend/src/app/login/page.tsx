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
import { Controller, useForm } from "react-hook-form";

export default function LoginPage() {
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
    <div className="w-full h-screen flex justify-center items-center">
      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent>
            <FieldSet className="w-full max-w-xs">
              <FieldGroup>
                <Controller
                  name="email"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="username">Username</FieldLabel>
                      <Input
                        {...field}
                        id="username"
                        type="text"
                        placeholder="seuemail@email.com"
                      />
                      {errors.email && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="password"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <Input
                        {...field}
                        id="password"
                        type="password"
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
                {authError && <p>{authError}</p>}
              </FieldGroup>
            </FieldSet>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              Entrar
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full border-slate-800 bg-slate-900 text-slate-100 hover:bg-slate-800 hover:text-slate-50 mt-2"
              asChild
            >
              <a href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}>
                <svg
                  className="mr-2 h-4 w-4"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fab"
                  data-icon="google"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 488 512"
                >
                  <path
                    fill="currentColor"
                    d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                  ></path>
                </svg>
                Entrar com o Google
              </a>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
