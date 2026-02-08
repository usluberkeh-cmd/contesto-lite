import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FAQ() {
  const faqs = [
    {
      question: "Comment fonctionne la garantie 100% ?",
      answer:
        "Si notre service ne fonctionne pas dans les cas où le conducteur n'a pas été interpellé, nous vous remboursons intégralement. Notre garantie couvre tous les cas conformes à l'article L121-3 du Code de la Route.",
    },
    {
      question: "Quels types d'amendes puis-je contester ?",
      answer:
        "Toutes les infractions automatisées : radars fixes et mobiles, feux rouges, vidéo-verbalisation, stationnement interdit, et autres contraventions où le conducteur n'a pas été intercepté sur place.",
    },
    {
      question: "Vais-je vraiment conserver mes points ?",
      answer:
        "Oui. Selon l'article L121-3 du Code de la Route français, si le conducteur n'est pas identifié lors de l'infraction, aucun point ne peut être retiré du permis de conduire.",
    },
    {
      question: "Combien de temps prend la procédure ?",
      answer:
        "La soumission de votre contestation est immédiate. La réponse des autorités (ANTAI) prend généralement entre 30 et 90 jours selon le type d'infraction et la charge administrative.",
    },
    {
      question: "Est-ce légal ?",
      answer:
        "Absolument. Notre service exploite une disposition légale du Code de la Route français (article L121-3). Tous nos dossiers sont révisés par des avocats inscrits au barreau.",
    },
    {
      question: "Que se passe-t-il si ma contestation est rejetée ?",
      answer:
        "Si votre dossier répond aux critères de contestabilité et que notre service échoue, vous êtes intégralement remboursé. Nous vous accompagnons également pour les démarches suivantes si nécessaire.",
    },
    {
      question: "Mes données personnelles sont-elles protégées ?",
      answer:
        "Oui, nous sommes 100% conformes au RGPD. Vos données sont chiffrées, stockées de manière sécurisée, et ne sont jamais partagées avec des tiers sans votre consentement explicite.",
    },
    {
      question: "Puis-je suivre l'avancement de mon dossier ?",
      answer:
        "Oui, vous recevez des notifications par email à chaque étape : réception, analyse IA, révision avocat, envoi aux autorités, et réponse finale. Vous avez également accès à un tableau de bord en ligne.",
    },
  ]

  return (
    <section id="faq" className="py-14 md:py-28 bg-grey-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">Questions fréquentes</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Tout ce que vous devez savoir sur notre service
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-grey-200 rounded-xl px-6 bg-background shadow-sm"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
