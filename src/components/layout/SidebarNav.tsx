
// This file is effectively replaced by SidebarNavContent.tsx
// Keeping it to avoid breaking existing imports immediately, but it's not used by ProtectedPageLayout anymore.
// You can delete this file if SidebarNavContent.tsx is used everywhere instead.
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ArrowRightLeft, Wallet, LayoutDashboard } from "lucide-react"; 
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
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    // This component's structure is deprecated in favor of SidebarNavContent used within a Sheet in Header.tsx
    // The old collapsible sidebar is no longer the primary navigation model.
    <Sidebar collapsible="icon" variant="sidebar" defaultOpen={true} className="hidden"> {/* Hidden as it's replaced */}
       <SidebarHeader className="flex items-center justify-between p-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2 md:flex">
          <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:p-1" aria-label="Página Inicial Duo Rico">
            <Home className="h-7 w-7 text-primary" />
            <span className="font-semibold text-lg text-primary group-data-[collapsible=icon]:hidden">Duo Rico</span>
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
       </SidebarFooter>
    </Sidebar>
  );
}
