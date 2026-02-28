"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AnimatedSection } from "@/components/animated-section";

export function FAQ() {
  const faqs = [
    {
      question: "Comment fonctionne la garantie 100% ?",
      answer:
        "Si notre service ne fonctionne pas dans les cas ou le conducteur n'a pas ete interpelle, nous vous remboursons integralement. Notre garantie couvre tous les cas conformes a l'article L121-3 du Code de la Route.",
    },
    {
      question: "Quels types d'amendes puis-je contester ?",
      answer:
        "Toutes les infractions automatisees : radars fixes et mobiles, feux rouges, video-verbalisation, stationnement interdit, et autres contraventions ou le conducteur n'a pas ete intercepte sur place.",
    },
    {
      question: "Vais-je vraiment conserver mes points ?",
      answer:
        "Oui. Selon l'article L121-3 du Code de la Route francais, si le conducteur n'est pas identifie lors de l'infraction, aucun point ne peut etre retire du permis de conduire.",
    },
    {
      question: "Combien de temps prend la procedure ?",
      answer:
        "La soumission de votre contestation est immediate. La reponse des autorites (ANTAI) prend generalement entre 30 et 90 jours selon le type d'infraction et la charge administrative.",
    },
    {
      question: "Est-ce legal ?",
      answer:
        "Absolument. Notre service exploite une disposition legale du Code de la Route francais (article L121-3). Tous nos dossiers sont revises par des avocats inscrits au barreau.",
    },
    {
      question: "Que se passe-t-il si ma contestation est rejetee ?",
      answer:
        "Si votre dossier repond aux criteres de contestabilite et que notre service echoue, vous etes integralement rembourse. Nous vous accompagnons egalement pour les demarches suivantes si necessaire.",
    },
    {
      question: "Mes donnees personnelles sont-elles protegees ?",
      answer:
        "Oui, nous sommes 100% conformes au RGPD. Vos donnees sont chiffrees, stockees de maniere securisee, et ne sont jamais partagees avec des tiers sans votre consentement explicite.",
    },
    {
      question: "Puis-je suivre l'avancement de mon dossier ?",
      answer:
        "Oui, vous recevez des notifications par email a chaque etape : reception, analyse IA, revision avocat, envoi aux autorites, et reponse finale. Vous avez egalement acces a un tableau de bord en ligne.",
    },
  ];

  return (
    <section id="faq" className="py-14 md:py-28 bg-grey-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center space-y-4 mb-12">
          <AnimatedSection variant="fade-down" duration={600}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Questions frequentes
            </h2>
          </AnimatedSection>
          <AnimatedSection variant="fade-up" delay={150} duration={600}>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Tout ce que vous devez savoir sur notre service
            </p>
          </AnimatedSection>
        </div>

        <AnimatedSection
          variant="fade-up"
          delay={250}
          duration={700}
          className="max-w-3xl mx-auto"
        >
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
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </AnimatedSection>
      </div>
    </section>
  );
}
