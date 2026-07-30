"use client";

import React, { useRef, useState } from "react";

interface InteractiveTiltCardProps {
  children: React.ReactNode;
  className?: string;
  badgeNumber?: number | string;
  badgeIcon?: React.ReactNode;
}

export default function InteractiveTiltCard({
  children,
  className = "",
  badgeNumber,
  badgeIcon,
}: InteractiveTiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = -((y - centerY) / centerY) * 8; // Subtle 8 deg tilt
    const rotY = ((x - centerX) / centerX) * 8;

    setRotateX(rotX);
    setRotateY(rotY);
  };

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div className="perspective-1000 w-full h-full">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: isHovered ? "transform 0.1s ease-out" : "transform 0.5s ease-out",
        }}
        className={`relative preserve-3d group ${className}`}
      >
        {/* Subtle Catalogue ID Badge */}
        {badgeNumber !== undefined && (
          <div className="absolute top-4 right-4 z-30 flex items-center gap-1 bg-[#c5a059] text-black font-mono font-bold text-[10px] px-2.5 py-0.5 rounded uppercase tracking-wider">
            <span>{badgeNumber}</span>
            {badgeIcon}
          </div>
        )}

        <div className="relative z-10 w-full h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
