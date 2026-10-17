import { getUser } from "@/api/user";
import { PageHeader } from "@/components/PageHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getServerAuthToken } from "@/lib/serverAuth";
import { redirect } from "next/navigation";
import { FormProfile } from "./components/FormProfile";

export default async function ProfilePage() {
  const token = await getServerAuthToken();

  if (!token) redirect("/login");

  const { user } = await getUser(token);

  const initials =
    `${user.name?.split(" ")?.[0]?.[0] ?? ""}${user.name?.split(" ")?.[1]?.[0] ?? ""}`.toUpperCase();

  return (
    <section className="flex w-full flex-col gap-6">
      <PageHeader
        title="Meu perfil"
        description="Gerencie suas informações pessoais e credenciais de acesso."
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarFallback className="bg-primary text-lg font-bold tracking-wider text-primary-foreground dark:bg-accent dark:text-accent-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <CardTitle className="truncate capitalize">{user.name}</CardTitle>
              <CardDescription className="truncate">
                {user.email}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <FormProfile defaultValues={user} token={token} />
        </CardContent>
      </Card>
    </section>
  );
}
