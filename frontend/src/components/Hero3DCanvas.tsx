"use client";

import React, { useEffect, useRef, useState } from "react";

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Particle3D {
  x: number;
  y: number;
  z: number;
  size: number;
  speed: number;
  alpha: number;
}

export default function Hero3DCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeShape, setActiveShape] = useState<"stupa" | "mandala" | "seal">("stupa");

  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, clickRipple: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 540);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight || 540;
    };

    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      mouseRef.current.targetX = (e.clientX - cx) / (rect.width / 2);
      mouseRef.current.targetY = (e.clientY - cy) / (rect.height / 2);
    };

    const handleClick = () => {
      mouseRef.current.clickRipple = 1.0;
    };

    window.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);

    // Fine Ambient Dust Particles
    const particles: Particle3D[] = [];
    for (let i = 0; i < 70; i++) {
      const rad = Math.random() * 260 + 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      particles.push({
        x: rad * Math.sin(phi) * Math.cos(theta),
        y: rad * Math.sin(phi) * Math.sin(theta),
        z: rad * Math.cos(phi),
        size: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.005 + 0.002,
        alpha: Math.random() * 0.5 + 0.2,
      });
    }

    const generateStupaPoints = (): Point3D[] => {
      const pts: Point3D[] = [];
      for (let l = 0; l < 4; l++) {
        const sz = 160 - l * 22;
        const y = 120 - l * 22;
        pts.push({ x: -sz, y, z: -sz }, { x: sz, y, z: -sz }, { x: sz, y, z: sz }, { x: -sz, y, z: sz });
      }
      for (let r = 0; r < 12; r++) {
        const angle = (r / 12) * Math.PI * 2;
        pts.push({ x: Math.cos(angle) * 70, y: 25 + Math.sin((r / 12) * Math.PI) * 15, z: Math.sin(angle) * 70 });
      }
      for (let s = 0; s < 13; s++) {
        const rad = 40 * (1 - s / 14);
        const y = -10 - s * 13;
        const angle = (s * Math.PI) / 3;
        pts.push({ x: Math.cos(angle) * rad, y, z: Math.sin(angle) * rad });
      }
      pts.push({ x: 0, y: -190, z: 0 });
      return pts;
    };

    const generateMandalaPoints = (): Point3D[] => {
      const pts: Point3D[] = [];
      for (let r = 1; r <= 4; r++) {
        const radius = r * 42;
        for (let i = 0; i < 16; i++) {
          const angle = (i / 16) * Math.PI * 2;
          pts.push({ x: Math.cos(angle) * radius, y: (r % 2 === 0 ? 10 : -10), z: Math.sin(angle) * radius });
        }
      }
      return pts;
    };

    const generateSealPoints = (): Point3D[] => {
      const pts: Point3D[] = [];
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        pts.push({ x: Math.cos(angle) * 140, y: 0, z: Math.sin(angle) * 140 });
        pts.push({ x: Math.cos(angle + Math.PI / 8) * 90, y: 15, z: Math.sin(angle + Math.PI / 8) * 90 });
      }
      return pts;
    };

    let shapePoints = generateStupaPoints();
    let rotationX = 0.2;
    let rotationY = 0;
    let time = 0;

    const render = () => {
      time += 0.012;
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.04;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.04;

      if (mouseRef.current.clickRipple > 0) {
        mouseRef.current.clickRipple -= 0.02;
      }

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2 + 10;
      const fov = 400;

      rotationY += 0.005 + mouseRef.current.x * 0.004;
      rotationX = 0.2 + mouseRef.current.y * 0.2;

      // Subtle Radial Gold Glow
      const bgGlow = ctx.createRadialGradient(cx, cy, 5, cx, cy, 260);
      bgGlow.addColorStop(0, "rgba(197, 160, 89, 0.08)");
      bgGlow.addColorStop(1, "rgba(9, 9, 11, 0)");
      ctx.fillStyle = bgGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, 260, 0, Math.PI * 2);
      ctx.fill();

      // Render Ambient Fine Dust
      particles.forEach((p) => {
        const cosY = Math.cos(p.speed);
        const sinY = Math.sin(p.speed);
        const rx = p.x * cosY - p.z * sinY;
        const rz = p.x * sinY + p.z * cosY;
        p.x = rx;
        p.z = rz;

        const scale = fov / (fov + p.z + 300);
        const projX = cx + p.x * scale;
        const projY = cy + p.y * scale;

        ctx.fillStyle = "#c5a059";
        ctx.globalAlpha = p.alpha * scale;
        ctx.beginPath();
        ctx.arc(projX, projY, p.size * scale, 0, Math.PI * 2);
        ctx.fill();
      });

      // Render 3D Geometry
      ctx.globalAlpha = 1.0;
      const projectedPoints: { x: number; y: number; z: number; scale: number }[] = [];

      const cosX = Math.cos(rotationX);
      const sinX = Math.sin(rotationX);
      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);

      if (activeShape === "stupa" && shapePoints.length !== 41) shapePoints = generateStupaPoints();
      else if (activeShape === "mandala" && shapePoints.length !== 64) shapePoints = generateMandalaPoints();
      else if (activeShape === "seal" && shapePoints.length !== 16) shapePoints = generateSealPoints();

      shapePoints.forEach((pt) => {
        let x = pt.x * cosY - pt.z * sinY;
        let y = pt.y;
        let z = pt.x * sinY + pt.z * cosY;

        let y2 = y * cosX - z * sinX;
        let z2 = y * sinX + z * cosX;

        const scale = fov / (fov + z2 + 340);
        projectedPoints.push({
          x: cx + x * scale,
          y: cy + y2 * scale,
          z: z2,
          scale,
        });
      });

      // Fine Lines Connections
      ctx.lineWidth = 1;
      for (let i = 0; i < projectedPoints.length; i++) {
        for (let j = i + 1; j < projectedPoints.length; j++) {
          const p1 = projectedPoints[i];
          const p2 = projectedPoints[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const maxDist = 75;
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.45 * Math.min(p1.scale, p2.scale);
            ctx.strokeStyle = `rgba(197, 160, 89, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Vertex Nodes
      projectedPoints.forEach((pt) => {
        ctx.fillStyle = "#c5a059";
        ctx.globalAlpha = Math.max(0.2, Math.min(1, pt.scale));
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2 * pt.scale, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClick);
    };
  }, [activeShape]);

  return (
    <div className="relative w-full h-[480px] md:h-[540px] overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0f] flex items-center justify-center group">
      <canvas ref={canvasRef} className="relative z-10 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Metadata Badge */}
      <div className="absolute top-5 left-5 z-20 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#c5a059]" />
        <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">
          EXHIBIT 3D MODEL • REF: AR-2026
        </span>
      </div>

      {/* Shape Selector Switcher */}
      <div className="absolute bottom-5 z-20 flex items-center gap-1.5 p-1 rounded-xl bg-zinc-950/80 backdrop-blur-md border border-white/10 text-xs font-medium">
        <button
          onClick={() => setActiveShape("stupa")}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeShape === "stupa" ? "bg-[#c5a059] text-black font-semibold" : "text-zinc-400 hover:text-white"
          }`}
        >
          Ancient Stupa
        </button>
        <button
          onClick={() => setActiveShape("mandala")}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeShape === "mandala" ? "bg-[#c5a059] text-black font-semibold" : "text-zinc-400 hover:text-white"
          }`}
        >
          Sacred Mandala
        </button>
        <button
          onClick={() => setActiveShape("seal")}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeShape === "seal" ? "bg-[#c5a059] text-black font-semibold" : "text-zinc-400 hover:text-white"
          }`}
        >
          Royal Seal
        </button>
      </div>
    </div>
  );
}
