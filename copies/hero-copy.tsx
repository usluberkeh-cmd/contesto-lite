import { Button } from "@/components/ui/button";
import { CheckCircle2, Camera, Sparkles, Scale, Zap } from "lucide-react";
import Link from "next/link";

/**
 * Hero section component for the landing page.
 *
 * Returns:
 *   JSX.Element: Hero section content.
 */

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-grey-50 to-grey-100">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">Contesto</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#comment-ca-marche"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Comment ça marche
          </a>
          <a
            href="#tarifs"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Tarifs
          </a>
          <a
            href="#faq"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            FAQ
          </a>
          <Button
            variant="outline"
            size="sm"
            className="font-medium bg-transparent"
          >
            Connexion
          </Button>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="container mx-auto px-8 py-20 md:pt-4 md:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            {/* <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-success/10 border border-success/20 text-success text-sm font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              94% de taux de réussite
            </div> */}

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
              Amende radar injuste ? Conservez vos points et votre argent en 5
              minutes
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty">
              Notre IA analyse votre dossier et nos avocats partenaires
              contestent pour vous. Simple, rapide, et garanti.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 bg-background/80 backdrop-blur-sm"
                asChild
              >
                <Link href="/dashboard/submit-fine">Soumettre mon amende</Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 bg-background/80 backdrop-blur-sm"
              >
                Voir comment ça marche
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-[repeat(4,minmax(0,1fr))_1.25fr] gap-4 pt-8">
              {/*grid-cols-2 gives 2 equal columns (1fr each) on small screens
            md:grid-cols-5 gives 5 equal columns (1fr each) at md and up.
            That keeps items 1–4 at 1fr and makes the last column 1.25fr.
            */}
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-foreground">
                    100% conforme
                  </div>
                  <div className="text-muted-foreground">Code de la Route</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-foreground">
                    Avocats certifiés
                  </div>
                  <div className="text-muted-foreground">Partenaires</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-foreground">
                    Paiement sécurisé
                  </div>
                  <div className="text-muted-foreground">Stripe & PayPal</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-foreground">
                    Traitement 48h
                  </div>
                  <div className="text-muted-foreground">Réponse rapide</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-foreground">
                    94% de taux de réussite
                  </div>
                  <div className="text-muted-foreground">
                    Résultats constatés sur nos dossiers
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Drop your file visual */}
          {false && (
            <div className="relative">
              <div className="relative bg-card/80 backdrop-blur-sm border border-border rounded-2xl shadow-2xl p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      Analyse IA instantanée
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Score de contestabilité en temps réel
                    </div>
                  </div>
                </div>

                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center space-y-4 bg-grey-50">
                  <Camera className="w-12 h-12 mx-auto text-muted-foreground" />
                  <div>
                    <div className="font-medium text-foreground">
                      Déposez votre amende ici
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      ou cliquez pour parcourir
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    PDF, JPG, PNG • Max 10MB
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/20 rounded-xl">
                  <Scale className="w-6 h-6 text-success" />
                  <div className="text-sm text-foreground">
                    <span className="font-semibold">Révision par avocat</span>{" "}
                    incluse dans chaque dossier
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-success/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-4 -left-4 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
