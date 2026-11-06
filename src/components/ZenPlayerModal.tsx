"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, X, Clock, BookOpen, ListOrdered, CheckCircle2 } from "lucide-react";
import { Lesson, LESSONS } from "@/lib/data";

interface ZenPlayerModalProps {
  initialLesson?: Lesson;
  isOpen: boolean;
  onClose: () => void;
  onSelectPackage?: () => void;
}

export default function ZenPlayerModal({ initialLesson, isOpen, onClose, onSelectPackage }: ZenPlayerModalProps) {
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(initialLesson || LESSONS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<"steps" | "ebook">("steps");
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (initialLesson) {
      setSelectedLesson(initialLesson);
    }
  }, [initialLesson]);

  // Handle sleep timer countdown
  useEffect(() => {
    if (!sleepTimerMinutes || !isPlaying) return;
    const timer = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      setSleepTimerMinutes(null);
    }, sleepTimerMinutes * 60 * 1000);

    return () => clearTimeout(timer);
  }, [sleepTimerMinutes, isPlaying]);

  if (!isOpen) return null;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch((e) => console.error(e));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const skipSeconds = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#E8E2D9] overflow-hidden flex flex-col">
        {/* Top bar */}
        <div className="px-6 py-4 border-b border-[#ECE7E1] flex items-center justify-between bg-white/70">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3D5A4C] animate-pulse"></span>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#2D2A26]">
                Không Gian Thiền & Quán Sát Nội Tâm
              </h3>
              <p className="text-xs text-[#8C7355]">Người hướng dẫn: Chị Minh Hằng</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#EFECE6] hover:bg-[#E2DDD5] text-[#5C554E] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal content body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left column: Player & Lesson info */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              {/* Lesson selection pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3D5A4C]/10 text-[#3D5A4C] text-xs font-semibold mb-3">
                <span>{selectedLesson.isFreePreview ? "Mở Khóa Nghe Thử" : "Bản Quyền Đầy Đủ"}</span>
                <span>•</span>
                <span>{selectedLesson.durationMinutes} phút</span>
              </div>

              <h2 className="font-serif text-2xl font-bold text-[#2D2A26] mb-2 leading-snug">
                {selectedLesson.title}
              </h2>
              <p className="text-sm text-[#665E55] italic mb-4">
                "{selectedLesson.subtitle}"
              </p>

              {/* Core insight alert */}
              <div className="p-4 rounded-2xl bg-[#F2EDE4] border border-[#E5DEC3]/60 mb-6">
                <div className="text-xs font-bold uppercase tracking-wider text-[#8C7355] mb-1">
                  Ý nghĩa cốt lõi
                </div>
                <p className="text-sm text-[#3E3A35] leading-relaxed">
                  {selectedLesson.coreMeaning}
                </p>
              </div>
            </div>

            {/* Hidden HTML Audio element */}
            <audio
              ref={audioRef}
              src={selectedLesson.audioUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
            />

            {/* Player Visualizer & Scrubber */}
            <div className="p-6 rounded-2xl bg-white border border-[#ECE7E1] shadow-sm space-y-4">
              {/* Audio progress bar */}
              <div>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-[#E8E2D9] rounded-lg appearance-none cursor-pointer accent-[#3D5A4C]"
                />
                <div className="flex justify-between text-xs text-[#8C847A] font-mono mt-1.5">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between pt-2">
                {/* Sleep timer dropdown */}
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#8C7355]" />
                  <select
                    value={sleepTimerMinutes || ""}
                    onChange={(e) => setSleepTimerMinutes(e.target.value ? Number(e.target.value) : null)}
                    className="text-xs bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg px-2 py-1 text-[#5C554E] focus:outline-none"
                  >
                    <option value="">Hẹn giờ tắt</option>
                    <option value="10">10 phút</option>
                    <option value="20">20 phút</option>
                    <option value="30">30 phút</option>
                    <option value="45">45 phút</option>
                  </select>
                </div>

                {/* Main player controls */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => skipSeconds(-15)}
                    className="p-2 rounded-full hover:bg-[#FAF8F5] text-[#5C554E] transition-colors"
                    title="Lùi 15s"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>

                  <button
                    onClick={togglePlay}
                    className="w-14 h-14 rounded-full bg-[#3D5A4C] hover:bg-[#31493D] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                  </button>

                  <button
                    onClick={() => skipSeconds(15)}
                    className="p-2 rounded-full hover:bg-[#FAF8F5] text-[#5C554E] transition-colors"
                    title="Tiến 15s"
                  >
                    <RotateCw className="w-5 h-5" />
                  </button>
                </div>

                {/* Volume toggle */}
                <button
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.muted = !isMuted;
                      setIsMuted(!isMuted);
                    }
                  }}
                  className="p-2 rounded-full hover:bg-[#FAF8F5] text-[#5C554E] transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Other lessons picker */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-[#8C7355]">
                Chuỗi 6 bài thiền chuyển hoá:
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {LESSONS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => {
                      if (l.isFreePreview) {
                        setSelectedLesson(l);
                        setIsPlaying(false);
                      } else {
                        if (onSelectPackage) onSelectPackage();
                      }
                    }}
                    className={`p-2 rounded-xl text-center border text-xs font-medium transition-all ${
                      selectedLesson.id === l.id
                        ? "bg-[#3D5A4C] text-white border-[#3D5A4C] shadow-sm"
                        : l.isFreePreview
                        ? "bg-white text-[#2D2A26] border-[#ECE7E1] hover:border-[#3D5A4C]"
                        : "bg-[#F5F2ED] text-[#8C847A] border-dashed border-[#DDD7CD] hover:bg-[#EDE8DF]"
                    }`}
                  >
                    <div className="font-bold">Bài {l.orderIndex}</div>
                    <div className="text-[10px] opacity-80 truncate">
                      {l.isFreePreview ? "Nghe thử" : "Khóa"}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: Guided Steps & Ebook content */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#ECE7E1] p-5 flex flex-col h-[520px]">
            {/* Tabs */}
            <div className="flex border-b border-[#ECE7E1] pb-3 mb-4 gap-4">
              <button
                onClick={() => setActiveTab("steps")}
                className={`text-sm font-semibold flex items-center gap-1.5 pb-1 border-b-2 transition-all ${
                  activeTab === "steps"
                    ? "border-[#3D5A4C] text-[#3D5A4C]"
                    : "border-transparent text-[#8C847A] hover:text-[#2D2A26]"
                }`}
              >
                <ListOrdered className="w-4 h-4" />
                <span>Các bước thực hành</span>
              </button>
              <button
                onClick={() => setActiveTab("ebook")}
                className={`text-sm font-semibold flex items-center gap-1.5 pb-1 border-b-2 transition-all ${
                  activeTab === "ebook"
                    ? "border-[#3D5A4C] text-[#3D5A4C]"
                    : "border-transparent text-[#8C847A] hover:text-[#2D2A26]"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Ebook chiêm nghiệm</span>
              </button>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-sm text-[#4A453F]">
              {activeTab === "steps" ? (
                <div className="space-y-3">
                  {selectedLesson.steps.map((step, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#ECE7E1] flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#3D5A4C] shrink-0 mt-0.5" />
                      <div className="text-xs sm:text-sm leading-relaxed">{step}</div>
                    </div>
                  ))}
                  <div className="pt-2 text-xs text-[#8C7355] italic text-center">
                    Gợi ý: Hãy nhắm nhẹ đôi mắt và thở đều theo giọng dẫn thiền.
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="font-serif font-bold text-base text-[#2D2A26]">
                    {selectedLesson.ebookSummary.title}
                  </h4>
                  {selectedLesson.ebookSummary.sections.map((sec, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="font-bold text-xs uppercase tracking-wide text-[#3D5A4C]">
                        {sec.heading}
                      </div>
                      <p className="text-xs sm:text-sm leading-relaxed text-[#5C554E]">
                        {sec.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom action in right column */}
            {!selectedLesson.isFreePreview && (
              <div className="pt-4 border-t border-[#ECE7E1]">
                <button
                  onClick={onSelectPackage}
                  className="w-full py-2.5 rounded-xl zen-btn-primary text-xs font-semibold text-center"
                >
                  Mở Khóa Toàn Bộ 6 Bài Thiền & Ebook
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

