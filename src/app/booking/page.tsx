"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Sparkles, Send, CheckCircle2, MessageCircle, MapPin, Video, ExternalLink, User, Award } from "lucide-react";
import Navbar from "@/components/Navbar";
import { BANK_CONFIG, DEFAULT_COACHES, CoachProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";

const CONSULT_TOPICS = [
  { id: "nltn", title: "1. Thiền Xem Năng Lực Tự Nhiên", desc: "Khám phá thiên hướng bẩm sinh, tiếng gọi bên trong (The Calling) và năng lượng riêng có." },
  { id: "dattay", title: "2. Đặt Tay Năng Lượng Chữa Lành Trên Thân", desc: "Tháo gỡ điểm tắc, điểm đau thể lý (dạ dày, ngực, vai gáy) do năng lực tự nhiên bị đè nén." },
  { id: "timeline", title: "3. Xem Timeline Đời Sống Quá Khứ & Bài Học", desc: "Hiểu bài học linh hồn từ quá khứ để vận dụng giải phóng tư tưởng, tâm lý đời này." },
  { id: "camxuc", title: "4. Hướng Dẫn Thiền Chuyển Hóa Cảm Xúc 1:1", desc: "Đồng hành trực tiếp tháo gỡ khối cảm xúc dồn nén theo từng tầng lớp củ hành tây." },
  { id: "family", title: "5. Chữa Lành Đất Ở & Cây Dòng Họ (Family Tree)", desc: "Hóa giải các điểm tắc bắt nguồn từ trường năng lượng đất ở hoặc gia hệ dòng họ." }
];

const TIME_SLOTS = [
  "09:00 - 10:30",
  "14:00 - 15:30",
  "16:00 - 17:30",
  "19:30 - 21:00"
];

export default function BookingPage() {
  const [coaches, setCoaches] = useState<CoachProfile[]>(DEFAULT_COACHES);
  const [selectedCoachId, setSelectedCoachId] = useState<string>(DEFAULT_COACHES[0].id);

  const [topic, setTopic] = useState("nltn");
  const [mode, setMode] = useState<"online" | "offline">("online");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    loadCoaches();
  }, []);

  const loadCoaches = async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase.from("profiles").select("*").eq("role", "coach");
      if (data && data.length > 0) {
        const mapped: CoachProfile[] = data.map((c: any) => ({
          id: c.id,
          fullName: c.full_name || "Huấn Luyện Viên",
          roleTitle: c.full_name?.includes("Hằng") ? "Sáng Lập Viên & Master Coach" : "Huấn Luyện Viên Đồng Hành",
          expertise: c.expertise || "Thiền Năng Lực Tự Nhiên & Chuyển Hoá Cảm Xúc Thân Tâm",
          bio: c.bio || "Người đồng hành lắng nghe và hướng dẫn thiền quán.",
          phone: c.phone || "0906115528",
          yearsExp: c.years_exp || 5,
          badge: c.full_name?.includes("Hằng") ? "Trưởng Ban Hướng Dẫn" : "Coach Đã Phê Duyệt",
          avatarLetter: c.full_name?.charAt(0)?.toUpperCase() || "C"
        }));
        setCoaches(mapped);
      }
    } catch {
      // Fallback to DEFAULT_COACHES
    }
  };

  const selectedCoach = coaches.find((c) => c.id === selectedCoachId) || coaches[0];
  const selectedTopicObj = CONSULT_TOPICS.find((t) => t.id === topic);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const supabase = createClient();
      await supabase.from("bookings").insert({
        full_name: fullName,
        phone: phone,
        coach_id: selectedCoach.id,
        coach_name: selectedCoach.fullName,
        topic: selectedTopicObj?.title || topic,
        mode: mode,
        booking_date: date,
        time_slot: timeSlot,
        symptoms_note: symptoms,
        status: "pending",
      });
    } catch (err) {
      console.warn("Lưu booking Supabase:", err);
    } finally {
      setIsSuccess(true);
    }
  };

  // Tạo liên kết Google Calendar tự động
  const startHour = timeSlot.split(" - ")[0]?.trim() || "09:00";
  const endHour = timeSlot.split(" - ")[1]?.trim() || "10:30";
  const formattedDate = date ? date.replace(/-/g, "") : "";
  const startTime = startHour.replace(":", "") + "00";
  const endTime = endHour.replace(":", "") + "00";
  const gcalDates = formattedDate ? `${formattedDate}T${startTime}/${formattedDate}T${endTime}` : "";
  
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    `[Tư Vấn 1:1] ${selectedTopicObj?.title || "Phát triển Năng Lực Tự Nhiên"} - ${selectedCoach.fullName}`
  )}&dates=${gcalDates}&details=${encodeURIComponent(
    `Buổi tư vấn chuyên sâu 1:1 cùng ${selectedCoach.fullName}\n- Học viên: ${fullName} (${phone})\n- Chủ đề: ${selectedTopicObj?.title}\n- Hình thức: ${mode === "online" ? "Google Meet (Online)" : "Trực tiếp"}\n- Vấn đề chia sẻ: ${symptoms}`
  )}&location=${encodeURIComponent(mode === "online" ? "Google Meet" : "Hà Nội")}`;

  const zaloBookingUrl = `https://zalo.me/${selectedCoach.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    `Xin chào ${selectedCoach.fullName}! Tôi là ${fullName} (SĐT: ${phone}).\nTôi đăng ký lịch tư vấn 1:1:\n- Chủ đề: ${selectedTopicObj?.title}\n- Hình thức: ${mode === "online" ? "Google Meet (Online)" : "Trực tiếp"}\n- Ngày hẹn: ${date}\n- Khung giờ: ${timeSlot}\n- Vấn đề gặp phải: ${symptoms}\nNhờ Coach xem và xác nhận lịch giúp tôi với ạ!`
  )}`;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        {/* Back */}
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
            <Calendar className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2D2A26] mb-3">
            Đặt Lịch Tư Vấn 1:1 Chuyên Sâu
          </h1>
          <p className="text-sm text-[#665E55] max-w-xl mx-auto leading-relaxed">
            Không gian riêng tư và tĩnh lặng để kết nối 4 chiều: Tinh thần, Vật lý, Thời gian và Không gian cùng Chuyên gia / Huấn luyện viên.
          </p>
        </div>

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="zen-card p-6 sm:p-8 bg-white space-y-8">
            {/* Step 1: Coach Selection */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#3D5A4C] flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>1. Lựa chọn Chuyên gia / Huấn luyện viên đồng hành</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {coaches.map((c) => (
                  <label
                    key={c.id}
                    onClick={() => setSelectedCoachId(c.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                      selectedCoachId === c.id
                        ? "bg-[#3D5A4C]/5 border-[#3D5A4C] shadow-xs"
                        : "bg-[#FAF8F5] border-[#ECE7E1] hover:border-[#3D5A4C]/40"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#3D5A4C] text-white flex items-center justify-center font-serif text-sm font-bold shrink-0">
                      {c.avatarLetter}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-serif font-bold text-sm text-[#2D2A26]">
                          {c.fullName}
                        </div>
                        <input
                          type="radio"
                          name="coach"
                          checked={selectedCoachId === c.id}
                          onChange={() => setSelectedCoachId(c.id)}
                          className="accent-[#3D5A4C]"
                        />
                      </div>
                      <div className="text-[11px] text-[#8C7355] font-semibold mt-0.5">
                        {c.roleTitle}
                      </div>
                      <p className="text-xs text-[#5C554E] mt-1 line-clamp-2 leading-relaxed">
                        {c.expertise}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Step 2: Topic Selection */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#3D5A4C] flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>2. Lựa chọn chủ đề tư vấn</span>
              </div>
              <div className="space-y-2.5">
                {CONSULT_TOPICS.map((item) => (
                  <label
                    key={item.id}
                    onClick={() => setTopic(item.id)}
                    className={`block p-4 rounded-2xl border cursor-pointer transition-all ${
                      topic === item.id
                        ? "bg-[#3D5A4C]/5 border-[#3D5A4C] shadow-xs"
                        : "bg-[#FAF8F5] border-[#ECE7E1] hover:border-[#3D5A4C]/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-xs sm:text-sm text-[#2D2A26]">
                        {item.title}
                      </div>
                      <input
                        type="radio"
                        name="topic"
                        checked={topic === item.id}
                        onChange={() => setTopic(item.id)}
                        className="accent-[#3D5A4C]"
                      />
                    </div>
                    <p className="text-xs text-[#665E55] mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </label>
                ))}
              </div>
            </div>

            {/* Step 3: Mode & Time */}
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-[#3D5A4C] flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>3. Hình thức & Khung thời gian</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode("online")}
                  className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                    mode === "online"
                      ? "bg-[#3D5A4C] text-white border-[#3D5A4C] shadow-sm"
                      : "bg-[#FAF8F5] text-[#5C554E] border-[#DED7CE] hover:border-[#3D5A4C]"
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>Online qua Google Meet</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode("offline")}
                  className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                    mode === "offline"
                      ? "bg-[#3D5A4C] text-white border-[#3D5A4C] shadow-sm"
                      : "bg-[#FAF8F5] text-[#5C554E] border-[#DED7CE] hover:border-[#3D5A4C]"
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span>Trực Tiếp (Hà Nội)</span>
                </button>
              </div>

              {mode === "online" && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-semibold block mb-0.5">Buổi tư vấn diễn ra trực tuyến qua Google Meet</span>
                    <span>Bạn có thể mở trước đường link phòng họp hoặc nhận lời mời qua email/Zalo.</span>
                  </div>
                  <a
                    href="https://meet.google.com/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-semibold text-xs hover:bg-emerald-800 transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Kiểm tra Meet</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5C554E] mb-1.5">
                    Ngày mong muốn hẹn
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs px-3.5 py-3 rounded-xl border border-[#DED7CE] bg-[#FAF8F5] focus:outline-none focus:border-[#3D5A4C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C554E] mb-1.5">
                    Khung giờ tư vấn (90 phút)
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full text-xs px-3.5 py-3 rounded-xl border border-[#DED7CE] bg-[#FAF8F5] focus:outline-none focus:border-[#3D5A4C]"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 4: Contact Info & Symptoms */}
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-[#3D5A4C] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>4. Phiếu chuẩn bị tâm thức trước buổi gặp</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5C554E] mb-1.5">
                    Họ và tên của bạn *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full text-xs px-3.5 py-3 rounded-xl border border-[#DED7CE] bg-[#FAF8F5] focus:outline-none focus:border-[#3D5A4C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C554E] mb-1.5">
                    Số điện thoại / Zalo *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0988.888.888"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs px-3.5 py-3 rounded-xl border border-[#DED7CE] bg-[#FAF8F5] focus:outline-none focus:border-[#3D5A4C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C554E] mb-1.5">
                  Mô tả ngắn về vấn đề bạn đang bế tắc (cảm xúc, công việc, hoặc đau trên thân thể):
                </label>
                <textarea
                  rows={3}
                  placeholder="Tôi thường xuyên bị tức ngực khó thở khi chịu áp lực và cảm thấy công việc hiện tại không thuộc về mình..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full text-xs px-3.5 py-3 rounded-xl border border-[#DED7CE] bg-[#FAF8F5] focus:outline-none focus:border-[#3D5A4C] leading-relaxed"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl zen-btn-primary font-semibold text-sm shadow-sm hover:shadow flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Hoàn Tất Đăng Ký Lịch Tư Vấn</span>
            </button>
          </form>
        ) : (
          <div className="zen-card p-8 sm:p-10 bg-white text-center space-y-6 animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-bold text-[#2D2A26]">
                Đăng Ký Tư Vấn Thành Công!
              </h2>
              <p className="text-xs sm:text-sm text-[#5C554E] max-w-md mx-auto leading-relaxed">
                Yêu cầu tư vấn của bạn cùng <strong>{selectedCoach.fullName}</strong> đã được ghi nhận vào hệ thống.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#ECE7E1] text-xs text-left space-y-2 max-w-md mx-auto">
              <div className="flex justify-between pb-1.5 border-b border-[#ECE7E1]">
                <span className="text-[#8C7355]">Huấn luyện viên:</span>
                <span className="font-bold text-[#2D2A26]">{selectedCoach.fullName}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-[#ECE7E1]">
                <span className="text-[#8C7355]">Chủ đề:</span>
                <span className="font-bold text-[#2D2A26]">{selectedTopicObj?.title}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-[#ECE7E1]">
                <span className="text-[#8C7355]">Hình thức:</span>
                <span className="font-bold text-[#2D2A26]">
                  {mode === "online" ? "Google Meet" : "Trực tiếp (Hà Nội)"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C7355]">Thời gian:</span>
                <span className="font-bold text-[#3D5A4C]">{date} ({timeSlot})</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={googleCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-3 rounded-xl zen-btn-outline font-semibold text-xs flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4 text-[#3D5A4C]" />
                <span>Thêm Vào Google Calendar</span>
              </a>

              <a
                href={zaloBookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-3 rounded-xl zen-btn-primary font-semibold text-xs flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Nhắn Tin Zalo Xác Nhận Ngay</span>
              </a>
            </div>

            <div className="pt-4 border-t border-[#ECE7E1]">
              <Link
                href="/dashboard"
                className="text-xs font-semibold text-[#8C7355] hover:text-[#3D5A4C] hover:underline"
              >
                Đi đến Không Gian Học Viên để theo dõi lịch hẹn →
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
