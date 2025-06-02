
// src/components/layout/SidebarNavContent.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"; // Assuming these are still useful for styling the sheet content

interface SidebarNavContentProps {
  onLinkClick?: () => void;
}

const navItems = [
  { href: "/income", label: "Receitas", icon: Wallet, tooltip: "Gerenciar Receitas" },
  { href: "/expenses", label: "Despesas", icon: ArrowRightLeft, tooltip: "Gerenciar Despesas" },
];

export function SidebarNavContent({ onLinkClick }: SidebarNavContentProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full p-4">
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref legacyBehavior>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                className="w-full justify-start text-base py-3"
                onClick={() => {
                  if (onLinkClick) onLinkClick();
                }}
              >
                <a>
                  <item.icon className="h-5 w-5 mr-3" />
                  <span>{item.label}</span>
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </div>
  );
}
