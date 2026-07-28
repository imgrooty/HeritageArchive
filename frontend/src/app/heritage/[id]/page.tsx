"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch, uploadMedia, API_BASE_URL } from "@/lib/api";

interface Story {
  id: number;
  language: string;
  title: string;
  content: string;
  contributor_id: number;
  created_at: string;
  is_translation: boolean;
  translation_method: string;
  translation_status: string;
  original_story_id?: number | null;
}

interface Media {
  id: number;
  media_url: string;
  media_type: string;
  contributor_id: number;
}

interface HeritageSite {
  id: number;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  status: string;
  creator_id: number;
  created_at: string;
  updated_at: string;
  stories: Story[];
  media: Media[];
}

interface Comment {
  id: number;
  site_id: number;
  user_id: number;
  content: string;
  created_at: string;
  user: {
    id: number;
    username: string;
    role: string;
  };
}

interface Revision {
  id: number;
  site_id: number;
  user_id: number;
  change_summary: string;
  details: any;
  created_at: string;
  user: {
    username: string;
  };
}

interface PanoramaViewerProps {
  imageUrl: string;
  onClose: () => void;
}

function PanoramaViewer({ imageUrl, onClose }: PanoramaViewerProps) {
  const [bgPosX, setBgPosX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = React.useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startX.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - startX.current;
    setBgPosX((prev) => prev + dx * 1.5); // sensitivity factor
    startX.current = e.clientX;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - startX.current;
    setBgPosX((prev) => prev + dx * 1.5);
    startX.current = e.touches[0].clientX;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md px-6">
      <div className="w-full max-w-4xl p-6 rounded-3xl border border-white/10 bg-[#0e0e13] flex flex-col gap-4 shadow-2xl relative select-none">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🌐</span> Interactive 360° Panorama Viewer
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">Drag horizontally with mouse or swipe touch to rotate viewport.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Viewport Cylinder */}
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUpOrLeave}
          className="relative w-full h-[400px] rounded-2xl border border-white/5 overflow-hidden cursor-grab active:cursor-grabbing"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundPosition: `${bgPosX}px center`,
            backgroundSize: "cover",
            backgroundRepeat: "repeat-x",
            transition: isDragging ? "none" : "background-position 0.1s ease-out"
          }}
        >
          {/* Compass Indicators Overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-6 px-4 py-2 rounded-full border border-white/10 bg-black/60 text-[10px] font-black text-zinc-400 tracking-widest">
            <span>WEST</span>
            <span className="text-amber-500">NORTH</span>
            <span>EAST</span>
            <span>SOUTH</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function decodeToken(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export default function HeritageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [site, setSite] = useState<HeritageSite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<{ id: number; role: string } | null>(null);
  const [selectedLang, setSelectedLang] = useState("en");

  // Community States
  const [likesInfo, setLikesInfo] = useState({ likes_count: 0, has_liked: false });
  const [verifyStats, setVerifyStats] = useState({ supports_count: 0, disputes_count: 0, user_vote: null as string | null });
  const [comments, setComments] = useState<Comment[]>([]);
  const [revisions, setRevisions] = useState<Revision[]>([]);

  // Media Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Forms and Modals
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyResult, setVerifyResult] = useState("supports");
  const [verifyComment, setVerifyComment] = useState("");
  const [submittingVerify, setSubmittingVerify] = useState(false);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("Incorrect Details");
  const [reportDesc, setReportDesc] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Correction and Translation States
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionTitle, setCorrectionTitle] = useState("");
  const [correctionContent, setCorrectionContent] = useState("");
  const [submittingCorrection, setSubmittingCorrection] = useState(false);

  // AI & Discovery States
  const [relatedSites, setRelatedSites] = useState<{ site: HeritageSite; similarity: number }[]>([]);
  const [subgraph, setSubgraph] = useState<{ nodes: any[]; edges: any[] }>({ nodes: [], edges: [] });
  const [showQRModal, setShowQRModal] = useState(false);
  const [active360Url, setActive360Url] = useState<string | null>(null);

  const languages = [
    { code: "ne", label: "नेपाली (Nepali)" },
    { code: "mai", label: "मैथिली (Maithili)" },
    { code: "bho", label: "भोजपुरी (Bhojpuri)" },
    { code: "en", label: "English" },
  ];

  // Decode JWT on load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = decodeToken(token);
        if (decoded) {
          setCurrentUser({ id: parseInt(decoded.sub), role: decoded.role });
        }
      }
    }
  }, []);

  const fetchSiteDetails = async () => {
    if (!id) return;
    try {
      const data = await apiFetch(`/heritage/${id}`);
      setSite(data);
      if (data.stories.length > 0) {
        const hasSelected = data.stories.some((s: Story) => s.language === selectedLang);
        if (!hasSelected) {
          setSelectedLang(data.stories[0].language);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to retrieve heritage details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunityData = async () => {
    if (!id) return;
    try {
      const [likes, verif, comms, revs] = await Promise.all([
        apiFetch(`/heritage/${id}/likes`),
        apiFetch(`/heritage/${id}/verify/stats`),
        apiFetch(`/heritage/${id}/comments`),
        apiFetch(`/heritage/${id}/revisions`),
      ]);
      setLikesInfo(likes);
      setVerifyStats(verif);
      setComments(comms);
      setRevisions(revs);
    } catch (err) {
      console.error("Failed to load community engagement data:", err);
    }
  };

  const fetchIntelligenceData = async () => {
    if (!id) return;
    try {
      const [related, graph] = await Promise.all([
        apiFetch(`/heritage/${id}/related`),
        apiFetch(`/knowledge/site/${id}`),
      ]);
      setRelatedSites(related);
      setSubgraph(graph);
    } catch (err) {
      console.error("Failed to load related sites or knowledge graph data:", err);
    }
  };

  useEffect(() => {
    fetchSiteDetails();
  }, [id]);

  useEffect(() => {
    if (site) {
      fetchCommunityData();
      fetchIntelligenceData();
    }
  }, [site]);

  const handleLikeToggle = async () => {
    if (!id) return;
    if (!currentUser) {
      router.push("/auth/login");
      return;
    }
    try {
      const res = await apiFetch(`/heritage/${id}/like`, { method: "POST" });
      setLikesInfo(res);
    } catch (err) {
      console.error("Like toggle failed:", err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!currentUser) {
      router.push("/auth/login");
      return;
    }
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      const commentObj = await apiFetch(`/heritage/${id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: newComment }),
      });
      setComments([commentObj, ...comments]);
      setNewComment("");
    } catch (err) {
      console.error("Comment post failed:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!currentUser) {
      router.push("/auth/login");
      return;
    }
    setSubmittingVerify(true);
    try {
      await apiFetch(`/heritage/${id}/verify`, {
        method: "POST",
        body: JSON.stringify({ result: verifyResult, comment: verifyComment || null }),
      });
      setShowVerifyModal(false);
      setVerifyComment("");
      const verif = await apiFetch(`/heritage/${id}/verify/stats`);
      setVerifyStats(verif);
      // Awarding reputation to verifier can be seen when visiting their profile page.
    } catch (err: any) {
      alert(err.message || "Failed to submit verification vote.");
    } finally {
      setSubmittingVerify(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!currentUser) {
      router.push("/auth/login");
      return;
    }
    setSubmittingReport(true);
    try {
      await apiFetch(`/heritage/{id}/report`.replace("{id}", id.toString()), {
        method: "POST",
        body: JSON.stringify({ reason: reportReason, description: reportDesc || null }),
      });
      setReportSuccess(true);
      setTimeout(() => {
        setShowReportModal(false);
        setReportDesc("");
        setReportSuccess(false);
      }, 1500);
    } catch (err: any) {
      alert(err.message || "Failed to file report.");
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleCorrectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!currentUser) {
      router.push("/auth/login");
      return;
    }
    if (!correctionTitle.trim() || !correctionContent.trim()) return;
    setSubmittingCorrection(true);
    try {
      await apiFetch(`/heritage/${id}/stories`, {
        method: "POST",
        body: JSON.stringify({
          language: selectedLang,
          title: correctionTitle,
          content: correctionContent,
        }),
      });
      setShowCorrectionModal(false);
      await fetchSiteDetails();
    } catch (err: any) {
      alert(err.message || "Failed to submit translation correction.");
    } finally {
      setSubmittingCorrection(false);
    }
  };


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !site) return;

    setUploading(true);
    setUploadError(null);
    try {
      await uploadMedia(site.id, file);
      await fetchSiteDetails();
    } catch (err: any) {
      setUploadError(err.message || "File upload failed.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070a] text-white flex flex-col items-center justify-center gap-2">
        <span className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Syncing story details...</span>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="min-h-screen bg-[#07070a] text-white flex flex-col items-center justify-center gap-4 px-6">
        <div className="max-w-md p-6 rounded-2xl border border-rose-500/10 bg-rose-500/5 text-center flex flex-col gap-3">
          <span className="text-2xl">⚠️</span>
          <p className="text-sm text-rose-400 font-bold">{error || "Heritage record not found."}</p>
        </div>
        <button
          onClick={() => router.push("/discover")}
          className="px-4 py-2 rounded-lg border border-white/10 text-xs text-zinc-400 hover:text-white transition-all"
        >
          &larr; Back to Discover
        </button>
      </div>
    );
  }

  const activeStory = site.stories.find((s) => s.language === selectedLang) || site.stories[0];
  const translationMissing = site.stories.length > 0 && activeStory.language !== selectedLang;
  const isAuthorized = currentUser && (currentUser.id === site.creator_id || currentUser.role === "moderator" || currentUser.role === "admin");

  // Media Categorization
  const images = site.media.filter((m) => m.media_type === "image");
  const videos = site.media.filter((m) => m.media_type === "video");
  const audios = site.media.filter((m) => m.media_type === "audio");

  // Verification calculations
  const totalVotes = verifyStats.supports_count + verifyStats.disputes_count;
  const supportPercent = totalVotes > 0 ? Math.round((verifyStats.supports_count / totalVotes) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#07070a] text-white pb-20 relative selection:bg-[#fb923c] selection:text-black">
      {/* Category Gradient Top Banner */}
      <div className="h-64 w-full bg-gradient-to-b from-amber-600/10 via-amber-800/5 to-transparent relative border-b border-white/5">
        <div className="absolute inset-0 bg-[#07070a]/40" />
        <div className="max-w-4xl mx-auto px-6 h-full flex items-end pb-8 relative z-10">
          <div className="flex flex-col gap-2 w-full">
            <div className="flex justify-between items-center w-full">
              <button
                onClick={() => router.push("/discover")}
                className="inline-flex items-center gap-1.5 text-xs text-amber-500 font-bold hover:underline mb-2"
              >
                &larr; Back to Discover Portal
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={handleLikeToggle}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                    likesInfo.has_liked
                      ? "bg-rose-500 border-rose-500 text-white"
                      : "border-white/5 bg-[#0e0e13] text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  ❤️ {likesInfo.likes_count}
                </button>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="px-3 py-1.5 rounded-lg border border-white/5 bg-[#0e0e13] text-xs font-bold text-zinc-400 hover:text-rose-400 transition-all"
                >
                  🚩 Report
                </button>
              </div>
            </div>

            <span className="inline-flex max-w-fit px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-[10px] font-bold text-amber-400 uppercase tracking-widest">
              {site.category}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mt-1">
              {site.name}
            </h1>
            <p className="text-xs text-zinc-500 font-mono">
              Coordinates: {site.latitude.toFixed(5)}°, {site.longitude.toFixed(5)}° &bull; Status:{" "}
              <span className={`font-bold ${site.status === "approved" ? "text-emerald-400" : "text-orange-400"}`}>
                {site.status.toUpperCase()}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 mt-12">
        {/* Left Side: Story, Verification, Comments & Revisions */}
        <div className="md:col-span-8 flex flex-col gap-10">
          {/* Multilingual Selector Header */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Read Story Context</h3>
            <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
              {languages.map((lang) => {
                const available = site.stories.some((s) => s.language === lang.code);
                return (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLang(lang.code)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                      selectedLang === lang.code
                        ? "bg-amber-500 text-black font-bold"
                        : "border border-white/5 bg-[#0e0e13] text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {lang.label}
                    {available && (
                      <span className="absolute top-[-3px] right-[-3px] w-2 h-2 rounded-full bg-emerald-500 border border-[#07070a]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Missing translation warning fallback banner */}
          {translationMissing && (
            <div className="p-4 rounded-xl border border-orange-500/20 bg-orange-500/10 text-xs font-medium text-orange-300 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="text-base">ℹ️</span>
                <div>
                  <p className="font-bold">Translation Unavailable</p>
                  <p className="mt-0.5">This archive item has not been documented in the selected language yet. Showing the original entry in <span className="font-bold uppercase">{activeStory.language}</span>.</p>
                </div>
              </div>
              {currentUser && (
                <button
                  onClick={() => {
                    setCorrectionTitle("");
                    setCorrectionContent("");
                    setShowCorrectionModal(true);
                  }}
                  className="px-3 py-1.5 bg-orange-500 hover:scale-95 text-black font-bold rounded-lg whitespace-nowrap text-[11px] transition-all"
                >
                  Add Translation
                </button>
              )}
            </div>
          )}

          {/* AI-Generated Machine Translation Warning Banner */}
          {!translationMissing && activeStory && activeStory.is_translation && activeStory.translation_method === "machine" && (
            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 text-xs font-medium text-amber-300 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="text-base">🤖</span>
                <div>
                  <p className="font-bold">AI-Generated Translation</p>
                  <p className="mt-0.5">This story was translated automatically. Help the community improve it by submitting a correction.</p>
                </div>
              </div>
              {currentUser && (
                <button
                  onClick={() => {
                    setCorrectionTitle(activeStory.title);
                    setCorrectionContent(activeStory.content);
                    setShowCorrectionModal(true);
                  }}
                  className="px-3 py-1.5 bg-amber-500 hover:scale-95 text-black font-bold rounded-lg whitespace-nowrap text-[11px] transition-all"
                >
                  Suggest Correction
                </button>
              )}
            </div>
          )}

          {/* Human Reviewed Translation Badge */}
          {!translationMissing && activeStory && activeStory.is_translation && activeStory.translation_method === "human" && (
            <div className="p-3 px-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5 text-xs font-semibold text-emerald-400 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>Community-reviewed translation (Human)</span>
              </div>
              {currentUser && (
                <button
                  onClick={() => {
                    setCorrectionTitle(activeStory.title);
                    setCorrectionContent(activeStory.content);
                    setShowCorrectionModal(true);
                  }}
                  className="text-[10px] text-zinc-400 hover:text-white underline"
                >
                  Edit Translation
                </button>
              )}
            </div>
          )}

          {/* Story Content */}
          <article className="flex flex-col gap-6">
            <h2 className="text-2xl font-black text-white leading-snug">
              {activeStory?.title || site.name}
            </h2>
            <div className="text-sm text-zinc-300 leading-relaxed space-y-4 whitespace-pre-wrap">
              {activeStory?.content || "No story has been contributed yet for this site."}
            </div>
          </article>

          {/* Verification Progress Bar */}
          <div className="p-6 rounded-2xl border border-white/5 bg-[#08080c] flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold text-white">Community Verification</h4>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  {totalVotes} reviews cast &bull; {supportPercent}% support rate
                </p>
              </div>
              
              <button
                onClick={() => {
                  if (!currentUser) router.push("/auth/login");
                  else setShowVerifyModal(true);
                }}
                disabled={verifyStats.user_vote !== null}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  verifyStats.user_vote
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 cursor-not-allowed"
                    : "bg-amber-500 border-amber-500 text-black hover:scale-95"
                }`}
              >
                {verifyStats.user_vote ? `Voted: ${verifyStats.user_vote.toUpperCase()}` : "Submit Review Vote"}
              </button>
            </div>

            {totalVotes > 0 ? (
              <div className="flex flex-col gap-1">
                <div className="w-full h-2.5 rounded-full bg-zinc-900 overflow-hidden flex">
                  <div className="bg-emerald-500 h-full" style={{ width: `${supportPercent}%` }} />
                  <div className="bg-rose-500 h-full" style={{ width: `${100 - supportPercent}%` }} />
                </div>
                <div className="flex justify-between text-[9px] text-zinc-500 font-mono mt-0.5">
                  <span>Supports: {verifyStats.supports_count}</span>
                  <span>Disputes: {verifyStats.disputes_count}</span>
                </div>
              </div>
            ) : (
              <div className="py-2 text-[10px] text-zinc-500 border border-dashed border-white/5 rounded-xl text-center">
                No community verifications submitted yet. Be the first to vote!
              </div>
            )}
          </div>

          {/* Comments Discussion Thread */}
          <div className="flex flex-col gap-6">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-2">
              Community Discussion ({comments.length})
            </h3>

            {/* Comment Form */}
            {currentUser ? (
              <form onSubmit={handleCommentSubmit} className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center font-bold text-amber-500 text-xs">
                  💬
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <textarea
                    id="new-comment"
                    name="newComment"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment about historical accuracy, festivals, or local stories..."
                    rows={3}
                    maxLength={1000}
                    className="w-full p-3 text-xs bg-[#0b0b0f] border border-white/5 focus:border-amber-500/50 rounded-xl outline-none resize-none text-zinc-200"
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="self-end px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-lg hover:scale-95 disabled:opacity-50 transition-all"
                  >
                    {submittingComment ? "Posting..." : "Post Comment"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-white/5 text-center text-xs text-zinc-550">
                Please <button onClick={() => router.push("/auth/login")} className="text-amber-500 font-bold hover:underline">login</button> to post comments.
              </div>
            )}

            {/* Comments List */}
            <div className="flex flex-col gap-4 mt-2">
              {comments.length === 0 ? (
                <p className="text-xs text-zinc-600 text-center py-6">No discussions yet.</p>
              ) : (
                comments.map((comm) => (
                  <div key={comm.id} className="p-4 rounded-xl border border-white/5 bg-[#09090d] flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold">
                      {comm.user.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline">
                        <button
                          onClick={() => router.push(`/users/${comm.user_id}`)}
                          className="text-xs font-bold text-zinc-300 hover:text-amber-500 transition-colors"
                        >
                          {comm.user.username}{" "}
                          <span className="text-[9px] px-1.5 py-0.5 rounded border border-zinc-700/55 text-zinc-500 uppercase tracking-widest ml-1 text-center">
                            {comm.user.role}
                          </span>
                        </button>
                        <span className="text-[9px] text-zinc-600 font-mono">
                          {new Date(comm.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-2 leading-relaxed whitespace-pre-wrap">
                        {comm.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Media, Attribution & Revision Logs */}
        <div className="md:col-span-4 flex flex-col gap-8">
          {/* Contributor Card */}
          <div className="p-5 rounded-2xl border border-white/5 bg-[#0a0a0e] flex flex-col gap-3">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Attribution</h4>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-500/15 flex items-center justify-center font-bold text-amber-500 text-sm">
                👤
              </div>
              <div>
                <button
                  onClick={() => router.push(`/users/${site.creator_id}`)}
                  className="text-xs font-bold text-white hover:text-amber-500 transition-colors text-left"
                >
                  Contributor Profile
                </button>
                <p className="text-[10px] text-zinc-500">ID Reference: #{site.creator_id}</p>
              </div>
            </div>
            <div className="text-[10px] text-zinc-500 border-t border-white/5 pt-3 mt-1 leading-relaxed flex items-center justify-between gap-4">
              <span>Added: {new Date(site.created_at).toLocaleDateString()}</span>
              <button
                onClick={() => setShowQRModal(true)}
                className="px-2.5 py-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-[9px] font-black text-amber-400 transition-all flex items-center gap-1 uppercase"
              >
                <span>🖨️</span> QR Plaque
              </button>
            </div>
          </div>

          {/* Media Attachments Gallery */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Media Gallery</h4>

            {/* Render Image Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {images.map((med) => (
                  <div key={med.id} className="relative aspect-square rounded-xl overflow-hidden border border-white/5 bg-white/5 group">
                    <img
                      src={`${API_BASE_URL}${med.media_url}`}
                      alt={site.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={() => setActive360Url(`${API_BASE_URL}${med.media_url}`)}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <span className="px-3 py-1.5 rounded-lg border border-white/20 bg-[#0e0e13]/85 text-[9px] font-black tracking-wider text-amber-400 hover:scale-105 transition-transform flex items-center gap-1">
                        <span>🌐</span> VIEW 360°
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Render Video Player Files */}
            {videos.length > 0 && (
              <div className="flex flex-col gap-3 mt-1">
                {videos.map((med) => (
                  <div key={med.id} className="rounded-xl overflow-hidden border border-white/5 bg-black/40">
                    <video
                      src={`${API_BASE_URL}${med.media_url}`}
                      controls
                      className="w-full aspect-video object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Render Audio Narrations */}
            {audios.length > 0 && (
              <div className="flex flex-col gap-2.5 mt-1">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Audio Narrations</span>
                {audios.map((med) => (
                  <div key={med.id} className="p-3 rounded-xl border border-white/5 bg-[#0c0c12] flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-[10px] font-semibold text-zinc-400">
                      <span>🔊</span>
                      <span>Audio Recording #{med.id}</span>
                    </div>
                    <audio
                      src={`${API_BASE_URL}${med.media_url}`}
                      controls
                      className="w-full h-8 scale-95"
                    />
                  </div>
                ))}
              </div>
            )}

            {site.media.length === 0 && (
              <div className="py-10 border border-dashed border-white/5 rounded-2xl text-center text-xs text-zinc-650 flex flex-col items-center gap-2">
                <span>🖼️</span>
                <span>No media attachments.</span>
              </div>
            )}

            {/* Media Upload Area (If Authorized) */}
            {isAuthorized && (
              <div className="mt-2 flex flex-col gap-2">
                <label className="flex flex-col items-center justify-center p-4 border border-dashed border-white/15 hover:border-amber-500/50 hover:bg-white/[0.01] rounded-2xl cursor-pointer transition-all text-center">
                  {uploading ? (
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                      Uploading asset...
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="text-lg">📤</span>
                      <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Attach Media File</span>
                      <span className="text-[9px] text-zinc-500">JPG, PNG, WEBP, MP4, MP3</span>
                    </div>
                  )}
                  <input
                    id="media-upload-input"
                    name="mediaFile"
                    type="file"
                    accept="image/*,video/*,audio/*"
                    disabled={uploading}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {uploadError && (
                  <p className="text-[10px] font-semibold text-rose-400">{uploadError}</p>
                )}
              </div>
            )}
          </div>

          {/* Revisions History Log */}
          <div className="flex flex-col gap-4 border-t border-white/5 pt-6 mt-2">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Revisions History</h4>
            {revisions.length === 0 ? (
              <p className="text-[10px] text-zinc-650 italic">No edits logged for this site yet.</p>
            ) : (
              <div className="flex flex-col gap-3 font-mono text-[10px]">
                {revisions.map((rev) => (
                  <div key={rev.id} className="p-3 rounded-lg border border-white/5 bg-[#09090d]/65 leading-relaxed">
                    <p className="text-zinc-300 font-bold">{rev.change_summary}</p>
                    <p className="text-zinc-600 mt-1">
                      By: {rev.user.username} &bull; {new Date(rev.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cultural Connections (Knowledge Graph Nodes) */}
          {subgraph.nodes && subgraph.nodes.length > 0 && (
            <div className="flex flex-col gap-4 border-t border-white/5 pt-6 mt-2">
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Cultural Connections</h4>
              <div className="flex flex-wrap gap-2">
                {subgraph.nodes.map((node) => {
                  let colorClass = "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
                  if (node.type === "site") colorClass = "bg-amber-500/10 text-amber-400 border-amber-500/25";
                  else if (node.type === "tradition") colorClass = "bg-teal-500/10 text-teal-400 border-teal-500/25";
                  else if (node.type === "festival") colorClass = "bg-purple-500/10 text-purple-400 border-purple-500/25";
                  else if (node.type === "community") colorClass = "bg-sky-500/10 text-sky-400 border-sky-500/25";

                  const emojis: Record<string, string> = {
                    site: "🛕",
                    tradition: "🎨",
                    festival: "🌊",
                    community: "👥",
                  };
                  const emoji = emojis[node.type] || "📍";

                  return (
                    <div
                      key={node.id}
                      title={node.description || ""}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-semibold cursor-default transition-all hover:scale-102 ${colorClass}`}
                    >
                      <span>{emoji}</span>
                      <span>{node.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Related Recommendations (pgvector similarity matches) */}
          {relatedSites && relatedSites.length > 0 && (
            <div className="flex flex-col gap-4 border-t border-white/5 pt-6 mt-2">
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Related Heritage Sites</h4>
              <div className="flex flex-col gap-3">
                {relatedSites.map((item) => (
                  <div
                    key={item.site.id}
                    onClick={() => router.push(`/heritage/${item.site.id}`)}
                    className="p-3 rounded-xl border border-white/5 bg-[#08080c] hover:border-amber-500/30 hover:bg-white/[0.01] transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider">{item.site.category}</span>
                      <h5 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors leading-snug">{item.site.name}</h5>
                    </div>
                    <span className="text-[9px] font-black text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 flex-shrink-0">
                      {Math.round(item.similarity * 100)}% Match
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Verification Vote Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-6">
          <div className="w-full max-w-md p-6 rounded-2xl border border-white/10 bg-[#0e0e13] flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Cast Verification Review</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Help confirm the accuracy, tradition context, or coordinates.
              </p>
            </div>

            <form onSubmit={handleVerifySubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Your Verdict</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVerifyResult("supports")}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      verifyResult === "supports"
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                        : "border-white/5 bg-[#0b0b0f] text-zinc-400"
                    }`}
                  >
                    👍 Supports Entry
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerifyResult("disputes")}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      verifyResult === "disputes"
                        ? "bg-rose-500/10 border-rose-500 text-rose-400"
                        : "border-white/5 bg-[#0b0b0f] text-zinc-400"
                    }`}
                  >
                    👎 Disputes Details
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="verify-comment" className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Comment/Evidence</label>
                <textarea
                  id="verify-comment"
                  name="verifyComment"
                  value={verifyComment}
                  onChange={(e) => setVerifyComment(e.target.value)}
                  placeholder="Provide supporting citations, details, or local context..."
                  rows={4}
                  maxLength={500}
                  className="w-full p-3 text-xs bg-[#0b0b0f] border border-white/5 focus:border-amber-500/50 rounded-xl outline-none resize-none text-zinc-200"
                />
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="px-4 py-2 rounded-lg border border-white/10 text-xs font-bold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingVerify}
                  className="px-4 py-2 rounded-lg bg-amber-500 text-black font-bold text-xs hover:scale-95 disabled:opacity-50"
                >
                  {submittingVerify ? "Submitting..." : "Submit Vote"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Flag/Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-6">
          <div className="w-full max-w-md p-6 rounded-2xl border border-white/10 bg-[#0e0e13] flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Report Inappropriate Content</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Submit this record to administrators and moderation teams for inspection.
              </p>
            </div>

            {reportSuccess ? (
              <div className="p-6 text-center text-emerald-400 font-bold text-xs flex flex-col gap-2 items-center bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                <span>✓</span>
                <span>Report successfully submitted to moderators.</span>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="report-reason" className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Reason for Report</label>
                  <select
                    id="report-reason"
                    name="reportReason"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full p-3 text-xs bg-[#0b0b0f] border border-white/5 text-zinc-300 rounded-xl outline-none focus:border-amber-500/50"
                  >
                    <option value="Incorrect Details">Incorrect / Misleading Details</option>
                    <option value="Inappropriate Content">Inappropriate Media or Language</option>
                    <option value="Spam">Spam Submission</option>
                    <option value="Copyright Violation">Copyright or Ownership Infringement</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="report-desc" className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Detailed Description</label>
                  <textarea
                    id="report-desc"
                    name="reportDesc"
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    placeholder="Provide details on what is incorrect or inappropriate..."
                    rows={4}
                    maxLength={1000}
                    className="w-full p-3 text-xs bg-[#0b0b0f] border border-white/5 focus:border-amber-500/50 rounded-xl outline-none resize-none text-zinc-200"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 rounded-lg border border-white/10 text-xs font-bold text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReport}
                    className="px-4 py-2 rounded-lg bg-rose-500 text-white font-bold text-xs hover:scale-95 disabled:opacity-50"
                  >
                    {submittingReport ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Suggest/Edit Translation Modal */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-6">
          <div className="w-full max-w-lg p-6 rounded-2xl border border-white/10 bg-[#0e0e13] flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">
                {translationMissing ? "Add Translation" : "Edit Translation"} in{" "}
                <span className="text-amber-500 uppercase">
                  {languages.find((l) => l.code === selectedLang)?.label || selectedLang}
                </span>
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                {translationMissing 
                  ? "Provide a manual translation of this heritage site's title and story context." 
                  : "Improve the AI-generated translation for correctness and community standard."}
              </p>
            </div>

            <form onSubmit={handleCorrectionSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="correction-title" className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Translated Title</label>
                <input
                  id="correction-title"
                  name="correctionTitle"
                  type="text"
                  value={correctionTitle}
                  onChange={(e) => setCorrectionTitle(e.target.value)}
                  placeholder="Enter translated title..."
                  maxLength={200}
                  className="w-full p-3 text-xs bg-[#0b0b0f] border border-white/5 focus:border-amber-500/50 rounded-xl outline-none text-zinc-250"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="correction-content" className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Translated Content / Story Context</label>
                <textarea
                  id="correction-content"
                  name="correctionContent"
                  value={correctionContent}
                  onChange={(e) => setCorrectionContent(e.target.value)}
                  placeholder="Enter detailed translation content..."
                  rows={8}
                  className="w-full p-3 text-xs bg-[#0b0b0f] border border-white/5 focus:border-amber-500/50 rounded-xl outline-none resize-none text-zinc-250 leading-relaxed"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowCorrectionModal(false)}
                  className="px-4 py-2 rounded-lg border border-white/10 text-xs font-bold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCorrection}
                  className="px-4 py-2 rounded-lg bg-amber-500 text-black font-bold text-xs hover:scale-95 disabled:opacity-50"
                >
                  {submittingCorrection ? "Submitting..." : "Save Translation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Plaque Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm px-6 print:bg-white print:p-0">
          <div className="w-full max-w-md p-6 rounded-2xl border border-white/10 bg-[#0e0e13] flex flex-col gap-4 shadow-2xl print:border-none print:bg-white print:text-black print:max-w-full print:shadow-none">
            
            {/* Printable plaque content container */}
            <div id="printable-plaque" className="flex flex-col items-center text-center p-6 border-4 border-double border-zinc-700 bg-black/20 rounded-xl print:border-8 print:border-double print:border-black print:bg-white print:text-black print:p-12">
              
              {/* Header styling */}
              <span className="text-[10px] font-black tracking-widest text-amber-500 uppercase print:text-zinc-650 print:text-[12px]">
                🛕 DIGITAL HERITAGE ARCHIVE
              </span>
              <h2 className="text-xl font-black text-white mt-1.5 font-serif print:text-black print:text-3xl">
                {site.name}
              </h2>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5 print:text-zinc-700 print:text-[11px] print:mt-1">
                Category: {site.category} &bull; Coordinates: {site.latitude.toFixed(5)}°, {site.longitude.toFixed(5)}°
              </span>

              {/* QR Code */}
              <div className="my-5 p-3 bg-white rounded-2xl border border-white/10 shadow-lg flex items-center justify-center print:border-2 print:border-black">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(typeof window !== "undefined" ? `${window.location.origin}/heritage/${site.id}` : "")}`}
                  alt={`${site.name} QR Code`}
                  className="w-40 h-40 object-contain"
                />
              </div>

              <p className="text-[11px] text-zinc-400 font-medium leading-relaxed max-w-sm print:text-black print:text-[14px]">
                Scan this code with your mobile device to discover historical stories, cultural context, 360° virtual panoramas, and multilingual recordings of this site.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-2 print:hidden">
              <button
                onClick={() => setShowQRModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-white/10 text-xs font-bold text-zinc-400 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-lg bg-amber-500 hover:scale-95 font-bold text-xs text-black transition-all flex items-center justify-center gap-1.5"
              >
                <span>🖨️</span> Print Plaque Card
              </button>
            </div>

            {/* Print Plaque Stylesheet */}
            <style dangerouslySetInnerHTML={{
              __html: `
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  #printable-plaque, #printable-plaque * {
                    visibility: visible;
                  }
                  #printable-plaque {
                    position: fixed;
                    left: 0;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    width: 100vw;
                    height: 100vh;
                    margin: 0;
                    padding: 40px;
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    justify-content: center !important;
                    border: 10px double #000000 !important;
                    background: #ffffff !important;
                    color: #000000 !important;
                  }
                }
              `
            }} />
          </div>
        </div>
      )}

      {/* 360 Panorama Viewer Modal */}
      {active360Url && (
        <PanoramaViewer
          imageUrl={active360Url}
          onClose={() => setActive360Url(null)}
        />
      )}
    </div>
  );
}
