"use client";

import React, { useState } from "react";

interface StoryItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  image: string;
  nepaliTitle: string;
  year: string;
  location: string;
}

const HERITAGE_STORIES: StoryItem[] = [
  {
    id: "1",
    title: "NIPPON KOKU UKIYO-E & PAUBHA",
    subtitle: "Sacred Scroll Art of Kathmandu Valley",
    category: "Traditional Fine Art",
    image: "/images/paubha_art.jpg",
    nepaliTitle: "पौभा चित्रकला र परम्परा",
    year: "14th Century",
    location: "Bhaktapur & Patan",
  },
  {
    id: "2",
    title: "BHAKTAPUR NYATAPOLA TEMPLE",
    subtitle: "Architectural Pinnacle of Five Roofs",
    category: "Monument & Shrine",
    image: "/images/nyatapola_temple.jpg",
    nepaliTitle: "न्यातपोल मन्दिर ५ तल्ला",
    year: "1702 AD",
    location: "Bhaktapur Durbar Square",
  },
  {
    id: "3",
    title: "KUMARI CHOWK & LIVING GODDESS",
    subtitle: "Century-Old Wooden Peacock Carvings",
    category: "Cultural Tradition",
    image: "/images/kumari_house.jpg",
    nepaliTitle: "जीवित देवी कुमारी र काष्ठकला",
    year: "Licchavi Era",
    location: "Kathmandu Durbar Square",
  },
  {
    id: "4",
    title: "INDRA JATRA & MASKED DANCE",
    subtitle: "Charya Nritya & Lakhey Mysticism",
    category: "Intangible Heritage",
    image: "/images/indra_jatra.jpg",
    nepaliTitle: "इन्द्र जात्रा र लाखे नृत्य",
    year: "Annual Festival",
    location: "Kathmandu Valley",
  },
];

export default function EditorialSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<StoryItem | null>(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % HERITAGE_STORIES.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + HERITAGE_STORIES.length) % HERITAGE_STORIES.length);
  };

  const active = HERITAGE_STORIES[currentIndex];

  return (
    <div className="w-full relative py-8 my-8">
      {/* Slider Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 pb-4 border-b border-zinc-800">
        <div>
          <span className="text-red-500 font-extrabold text-xs tracking-widest uppercase font-saroj">
            FEATURED ARCHIVE SLIDER
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight font-saroj-wide mt-1">
            DIGITAL HERITAGE DISCOVERY
          </h2>
        </div>
        
        {/* Number Counter & Controls (Matching 2/120 in reference image) */}
        <div className="flex items-center gap-6 mt-4 md:mt-0">
          <div className="flex items-center gap-2 font-mono text-sm tracking-widest text-zinc-400">
            <span className="h-0.5 w-6 bg-red-600 inline-block" />
            <span className="text-red-500 font-bold">0{currentIndex + 1}</span>
            <span>/</span>
            <span>0{HERITAGE_STORIES.length}</span>
            <span className="h-0.5 w-12 bg-zinc-700 inline-block" />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              aria-label="Previous Slide"
              className="w-10 h-10 rounded-full border border-white/20 hover:border-red-500 flex items-center justify-center text-white hover:bg-red-600/20 transition-all"
            >
              ←
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next Slide"
              className="w-10 h-10 rounded-full border border-white/20 hover:border-red-500 flex items-center justify-center text-white hover:bg-red-600/20 transition-all"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Main Active Slide Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#111116] border border-white/10 rounded-none overflow-hidden p-6 md:p-8">
        
        {/* Left Info Column */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              {active.category}
            </div>

            <h3 className="text-2xl md:text-4xl font-extrabold text-white uppercase font-saroj-wide tracking-tight leading-none">
              {active.title}
            </h3>

            <p className="text-amber-400 font-amita text-lg font-bold">
              {active.nepaliTitle}
            </p>

            <p className="text-zinc-400 text-sm leading-relaxed">
              {active.subtitle}. Documented in the national digital repository with historical records, geographic tags, and audio narrative.
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
            <div className="text-xs text-zinc-500">
              <p className="font-semibold text-zinc-300">{active.location}</p>
              <p>{active.year}</p>
            </div>

            <button
              onClick={() => setSelectedItem(active)}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition-all flex items-center gap-2"
            >
              <span>EXPLORE STORY</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* Right Photo Column */}
        <div className="lg:col-span-7 relative h-72 md:h-96 w-full bg-zinc-900 overflow-hidden group border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
          
          {/* Badge Overlay */}
          <div className="absolute top-4 left-4 z-20 red-stamp-circle w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-xs shadow-xl">
            अभिलेख
          </div>

          {/* Placeholder Image / Hero Visual */}
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 via-stone-900 to-black text-center p-6">
            <div className="space-y-2 z-20">
              <span className="text-6xl">🏛️</span>
              <p className="text-white font-black text-xl font-saroj uppercase tracking-wider">{active.title}</p>
              <p className="text-red-400 font-amita text-sm">{active.nepaliTitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Story Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#111116] border border-red-600 max-w-xl w-full p-6 md:p-8 space-y-4 relative">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white font-bold text-xl"
            >
              ✕
            </button>

            <span className="text-red-500 font-bold text-xs tracking-widest uppercase">{selectedItem.category}</span>
            <h3 className="text-2xl font-black text-white font-saroj-wide uppercase">{selectedItem.title}</h3>
            <p className="text-amber-400 font-amita text-lg">{selectedItem.nepaliTitle}</p>
            
            <p className="text-zinc-300 text-sm leading-relaxed">
              This cultural heritage archive entry details the historical significance, oral stories, architecture, and preservation state of {selectedItem.title} ({selectedItem.location}).
            </p>

            <div className="pt-4 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-6 py-2 bg-red-600 text-white font-bold text-xs uppercase"
              >
                Close Archive View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
