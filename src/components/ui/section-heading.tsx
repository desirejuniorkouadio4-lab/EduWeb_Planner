import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "left" | "center";
  tone?: "dark" | "light";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  tone = "dark",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <Reveal>
          <span
            className={cn(
              "inline-block text-xs font-semibold uppercase tracking-[0.24em]",
              tone === "light" ? "text-gold-300" : "text-gold-600",
            )}
          >
            {eyebrow}
          </span>
        </Reveal>
      )}
      <Reveal delayIndex={1}>
        <h2
          className={cn(
            "mt-3 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl",
            tone === "light" ? "text-cream-50" : "text-forest-900",
          )}
        >
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal delayIndex={2}>
          <p
            className={cn(
              "mt-4 text-lg leading-relaxed",
              tone === "light" ? "text-cream-200/85" : "text-ink-700/80",
            )}
          >
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}
