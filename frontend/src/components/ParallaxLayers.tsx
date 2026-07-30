"use client";

import React from "react";

export default function ParallaxLayers() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      {/* Minimal ambient atmospheric lighting fields (No background SVGs) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#c5a059]/05 via-transparent to-transparent blur-3xl pointer-events-none" />
    </div>
  );
}
