import { Shield, Lock, Award, Clock } from "lucide-react"
import { Card } from "@/components/ui/card"

export function Trust() {
  const trustItems = [
    {
      icon: Shield,
      title: "Conformité RGPD",
      description: "Vos données personnelles sont chiffrées et jamais partagées",
    },
    {
      icon: Award,
      title: "Avocats certifiés",
      description: "Service géré par des avocats inscrits au barreau",
    },
    {
      icon: Lock,
      title: "Paiement sécurisé",
      description: "Transactions protégées par Stripe et PayPal",
    },
    {
      icon: Clock,
      title: "Support réactif",
      description: "Équipe disponible pour répondre à vos questions",
    },
  ]

  return (
    <section className="py-14 md:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Votre confiance, notre priorité
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Un service professionnel et sécurisé pour protéger vos droits
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustItems.map((item, index) => {
            const Icon = item.icon
            return (
              <Card
                key={index}
                className="p-6 text-center space-y-4 bg-card hover:shadow-lg transition-all border-grey-200"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
