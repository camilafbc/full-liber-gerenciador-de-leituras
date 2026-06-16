"use client";

import SidebarLayout from "@/components/logged-layout/SidebarLayout";
import UserMenu from "@/components/logged-layout/UserMenu";
import { TextLogo } from "@/components/TextLogo";
import { useAuthContext } from "@/context/authContext";
import {
  BookSearchIcon,
  House,
  LayoutDashboard,
  LibraryBigIcon,
  Settings,
  UserRoundIcon,
} from "lucide-react";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function Layout({ children }: Props) {
  const { user } = useAuthContext();

  const menuButtons = [
    {
      icon: <House size={26} />,
      title: "Home",
      href: "/home",
    },
    {
      icon: <BookSearchIcon size={26} />,
      title: "Buscar",
      href: "/buscar",
    },
    {
      icon: <LibraryBigIcon size={26} />,
      title: "Biblioteca",
      href: "/biblioteca",
    },
    {
      icon: <UserRoundIcon size={26} />,
      title: "Perfil",
      href: "/perfil",
    },
  ];

  return (
    <SidebarLayout
      key={"sidebarlayout"}
      headerTitle={`Olá, ${user?.name}!`}
      userMenu={
        <UserMenu
          name={user?.name}
          email={user?.email}
          buttons={[
            {
              icon: <Settings size={18} />,
              title: "Configurações",
              href: "/admin/configuracoes",
            },
          ]}
        />
      }
      logo={<TextLogo width={83} className="fill-white" />}
      ButtonsMenu={menuButtons}
    >
      {children}
    </SidebarLayout>
  );
}
