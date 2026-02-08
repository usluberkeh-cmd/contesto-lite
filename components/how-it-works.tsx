import { Camera, Sparkles, Scale, ArrowRight } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      number: "1",
      icon: Camera,
      title: "Déposez votre amende",
      description: "Prenez une photo ou déposez votre PDF",
      subtext: "Fonctionne sur mobile, tablette et ordinateur",
    },
    {
      number: "2",
      icon: Sparkles,
      title: "Analyse IA instantanée",
      description:
        "Notre intelligence artificielle calcule vos chances de succès",
      subtext: "Score de contestabilité en temps réel",
    },
    {
      number: "3",
      icon: Scale,
      title: "Nos avocats s'occupent du reste",
      description: "Contestation automatique envoyée aux autorités",
      subtext: "Suivi par email à chaque étape",
    },
  ];

  return (
    <section id="comment-ca-marche" className="py-14 md:py-28 bg-grey-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Comment ça marche
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Un processus simple en 3 étapes pour contester votre amende et
            conserver vos points
          </p>
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
              <div key={index} className="relative">
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
