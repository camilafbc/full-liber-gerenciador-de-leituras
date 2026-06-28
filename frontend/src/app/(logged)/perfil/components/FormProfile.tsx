"use client";

import { updateUserData } from "@/api/user";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuthContext } from "@/context/authContext";
import { updateUserSchema, UserUpdateInput } from "@/schemas/user.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

interface FormProfileProps {
  defaultValues: {
    name: string;
    email: string;
  };
  token: string;
}

export const FormProfile = ({ defaultValues, token }: FormProfileProps) => {
  const [isPending, setIsPending] = useState(false);
  const { setUser } = useAuthContext();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UserUpdateInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: defaultValues.name,
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: UserUpdateInput) => {
    setIsPending(true);
    try {
      const name =
        data.name !== "" && data.name !== defaultValues.name
          ? data.name
          : undefined;
      const password =
        data.password && data.password !== "" ? data.password : undefined;

      const response = await updateUserData(token, name, password);
      setUser((user) => (user ? { ...user, name: response.data.name } : null));
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldSet className="w-full">
        <FieldGroup className="w-full grid grid-cols-1 md:grid-cols-2">
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="name">Nome</FieldLabel>
                <Input {...field} id="name" type="text" />
                {errors.name && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Field>
            <FieldLabel htmlFor="email">E-mail</FieldLabel>
            <Input
              value={defaultValues.email}
              id="email"
              type="email"
              disabled
              className="cursor-not-allowed"
            />
          </Field>
        </FieldGroup>
        <FieldGroup className="w-full grid grid-cols-1 md:grid-cols-2 ">
          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="password">Senha</FieldLabel>
                <Input {...field} id="password" type="password" />
                {errors.password && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="confirmPassword">
                  Confirmar Senha
                </FieldLabel>
                <Input {...field} id="confirmPassword" type="password" />
                {errors.confirmPassword && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>

      <div className="mt-6 flex w-full flex-col-reverse gap-2 md:flex-row md:justify-end border-t pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
          disabled={isPending}
        >
          <ChevronLeft className="size-5" />
          Voltar
        </Button>

        <Button type="submit" className="bg-primary dark:bg-accent">
          {isPending && <Loader2 className="animate-spin" />}
          {!isPending && "Salvar Alterações"}
        </Button>
      </div>
    </form>
  );
};
