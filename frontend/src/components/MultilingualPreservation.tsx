"use client";

import React, { useState } from "react";

interface LanguageOption {
  code: "nepali" | "maithili" | "english" | "bhojpuri";
  name: string;
  nativeName: string;
  title: string;
  content: string;
  verifier: string;
}

const SAMPLE_HERITAGE: Record<string, LanguageOption> = {
  nepali: {
    code: "nepali",
    name: "Nepali",
    nativeName: "नेपाली (देवनागरी)",
    title: "काठमाडौँ उपत्यकाको मछिन्द्रनाथ रथात्रा परम्परा",
    content:
      "रातो मछिन्द्रनाथको जात्रा नेपालकै सबैभन्दा लामो र ऐतिहासिक जात्रा मानिन्छ। यस जात्रामा काठको ठूलो रथ निर्माण गरी ललितपुरका विभिन्न टोलहरूमा घुमाइन्छ। वर्षा र सहकालका देवता मछिन्द्रनाथको पूजा गरी समुदायले सांस्कृतिक एकता कायम राख्छन्।",
    verifier: "Verified by Guthi Sansthan Nepal (गुठी संस्थान)",
  },
  maithili: {
    code: "maithili",
    name: "Maithili",
    nativeName: "मैथिली",
    title: "जनकपुरक प्रसिद्ध रामजानकी मन्दिर आ मिथिला परम्परा",
    content:
      "मिथिला चित्रकला आ संस्कृति सम्पूर्ण नेपाल तथा भारतमे प्रसिद्ध अछि। जानकी मन्दिर जनकपुरक पहिचान अछि, जतय विवाह पञ्चमीमे बडका मेला लागैत अछि। ओरिजनल ऐतिहासिक धरोहर आ लोक कथा सभके संरक्षण करब आवश्यक अछि।",
    verifier: "Verified by Mithila Heritage Preservation Council",
  },
  bhojpuri: {
    code: "bhojpuri",
    name: "Bhojpuri",
    nativeName: "भोजपुरी",
    title: "तराई क्षेत्र के प्राचीन गढ़ी आ सांस्कृतिक परम्परा",
    content:
      "भोजपुरी भाषा आ संस्कृति नेपाल के तराई भूभाग में सदियों से प्रसिद्ध बा। स्थानीय लोकगीत, सोहर, आ छठ पर्व के अवसर पर ऐतिहासिक धरोहर के विशेष महत्व देहल जाला।",
    verifier: "Verified by Terai Cultural Archive Society",
  },
  english: {
    code: "english",
    name: "English",
    nativeName: "English Translation",
    title: "Rato Machhindranath Chariot Procession of Kathmandu Valley",
    content:
      "The procession of Rato Machhindranath is considered the longest and most revered historical festival in Nepal. A towering wooden chariot is constructed and pulled through traditional courtyards of Lalitpur to invoke rain and prosperity.",
    verifier: "Verified by UNESCO Regional Preservation Office",
  },
};

export default function MultilingualPreservation() {
  const [activeLang, setActiveLang] = useState<"nepali" | "maithili" | "english" | "bhojpuri">("nepali");

  const current = SAMPLE_HERITAGE[activeLang];

  return (
    <div className="w-full bg-[#121216] border border-white/10 rounded-2xl p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-5 mb-6 gap-4">
        <div>
          <span className="text-[11px] font-mono tracking-widest text-[#c5a059] uppercase font-semibold">
            MULTILINGUAL MANUSCRIPT ARCHIVE • SYSTEM CAT-NLP 4.0
          </span>
          <h3 className="text-2xl font-normal text-white font-display mt-0.5">
            Original Text Preservation &amp; Parallel Translations
          </h3>
        </div>

        {/* Language Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#09090b] border border-white/10">
          {(["nepali", "maithili", "bhojpuri", "english"] as const).map((langKey) => {
            const isSelected = activeLang === langKey;
            const langObj = SAMPLE_HERITAGE[langKey];
            return (
              <button
                key={langKey}
                onClick={() => setActiveLang(langKey)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                  isSelected ? "bg-[#c5a059] text-black font-semibold" : "text-zinc-400 hover:text-white"
                }`}
              >
                {langObj.nativeName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Side by Side Comparison Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source Original Community Manuscript */}
        <div className="p-6 rounded-xl bg-[#09090b] border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-3 border-b border-white/5 pb-2">
              <span>MANUSCRIPT SOURCE: ORIGINAL COMMUNITY ENTRY</span>
              <span className="text-[#c5a059]">NEPALI UNICODE (नेपाली)</span>
            </div>
            <h4 className="text-lg font-medium text-white font-devanagari mb-2">
              {SAMPLE_HERITAGE.nepali.title}
            </h4>
            <p className="text-zinc-300 text-sm leading-relaxed font-devanagari">
              {SAMPLE_HERITAGE.nepali.content}
            </p>
          </div>
          <div className="mt-6 pt-3 border-t border-white/5 text-[11px] text-zinc-500 font-mono">
            Contributor: Guthi Sansthan Nepal Archives
          </div>
        </div>

        {/* Selected Target Translation */}
        <div className="p-6 rounded-xl bg-[#09090b] border border-[#c5a059]/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-3 border-b border-white/5 pb-2">
              <span>TARGET TRANSLATION RECORD</span>
              <span className="text-[#c5a059]">{current.name.toUpperCase()} SCRIPT</span>
            </div>
            <h4 className="text-lg font-medium text-white font-display mb-2">
              {current.title}
            </h4>
            <p className="text-zinc-300 text-sm leading-relaxed font-devanagari">
              {current.content}
            </p>
          </div>
          <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-emerald-400">
            <span>✓ {current.verifier}</span>
            <span className="text-zinc-500">Version 2.4</span>
          </div>
        </div>
      </div>
    </div>
  );
}
