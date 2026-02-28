"use client"

import { useTheme } from "next-themes"
import { Moon, Sun, Monitor } from "lucide-react"
import { useSyncExternalStore } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"

/**
 * Standalone theme toggle button for the header.
 * Visible to ALL users (guests and authenticated).
 */
export function ThemeToggleButton() {
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  )

  if (!mounted) {
    return (
      <button className="p-2 rounded-lg hover:bg-accent transition-colors" aria-label="Changer le theme">
        <Sun className="size-4 text-muted-foreground" />
      </button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="p-2 rounded-lg hover:bg-accent transition-colors relative"
          aria-label="Changer le theme"
        >
          <Sun className="size-4 text-muted-foreground rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute top-2 left-2 size-4 text-muted-foreground rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        <DropdownMenuItem
          className="cursor-pointer gap-2"
          onClick={() => setTheme("light")}
        >
          <Sun className="size-4" />
          <span>Clair</span>
          {theme === "light" && (
            <span className="ml-auto text-xs text-primary">&#10003;</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer gap-2"
          onClick={() => setTheme("dark")}
        >
          <Moon className="size-4" />
          <span>Sombre</span>
          {theme === "dark" && (
            <span className="ml-auto text-xs text-primary">&#10003;</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer gap-2"
          onClick={() => setTheme("system")}
        >
          <Monitor className="size-4" />
          <span>Systeme</span>
          {theme === "system" && (
            <span className="ml-auto text-xs text-primary">&#10003;</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Theme toggle as a dropdown sub-menu (used inside UserDropdown).
 */
export function ThemeToggleSubmenu() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="cursor-pointer">
        <Sun className="size-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
        <span>Theme</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => setTheme("light")}
          >
            <Sun className="size-4" />
            <span>Clair</span>
            {theme === "light" && (
              <span className="ml-auto text-xs text-primary">&#10003;</span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => setTheme("dark")}
          >
            <Moon className="size-4" />
            <span>Sombre</span>
            {theme === "dark" && (
              <span className="ml-auto text-xs text-primary">&#10003;</span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => setTheme("system")}
          >
            <Monitor className="size-4" />
            <span>Systeme</span>
            {theme === "system" && (
              <span className="ml-auto text-xs text-primary">&#10003;</span>
            )}
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  )
}
