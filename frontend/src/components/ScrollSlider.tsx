"use client";

import React, { useEffect, useRef, useState } from "react";
import InteractiveTiltCard from "./InteractiveTiltCard";
import { apiFetch, API_BASE_URL } from "@/lib/api";

interface GalleryItem {
  id: string;
  badge: string;
  title: string;
  nepaliTitle: string;
  category: string;
  location: string;
  era: string;
  description: string;
  image: string;
}

const FALLBACK_ITEMS: GalleryItem[] = [
  {
    id: "01",
    badge: "CAT-NE-01",
    title: "Kathmandu Valley WHS",
    nepaliTitle: "काठमाडौँ उपत्यका विश्व सम्पदा",
    category: "MONUMENT",
    location: "Kathmandu Valley",
    era: "Licchavi & Malla Era",
    description: "Seven monument zones including Durbar Squares, Swayambhunath, Pashupatinath, and Changu Narayan.",
    image: "/hero_heritage_nepal.png",
  },
  {
    id: "02",
    badge: "CAT-NE-02",
    title: "Lumbini Maya Devi Temple",
    nepaliTitle: "लुम्बिनी मायादेवी मन्दिर",
    category: "SACRED MONUMENT",
    location: "Lumbini, Rupandehi",
    era: "623 BC • Sakya Kingdom",
    description: "UNESCO World Heritage site marking the birth place of Prince Siddhartha Gautama (Lord Buddha).",
    image: "/hero_heritage_nepal.png",
  },
  {
    id: "03",
    badge: "CAT-NE-03",
    title: "Janaki Mandir Janakpur",
    nepaliTitle: "जानकी मन्दिर जनकपुरधाम",
    category: "TEMPLE SHRINE",
    location: "Janakpurdham, Mithila",
    era: "1911 AD • Koiri Architecture",
    description: "Sacred center of Mithila culture and birthplace of Goddess Sita, featuring 60 marble rooms.",
    image: "/janaki_mandir_janakpur.png",
  },
  {
    id: "04",
    badge: "CAT-NE-04",
    title: "Mithila Madhubani Art",
    nepaliTitle: "मिथिला लोक चित्रकला",
    category: "TRADITION",
    location: "Madhesh Province",
    era: "Ancient Mithila",
    description: "Folk wall and paper paintings created using natural dyes and sacred mythological motifs.",
    image: "/mithila_cultural_art.png",
  },
];

export default function ScrollSlider() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [items, setItems] = useState<GalleryItem[]>(FALLBACK_ITEMS);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const data = await apiFetch("/heritage");
        if (data && data.length > 0) {
          const transformed: GalleryItem[] = data.slice(0, 10).map((site: any, idx: number) => {
            const imgMedia = site.media?.find((m: any) => m.media_type === "image");
            const rawImg = imgMedia ? imgMedia.media_url : "/hero_heritage_nepal.png";
            const fullImg = rawImg.startsWith("http") || rawImg.startsWith("/") ? rawImg : `${API_BASE_URL}${rawImg}`;
            const primaryStory = site.stories?.[0];

            return {
              id: (idx + 1).toString().padStart(2, "0"),
              badge: `NE-HER-${site.id.toString().padStart(2, "0")}`,
              title: site.name.toUpperCase(),
              nepaliTitle: primaryStory?.title || site.name,
              category: site.category.toUpperCase(),
              location: `Lat ${site.latitude.toFixed(2)}°, Lng ${site.longitude.toFixed(2)}°`,
              era: site.status.toUpperCase(),
              description: primaryStory?.content
                ? primaryStory.content.slice(0, 140) + "..."
                : "Preserved heritage catalogue record.",
              image: fullImg,
            };
          });
          setItems(transformed);
        }
      } catch (err) {
        console.error("Failed to load real DB exhibits for slider:", err);
      }
    };

    fetchSites();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const scrollableHeight = section.clientHeight - window.innerHeight;

      if (scrollableHeight <= 0) return;

      const currentScroll = -rect.top;
      const progress = Math.max(0, Math.min(1, currentScroll / scrollableHeight));
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const activeIndex = Math.min(
    items.length - 1,
    Math.floor(scrollProgress * items.length)
  );

  const cardWidth = 440;
  const gap = 28;
  const totalTrackWidth = items.length * (cardWidth + gap);
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
  const maxTranslate = Math.max(0, totalTrackWidth - viewportWidth + 160);
  const translateX = scrollProgress * maxTranslate;

  return (
    <div ref={sectionRef} className="relative w-full h-[250vh] bg-[#09090b] border-y border-white/10">
      
      {/* Sticky Locked Viewport Container */}
      <div className="sticky top-0 w-full h-screen overflow-hidden flex flex-col justify-between py-8 bg-[#09090b] z-30">
        
        {/* Header */}
        <div className="max-w-7xl mx-auto px-6 w-full flex items-end justify-between z-20 shrink-0">
          <div>
            <span className="text-[11px] font-mono tracking-widest text-[#c5a059] uppercase font-semibold">
              EXHIBITION INDEX • PINNED HORIZONTAL CATALOGUE
            </span>
            <h2 className="text-3xl md:text-4xl font-normal text-white font-display mt-0.5">
              Featured Archival Exhibits (Database Fed)
            </h2>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs tracking-widest text-zinc-400">
            <span className="text-[#c5a059] font-bold text-lg">0{activeIndex + 1}</span>
            <span>/</span>
            <span>0{items.length}</span>
          </div>
        </div>

        {/* Horizontal Track */}
        <div className="w-full overflow-hidden my-auto z-20">
          <div
            style={{ transform: `translate3d(-${translateX}px, 0, 0)` }}
            className="flex gap-7 px-6 md:px-16 w-max items-center transition-transform duration-75 ease-out"
          >
            {items.map((item) => (
              <div key={item.id} className="w-[320px] sm:w-[400px] md:w-[440px] shrink-0">
                <InteractiveTiltCard
                  badgeNumber={item.badge}
                  className="bg-[#121216] border border-white/10 rounded-2xl p-6 flex flex-col justify-between h-[420px] relative overflow-hidden group"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-35 transition-opacity duration-500"
                    style={{ backgroundImage: `url(${item.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121216] via-[#121216]/80 to-transparent z-10" />

                  <div className="relative z-20 flex justify-between items-start">
                    <span className="px-2.5 py-1 bg-zinc-900 border border-white/10 text-[#c5a059] font-mono text-[10px] uppercase tracking-wider rounded font-bold">
                      {item.category}
                    </span>
                    <span className="text-2xl font-mono text-zinc-600">#{item.id}</span>
                  </div>

                  <div className="relative z-20 space-y-2 mt-auto">
                    <h3 className="text-xl font-normal text-white font-display leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-[#c5a059] font-devanagari text-base line-clamp-1">
                      {item.nepaliTitle}
                    </p>

                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                      {item.description}
                    </p>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                      <span>{item.location}</span>
                      <span className="text-emerald-400 font-bold">{item.era}</span>
                    </div>
                  </div>
                </InteractiveTiltCard>
              </div>
            ))}
          </div>
        </div>

        {/* Footer progress bar */}
        <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between text-xs text-zinc-500 z-20 shrink-0">
          <span className="font-mono text-[11px] text-zinc-400">
            SCROLL VERTICALLY TO PIN &amp; REVEAL EXHIBITS
          </span>

          <div className="flex items-center gap-3">
            <div className="w-40 h-1 bg-zinc-800 rounded-full overflow-hidden hidden sm:block">
              <div
                className="h-full bg-[#c5a059] transition-all duration-100"
                style={{ width: `${Math.max(5, scrollProgress * 100)}%` }}
              />
            </div>
            <span className="font-mono text-zinc-400">{Math.round(scrollProgress * 100)}%</span>
          </div>
        </div>

      </div>
    </div>
  );
}
