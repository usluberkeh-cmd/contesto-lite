import { Star, TrendingUp, Euro, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function SocialProof() {
  const testimonials = [
    {
      name: "Marie L.",
      location: "Paris",
      initial: "ML",
      quote:
        "J'ai reçu une amende pour un radar que je n'ai jamais vu. En 10 minutes tout était réglé, aucun point perdu !",
      rating: 5,
    },
    {
      name: "Thomas B.",
      location: "Lyon",
      initial: "TB",
      quote:
        "Service impeccable. L'analyse IA m'a donné un score de 92% et effectivement, ma contestation a été acceptée.",
      rating: 5,
    },
    {
      name: "Sophie D.",
      location: "Marseille",
      initial: "SD",
      quote:
        "J'étais sceptique au début, mais le suivi par avocat m'a rassuré. Résultat : 135€ économisés et mes 3 points conservés.",
      rating: 5,
    },
  ]

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        {/* Statistics */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="text-center space-y-3 p-6 rounded-2xl bg-grey-50 border border-grey-200">
            <div className="flex items-center justify-center gap-2">
              <Users className="w-8 h-8 text-primary" />
              <div className="text-4xl md:text-5xl font-bold text-foreground">8,100+</div>
            </div>
            <div className="text-muted-foreground font-medium">amendes contestées en 2024</div>
          </div>
          <div className="text-center space-y-3 p-6 rounded-2xl bg-success/5 border border-success/20">
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-8 h-8 text-success" />
              <div className="text-4xl md:text-5xl font-bold text-foreground">94%</div>
            </div>
            <div className="text-muted-foreground font-medium">de taux de réussite</div>
          </div>
          <div className="text-center space-y-3 p-6 rounded-2xl bg-grey-50 border border-grey-200">
            <div className="flex items-center justify-center gap-2">
              <Euro className="w-8 h-8 text-warning" />
              <div className="text-4xl md:text-5xl font-bold text-foreground">462K€</div>
            </div>
            <div className="text-muted-foreground font-medium">économisés par nos clients</div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">Ce que disent nos clients</h2>
            <div className="flex items-center justify-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-warning text-warning" />
                ))}
              </div>
              <span className="text-lg font-semibold text-foreground">4.8/5</span>
              <span className="text-muted-foreground">(327 avis)</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="p-6 space-y-4 bg-card hover:shadow-xl transition-all hover:-translate-y-1 border-grey-200"
              >
                <div className="flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-foreground leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {testimonial.initial}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
