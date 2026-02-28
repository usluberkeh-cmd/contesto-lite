"use client";

import {
  Car,
  CircleAlert,
  Video,
  ParkingCircle,
  Smartphone,
  AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/animated-section";

export function FineTypes() {
  const types = [
    {
      icon: Car,
      title: "Exces de vitesse",
      description: "Radar fixe ou mobile",
    },
    {
      icon: CircleAlert,
      title: "Feu rouge / Stop",
      description: "Infractions automatisees",
    },
    {
      icon: Video,
      title: "Video-verbalisation",
      description: "Controle par camera",
    },
    {
      icon: ParkingCircle,
      title: "Stationnement interdit",
      description: "Zones reglementees",
    },
    {
      icon: Smartphone,
      title: "Telephone au volant",
      description: "Si non intercepte",
    },
    {
      icon: AlertTriangle,
      title: "Autres infractions",
      description: "Automatisees",
    },
  ];

  return (
    <section className="py-14 md:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center space-y-4 mb-12">
          <AnimatedSection variant="fade-down" duration={600}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              {"Types d'amendes couvertes"}
            </h2>
          </AnimatedSection>
          <AnimatedSection variant="fade-up" delay={150} duration={600}>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {"Nous contestons tous les types d'infractions automatisees"}
            </p>
          </AnimatedSection>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {types.map((type, index) => {
            const Icon = type.icon;
            return (
              <AnimatedSection
                key={index}
                variant="fade-up"
                delay={100 + index * 100}
                duration={600}
              >
                <Card className="p-6 space-y-4 hover:shadow-xl transition-all hover:-translate-y-1 bg-card group border-grey-200 h-full">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-all">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-1">
                      {type.title}
                    </h3>
                    <p className="text-muted-foreground">{type.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary hover:bg-primary/5"
                  >
                    {"En savoir plus ->"}
                  </Button>
                </Card>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
