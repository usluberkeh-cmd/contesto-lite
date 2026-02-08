"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserDropdown } from "@/components/user-dropdown"

interface HeaderContentProps {
  isAuthenticated: boolean
  userEmail?: string
}

const PUBLIC_ROUTES = ["/login", "/signup", "/signup/confirm"]

const HOME_NAV_ITEMS = [
  { href: "#qui-sommes-nous", label: "Qui sommes-nous", isAnchor: true },
  { href: "/dashboard/submit-fine", label: "Contester", isAnchor: false },
  { href: "#nous-contacter", label: "Nous contacter", isAnchor: true },
]

const DASHBOARD_NAV_ITEMS = [
  { href: "/dashboard", label: "Tableau de bord", isAnchor: false },
  { href: "/dashboard/submit-fine", label: "Nouvelle amende", isAnchor: false },
]

export function HeaderContent({ isAuthenticated, userEmail }: HeaderContentProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Don't render header on public auth routes
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    return null
  }

  const isDashboard = pathname.startsWith("/dashboard")
  const isHome = pathname === "/"
  const navItems = isDashboard ? DASHBOARD_NAV_ITEMS : isHome ? HOME_NAV_ITEMS : HOME_NAV_ITEMS

  return (
    <>
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

            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) =>
                item.isAnchor ? (
                  <a
                    key={item.href}
                    href={item.href}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </nav>
          </div>

          {/* Desktop auth area */}
          <div className="hidden md:flex items-center">
            {isAuthenticated && userEmail ? (
              <UserDropdown email={userEmail} />
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm" className="font-medium bg-transparent">
                  Connexion
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile hamburger button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-foreground" /> : <Menu className="w-6 h-6 text-foreground" />}
          </button>
        </div>
      </header>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border/50 px-6 py-4 space-y-3 sticky top-[65px] z-40">
          {navItems.map((item) =>
            item.isAnchor ? (
              <a
                key={item.href}
                href={item.href}
                className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ),
          )}
          {isAuthenticated && userEmail ? (
            <div className="flex items-center gap-3 py-2">
              <UserDropdown email={userEmail} />
              <span className="text-sm text-muted-foreground truncate">{userEmail}</span>
            </div>
          ) : (
            <Link href="/login" className="block" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" size="sm" className="w-full font-medium bg-transparent">
                Connexion
              </Button>
            </Link>
          )}
        </div>
      )}
    </>
  )
}
