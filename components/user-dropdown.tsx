"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { User, LayoutDashboard, LogOut, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { buildLoginPathWithNext } from "@/lib/auth/next-path";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserDropdownProps {
  email: string | null;
  isGuest?: boolean;
}

export function UserDropdown({ email, isGuest = false }: UserDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isDashboard = pathname.startsWith("/dashboard");
  const displayName = isGuest ? "Mode invité" : email ?? "Compte";

  const initial = displayName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleConnectWithAccount = async () => {
    const supabase = createClient();
    const query = searchParams.toString();
    const currentPath = `${pathname}${query ? `?${query}` : ""}`;

    await supabase.auth.signOut();
    router.push(buildLoginPathWithNext(currentPath));
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Menu utilisateur"
        >
          <Avatar className="size-9 cursor-pointer border-2 border-primary/30 hover:border-primary transition-colors">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
              {initial}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => router.push("/dashboard/settings/profile")}
          >
            <User className="size-4" />
            Informations personnelles
          </DropdownMenuItem>

          {!isDashboard && (
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => router.push("/dashboard")}
            >
              <LayoutDashboard className="size-4" />
              Aller au tableau de bord
            </DropdownMenuItem>
          )}

          {isGuest && (
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={handleConnectWithAccount}
            >
              <LogIn className="size-4" />
              Se connecter avec un compte
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="size-4" />
          Deconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
