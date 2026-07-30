"use client";

import React, { useState, useEffect, useRef } from "react";
import { apiFetch, API_BASE_URL } from "@/lib/api";

interface AudioStory {
  id: string;
  catalogId: string;
  title: string;
  titleNepali: string;
  narrator: string;
  language: string;
  duration: string;
  location: string;
  description: string;
  audioUrl: string;
}

const FALLBACK_STORIES: AudioStory[] = [
  {
    id: "story-1",
    catalogId: "AUDIO-NE-01",
    title: "Rajamati - Traditional Newar Folk Ballad",
    titleNepali: "राजमति कुमति मूबहाःया राजमति",
    narrator: "Seturam Shrestha (1908 Gramophone Archive)",
    language: "Nepal Bhasa / Newari",
    duration: "0:05",
    location: "Kathmandu Valley",
    description: "Famous Newar folk song recounting the tragedy of Rajamati. Recorded initially in Kolkata in 1908.",
    audioUrl: `${API_BASE_URL}/static/audio/rajamati.wav`,
  },
  {
    id: "story-2",
    catalogId: "AUDIO-NE-02",
    title: "Silu - Gosaikunda Pilgrimage Ballad",
    titleNepali: "सिलु परम्परागत तीर्थ यात्रा गीत",
    narrator: "Newar Folk Archive",
    language: "Nepal Bhasa",
    duration: "0:05",
    location: "Gosaikunda Lake",
    description: "Seasonal ballad about a tragic couple's pilgrimage to sacred Gosaikunda Lake in the high Himalayas.",
    audioUrl: `${API_BASE_URL}/static/audio/silu.wav`,
  },
  {
    id: "story-3",
    catalogId: "AUDIO-NE-03",
    title: "Malshree Dhun - Royal Dashain Music",
    titleNepali: "मालश्री धुन र विजयदशमी संगीत",
    narrator: "Classical Newar Instrumentalist Collective",
    language: "Classical Music",
    duration: "0:05",
    location: "Kathmandu Durbar Square",
    description: "Sacred seasonal melody played on traditional instruments announcing the autumn Mohani/Dashain festival.",
    audioUrl: `${API_BASE_URL}/static/audio/malshree_dhun.wav`,
  },
];

export default function AudioStoryteller() {
  const [stories, setStories] = useState<AudioStory[]>(FALLBACK_STORIES);
  const [activeStory, setActiveStory] = useState<AudioStory>(FALLBACK_STORIES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fetch real sites with audio from database API
  useEffect(() => {
    const fetchAudioData = async () => {
      try {
        const data = await apiFetch("/heritage");
        const audioList: AudioStory[] = [];

        data.forEach((site: any) => {
          const audioMedia = site.media?.find((m: any) => m.media_type === "audio");
          if (audioMedia) {
            const rawUrl = audioMedia.media_url;
            const fullAudioUrl = rawUrl.startsWith("http") ? rawUrl : `${API_BASE_URL}${rawUrl}`;
            const primaryStory = site.stories?.[0];

            audioList.push({
              id: `site-${site.id}`,
              catalogId: `AUDIO-NE-${site.id}`,
              title: site.name,
              titleNepali: primaryStory?.title || site.name,
              narrator: primaryStory ? `Recorded Entry #${primaryStory.contributor_id}` : "Community Contributor",
              language: primaryStory?.language ? primaryStory.language.toUpperCase() : "Multilingual",
              duration: "0:05",
              location: `Lat ${site.latitude.toFixed(2)}, Lng ${site.longitude.toFixed(2)}`,
              description: primaryStory?.content || "Preserved oral heritage recording.",
              audioUrl: fullAudioUrl,
            });
          }
        });

        if (audioList.length > 0) {
          setStories(audioList);
          setActiveStory(audioList[0]);
        }
      } catch (err) {
        console.error("Failed to load real audio entries from database:", err);
      }
    };

    fetchAudioData();
  }, []);

  // Synchronize HTML5 Audio Element
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    audio.src = activeStory.audioUrl;
    setProgress(0);

    if (isPlaying) {
      audio.play().catch((e) => {
        console.warn("Audio playback interrupted or blocked:", e);
        setIsPlaying(false);
      });
    }

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [activeStory]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => {
          console.warn("Audio play blocked by browser:", e);
          setIsPlaying(false);
        });
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = clickX / rect.width;
    audioRef.current.currentTime = pct * audioRef.current.duration;
    setProgress(pct * 100);
  };

  // Canvas visualizer animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    let height = (canvas.height = 90);
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const barCount = 48;
      const barWidth = width / barCount - 2;
      const centerY = height / 2;

      phase += isPlaying ? 0.08 : 0.02;

      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + 2);
        const mult = isPlaying ? Math.sin(phase + i * 0.25) * 0.5 + 0.5 : 0.15;
        const noise = Math.sin(i * 0.5 + phase * 1.2) * 0.5 + 0.5;
        const barHeight = (mult * 30 + noise * 18 + 6) * (isPlaying ? 1 : 0.35);

        ctx.fillStyle = isPlaying ? "#c5a059" : "rgba(255, 255, 255, 0.2)";
        ctx.fillRect(x, centerY - barHeight / 2, barWidth, barHeight);
      }

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying]);

  return (
    <div className="w-full bg-[#121216] border border-white/10 rounded-2xl p-6 md:p-8 relative">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} preload="metadata" />

      {/* Header Tag */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-4 mb-6 gap-2">
        <div>
          <span className="text-[11px] font-mono tracking-widest text-[#c5a059] uppercase font-semibold">
            ORAL HERITAGE SOUND ARCHIVE • RECORDING {activeStory.catalogId}
          </span>
          <h3 className="text-2xl font-normal text-white font-display mt-0.5">
            Oral Folklore &amp; Audio Transcripts (Database Fed)
          </h3>
        </div>
        <span className="text-xs text-zinc-400 font-devanagari">
          परम्परागत श्रव्य संग्रह तथा मौखिक इतिहास
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Active Player Card */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="w-full bg-[#09090b] rounded-xl border border-white/10 p-5 flex flex-col justify-between relative">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-2">
              <span className="text-[#c5a059]">
                {activeStory.language} • {activeStory.location}
              </span>
              <span>{activeStory.duration}</span>
            </div>

            <canvas ref={canvasRef} className="w-full h-20 pointer-events-none" />

            <div
              onClick={handleSeek}
              className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden mt-3 cursor-pointer relative"
            >
              <div
                className="bg-[#c5a059] h-full transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 max-w-[calc(100%-60px)]">
              <h4 className="text-xl font-medium text-white font-display tracking-tight flex flex-wrap items-center gap-3">
                <span>{activeStory.title}</span>
              </h4>
              <p className="text-xs text-zinc-400 line-clamp-2">
                {activeStory.description}
              </p>
            </div>

            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-xl bg-[#c5a059] hover:bg-[#d4af37] text-black font-bold flex items-center justify-center text-lg transition-all shrink-0 shadow-lg shadow-[#c5a059]/20"
            >
              {isPlaying ? "⏸" : "▶"}
            </button>
          </div>
        </div>

        {/* Playlist selection */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <span className="text-xs font-mono tracking-widest text-zinc-400 uppercase">
            Database Audio Records ({stories.length}):
          </span>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {stories.map((story) => {
              const isSelected = story.id === activeStory.id;
              return (
                <div
                  key={story.id}
                  onClick={() => {
                    setActiveStory(story);
                    setIsPlaying(true);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "bg-zinc-900 border-[#c5a059]/50 text-white"
                      : "bg-[#09090b] border-white/5 text-zinc-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[#c5a059]">{story.catalogId}</span>
                    <div>
                      <h5 className="text-xs font-medium line-clamp-1">{story.title}</h5>
                      <p className="text-[10px] text-zinc-500 font-mono">{story.language}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-[#c5a059]">🎵 Listen</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
