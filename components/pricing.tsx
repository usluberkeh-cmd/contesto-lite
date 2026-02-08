import { Check } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function Pricing() {
  const features = [
    "Analyse IA complète",
    "Génération de contestation",
    "Révision par avocat",
    "Envoi aux autorités (ANTAI)",
    "Suivi jusqu'à résolution",
    "Garantie satisfait ou remboursé",
  ]

  return (
    <section id="tarifs" className="py-14 md:py-28 bg-accent">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Tarif transparent, sans surprise
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Un prix unique pour un service complet
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <Card className="p-8 space-y-8 bg-card shadow-2xl border-2 border-primary/20 relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl -z-0" />

            <div className="relative z-10">
              {/* Price */}
              <div className="text-center space-y-2">
                <div className="inline-block px-4 py-1.5 rounded-full bg-success/10 border border-success/20 text-success text-sm font-semibold mb-4">
                  Analyse gratuite incluse
                </div>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-6xl font-bold text-foreground">49€</span>
                  <span className="text-muted-foreground text-lg">TTC</span>
                </div>
                <p className="text-muted-foreground">par dossier</p>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <div className="font-semibold text-foreground text-lg">Ce qui est inclus :</div>
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              

              <p className="text-center text-sm text-muted-foreground">


Aucune carte bancaire requise pour l'analyse</p>
            </div>
          </Card>

          {/* Additional Info */}
          <div className="mt-8 text-center space-y-2">
            <p className="text-sm text-muted-foreground">Paiement sécurisé par Stripe et PayPal</p>
            <p className="text-sm text-muted-foreground">Garantie 100% remboursé si le service ne fonctionne pas</p>
          </div>
        </div>
      </div>
    </section>
  )
}
