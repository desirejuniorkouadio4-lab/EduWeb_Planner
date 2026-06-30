import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="py-24 sm:py-28">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-forest-800 via-forest-900 to-forest-950 px-8 py-16 text-center text-cream-50 sm:px-16 sm:py-20">
            <div className="absolute inset-0 bg-grid-forest opacity-30" aria-hidden />
            <div
              className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold-500/15 blur-[100px]"
              aria-hidden
            />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                Prêt à digitaliser votre établissement&nbsp;?
              </h2>
              <p className="mt-4 text-lg text-cream-200/85">
                Créez votre compte, déclarez le rôle souhaité, et accédez à votre espace dès
                l'approbation. L'inscription est gratuite et immédiate.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <Button href="/inscription" variant="gold" size="lg">
                  Créer un compte
                  <ArrowRight size={18} />
                </Button>
                <Button
                  href="/connexion"
                  variant="outline"
                  size="lg"
                  className="border-cream-50/20 bg-white/5 text-cream-50 hover:border-cream-50/40 hover:bg-white/10"
                >
                  J'ai déjà un compte
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
