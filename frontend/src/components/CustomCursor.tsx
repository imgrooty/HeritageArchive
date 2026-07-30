"use client";

import React, { useEffect, useState } from "react";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || window.innerWidth < 768) return;

    setIsVisible(true);

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive =
          target.tagName === "BUTTON" ||
          target.tagName === "A" ||
          target.tagName === "INPUT" ||
          target.tagName === "SELECT" ||
          target.closest("button") !== null ||
          target.closest("a") !== null ||
          target.getAttribute("role") === "button" ||
          target.classList.contains("cursor-pointer");

        setIsHovered(!!isInteractive);
      }
    };

    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Precision Center Dot */}
      <div
        className="fixed pointer-events-none z-[9999] rounded-full transition-transform duration-75 ease-out -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: isMouseDown ? "4px" : isHovered ? "8px" : "6px",
          height: isMouseDown ? "4px" : isHovered ? "8px" : "6px",
          backgroundColor: isHovered ? "#c5a059" : "#f4f4f7",
        }}
      />

      {/* Sleek Outer Ring */}
      <div
        className="fixed pointer-events-none z-[9998] rounded-full border transition-all duration-200 ease-out -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: isHovered ? "42px" : isMouseDown ? "20px" : "30px",
          height: isHovered ? "42px" : isMouseDown ? "20px" : "30px",
          borderColor: isHovered ? "rgba(197, 160, 89, 0.6)" : "rgba(255, 255, 255, 0.2)",
          backgroundColor: isHovered ? "rgba(197, 160, 89, 0.05)" : "transparent",
        }}
      />
    </>
  );
}
