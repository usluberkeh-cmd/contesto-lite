"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserDropdown } from "@/components/user-dropdown";
import { createClient } from "@/lib/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { ThemeToggleButton } from "@/components/theme-toggle";

type HeaderUser = {
  email: string | null;
  isGuest: boolean;
};

interface AppHeaderProps {
  user: HeaderUser | null;
}

const PUBLIC_AUTH_ROUTES = [
  "/login",
  "/signup",
  "/auth",
  "/forgot-password",
  "/reset-password",
];

function mapSupabaseUserToHeaderUser(
  user: SupabaseUser | null,
): HeaderUser | null {
  if (!user) {
    return null;
  }

  const isGuest = Boolean(user.is_anonymous);

  return {
    email: isGuest ? null : user.email?.trim() || null,
    isGuest,
  };
}

export function AppHeader({ user }: AppHeaderProps) {
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);
  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<HeaderUser | null>(user);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  useEffect(() => {
    let mounted = true;

    const syncUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!mounted) {
        return;
      }

      setCurrentUser(mapSupabaseUserToHeaderUser(authUser));
    };

    void syncUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) {
        return;
      }

      setCurrentUser(mapSupabaseUserToHeaderUser(session?.user ?? null));
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  if (
    PUBLIC_AUTH_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    )
  ) {
    return null;
  }

  const isDashboard = pathname.startsWith("/dashboard");

  const navLinks = isDashboard
    ? [
        { href: "/dashboard", label: "Tableau de bord" },
        { href: "/dashboard/submit-fine", label: "Nouvelle amende" },
      ]
    : [
        { href: "#qui-sommes-nous", label: "Qui sommes-nous" },
        { href: "/dashboard/submit-fine", label: "Contester" },
        { href: "#nous-contacter", label: "Nous contacter" },
      ];

  return (
    <header className="w-full border-b border-border/50 sticky top-0 z-50 backdrop-blur-sm bg-background/95">
      <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/images/contesto-logo-transparent.png"
              alt="Contesto"
              width={140}
              height={40}
              className="h-9 w-auto dark:hidden"
            />
            <img
              src="/images/contesto-logo-transparent-dark.png"
              alt=""
              aria-hidden="true"
              width={140}
              height={40}
              className="hidden h-9 w-auto dark:block"
            />
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden md:flex items-center gap-6"
            aria-label="Navigation principale"
          >
            {navLinks.map((link) => {
              const isAnchor = link.href.startsWith("#");
              const isActive = !isAnchor && pathname === link.href;
              const navLink = isAnchor ? (
                <a
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );

              if (
                link.label === "Nous contacter" &&
                currentUser &&
                !isDashboard
              ) {
                return (
                  <span key={link.href} className="flex items-center gap-3">
                    {navLink}
                    <Link href="/dashboard">
                      <Button
                        size="sm"
                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        Aller au tableau de bord
                      </Button>
                    </Link>
                  </span>
                );
              }

              return <span key={link.href}>{navLink}</span>;
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme toggle - visible for ALL users */}
          <ThemeToggleButton />

          {/* Desktop auth section */}
          <div className="hidden md:flex items-center gap-2">
            {currentUser ? (
              <>
                {currentUser.isGuest && (
                  <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-1 text-xs font-medium">
                    Mode invité
                  </span>
                )}
                <UserDropdown
                  email={currentUser.email}
                  isGuest={currentUser.isGuest}
                />
              </>
            ) : (
              <Link href="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="font-medium bg-transparent"
                >
                  Connexion
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu */}
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button
                  className="p-2 rounded-lg hover:bg-accent transition-colors"
                  aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
                >
                  {open ? (
                    <X className="w-6 h-6 text-foreground" />
                  ) : (
                    <Menu className="w-6 h-6 text-foreground" />
                  )}
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0">
                <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
                <div className="flex flex-col h-full">
                  <div className="px-6 py-5 border-b border-border">
                    <img
                      src="/images/contesto-logo-transparent.png"
                      alt="Contesto"
                      width={120}
                      height={34}
                      className="h-8 w-auto dark:hidden"
                    />
                    <img
                      src="/images/contesto-logo-transparent-dark.png"
                      alt=""
                      aria-hidden="true"
                      width={120}
                      height={34}
                      className="hidden h-8 w-auto dark:block"
                    />
                  </div>

                  <nav
                    className="flex-1 px-4 py-4 space-y-1"
                    aria-label="Navigation mobile"
                  >
                    {navLinks.map((link) => {
                      const isAnchor = link.href.startsWith("#");
                      const isActive = !isAnchor && pathname === link.href;
                      const navLink = isAnchor ? (
                        <a
                          href={link.href}
                          className="block px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          onClick={() => setOpen(false)}
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                              ? "text-foreground bg-accent"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent"
                          }`}
                          onClick={() => setOpen(false)}
                        >
                          {link.label}
                        </Link>
                      );

                      if (
                        link.label === "Nous contacter" &&
                        currentUser &&
                        !isDashboard
                      ) {
                        return (
                          <div key={link.href} className="space-y-2">
                            {navLink}
                            <Link
                              href="/dashboard"
                              onClick={() => setOpen(false)}
                            >
                              <Button
                                size="sm"
                                className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                              >
                                Aller au tableau de bord
                              </Button>
                            </Link>
                          </div>
                        );
                      }

                      return <span key={link.href}>{navLink}</span>;
                    })}
                  </nav>

                  <div className="px-4 py-4 border-t border-border mt-auto">
                    {currentUser ? (
                      <div className="flex items-center gap-3">
                        <UserDropdown
                          email={currentUser.email}
                          isGuest={currentUser.isGuest}
                        />
                        <span className="text-sm text-muted-foreground truncate">
                          {currentUser.isGuest
                            ? "Mode invité"
                            : (currentUser.email ?? "Compte")}
                        </span>
                      </div>
                    ) : (
                      <Link href="/login" onClick={() => setOpen(false)}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full font-medium bg-transparent"
                        >
                          Connexion
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
