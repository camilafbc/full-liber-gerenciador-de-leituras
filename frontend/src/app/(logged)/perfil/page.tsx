import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { getUser } from "@/api/user";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { FormProfile } from "./components/FormProfile";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("liber_access_token")?.value;

  if (!token) redirect("/login");

  const { user } = await getUser(token);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Avatar className="size-16">
            <AvatarFallback className="bg-primary dark:bg-accent text-white text-xl font-bold tracking-wider ">
              {user.name?.split(" ")?.[0]?.[0]?.toUpperCase()}
              {user.name?.split(" ")?.[1]?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col justify-start">
            <p className="font-bold capitalize">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <FormProfile defaultValues={user} token={token} />
      </CardContent>
    </Card>
  );
}
