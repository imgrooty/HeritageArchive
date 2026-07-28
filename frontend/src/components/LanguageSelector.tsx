"use client";

import React, { useState, useEffect, useRef } from "react";

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🌐" },
  { code: "ne", name: "Nepali", nativeName: "नेपाली", flag: "🇳🇵" },
  { code: "mai", name: "Maithili", nativeName: "मैथिली", flag: "🪷" },
  { code: "bho", name: "Bhojpuri", nativeName: "भोजपुरी", flag: "🏺" },
];

interface LanguageSelectorProps {
  onLanguageChange?: (langCode: string) => void;
}

export default function LanguageSelector({ onLanguageChange }: LanguageSelectorProps) {
  const [selectedCode, setSelectedCode] = useState<string>("en");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("preferred_language");
      if (saved && LANGUAGES.some((l) => l.code === saved)) {
        setSelectedCode(saved);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (code: string) => {
    setSelectedCode(code);
    setIsOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("preferred_language", code);
      window.dispatchEvent(new CustomEvent("languageChanged", { detail: code }));
    }
    if (onLanguageChange) {
      onLanguageChange(code);
    }
  };

  const selectedLang = LANGUAGES.find((l) => l.code === selectedCode) || LANGUAGES[0];

  return (
    <div className="relative z-50" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
      >
        <span>{selectedLang.flag}</span>
        <span>{selectedLang.name}</span>
        <svg
          className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl bg-[#0e0e13] border border-white/10 shadow-2xl z-50 overflow-hidden py-1">
          <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5">
            Select Archive Language
          </div>
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === selectedCode;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang.code)}
                className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-amber-500/10 text-amber-400 font-bold"
                    : "text-zinc-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.name} ({lang.nativeName})</span>
                </span>
                {isSelected && <span className="text-amber-400 text-xs">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
