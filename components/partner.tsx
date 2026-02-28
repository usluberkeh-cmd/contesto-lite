"use client";

import Image from "next/image";
import { AnimatedSection } from "@/components/animated-section";

export function Partner() {
  return (
    <section id="qui-sommes-nous" className="py-14 md:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center space-y-4 mb-14">
          <AnimatedSection variant="blur-in" duration={600}>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Notre cabinet partenaire
            </p>
          </AnimatedSection>
          <AnimatedSection variant="fade-up" delay={100} duration={600}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground text-balance">
              {"Presentation du Cabinet Partenaire"}
            </h2>
          </AnimatedSection>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">
          {/* Left column - Lawyer photo */}
          <AnimatedSection
            variant="fade-right"
            delay={200}
            duration={800}
            className="w-full lg:w-5/12"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-primary/40">
              <Image
                src="/images/WhatsApp Image 2026-02-13 at 13.34.55.jpeg"
                alt="Avocat partenaire du cabinet Contesto"
                width={600}
                height={750}
                className="w-full h-auto object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-foreground/80 to-transparent p-6 pt-16">
                <p className="text-lg font-bold text-background">
                  Cabinet d{"'"}avocats partenaire
                </p>
                <p className="text-sm text-background/80">
                  {"Specialistes du droit routier depuis plus de 15 ans"}
                </p>
              </div>
            </div>
          </AnimatedSection>

          {/* Right column - Presentation text */}
          <div className="w-full lg:w-7/12">
            <AnimatedSection variant="fade-left" delay={300} duration={600}>
              <div className="border-l-4 border-primary pl-6 mb-8">
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                  {"Presentation du Cabinet"}
                </h3>
              </div>
            </AnimatedSection>

            <div className="space-y-5 text-muted-foreground leading-relaxed">
              <AnimatedSection variant="fade-up" delay={400} duration={600}>
                <p>
                  {
                    "Notre cabinet partenaire est specialise en droit routier et accompagne les conducteurs depuis plus de 15 ans dans la contestation de leurs amendes. Fort d'une expertise reconnue et d'un taux de reussite exceptionnel, notre equipe d'avocats met son savoir-faire au service de vos droits pour vous offrir la meilleure defense possible."
                  }
                </p>
              </AnimatedSection>

              <AnimatedSection variant="fade-up" delay={500} duration={600}>
                <p>
                  {
                    "Grace a une approche combinant technologie de pointe et expertise juridique, nous analysons chaque dossier avec precision pour identifier les vices de procedure, erreurs de verbalisation et motifs d'annulation. Chaque cas est unique et merite une attention particuliere : c'est pourquoi nos avocats etudient personnellement chaque contestation avant son envoi."
                  }
                </p>
              </AnimatedSection>

              <AnimatedSection variant="fade-up" delay={600} duration={600}>
                <p>
                  {
                    "Notre engagement : transparence, efficacite et resultats. Nous vous accompagnons a chaque etape, de l'analyse initiale de votre amende jusqu'a la resolution definitive de votre dossier. Avec plus de 8 100 clients satisfaits et un taux de succes de 94%, notre cabinet est votre meilleur allie pour recuperer vos points et votre argent."
                  }
                </p>
              </AnimatedSection>
            </div>

            {/* Key highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">
              {[
                { value: "15+", label: "Annees d'experience", delay: 700 },
                { value: "94%", label: "Taux de succes", delay: 800 },
                { value: "8,100+", label: "Clients satisfaits", delay: 900 },
              ].map((item, index) => (
                <AnimatedSection
                  key={index}
                  variant="scale-up"
                  delay={item.delay}
                  duration={500}
                  className={index === 2 ? "col-span-2 sm:col-span-1" : ""}
                >
                  <div className="rounded-xl bg-accent p-4 text-center">
                    <p className="text-2xl font-bold text-primary">
                      {item.value}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.label}
                    </p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
