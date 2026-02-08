import { Check, X, Minus } from "lucide-react"

export function Comparison() {
  const features = [
    { feature: "Analyse IA", us: "smart", competitors: false },
    { feature: "Avocats partenaires", us: true, competitors: "partial" },
    { feature: "Suivi en temps reel", us: true, competitors: "partial" },
    { feature: "Garantie remboursement", us: true, competitors: "varies" },
    { feature: "Prix", us: "49\u20AC", competitors: "51-80\u20AC" },
  ]

  return (
    <section className="py-14 md:py-28 bg-accent">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center space-y-4 mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Nos avantages
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground text-balance">
            Pourquoi nous choisir ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {"Une solution complete qui combine technologie et expertise juridique pour maximiser vos chances de succes."}
          </p>
        </div>

        <div className="max-w-4xl mx-auto rounded-xl overflow-hidden border border-primary/20 shadow-lg bg-background">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary/20 bg-primary/5">
                  <th className="text-left p-4 md:p-5 font-semibold text-foreground text-sm md:text-base">
                    {"Fonctionnalite"}
                  </th>
                  <th className="text-center p-4 md:p-5 font-semibold text-primary text-sm md:text-base">
                    Contesto
                  </th>
                  <th className="text-center p-4 md:p-5 font-semibold text-muted-foreground text-sm md:text-base">
                    Concurrents
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-border last:border-0"
                  >
                    <td className="p-4 md:p-5 text-foreground font-medium text-sm md:text-base">
                      {item.feature}
                    </td>
                    <td className="p-4 md:p-5 text-center">
                      {item.us === true ? (
                        <div className="flex justify-center">
                          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary/15 flex items-center justify-center">
                            <Check className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                          </div>
                        </div>
                      ) : item.us === "smart" ? (
                        <span className="text-primary font-semibold text-sm md:text-base">
                          Score intelligent
                        </span>
                      ) : (
                        <span className="text-foreground font-semibold text-sm md:text-base">
                          {item.us}
                        </span>
                      )}
                    </td>
                    <td className="p-4 md:p-5 text-center">
                      {item.competitors === false ? (
                        <div className="flex justify-center">
                          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                            <X className="w-4 h-4 md:w-5 md:h-5 text-destructive" />
                          </div>
                        </div>
                      ) : item.competitors === "partial" ? (
                        <div className="flex justify-center">
                          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-muted flex items-center justify-center">
                            <Minus className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                          </div>
                        </div>
                      ) : item.competitors === "varies" ? (
                        <span className="text-muted-foreground text-sm md:text-base">
                          Variable
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm md:text-base">
                          {item.competitors}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
