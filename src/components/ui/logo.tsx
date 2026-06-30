import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** Affiche le nom à côté du blason. */
  withWordmark?: boolean;
  /** Variante de couleur du texte (sur fond clair ou foncé). */
  tone?: "dark" | "light";
  href?: string;
  className?: string;
  size?: number;
}

/** Blason EduWeb Planner + nom optionnel. */
export function Logo({
  withWordmark = true,
  tone = "dark",
  href = "/",
  className,
  size = 44,
}: LogoProps) {
  const content = (
    <span className={cn("flex items-center gap-3", className)}>
      <Image
        src="/logo.png"
        alt="EduWeb Planner"
        width={size}
        height={size}
        priority
        className="h-auto w-auto drop-shadow-sm"
        style={{ width: size, height: size, objectFit: "contain" }}
      />
      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-lg font-bold tracking-tight",
              tone === "light" ? "text-cream-50" : "text-forest-900",
            )}
          >
            EduWeb
          </span>
          <span
            className={cn(
              "text-[0.62rem] font-semibold uppercase tracking-[0.32em]",
              tone === "light" ? "text-gold-300" : "text-gold-600",
            )}
          >
            Planner
          </span>
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} aria-label="EduWeb Planner — accueil" className="inline-flex">
        {content}
      </Link>
    );
  }
  return content;
}
