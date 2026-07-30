"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "scale";
}

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: ScrollRevealProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  let transformInitial = "translateY(40px)";
  if (direction === "down") transformInitial = "translateY(-40px)";
  if (direction === "left") transformInitial = "translateX(-40px)";
  if (direction === "right") transformInitial = "translateX(40px)";
  if (direction === "scale") transformInitial = "scale(0.92)";

  return (
    <div
      ref={elRef}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "none" : transformInitial,
        transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
      }}
      className={className}
    >
      {children}
    </div>
  );
}
