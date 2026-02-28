"use client";

import { Camera, ScanLine, Scale, ArrowRight } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";

export function HowItWorks() {
  const steps = [
    {
      number: "1",
      icon: Camera,
      title: "Deposez votre amende",
      description: "Prenez une photo ou deposez votre PDF",
      subtext: "Fonctionne sur mobile, tablette et ordinateur",
    },
    {
      number: "2",
      icon: ScanLine,
      title: "Extraction OCR rapide",
      description:
        "Deposez simplement votre amende, notre technologie OCR extrait toutes les informations en un instant",
      subtext: "Rapide, fiable et sans effort de votre part",
    },
    {
      number: "3",
      icon: Scale,
      title: "Nos avocats s'occupent du reste",
      description: "Contestation automatique envoyee aux autorites",
      subtext: "Suivi par email a chaque etape",
    },
  ];

  return (
    <section id="comment-ca-marche" className="py-14 md:py-28 bg-grey-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center space-y-4 mb-16">
          <AnimatedSection variant="fade-down" duration={600}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              {"Comment ca marche"}
            </h2>
          </AnimatedSection>
          <AnimatedSection variant="fade-up" delay={150} duration={600}>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {"Un processus simple en 3 etapes pour contester votre amende et conserver vos points"}
            </p>
          </AnimatedSection>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
          {/* Connection Lines */}
          <div
            className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent"
            style={{ width: "calc(100% - 12rem)", left: "6rem" }}
          />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <AnimatedSection
                key={index}
                variant="scale-up"
                delay={200 + index * 200}
                duration={600}
              >
                <div className="relative">
                  <div className="flex flex-col items-center text-center space-y-4">
                    {/* Icon Circle */}
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative z-10 border-4 border-background shadow-lg">
                        <Icon className="w-10 h-10 text-primary" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center font-bold text-sm z-20 shadow-md">
                        {step.number}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-foreground">
                        {step.title}
                      </h3>
                      <p className="text-foreground leading-relaxed">
                        {step.description}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {step.subtext}
                      </p>
                    </div>
                  </div>

                  {/* Arrow for mobile */}
                  {index < steps.length - 1 && (
                    <div className="md:hidden flex justify-center my-6">
                      <ArrowRight className="w-6 h-6 text-muted-foreground rotate-90" />
                    </div>
                  )}
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
