"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserDropdown } from "@/components/user-dropdown"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"

interface AppHeaderProps {
  user: {
    email: string
  } | null
}

export function AppHeader({ user }: AppHeaderProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const isDashboard = pathname.startsWith("/dashboard")

  const navLinks = isDashboard
    ? [
        { href: "/dashboard", label: "Tableau de bord" },
        { href: "/dashboard/submit-fine", label: "Nouvelle amende" },
      ]
    : [
        { href: "#qui-sommes-nous", label: "Qui sommes-nous" },
        { href: "/dashboard/submit-fine", label: "Contester" },
        { href: "#nous-contacter", label: "Nous contacter" },
      ]

  return (
    <header className="w-full border-b border-border/50 sticky top-0 z-50 backdrop-blur-sm bg-background/95">
      <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/contesto-logo.png"
              alt="Contesto"
              width={140}
              height={40}
              className="h-9 w-auto"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Navigation principale">
            {navLinks.map((link) => {
              const isAnchor = link.href.startsWith("#")
              const isActive = !isAnchor && pathname === link.href

              return isAnchor ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Desktop auth section */}
          <div className="hidden md:block">
            {user ? (
              <UserDropdown email={user.email} />
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
                    <Image
                      src="/images/contesto-logo.png"
                      alt="Contesto"
                      width={120}
                      height={34}
                      className="h-8 w-auto"
                    />
                  </div>

                  <nav className="flex-1 px-4 py-4 space-y-1" aria-label="Navigation mobile">
                    {navLinks.map((link) => {
                      const isAnchor = link.href.startsWith("#")
                      const isActive = !isAnchor && pathname === link.href

                      return isAnchor ? (
                        <a
                          key={link.href}
                          href={link.href}
                          className="block px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          onClick={() => setOpen(false)}
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          key={link.href}
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
                      )
                    })}
                  </nav>

                  <div className="px-4 py-4 border-t border-border mt-auto">
                    {user ? (
                      <div className="flex items-center gap-3">
                        <UserDropdown email={user.email} />
                        <span className="text-sm text-muted-foreground truncate">
                          {user.email}
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
  )
}
