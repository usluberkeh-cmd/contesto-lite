import { Car, CircleAlert, Video, ParkingCircle, Smartphone, AlertTriangle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function FineTypes() {
  const types = [
    {
      icon: Car,
      title: "Excès de vitesse",
      description: "Radar fixe ou mobile",
    },
    {
      icon: CircleAlert,
      title: "Feu rouge / Stop",
      description: "Infractions automatisées",
    },
    {
      icon: Video,
      title: "Vidéo-verbalisation",
      description: "Contrôle par caméra",
    },
    {
      icon: ParkingCircle,
      title: "Stationnement interdit",
      description: "Zones réglementées",
    },
    {
      icon: Smartphone,
      title: "Téléphone au volant",
      description: "Si non intercepté",
    },
    {
      icon: AlertTriangle,
      title: "Autres infractions",
      description: "Automatisées",
    },
  ]

  return (
    <section className="py-14 md:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">Types d'amendes couvertes</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Nous contestons tous les types d'infractions automatisées
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {types.map((type, index) => {
            const Icon = type.icon
            return (
              <Card
                key={index}
                className="p-6 space-y-4 hover:shadow-xl transition-all hover:-translate-y-1 bg-card group border-grey-200"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-all">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-1">{type.title}</h3>
                  <p className="text-muted-foreground">{type.description}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/5">
                  En savoir plus →
                </Button>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
