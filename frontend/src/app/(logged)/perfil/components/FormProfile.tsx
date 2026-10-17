"use client";

import { updateUserData } from "@/api/user";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Loader2,
  Save,
  User,
} from "lucide-react";
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { setUser } = useAuthContext();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
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
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const name =
        data.name && data.name.trim() !== "" && data.name !== defaultValues.name
          ? data.name.trim()
          : undefined;
      const password =
        data.password && data.password.trim() !== ""
          ? data.password.trim()
          : undefined;

      if (!name && !password) {
        setSuccessMessage("Nenhuma alteração foi realizada.");
        setIsPending(false);
        return;
      }

      const response = await updateUserData(token, name, password);

      if (response?.data?.name) {
        setUser((user) =>
          user ? { ...user, name: response.data.name } : null,
        );
      }

      setSuccessMessage("Perfil atualizado com sucesso!");

      // Limpa os campos de senha mantendo o nome atualizado
      reset({
        name: data.name || defaultValues.name,
        password: "",
        confirmPassword: "",
      });

      router.refresh();
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      const msg =
        error instanceof Error
          ? error.message
          : "Não foi possível salvar as alterações. Tente novamente.";
      setErrorMessage(msg);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Feedback de Sucesso */}
      {successMessage && (
        <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200">
          <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
          <AlertDescription className="text-xs font-medium">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Feedback de Erro */}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription className="text-xs font-medium">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Seção: Dados Básicos */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <User className="size-4 text-accent" />
          <span>Informações Pessoais</span>
        </div>

        <FieldSet className="w-full">
          <FieldGroup className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name" className="text-xs font-medium">
                    Nome Completo
                  </FieldLabel>
                  <Input
                    {...field}
                    id="name"
                    type="text"
                    placeholder="Seu nome de leitor"
                    className="focus-visible:ring-accent"
                  />
                  {errors.name && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Field>
              <FieldLabel htmlFor="email" className="text-xs font-medium">
                E-mail (fixo)
              </FieldLabel>
              <Input
                value={defaultValues.email}
                id="email"
                type="email"
                disabled
                className="cursor-not-allowed bg-muted/60 opacity-80"
              />
            </Field>
          </FieldGroup>
        </FieldSet>
      </div>

      {/* Seção: Segurança */}
      <div className="space-y-4 pt-4 border-t border-border/50">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <KeyRound className="size-4 text-accent" />
          <span>Alterar Senha</span>
        </div>

        <FieldSet className="w-full">
          <FieldGroup className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="password"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor="password"
                    className="text-xs font-medium"
                  >
                    Nova Senha
                  </FieldLabel>
                  <Input
                    {...field}
                    id="password"
                    type="password"
                    placeholder="Nova senha"
                    className="focus-visible:ring-accent"
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
                  <FieldLabel
                    htmlFor="confirmPassword"
                    className="text-xs font-medium"
                  >
                    Confirmar Nova Senha
                  </FieldLabel>
                  <Input
                    {...field}
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirme a nova senha"
                    className="focus-visible:ring-accent"
                  />
                  {errors.confirmPassword && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>
      </div>

      {/* Barra de Ações */}
      <div className="flex w-full flex-col-reverse gap-2 border-t border-border/50 pt-5 sm:flex-row sm:justify-end">
        {/* <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="gap-2"
          disabled={isPending}
        >
          <ChevronLeft className="size-4" />
          Voltar
        </Button> */}

        <Button
          type="submit"
          disabled={isPending || !isDirty}
          className="gap-2 shadow-xs"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {isPending ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
    </form>
  );
};
