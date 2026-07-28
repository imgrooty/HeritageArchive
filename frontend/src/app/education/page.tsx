"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import LanguageSelector from "@/components/LanguageSelector";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  answer: number; // Index of correct option
  explanation: string;
}

export default function EducationPortal() {
  const router = useRouter();

  // Quiz State
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Glossary Search state
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
      term: "Biska Jatra",
      category: "Festival 🌊",
      definition: "A multi-day chariot pulling festival in Bhaktapur marking the Bikram Sambat solar New Year. The festival culminates in erecting a massive wooden pole (Lyo Dhyo) representing victory over evil."
    },
    {
      term: "Bibaha Panchami",
      category: "Festival 🌊",
      definition: "A grand festival celebrated in Janakpur commemorating the mythological wedding of Lord Rama and Goddess Sita. Thousands of pilgrims visit the Janaki Temple to watch the wedding reenactment."
    },
    {
      term: "Oral Narratives (Gathu)",
      category: "Tradition 🗣️",
      definition: "Oral storytelling traditions and song rituals kept alive by village elders. Used to pass down historical events, spiritual beliefs, and lineage records through generations without formal written scripts."
    },
    {
      term: "Ganga Sagar",
      category: "Natural 🌳",
      definition: "A sacred lake located in Janakpur. Mentioned in ancient scriptures, it is a key site for religious ablutions, evening Ganga Aarti rituals, and community gatherings during Chhath Puja."
    }
  ];

  const handleOptionSelect = (index: number) => {
    if (isChecked) return;
    setSelectedOption(index);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null || isChecked) return;
    setIsChecked(true);
    if (selectedOption === quizQuestions[currentQuestion].answer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsChecked(false);
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setIsChecked(false);
    setScore(0);
    setQuizFinished(false);
  };

  const getRank = () => {
    if (score === 5) return { title: "Preservation Scholar 🎓", class: "text-amber-400 bg-amber-500/10 border-amber-500/25" };
    if (score >= 3) return { title: "Cultural Explorer 🗺️", class: "text-sky-400 bg-sky-500/10 border-sky-500/25" };
    return { title: "Heritage Novice 📜", class: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20" };
  };

  const filteredGlossary = glossaryItems.filter(
    (item) =>
      item.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      item.definition.toLowerCase().includes(glossarySearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#07070a] text-white flex flex-col selection:bg-[#fb923c] selection:text-black">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#07070a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
            <span className="text-xl">🛕</span>
            <span className="font-black text-sm tracking-widest bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent uppercase">
              HERITAGE ARCHIVE
            </span>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden sm:flex items-center gap-6 text-xs font-bold text-zinc-400 uppercase tracking-wider">
              <button onClick={() => router.push("/discover")} className="hover:text-white transition-colors">
                Discover Map
              </button>
              <button onClick={() => router.push("/education")} className="text-white">
                Education Portal
              </button>
              <button onClick={() => router.push("/contribute")} className="hover:text-white transition-colors">
                Contribute
              </button>
            </nav>
            <LanguageSelector />
            <a
              href="/auth/login"
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-xs font-bold text-black shadow-lg hover:shadow-orange-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Sign In
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column - Heritage Quiz */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-wider">Interactive Learning</span>
            <h2 className="text-3xl font-black">Heritage Knowledge Quiz</h2>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
              Test your understanding of Nepalese local heritage sites, oral traditions, and community verification protocols.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-white/5 bg-[#0a0a0e] shadow-xl flex flex-col gap-6">
            {!quizFinished ? (
              <>
                {/* Quiz Header Info */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Question {currentQuestion + 1} of {quizQuestions.length}
                  </span>
                  <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Score: {score}
                  </span>
                </div>

                {/* Question */}
                <h3 className="text-base font-extrabold text-white leading-relaxed">
                  {quizQuestions[currentQuestion].question}
                </h3>

                {/* Options List */}
                <div className="flex flex-col gap-3">
                  {quizQuestions[currentQuestion].options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === quizQuestions[currentQuestion].answer;
                    
                    let btnStyle = "border-white/5 bg-white/[0.02] text-zinc-300 hover:border-white/10 hover:bg-white/[0.04]";
                    if (isSelected) {
                      btnStyle = "border-amber-500/40 bg-amber-500/5 text-amber-400";
                    }
                    if (isChecked) {
                      if (isCorrect) {
                        btnStyle = "border-emerald-500/40 bg-emerald-500/5 text-emerald-400";
                      } else if (isSelected) {
                        btnStyle = "border-rose-500/40 bg-rose-500/5 text-rose-400";
                      } else {
                        btnStyle = "opacity-40 border-white/5 bg-white/[0.01] text-zinc-500";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionSelect(idx)}
                        disabled={isChecked}
                        className={`w-full text-left p-4 rounded-xl border text-xs font-semibold leading-relaxed transition-all flex items-center justify-between gap-4 ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {isChecked && isCorrect && <span className="text-emerald-400 text-sm">✓</span>}
                        {isChecked && isSelected && !isCorrect && <span className="text-rose-400 text-sm">✗</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Card */}
                {isChecked && (
                  <div className="p-4 rounded-2xl border border-white/5 bg-[#0b0b0f] text-[11px] leading-relaxed text-zinc-400 animate-fade-in flex flex-col gap-1">
                    <span className="font-extrabold text-white uppercase tracking-wider text-[9px] text-amber-500">
                      💡 Knowledge Detail
                    </span>
                    <p>{quizQuestions[currentQuestion].explanation}</p>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="flex justify-end gap-3 mt-2">
                  {!isChecked ? (
                    <button
                      onClick={handleCheckAnswer}
                      disabled={selectedOption === null}
                      className="px-6 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all"
                    >
                      Check Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:scale-95 transition-all"
                    >
                      {currentQuestion === quizQuestions.length - 1 ? "Finish Quiz" : "Next Question →"}
                    </button>
                  )}
                </div>
              </>
            ) : (
              // Quiz Finished Screen
              <div className="py-8 flex flex-col items-center justify-center text-center gap-5">
                <span className="text-4xl animate-bounce">🏆</span>
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-black text-white">Quiz Completed!</h3>
                  <p className="text-xs text-zinc-500">You scored {score} out of {quizQuestions.length} correct answers.</p>
                </div>

                {/* Performance Title Badge */}
                <div className={`px-4 py-2 rounded-2xl border text-xs font-black uppercase tracking-widest ${getRank().class}`}>
                  {getRank().title}
                </div>

                <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                  {score === 5 
                    ? "Exceptional! You possess outstanding understanding of the archive's cultural assets."
                    : "Great job! Explore the glossary on the right to deepen your cultural preservation knowledge."}
                </p>

                <button
                  onClick={handleRestartQuiz}
                  className="px-6 py-3 rounded-xl bg-amber-500 text-black font-bold text-xs hover:scale-95 transition-all mt-2"
                >
                  Restart Quiz
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Cultural Glossary */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">Glossary Database</span>
            <h2 className="text-2xl font-black">Cultural Terms</h2>
            
            {/* Filter Search Input */}
            <div className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 focus-within:border-amber-500/50 transition-all mt-2">
              <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                id="glossary-search-input"
                name="glossarySearch"
                type="text"
                placeholder="Search cultural terms or descriptions..."
                value={glossarySearch}
                onChange={(e) => setGlossarySearch(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-xs text-white placeholder-zinc-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[550px] pr-1 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
            {filteredGlossary.length === 0 ? (
              <div className="text-center py-20 text-zinc-500 border border-dashed border-white/5 rounded-2xl">
                <p className="text-xs font-semibold">No glossary terms found matching query.</p>
              </div>
            ) : (
              filteredGlossary.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-white/5 bg-[#0a0a0e]/50 hover:bg-[#0f0f15]/75 hover:border-white/10 transition-all flex flex-col gap-2">
                  <div className="flex justify-between items-start gap-3">
                    <h4 className="text-xs font-extrabold text-white">{item.term}</h4>
                    <span className="text-[9px] font-black text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    {item.definition}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
