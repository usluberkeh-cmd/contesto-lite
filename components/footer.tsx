"use client";

import { Facebook, Twitter, Linkedin, Mail, Phone } from "lucide-react";
import Image from "next/image";
import { AnimatedSection } from "@/components/animated-section";

export function Footer() {
  return (
    <footer
      id="nous-contacter"
      className="bg-grey-100 border-t border-grey-200 text-foreground py-12 md:py-16"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <AnimatedSection
            variant="fade-up"
            delay={0}
            duration={600}
            className="col-span-2 md:col-span-1"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Image
                  src="/images/contesto-logo-transparent.png"
                  alt="Contesto"
                  width={130}
                  height={36}
                  className="h-8 w-auto"
                />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {"Service de contestation d'amendes routieres avec analyse IA et revision par avocat."}
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                >
                  <Facebook className="w-4 h-4 text-primary" />
                </a>
                <a
                  href="#"
                  className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                >
                  <Twitter className="w-4 h-4 text-primary" />
                </a>
                <a
                  href="#"
                  className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                >
                  <Linkedin className="w-4 h-4 text-primary" />
                </a>
              </div>
            </div>
          </AnimatedSection>

          {/* Navigation */}
          <AnimatedSection variant="fade-up" delay={100} duration={600}>
            <h3 className="font-semibold mb-4 text-foreground">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Accueil
                </a>
              </li>
              <li>
                <a
                  href="#qui-sommes-nous"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Qui sommes-nous
                </a>
              </li>
              <li>
                <a
                  href="#contester"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contester
                </a>
              </li>
              <li>
                <a
                  href="#nous-contacter"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Nous contacter
                </a>
              </li>
            </ul>
          </AnimatedSection>

          {/* Legal */}
          <AnimatedSection variant="fade-up" delay={200} duration={600}>
            <h3 className="font-semibold mb-4 text-foreground">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Mentions legales
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  CGU
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {"Politique de confidentialite"}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cookies
                </a>
              </li>
            </ul>
          </AnimatedSection>

          {/* Contact */}
          <AnimatedSection variant="fade-up" delay={300} duration={600}>
            <h3 className="font-semibold mb-4 text-foreground">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <a
                  href="mailto:contact@contesto.fr"
                  className="hover:text-foreground transition-colors"
                >
                  contact@contesto.fr
                </a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <a
                  href="tel:+33123456789"
                  className="hover:text-foreground transition-colors"
                >
                  01 23 45 67 89
                </a>
              </li>
            </ul>
            <div className="mt-4 text-xs text-muted-foreground">
              <p>Contesto SAS</p>
              <p>SIRET: 123 456 789 00012</p>
              <p>Paris, France</p>
            </div>
          </AnimatedSection>
        </div>

        <AnimatedSection variant="blur-in" delay={400} duration={600}>
          <div className="pt-8 border-t border-grey-200 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Contesto. Tous droits reserves.</p>
          </div>
        </AnimatedSection>
      </div>
    </footer>
  );
}
