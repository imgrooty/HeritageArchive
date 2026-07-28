"use client";

import React, { useState } from "react";

export default function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState("en");

  const languages = [
    { code: "en", label: "English" },
    { code: "ne", label: "नेपाली" },
    { code: "mai", label: "मैथिली" },
    { code: "bho", label: "भोजपुरी" },
  ];

  return (
    <div className="relative inline-block text-left">
      <select
        value={currentLang}
        onChange={(e) => setCurrentLang(e.target.value)}
        className="bg-slate-900 border border-slate-700 text-amber-300 text-xs font-semibold px-3 py-1.5 rounded-lg focus:outline-none focus:border-amber-500 cursor-pointer"
      >
        {languages.map((l) => (
          <option key={l.code} value={l.code} className="bg-slate-900 text-slate-200">
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}
