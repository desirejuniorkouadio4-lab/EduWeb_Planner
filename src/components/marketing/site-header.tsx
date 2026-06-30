"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

const liens = [
  { libelle: "La plateforme", href: "#plateforme" },
  { libelle: "Modules", href: "#modules" },
  { libelle: "Emplois du temps", href: "#solveur" },
  { libelle: "Pour qui ?", href: "#public" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOuvert, setMenuOuvert] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // En haut de page, l'en-tête flotte au-dessus du hero sombre → contenu clair.
  // Au défilement, il devient une barre crème → contenu foncé.
  const surHero = !scrolled;

  return (
    <motion.header
      initial={{ y: -90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300",
        scrolled
          ? "border-b border-cream-200/80 bg-cream-50/90 shadow-[0_6px_30px_-14px_rgba(15,53,39,0.35)] backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <Container className="flex h-20 items-center justify-between">
        <Logo tone={surHero ? "light" : "dark"} />

        <nav className="hidden items-center gap-1 lg:flex">
          {liens.map((lien) => (
            <Link
              key={lien.href}
              href={lien.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                surHero
                  ? "text-cream-100/85 hover:bg-white/10 hover:text-white"
                  : "text-forest-800/80 hover:bg-forest-50 hover:text-forest-900",
              )}
            >
              {lien.libelle}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button
            href="/connexion"
            variant="ghost"
            size="sm"
            className={cn(
              surHero && "text-cream-50 hover:bg-white/10 hover:text-white",
            )}
          >
            Connexion
          </Button>
          <Button href="/inscription" variant={surHero ? "gold" : "primary"} size="sm">
            Créer un compte
            <ArrowRight size={15} />
          </Button>
        </div>

        <button
          type="button"
          aria-label="Ouvrir le menu"
          onClick={() => setMenuOuvert((v) => !v)}
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors lg:hidden",
            surHero
              ? "text-cream-50 hover:bg-white/10"
              : "text-forest-800 hover:bg-forest-50",
          )}
        >
          {menuOuvert ? <X size={22} /> : <Menu size={22} />}
        </button>
      </Container>

      <AnimatePresence>
        {menuOuvert && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-cream-200 bg-cream-50/97 backdrop-blur-md lg:hidden"
          >
            <Container className="flex flex-col gap-1 py-4">
              {liens.map((lien) => (
                <Link
                  key={lien.href}
                  href={lien.href}
                  onClick={() => setMenuOuvert(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-forest-800 hover:bg-forest-50"
                >
                  {lien.libelle}
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-2 px-1">
                <Button href="/connexion" variant="outline" size="md">
                  Connexion
                </Button>
                <Button href="/inscription" variant="primary" size="md">
                  Créer un compte
                </Button>
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
