"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export type HeroSlide = {
  imageUrl?: string;
  caption?: string;
};

type Props = {
  slides: HeroSlide[];
  title: string;
  subtitle: string;
  primaryAction: { label: string; href: string };
  secondaryAction: { label: string; href: string };
  accentColor: string;
};

export default function HeroSlider({
  slides,
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  accentColor,
}: Props) {
  const cleanedSlides = useMemo(() => {
    if (slides.length === 0) {
      return [
        {
          caption: subtitle,
        },
      ];
    }

    return slides;
  }, [slides, subtitle]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (cleanedSlides.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % cleanedSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [cleanedSlides.length]);

  const currentSlide = cleanedSlides[activeIndex];

  return (
    <section className="relative overflow-hidden" aria-label="Hero carousel">
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          backgroundImage: currentSlide.imageUrl
            ? `linear-gradient(180deg, rgba(15,23,42,0.38), rgba(15,23,42,0.84)), url('${currentSlide.imageUrl}')`
            : "linear-gradient(180deg, rgba(15,23,42,0.82), rgba(15,23,42,0.96))",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.14),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.16),_transparent_26%)]" />

      <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-6 py-18 text-white sm:px-10">
        <div className="max-w-3xl rounded-[2rem] border border-white/15 bg-black/20 p-7 backdrop-blur-sm md:p-8">
          <p className="text-xs uppercase tracking-[0.4em] text-white/70">
            Impacto coletivo
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight drop-shadow md:text-6xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-white/90 md:text-xl">
            {subtitle}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={primaryAction.href}
              className="rounded-full px-6 py-3 text-sm font-semibold text-white transition"
              style={{ backgroundColor: accentColor }}
            >
              {primaryAction.label}
            </Link>
            <Link
              href={secondaryAction.href}
              className="rounded-full border border-white/70 px-6 py-3 text-sm font-medium text-white"
            >
              {secondaryAction.label}
            </Link>
          </div>
        </div>

        {currentSlide.caption ? (
          <div className="mt-6 inline-flex max-w-xl rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm text-white/82 backdrop-blur-sm">
            {currentSlide.caption}
          </div>
        ) : null}
      </div>

      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 backdrop-blur-sm">
        {cleanedSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`h-2.5 w-10 rounded-full transition-colors ${
              activeIndex === index ? "bg-white" : "bg-white/35"
            }`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
