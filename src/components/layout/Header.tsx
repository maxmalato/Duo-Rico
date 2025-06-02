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
import { LogOut, Menu } from "lucide-react"; // UserCircle, Settings removidos
import Link from "next/link";
import { useSidebar } from "@/components/ui/sidebar";

export function Header() {
  const { user, logout } = useAuth(); 
  const { toggleSidebar } = useSidebar(); // isMobile não é mais necessário aqui para o toggle

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
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      <Button variant="ghost" size="icon" onClick={toggleSidebar} className="shrink-0">
        <Menu className="h-6 w-6" />
        <span className="sr-only">Alternar barra lateral</span>
      </Button>
      
      <div className="flex-1">
        {/* O título "Duo Rico" foi removido daqui, será um ícone na sidebar */}
      </div>
      
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
            {/* Perfil e Configurações removidos 
            <DropdownMenuItem>
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            */}
            <DropdownMenuItem onClick={logout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
}
