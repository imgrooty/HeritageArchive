"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import LanguageSelector from "@/components/LanguageSelector";
import InteractiveTiltCard from "@/components/InteractiveTiltCard";
import ScrollReveal from "@/components/ScrollReveal";
import CustomCursor from "@/components/CustomCursor";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export default function EducationPortal() {
  const router = useRouter();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [glossarySearch, setGlossarySearch] = useState("");

  const quizQuestions: QuizQuestion[] = [
    {
      id: 1,
      question: "Which Nepalese king built the famous five-story Nyatapola Temple in Bhaktapur in 1702?",
      options: [
        "King Pratap Malla",
        "King Bhupatindra Malla",
        "King Jayasthiti Malla",
        "King Yaksha Malla"
      ],
      answer: 1,
      explanation: "King Bhupatindra Malla commissioned the construction of Nyatapola Temple in 1702. It stands as a masterpiece of Newari architecture and survived both the 1934 and 2015 earthquakes."
    },
    {
      id: 2,
      question: "Janakpur is historically renowned as the center of which ancient kingdom?",
      options: [
        "Lichhavi Kingdom",
        "Khasa Kingdom",
        "Mithila Kingdom",
        "Shakya Kingdom"
      ],
      answer: 2,
      explanation: "Janakpur is historically identified as Janakpurdham, the capital of the ancient Mithila Kingdom, famed as the birthplace of Goddess Sita."
    },
    {
      id: 3,
      question: "Which artistic practice is characterized by vibrant natural colors, geometric line work, and depictions of mythological events?",
      options: [
        "Paubha Painting",
        "Thanka Art",
        "Mithila Painting",
        "Charya Dance Masks"
      ],
      answer: 2,
      explanation: "Mithila Painting (or Madhubani Art) is practiced by women of the Mithila region, representing sacred rituals, nature, and folklore in rich geometric patterns."
    },
    {
      id: 4,
      question: "What major festival in Bhaktapur marks the Nepalese solar New Year and features the pulling of large wooden chariots?",
      options: [
        "Biska Jatra",
        "Indra Jatra",
        "Rato Machindranath Jatra",
        "Yomari Punhi"
      ],
      answer: 0,
      explanation: "Biska Jatra (Bisket Jatra) is a grand festival celebrated in Bhaktapur to ring in the Nepalese solar New Year, famous for its giant chariot tug-of-war."
    },
    {
      id: 5,
      question: "In the Cultural Heritage Archive, what is the primary role of a Community Verifier?",
      options: [
        "Writing translations using automated models",
        "Reviewing submissions to vote support or dispute coordinate accuracy & context",
        "Deleting historical media attachments",
        "Running vector database scripts"
      ],
      answer: 1,
      explanation: "Community Verifiers review submitted heritage sites, voting to support or dispute details. This ensures accuracy and community verification of local oral traditions."
    }
  ];

  const glossaryItems = [
    {
      term: "Mithila Art (Madhubani)",
      category: "Tradition 🎨",
      definition: "A traditional painting style practiced primarily by women of the Mithila region. Traditionally painted on mud walls using fingers, twigs, and natural pigments, it depicts weddings, flora, fauna, and Hindu mythology."
    },
    {
      term: "Newar Woodcarving",
      category: "Architecture 🧱",
      definition: "The intricate woodworking craft developed by the Newar community of Kathmandu Valley. Characterized by detailed lattice work, mythological carvings on struts, and decorated doors/windows seen in Durbar Squares."
    },
    {
      term: "Paubha Scroll Painting",
      category: "Fine Art 📜",
      definition: "A traditional religious painting made by Newar artists in Nepal depicting deities, mandalas, or monuments. Painted on cloth using natural mineral colors and pure gold."
    },
    {
      term: "Charya Nritya (Sacred Dance)",
      category: "Performing Arts 💃",
      definition: "An ancient Vajrayana Buddhist dance tradition practiced in Kathmandu Valley. Dancers wear deity masks and silver jewelry while performing ritual hand mudras."
    },
    {
      term: "Torana Archways",
      category: "Architectural Shrine ⛩️",
      definition: "Intricately sculpted semicircular wooden or metal tympanums placed over shrine doorways, depicting Garuda, Chepu, Nagas, and deity figures."
    }
  ];

  const handleOptionSelect = (index: number) => {
    if (!isChecked) {
      setSelectedOption(index);
    }
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null) return;
    setIsChecked(true);
    if (selectedOption === quizQuestions[currentQuestion].answer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setIsChecked(false);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setIsChecked(false);
    setScore(0);
    setQuizFinished(false);
  };

  const filteredGlossary = glossaryItems.filter(
    (item) =>
      item.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      item.definition.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      item.category.toLowerCase().includes(glossarySearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f7] archive-grid-bg flex flex-col relative overflow-x-hidden">
      
      <CustomCursor />

      {/* Institutional Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#09090b]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
            <div className="w-9 h-9 rounded-full bg-[#c5a059] flex items-center justify-center font-bold text-black text-sm font-devanagari">
              ने
            </div>
            <div className="flex flex-col">
              <span className="font-display font-medium text-lg tracking-tight text-white uppercase">
                RESEARCH <span className="text-[#c5a059]">PORTAL</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-devanagari tracking-wider -mt-1">
                सांस्कृतिक तथा शैक्षिक स्रोत
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-mono tracking-widest text-zinc-300 uppercase">
            <a href="/" className="hover:text-[#c5a059] transition-colors">Index</a>
            <a href="/discover" className="hover:text-[#c5a059] transition-colors">Catalogue</a>
            <span className="text-[#c5a059]">Research</span>
            <a href="/contribute" className="hover:text-[#c5a059] transition-colors">Contribute</a>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSelector />
            <button
              onClick={() => router.push("/discover")}
              className="px-4 py-2 bg-[#c5a059] hover:bg-[#d4af37] text-black font-mono font-semibold text-xs uppercase tracking-wider rounded-lg transition-all"
            >
              Explore Map
            </button>
          </div>
        </div>
      </header>

      {/* Main Educational Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-12 z-20 relative">
        
        {/* Banner Section */}
        <ScrollReveal direction="up">
          <div className="bg-[#121216] border border-white/10 rounded-2xl p-8 space-y-4">
            <span className="text-[11px] font-mono tracking-widest text-[#c5a059] uppercase font-semibold">
              EDUCATIONAL KNOWLEDGE HUB • DEPT OF HERITAGE RESEARCH
            </span>
            <h1 className="text-3xl md:text-5xl font-normal text-white font-display">
              Heritage Knowledge &amp; Educational Resources
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl leading-relaxed">
              Explore curated academic entries on traditional Nepalese architecture, indigenous fine arts, intangible performing traditions, and historical site literature.
            </p>
          </div>
        </ScrollReveal>

        {/* Section 1: Cultural Glossary */}
        <ScrollReveal direction="up">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-[11px] font-mono text-[#c5a059] uppercase tracking-wider font-semibold">
                  ARCHIVAL GLOSSARY &amp; CONTEXT INDEX
                </span>
                <h2 className="text-2xl font-normal text-white font-display mt-0.5">
                  Cultural Terminology Dictionary
                </h2>
              </div>

              {/* Glossary Search Input */}
              <div className="w-full sm:w-80 flex items-center gap-2 px-3.5 py-2 bg-[#09090b] border border-white/10 focus-within:border-[#c5a059] transition-all rounded-xl">
                <span className="text-zinc-500 font-mono text-xs">🔍</span>
                <input
                  type="text"
                  placeholder="Search glossary terms..."
                  value={glossarySearch}
                  onChange={(e) => setGlossarySearch(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-xs text-white placeholder-zinc-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGlossary.map((item, idx) => (
                <InteractiveTiltCard key={idx} badgeNumber={`GLOSS-${idx + 1}`} className="archive-card p-6 rounded-2xl flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[10px] text-[#c5a059] font-mono uppercase tracking-wider">
                      {item.category}
                    </span>
                    <h3 className="text-lg font-medium text-white font-display">
                      {item.term}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed font-body">
                      {item.definition}
                    </p>
                  </div>
                </InteractiveTiltCard>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Section 2: Heritage Assessment Quiz */}
        <ScrollReveal direction="up">
          <div className="bg-[#121216] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
            <div className="border-b border-white/10 pb-4">
              <span className="text-[11px] font-mono text-[#c5a059] uppercase tracking-wider font-semibold">
                KNOWLEDGE EVALUATION • QUIZ MODULE
              </span>
              <h2 className="text-2xl font-normal text-white font-display mt-0.5">
                Heritage Verification Assessment
              </h2>
            </div>

            {!quizFinished ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
                  <span className="text-[#c5a059]">Score: {score}</span>
                </div>

                <h3 className="text-lg font-medium text-white font-display">
                  {quizQuestions[currentQuestion].question}
                </h3>

                <div className="space-y-3">
                  {quizQuestions[currentQuestion].options.map((option, idx) => {
                    let btnClass = "bg-[#09090b] border-white/10 text-zinc-300 hover:border-white/20";
                    if (selectedOption === idx) {
                      btnClass = "bg-[#c5a059]/10 border-[#c5a059] text-white";
                    }
                    if (isChecked) {
                      if (idx === quizQuestions[currentQuestion].answer) {
                        btnClass = "bg-emerald-950/60 border-emerald-500 text-emerald-300";
                      } else if (selectedOption === idx) {
                        btnClass = "bg-red-950/60 border-red-500 text-red-300";
                      }
                    }

                    return (
                      <div
                        key={idx}
                        onClick={() => handleOptionSelect(idx)}
                        className={`p-4 rounded-xl border text-xs font-mono transition-all cursor-pointer flex items-center justify-between ${btnClass}`}
                      >
                        <span>{option}</span>
                        {isChecked && idx === quizQuestions[currentQuestion].answer && <span>✓ Correct</span>}
                      </div>
                    );
                  })}
                </div>

                {isChecked && (
                  <div className="p-4 rounded-xl bg-[#09090b] border border-white/10 text-xs text-zinc-300 space-y-1 font-body">
                    <span className="font-mono text-[#c5a059] uppercase text-[10px]">Explanation:</span>
                    <p>{quizQuestions[currentQuestion].explanation}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  {!isChecked ? (
                    <button
                      onClick={handleCheckAnswer}
                      disabled={selectedOption === null}
                      className="px-5 py-2.5 bg-[#c5a059] disabled:opacity-40 hover:bg-[#d4af37] text-black font-mono font-semibold text-xs uppercase tracking-wider rounded-lg transition-all"
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-5 py-2.5 bg-[#c5a059] hover:bg-[#d4af37] text-black font-mono font-semibold text-xs uppercase tracking-wider rounded-lg transition-all"
                    >
                      {currentQuestion < quizQuestions.length - 1 ? "Next Question →" : "Finish Quiz"}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 space-y-4">
                <span className="text-4xl">🎓</span>
                <h3 className="text-2xl font-normal text-white font-display">Assessment Complete!</h3>
                <p className="text-sm text-zinc-400 font-mono">
                  Final Score: <span className="text-[#c5a059] font-bold">{score} / {quizQuestions.length}</span>
                </p>
                <button
                  onClick={resetQuiz}
                  className="px-6 py-2.5 bg-[#c5a059] hover:bg-[#d4af37] text-black font-mono font-semibold text-xs uppercase tracking-wider rounded-lg transition-all"
                >
                  Retake Evaluation
                </button>
              </div>
            )}
          </div>
        </ScrollReveal>

      </main>

    </div>
  );
}
