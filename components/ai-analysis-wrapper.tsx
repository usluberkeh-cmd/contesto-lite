import type React from "react"
import { Sparkles, Scale } from "lucide-react"
import { cn } from "@/lib/utils"

interface AIAnalysisWrapperProps {
  children: React.ReactNode
  className?: string
}

/**
 * Reusable wrapper that mimics the hero "Analyse IA instantanée" block styling.
 * Contains header row, content area, lawyer badge, and floating glow effects.
 */
export function AIAnalysisWrapper({ children, className }: AIAnalysisWrapperProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Main card container - matches hero visual styling */}
      <div className="relative bg-card/80 backdrop-blur-sm border border-border rounded-2xl shadow-2xl p-8 space-y-6">
        {/* Header row - "Analyse IA instantanée" */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="font-semibold text-foreground">Analyse IA instantanée</div>
            <div className="text-sm text-muted-foreground">Score de contestabilité en temps réel</div>
          </div>
        </div>

        {/* Content area - receives FileUpload or other children */}
        {children}

        {/* Lawyer badge - matches hero */}
        <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/20 rounded-xl">
          <Scale className="w-6 h-6 text-success" />
          <div className="text-sm text-foreground">
            <span className="font-semibold">Révision par avocat</span> incluse dans chaque dossier
          </div>
        </div>
      </div>

      {/* Floating glow elements - matches hero */}
      <div className="absolute -top-4 -right-4 w-32 h-32 bg-success/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-4 -left-4 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
    </div>
  )
}
