// src/components/layout/SidebarNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ArrowRightLeft, Wallet, LayoutDashboard } from "lucide-react"; // Settings removido
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger, // Mantido caso seja usado internamente pelo componente Sidebar para outros fins
} from "@/components/ui/sidebar";

const navItems = [
  { href: "/dashboard", label: "Painel", icon: LayoutDashboard, tooltip: "Painel" },
  { href: "/income", label: "Receitas", icon: Wallet, tooltip: "Receitas" },
  { href: "/expenses", label: "Despesas", icon: ArrowRightLeft, tooltip: "Despesas" },
  // { href: "/settings", label: "Configurações", icon: Settings, tooltip: "Configurações" }, 
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar" defaultOpen={true}>
       <SidebarHeader className="flex items-center justify-between p-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2 md:flex">
          <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:p-1" aria-label="Página Inicial Duo Rico">
            <Home className="h-7 w-7 text-primary" />
            <span className="font-semibold text-lg text-primary group-data-[collapsible=icon]:hidden">Duo Rico</span>
          </Link>
          {/* SidebarTrigger aqui é o original do componente, para expandir/colapsar quando não está em modo sheet */}
          <SidebarTrigger className="group-data-[collapsible=icon]:hidden" />
       </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
                  tooltip={{children: item.tooltip, side: "right"}}
                >
                  <a>
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
       <SidebarFooter className="hidden p-4 group-data-[collapsible=icon]:p-2 md:block">
          {/* Conteúdo do rodapé, se necessário */}
       </SidebarFooter>
    </Sidebar>
  );
}
