"use client";

import React, { useEffect } from "react";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Scroll reveal observer for elements with .reveal-card
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-12");
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = document.querySelectorAll(".reveal-card");
    cards.forEach((card) => {
      card.classList.add("transition-all", "duration-700", "ease-out", "opacity-0", "translate-y-12");
      observer.observe(card);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return <>{children}</>;
}
