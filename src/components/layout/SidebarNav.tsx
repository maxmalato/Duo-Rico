// src/components/layout/SidebarNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ArrowRightLeft, Wallet, Settings, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
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
       <SidebarHeader className="hidden items-center justify-between p-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2 md:flex">
          <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
            <Home className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg text-primary">Duo Rico</span>
          </Link>
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
          {/* Footer content like settings or user profile short if needed */}
       </SidebarFooter>
    </Sidebar>
  );
}
