"use client";

import { motion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";

const variants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.08,
      ease: [0.21, 0.5, 0.27, 1],
    },
  }),
};

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Index pour décaler l'apparition (effet cascade). */
  delayIndex?: number;
  as?: "div" | "section" | "li" | "article" | "span";
}

/** Enveloppe un bloc et le fait apparaître en fondu + glissement quand il entre dans le viewport. */
export function Reveal({ children, className, delayIndex = 0, as = "div" }: RevealProps) {
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={cn(className)}
      custom={delayIndex}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </MotionTag>
  );
}
