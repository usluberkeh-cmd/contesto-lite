"use client";

import { Star, TrendingUp, Euro, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AnimatedSection } from "@/components/animated-section";

export function SocialProof() {
  const testimonials = [
    {
      name: "Marie L.",
      location: "Paris",
      initial: "ML",
      quote:
        "J'ai recu une amende pour un radar que je n'ai jamais vu. En 10 minutes tout etait regle, aucun point perdu !",
      rating: 5,
    },
    {
      name: "Thomas B.",
      location: "Lyon",
      initial: "TB",
      quote:
        "Service impeccable. L'analyse IA m'a donne un score de 92% et effectivement, ma contestation a ete acceptee.",
      rating: 5,
    },
    {
      name: "Sophie D.",
      location: "Marseille",
      initial: "SD",
      quote:
        "J'etais sceptique au debut, mais le suivi par avocat m'a rassure. Resultat : 135 euros economises et mes 3 points conserves.",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        {/* Statistics */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {[
            {
              icon: Users,
              value: "8,100+",
              label: "amendes contestees en 2024",
              bg: "bg-grey-50 border border-grey-200",
            },
            {
              icon: TrendingUp,
              value: "94%",
              label: "de taux de reussite",
              bg: "bg-success/5 border border-success/20",
            },
            {
              icon: Euro,
              value: "462K\u20AC",
              label: "economises par nos clients",
              bg: "bg-grey-50 border border-grey-200",
            },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <AnimatedSection
                key={index}
                variant="scale-up"
                delay={index * 150}
                duration={600}
              >
                <div
                  className={`text-center space-y-3 p-6 rounded-2xl ${stat.bg}`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Icon className="w-8 h-8 text-primary" />
                    <div className="text-4xl md:text-5xl font-bold text-foreground">
                      {stat.value}
                    </div>
                  </div>
                  <div className="text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>

        {/* Testimonials */}
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <AnimatedSection variant="fade-down" duration={600}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                Ce que disent nos clients
              </h2>
            </AnimatedSection>
            <AnimatedSection variant="fade-up" delay={150} duration={600}>
              <div className="flex items-center justify-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-warning text-warning"
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-foreground">
                  4.8/5
                </span>
                <span className="text-muted-foreground">(327 avis)</span>
              </div>
            </AnimatedSection>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <AnimatedSection
                key={index}
                variant="fade-up"
                delay={200 + index * 150}
                duration={600}
              >
                <Card className="p-6 space-y-4 bg-card hover:shadow-xl transition-all hover:-translate-y-1 border-grey-200 h-full">
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-warning text-warning"
                      />
                    ))}
                  </div>
                  <p className="text-foreground leading-relaxed">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {testimonial.initial}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-foreground">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.location}
                      </div>
                    </div>
                  </div>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
