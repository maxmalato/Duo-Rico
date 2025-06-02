
// src/components/layout/Header.tsx
"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Menu, Home } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNavContent } from "./SidebarNavContent"; // Renomear SidebarNav para SidebarNavContent

export function Header() {
  const { user, logout } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const getInitials = (nameOrEmail?: string) => {
    if (!nameOrEmail) return "DU";
    if (nameOrEmail.includes(' ')) {
      const parts = nameOrEmail.split(' ');
      const firstNameInitial = parts[0]?.[0] || '';
      const lastNameInitial = parts.length > 1 ? parts[parts.length - 1]?.[0] || '' : '';
      return `${firstNameInitial}${lastNameInitial}`.toUpperCase() || '??';
    }
    return nameOrEmail.substring(0, 2).toUpperCase();
  };
  
  const displayName = user?.fullName || user?.email;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      {/* Left: Hamburger Menu */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="shrink-0">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Abrir menu de navegação</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[260px] p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="text-primary flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-primary"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Duo Rico
            </SheetTitle>
          </SheetHeader>
          <SidebarNavContent onLinkClick={() => setIsSheetOpen(false)} />
        </SheetContent>
      </Sheet>
      
      {/* Center: Home Icon */}
      <div className="flex-1 flex justify-center">
        <Link href="/dashboard" passHref>
          <Button variant="ghost" size="icon" aria-label="Painel Principal">
            <Home className="h-6 w-6 text-primary" />
          </Button>
        </Link>
      </div>
      
      {/* Right: User Menu */}
      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={`https://placehold.co/100x100.png?text=${getInitials(displayName)}`} alt={displayName || "Usuário"} data-ai-hint="avatar user profile" />
                <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.fullName || "Usuário"}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {!user && <div className="w-10 h-10"></div> /* Placeholder to maintain layout if no user */}
    </header>
  );
}
