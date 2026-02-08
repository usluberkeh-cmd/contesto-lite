import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export function Hero() {
  return (
    <section className="flex flex-col">
      {/* Hero section with background image */}
      <div className="relative min-h-[70vh] sm:min-h-[80vh] lg:min-h-[85vh]">
        {/* Background image - no overlay effects, image stays as-is */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-bg.png"
            alt=""
            fill
            className="object-cover object-center sm:object-right-bottom"
            priority
          />
        </div>

        {/* Content on the left side */}
        <div className="relative z-10 flex items-center h-full min-h-[70vh] sm:min-h-[80vh] lg:min-h-[85vh]">
          <div className="w-full px-4 py-10 sm:px-6 sm:py-12 md:px-12 lg:px-16 xl:px-20 max-w-xl lg:max-w-2xl">
            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-[1.15] tracking-tight text-balance">
              Contester vos Amendes{" "}
              <span className="text-muted-foreground">
                Conservez vos points
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mt-5 text-base lg:text-lg text-muted-foreground leading-relaxed text-pretty max-w-md">
              Notre IA analyse votre dossier et nos avocats partenaires
              contestent pour vous. Simple, rapide, et garanti.
            </p>

            {/* CTA Section */}
            <div className="mt-7 space-y-4">
              <Button
                size="lg"
                className="w-full sm:w-auto text-base px-8 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/20"
                asChild
              >
                <Link href="/dashboard/submit-fine">
                  Soumettre mon amende
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>

              <div className="flex items-center gap-2">
                <a
                  href="#comment-ca-marche"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  Voir comment ca marche
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 pt-6 border-t border-foreground/10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">
                      100% conforme
                    </p>
                    <p className="text-muted-foreground">Code de la Route</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">
                      Avocats certifies
                    </p>
                    <p className="text-muted-foreground">Partenaires</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">
                      Paiement securise
                    </p>
                    <p className="text-muted-foreground">Stripe & PayPal</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">
                      94% de taux de reussite
                    </p>
                    <p className="text-muted-foreground">
                      Resultats constates
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
