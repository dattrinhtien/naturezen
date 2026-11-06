"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Sparkles, Check, Trash2, Calendar, Heart, Layers, Activity } from "lucide-react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";

interface JournalItem {
  id: string;
  date: string;
  moodBefore: number;
  moodAfter: number;
  bodySpots: string[];
  surfaceEmotions: string[];
  deepLayerText: string;
  notes: string;
}

const BODY_REGIONS = [
  { id: "head", label: "Đầu / Trán căng thẳng", cx: 70, cy: 32, r: 8 },
  { id: "throat", label: "Cổ họng nghẹn ứ", cx: 70, cy: 62, r: 7 },
  { id: "shoulders", label: "Cổ vai gáy nhức mỏi", cx: 70, cy: 80, r: 9 },
  { id: "chest", label: "Ngực tức nặng, khó thở", cx: 70, cy: 104, r: 9 },
  { id: "stomach", label: "Dạ dày buốt, xót, cồn cào", cx: 70, cy: 132, r: 9 },
  { id: "belly", label: "Vùng bụng dưới thắt chặt", cx: 70, cy: 160, r: 9 },
  { id: "limbs", label: "Tay chân tê mỏi, rã rời", cx: 70, cy: 215, r: 9 },
];

const EMOTION_TAGS = [
  "Tức giận", "Bất an", "Lo lắng", "Trì trệ", "Buồn bã", "Thất vọng", "Cô đơn", "Ghen tị", "Tự ti", "Mệt mỏi"
];

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalItem[]>([]);
  const [moodBefore, setMoodBefore] = useState(3);
  const [moodAfter, setMoodAfter] = useState(4);
  const [selectedSpots, setSelectedSpots] = useState<string[]>([]);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [deepLayerText, setDeepLayerText] = useState("");
  const [notes, setNotes] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("hang_thien_journal");
      if (stored) {
        setEntries(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleSpot = (label: string) => {
    if (selectedSpots.includes(label)) {
      setSelectedSpots(selectedSpots.filter((s) => s !== label));
    } else {
      setSelectedSpots([...selectedSpots, label]);
    }
  };

  const toggleEmotion = (emotion: string) => {
    if (selectedEmotions.includes(emotion)) {
      setSelectedEmotions(selectedEmotions.filter((e) => e !== emotion));
    } else {
      setSelectedEmotions([...selectedEmotions, emotion]);
    }
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: JournalItem = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      moodBefore,
      moodAfter,
      bodySpots: selectedSpots,
      surfaceEmotions: selectedEmotions,
      deepLayerText,
      notes,
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    localStorage.setItem("hang_thien_journal", JSON.stringify(updated));

    // Async sync to Supabase if authenticated
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("journal_entries").insert({
          user_id: user.id,
          mood_before: moodBefore,
          mood_after: moodAfter,
          body_spots: selectedSpots,
          surface_emotions: selectedEmotions,
          deep_layers: deepLayerText,
          notes: notes,
        });
      }
    } catch (err) {
      console.warn("Đồng bộ Supabase Journal:", err);
    }

    // Reset form
    setSelectedSpots([]);
    setSelectedEmotions([]);
    setDeepLayerText("");
    setNotes("");
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleDeleteEntry = (id: string) => {
    const updated = entries.filter((item) => item.id !== id);
    setEntries(updated);
    localStorage.setItem("hang_thien_journal", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        {/* Back button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#8C7355] hover:text-[#3D5A4C] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay về trang chủ</span>
          </Link>
        </div>

        {/* Title */}
        <div className="text-center mb-10">
          <div className="w-12 h-12 rounded-full bg-[#3D5A4C]/10 text-[#3D5A4C] mx-auto flex items-center justify-center mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2D2A26] mb-3">
            Sổ Quán Sát Thân & Tâm
          </h1>
          <p className="text-sm text-[#665E55] max-w-xl mx-auto leading-relaxed">
            "Viết xuống mỗi ngày thực hành của bạn để nhìn thấy sự tiến bộ từng bước của bản thân và thấu suốt căn nguyên nội tâm."
          </p>
        </div>

        {/* Entry Form */}
        <form onSubmit={handleSaveEntry} className="zen-card p-6 sm:p-8 bg-white mb-12 space-y-8">
          {/* Section 1: Mood Slider */}
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-[#3D5A4C] flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>1. Trạng thái nội tâm trước và sau khi thiền</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#FAF8F5] p-5 rounded-2xl border border-[#ECE7E1]">
              <div>
                <label className="block text-xs font-medium text-[#5C554E] mb-2">
                  Trước khi thiền (Mức bất an / căng thẳng): <strong>{moodBefore}/5</strong>
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={moodBefore}
                  onChange={(e) => setMoodBefore(Number(e.target.value))}
                  className="w-full accent-[#8C7355] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#A39A8F] mt-1">
                  <span>Nhẹ nhàng (1)</span>
                  <span>Rất nặng nề (5)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5C554E] mb-2">
                  Sau khi thiền (Mức tĩnh lặng / an yên): <strong>{moodAfter}/5</strong>
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={moodAfter}
                  onChange={(e) => setMoodAfter(Number(e.target.value))}
                  className="w-full accent-[#3D5A4C] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#A39A8F] mt-1">
                  <span>Chưa dịu (1)</span>
                  <span>Rất an lạc (5)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Visual Somatic Body Map & Tags */}
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-[#3D5A4C] flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span>2. Sơ đồ Quán sát Điểm Tắc Thân Thể (Bài thiền 4 & 5)</span>
            </div>
            <p className="text-xs text-[#8C847A]">
              Chạm trực tiếp vào các điểm năng lượng trên sơ đồ cơ thể hoặc bấm chọn các nhãn bên cạnh:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-[#FAF8F5] p-5 rounded-2xl border border-[#ECE7E1]">
              {/* Silhouette SVG */}
              <div className="md:col-span-5 flex justify-center py-2">
                <div className="relative p-3 bg-white rounded-2xl border border-[#ECE7E1] shadow-xs">
                  <svg width="140" height="280" viewBox="0 0 140 280" className="select-none">
                    {/* Minimal Zen Body Silhouette */}
                    {/* Head */}
                    <circle cx="70" cy="32" r="16" fill="#ECE7E1" />
                    {/* Neck */}
                    <rect x="65" y="48" width="10" height="12" rx="3" fill="#ECE7E1" />
                    {/* Torso */}
                    <path d="M 40 64 C 40 60, 100 60, 100 64 L 94 165 C 94 175, 46 175, 46 165 Z" fill="#ECE7E1" />
                    {/* Arms */}
                    <path d="M 38 65 L 20 145 C 19 152, 27 155, 29 148 L 44 95" fill="#ECE7E1" />
                    <path d="M 102 65 L 120 145 C 121 152, 113 155, 111 148 L 96 95" fill="#ECE7E1" />
                    {/* Legs */}
                    <path d="M 50 170 L 46 265 C 45 272, 57 272, 58 265 L 67 185" fill="#ECE7E1" />
                    <path d="M 90 170 L 94 265 C 95 272, 83 272, 82 265 L 73 185" fill="#ECE7E1" />

                    {/* Interactive Clickable Nodes */}
                    {BODY_REGIONS.map((item) => {
                      const isSelected = selectedSpots.includes(item.label);
                      return (
                        <g key={item.id} className="cursor-pointer" onClick={() => toggleSpot(item.label)}>
                          <circle
                            cx={item.cx}
                            cy={item.cy}
                            r={item.r + 4}
                            className={`transition-all ${
                              isSelected ? "fill-[#3D5A4C]/20 stroke-[#3D5A4C] stroke-2 animate-pulse" : "fill-transparent hover:fill-black/5"
                            }`}
                          />
                          <circle
                            cx={item.cx}
                            cy={item.cy}
                            r={item.r}
                            className={`transition-all ${
                              isSelected ? "fill-[#3D5A4C]" : "fill-[#B3A999] hover:fill-[#8C7355]"
                            }`}
                          />
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Selection Pills */}
              <div className="md:col-span-7 space-y-2">
                <div className="text-[11px] font-semibold text-[#8C7355] uppercase tracking-wider mb-2">
                  Danh sách vùng phản ứng:
                </div>
                <div className="flex flex-wrap gap-2">
                  {BODY_REGIONS.map((spot) => {
                    const isSelected = selectedSpots.includes(spot.label);
                    return (
                      <button
                        type="button"
                        key={spot.id}
                        onClick={() => toggleSpot(spot.label)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border text-left transition-all ${
                          isSelected
                            ? "bg-[#3D5A4C] text-white border-[#3D5A4C] shadow-xs"
                            : "bg-white text-[#5C554E] border-[#DED7CE] hover:border-[#3D5A4C]"
                        }`}
                      >
                        {spot.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Onion Layering */}
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-[#3D5A4C] flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>3. Bóc tách từng tầng lớp cảm xúc (Củ hành tây - Bài thiền 3)</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5C554E] mb-2">
                Cảm xúc lớp bề mặt nhận thấy:
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {EMOTION_TAGS.map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleEmotion(tag)}
                    className={`px-3 py-1 rounded-lg text-xs transition-all ${
                      selectedEmotions.includes(tag)
                        ? "bg-[#8C7355] text-white"
                        : "bg-[#FAF8F5] text-[#665E55] border border-[#ECE7E1] hover:border-[#8C7355]"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5C554E] mb-1">
                Lớp sâu hơn bên dưới (Nỗi sợ, sự dằn vặt, cảm giác thiếu thốn, đóng vai nạn nhân...):
              </label>
              <textarea
                rows={3}
                placeholder="Khi đi sâu vào cảm xúc, tôi nhận thấy bên dưới sự tức giận thực ra là nỗi sợ bị từ chối và cảm giác không an toàn..."
                value={deepLayerText}
                onChange={(e) => setDeepLayerText(e.target.value)}
                className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-[#DED7CE] bg-[#FAF8F5] focus:outline-none focus:border-[#3D5A4C]"
              />
            </div>
          </div>

          {/* Section 4: Self-love note */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[#3D5A4C] flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span>4. Lời nhắn nhủ & Ôm ấp con người nhược điểm (Bài thiền 6)</span>
            </div>
            <textarea
              rows={3}
              placeholder="Tôi nhìn nhận và đón nhận sự yếu đuối này của tôi. Tôi ôm ấp nó và cho phép năng lượng này được chữa lành..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-[#DED7CE] bg-[#FAF8F5] focus:outline-none focus:border-[#3D5A4C]"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-4 border-t border-[#ECE7E1]">
            <div className="text-xs text-[#8C7355]">
              Dữ liệu được lưu riêng tư và an toàn trên thiết bị của bạn.
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl zen-btn-primary font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Lưu Vào Sổ Quán Sát</span>
            </button>
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs text-center font-medium">
              Đã ghi lại hành trình quán sát hôm nay của bạn thành công!
            </div>
          )}
        </form>

        {/* Entries list */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#ECE7E1] pb-3">
            <h2 className="font-serif text-xl font-bold text-[#2D2A26]">
              Lịch Sử Quán Chiếu ({entries.length})
            </h2>
            <span className="text-xs text-[#8C7355]">Mỗi ngày một bước tiến nhỏ</span>
          </div>

          {entries.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-[#DDD7CD] text-[#8C847A] text-xs">
              Chưa có ghi chép nào. Hãy thực hành một bài thiền và ghi lại những quan sát đầu tiên của bạn ở biểu mẫu phía trên.
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((item) => (
                <div key={item.id} className="zen-card p-5 bg-white space-y-4 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#8C7355]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{item.date}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteEntry(item.id)}
                      className="text-[#B5ACA0] hover:text-red-600 transition-colors"
                      title="Xoá ghi chép"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-[#FAF8F5] p-3 rounded-xl">
                    <div>
                      <span className="text-[#8C847A]">Tâm trước thiền: </span>
                      <strong className="text-[#8C7355]">{item.moodBefore}/5</strong>
                    </div>
                    <div>
                      <span className="text-[#8C847A]">Tâm sau thiền: </span>
                      <strong className="text-[#3D5A4C]">{item.moodAfter}/5</strong>
                    </div>
                  </div>

                  {item.bodySpots.length > 0 && (
                    <div className="text-xs">
                      <span className="text-[#8C847A] block mb-1">Điểm đau trên thân:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.bodySpots.map((spot, i) => (
                          <span key={i} className="px-2.5 py-0.5 rounded-full bg-[#3D5A4C]/10 text-[#3D5A4C] font-medium text-[11px]">
                            {spot}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.surfaceEmotions.length > 0 && (
                    <div className="text-xs">
                      <span className="text-[#8C847A] block mb-1">Cảm xúc bề mặt:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.surfaceEmotions.map((em, i) => (
                          <span key={i} className="px-2.5 py-0.5 rounded-full bg-[#8C7355]/10 text-[#8C7355] font-medium text-[11px]">
                            {em}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.deepLayerText && (
                    <div className="text-xs border-l-2 border-[#8C7355] pl-3 py-1 text-[#4A453F]">
                      <span className="font-semibold text-[#8C7355] block mb-0.5">Tầng lớp sâu hơn:</span>
                      {item.deepLayerText}
                    </div>
                  )}

                  {item.notes && (
                    <div className="text-xs border-l-2 border-[#3D5A4C] pl-3 py-1 text-[#4A453F]">
                      <span className="font-semibold text-[#3D5A4C] block mb-0.5">Lời yêu thương bản thân:</span>
                      {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
