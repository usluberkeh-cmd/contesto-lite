"use client";

import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function AnimatedWord({
  word,
  delay,
  className,
}: {
  word: string;
  delay: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <span
      className={cn(
        "inline-block transition-all duration-700 ease-out",
        isVisible
          ? "opacity-100 translate-y-0 blur-0"
          : "opacity-0 translate-y-6 blur-[2px]",
        className
      )}
    >
      {word}
    </span>
  );
}

function AnimatedElement({
  children,
  delay,
  className,
  variant = "fade-up",
}: {
  children: React.ReactNode;
  delay: number;
  className?: string;
  variant?: "fade-up" | "fade-left" | "scale-up";
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const hiddenStyles = {
    "fade-up": "opacity-0 translate-y-6",
    "fade-left": "opacity-0 translate-x-6",
    "scale-up": "opacity-0 scale-90",
  };

  const visibleStyles = {
    "fade-up": "opacity-100 translate-y-0",
    "fade-left": "opacity-100 translate-x-0",
    "scale-up": "opacity-100 scale-100",
  };

  return (
    <div
      className={cn(
        "transition-all duration-700 ease-out",
        isVisible ? visibleStyles[variant] : hiddenStyles[variant],
        className
      )}
    >
      {children}
    </div>
  );
}

export function Hero() {
  const headlineWords = ["Contester", "vos", "Amendes"];
  const subHeadlineWords = ["Conservez", "vos", "points"];

  return (
    <section className="flex flex-col">
      {/* Hero section with background image */}
      <div className="relative min-h-[70vh] sm:min-h-[80vh] lg:min-h-[85vh]">
        {/* Background image */}
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
            {/* Headline - word by word animation */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-[1.15] tracking-tight text-balance">
              <span className="flex flex-wrap gap-x-[0.3em]">
                {headlineWords.map((word, i) => (
                  <AnimatedWord
                    key={`h-${i}`}
                    word={word}
                    delay={200 + i * 150}
                  />
                ))}
              </span>
              <span className="flex flex-wrap gap-x-[0.3em] text-muted-foreground">
                {subHeadlineWords.map((word, i) => (
                  <AnimatedWord
                    key={`s-${i}`}
                    word={word}
                    delay={700 + i * 150}
                    className="text-muted-foreground"
                  />
                ))}
              </span>
            </h1>

            {/* Subheadline */}
            <AnimatedElement delay={1200} className="mt-5">
              <p className="text-base lg:text-lg text-muted-foreground leading-relaxed text-pretty max-w-md">
                Notre technologie OCR analyse votre amende et nos avocats partenaires
                contestent pour vous. Simple, rapide, et garanti.
              </p>
            </AnimatedElement>

            {/* CTA Section */}
            <AnimatedElement delay={1500} variant="scale-up" className="mt-7">
              <div className="space-y-4">
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
            </AnimatedElement>

            {/* Trust Indicators */}
            <AnimatedElement delay={1800} className="mt-8">
              <div className="pt-6 border-t border-foreground/10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      title: "100% conforme",
                      sub: "Code de la Route",
                      delay: 1900,
                    },
                    {
                      title: "Avocats certifies",
                      sub: "Partenaires",
                      delay: 2050,
                    },
                    {
                      title: "Paiement securise",
                      sub: "Stripe & PayPal",
                      delay: 2200,
                    },
                    {
                      title: "94% de taux de reussite",
                      sub: "Resultats constates",
                      delay: 2350,
                    },
                  ].map((item, index) => (
                    <AnimatedElement
                      key={index}
                      delay={item.delay}
                      variant="fade-left"
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-foreground">
                            {item.title}
                          </p>
                          <p className="text-muted-foreground">{item.sub}</p>
                        </div>
                      </div>
                    </AnimatedElement>
                  ))}
                </div>
              </div>
            </AnimatedElement>
          </div>
        </div>
      </div>
    </section>
  );
}
