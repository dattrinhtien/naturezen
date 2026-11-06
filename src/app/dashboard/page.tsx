"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  MessageCircle, 
  BookOpen, 
  Headphones, 
  Calendar, 
  Send, 
  User, 
  LogOut, 
  Play, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Heart,
  Video,
  FileText,
  Users,
  Check,
  X,
  Phone
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ZenPlayerModal from "@/components/ZenPlayerModal";
import { createClient } from "@/lib/supabase/client";
import { LESSONS, Lesson, EBOOKS, DEFAULT_COACHES, CoachProfile } from "@/lib/data";

interface MessageItem {
  id: string;
  sender_id: string;
  coach_id?: string;
  sender_name: string;
  content: string;
  is_from_coach: boolean;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "lessons" | "journal" | "bookings">("chat");
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [activeLesson, setActiveLesson] = useState<Lesson>(LESSONS[0]);

  // Coach states
  const [coaches, setCoaches] = useState<CoachProfile[]>(DEFAULT_COACHES);
  const [selectedCoach, setSelectedCoach] = useState<CoachProfile>(DEFAULT_COACHES[0]);
  const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Lắng nghe tin nhắn phản hồi từ Coach theo thời gian thực (Supabase Realtime)
  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`chat_student_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newMsg = payload.new as MessageItem;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchUserData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setUser(user);

    // Lấy thông tin profile
    const { data: prof } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (prof) setProfile(prof);

    // Lấy danh sách Coach đã được duyệt từ hệ thống
    try {
      const { data: dbCoaches } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "coach");

      if (dbCoaches && dbCoaches.length > 0) {
        const mapped: CoachProfile[] = dbCoaches.map((c: any) => ({
          id: c.id,
          fullName: c.full_name || "Huấn Luyện Viên",
          roleTitle: c.full_name?.includes("Hằng") ? "Sáng Lập Viên & Master Coach" : "Huấn Luyện Viên Đồng Hành",
          expertise: c.expertise || "Thiền Năng Lực Tự Nhiên & Chuyển Hoá Cảm Xúc Thân Tâm",
          bio: c.bio || "Người đồng hành lắng nghe, tháo gỡ bế tắc nội tâm và hướng dẫn thiền quán.",
          phone: c.phone || "0906115528",
          yearsExp: c.years_exp || 5,
          badge: c.full_name?.includes("Hằng") ? "Trưởng Ban Hướng Dẫn" : "Coach Đã Phê Duyệt",
          avatarLetter: c.full_name?.charAt(0)?.toUpperCase() || "C"
        }));

        setCoaches(mapped);

        // Nếu học viên đã chọn coach trước đó
        if (prof?.coach_id) {
          const current = mapped.find((m) => m.id === prof.coach_id);
          if (current) setSelectedCoach(current);
        } else if (mapped.length > 0) {
          setSelectedCoach(mapped[0]);
        }
      }
    } catch {
      // Giữ default coaches nếu có lỗi
    }

    // Lấy tin nhắn trao đổi
    const { data: msgData } = await supabase
      .from("messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (msgData) setMessages(msgData);

    // Lấy nhật ký của user
    const { data: jData } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (jData && jData.length > 0) {
      setJournalEntries(jData);
    } else {
      // Đọc localstorage dự phòng
      try {
        const stored = localStorage.getItem("hang_thien_journal");
        if (stored) setJournalEntries(JSON.parse(stored));
      } catch (e) {}
    }

    // Lấy lịch hẹn của user
    const { data: bData } = await supabase
      .from("bookings")
      .select("*")
      .or(`user_id.eq.${user.id},phone.eq.${prof?.phone || user.phone || ""}`)
      .order("created_at", { ascending: false });
    if (bData) setBookings(bData);
  };

  const handleSelectCoach = async (coach: CoachProfile) => {
    setSelectedCoach(coach);
    setIsCoachModalOpen(false);
    if (!user) return;

    try {
      const supabase = createClient();
      await supabase
        .from("profiles")
        .update({ coach_id: coach.id })
        .eq("id", user.id);
    } catch (err) {
      console.error("Lưu coach_id:", err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    setIsSending(true);
    const content = newMessage.trim();
    setNewMessage("");

    try {
      const supabase = createClient();
      const newMsg = {
        user_id: user.id,
        coach_id: selectedCoach.id,
        sender_id: user.id,
        sender_name: profile?.full_name || user.email?.split("@")[0] || "Học viên",
        content: content,
        is_from_coach: false,
      };

      const { data, error } = await supabase
        .from("messages")
        .insert(newMsg)
        .select()
        .single();

      if (data) {
        setMessages((prev) => [...prev, data]);
      } else {
        // Fallback hiển thị tức thì
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            ...newMsg,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* User Welcome Bar */}
        <div className="zen-card p-6 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#3D5A4C]/10 text-[#3D5A4C] flex items-center justify-center font-serif text-xl font-bold">
              {profile?.full_name ? profile.full_name[0].toUpperCase() : <User className="w-7 h-7" />}
            </div>
            <div>
              <div className="text-xs font-semibold text-[#8C7355] uppercase tracking-wider">
                Không Gian Tĩnh Lặng Của Học Viên
              </div>
              <h1 className="font-serif text-2xl font-bold text-[#2D2A26]">
                Chào bạn, {profile?.full_name || user?.email?.split("@")[0] || "Học viên"}
              </h1>
              <p className="text-xs text-[#7A7165]">
                {user?.email} {profile?.phone ? `• ${profile.phone}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl border border-[#DED7CE] hover:bg-[#FAF8F5] text-xs font-semibold text-[#7A7165] flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng Xuất</span>
            </button>
          </div>
        </div>

        {/* Coach Companion Banner */}
        <div className="p-5 mb-8 rounded-2xl bg-white border border-[#ECE7E1] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#3D5A4C] text-white flex items-center justify-center font-serif text-lg font-bold shadow-xs shrink-0">
              {selectedCoach.avatarLetter}
            </div>
            <div>
              <div className="text-[11px] text-[#8C7355] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#3D5A4C]" />
                <span>Người Hướng Dẫn Đồng Hành Của Bạn</span>
                {selectedCoach.badge && (
                  <span className="px-2 py-0.5 rounded-full bg-[#3D5A4C]/10 text-[#3D5A4C] text-[10px] font-bold">
                    {selectedCoach.badge}
                  </span>
                )}
              </div>
              <h2 className="font-serif text-lg font-bold text-[#2D2A26]">
                {selectedCoach.fullName}
              </h2>
              <p className="text-xs text-[#5C554E] max-w-xl">
                {selectedCoach.expertise} • {selectedCoach.yearsExp} năm kinh nghiệm
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCoachModalOpen(true)}
            className="px-4 py-2 rounded-xl border border-[#3D5A4C]/30 text-[#3D5A4C] hover:bg-[#FAF8F5] text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Chọn / Đổi Người Hướng Dẫn</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#ECE7E1] gap-6 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("chat")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === "chat"
                ? "border-[#3D5A4C] text-[#3D5A4C]"
                : "border-transparent text-[#7A7165] hover:text-[#2D2A26]"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Tâm Sự & Trao Đổi 1:1 Cùng {selectedCoach.fullName}</span>
          </button>

          <button
            onClick={() => setActiveTab("lessons")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === "lessons"
                ? "border-[#3D5A4C] text-[#3D5A4C]"
                : "border-transparent text-[#7A7165] hover:text-[#2D2A26]"
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>Khoá 6 Bài Thiền & Ebook</span>
          </button>

          <button
            onClick={() => setActiveTab("journal")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === "journal"
                ? "border-[#3D5A4C] text-[#3D5A4C]"
                : "border-transparent text-[#7A7165] hover:text-[#2D2A26]"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Sổ Quán Sát Thân Tâm ({journalEntries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("bookings")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === "bookings"
                ? "border-[#3D5A4C] text-[#3D5A4C]"
                : "border-transparent text-[#7A7165] hover:text-[#2D2A26]"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Lịch Hẹn 1:1 ({bookings.length})</span>
          </button>
        </div>

        {/* Tab 1: Chat 1:1 with Selected Coach */}
        {activeTab === "chat" && (
          <div className="zen-card bg-white flex flex-col h-[600px] overflow-hidden border border-[#ECE7E1]">
            {/* Chat header */}
            <div className="px-6 py-4 border-b border-[#ECE7E1] bg-[#FAF8F5] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#3D5A4C] text-white flex items-center justify-center font-serif font-bold text-sm">
                  {selectedCoach.avatarLetter}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#2D2A26]">
                    {selectedCoach.fullName} • Người Đồng Hành
                  </h3>
                  <div className="text-[11px] text-[#3D5A4C] flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Không gian riêng tư và bảo mật tuyệt đối</span>
                  </div>
                </div>
              </div>

              <a
                href="https://meet.google.com/new"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-white border border-[#DED7CE] text-xs font-semibold text-[#3D5A4C] hover:bg-[#FAF8F5] flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Mở Google Meet</span>
              </a>
            </div>

            {/* Chat message stream */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FAF8F5]/40">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-[#3D5A4C]/10 text-[#3D5A4C] flex items-center justify-center">
                    <Heart className="w-7 h-7" />
                  </div>
                  <h4 className="font-serif font-bold text-base text-[#2D2A26]">
                    Chào mừng bạn đến với Không gian Tâm sự Riêng
                  </h4>
                  <p className="text-xs text-[#7A7165] max-w-md leading-relaxed">
                    Đây là không gian riêng giữa bạn và {selectedCoach.fullName}. Bạn có thể chia sẻ những cảm xúc đang bế tắc, những điểm đau trên thân thể hoặc hỏi thêm về cách thực hành thiền. {selectedCoach.fullName} sẽ đọc và phản hồi trực tiếp cho bạn tại đây.
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.is_from_coach ? "items-start" : "items-end"}`}
                  >
                    <div className="text-[11px] text-[#8C847A] mb-1 px-1">
                      {msg.is_from_coach ? (msg.sender_name || selectedCoach.fullName) : "Bạn"} •{" "}
                      {new Date(msg.created_at).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div
                      className={`max-w-md p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        msg.is_from_coach
                          ? "bg-white border border-[#ECE7E1] text-[#2D2A26] rounded-tl-xs shadow-xs"
                          : "bg-[#3D5A4C] text-white rounded-tr-xs shadow-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-[#ECE7E1] bg-white flex items-center gap-3">
              <input
                type="text"
                placeholder={`Nhập tâm sự hoặc câu hỏi của bạn để gửi tới ${selectedCoach.fullName}...`}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 text-xs sm:text-sm px-4 py-3 rounded-xl border border-[#DED7CE] bg-[#FAF8F5] focus:outline-none focus:border-[#3D5A4C]"
              />
              <button
                type="submit"
                disabled={isSending || !newMessage.trim()}
                className="px-5 py-3 rounded-xl zen-btn-primary font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm disabled:opacity-50 shrink-0"
              >
                <span>Gửi</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Lessons & Ebooks */}
        {activeTab === "lessons" && (
          <div className="space-y-8">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#2D2A26] mb-2">
                Hành Trình 6 Bài Thiền & Thấu Hiểu Cảm Xúc
              </h2>
              <p className="text-xs text-[#7A7165]">
                Thực hành theo thứ tự từng bài để bóc tách từng tầng lớp cảm xúc từ bề mặt thân thể về sự tĩnh lặng thuần khiết.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {LESSONS.map((lesson) => (
                <div
                  key={lesson.id}
                  className="zen-card p-6 bg-white flex flex-col justify-between hover:border-[#3D5A4C]/40 transition-all border border-[#ECE7E1]"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#8C7355] font-semibold mb-2">
                      <span>Bài {lesson.orderIndex}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {lesson.durationMinutes} phút
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-[#2D2A26] mb-1">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-[#8C7355] italic mb-3">
                      &quot;{lesson.subtitle}&quot;
                    </p>
                    <p className="text-xs text-[#5C554E] line-clamp-3 mb-4 leading-relaxed">
                      {lesson.coreMeaning}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setActiveLesson(lesson);
                      setIsPlayerOpen(true);
                    }}
                    className="w-full py-2.5 rounded-xl zen-btn-primary text-xs font-semibold flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Luyện Tập Bài Này</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Ebooks List */}
            <div className="pt-6 border-t border-[#ECE7E1]">
              <h3 className="font-serif text-lg font-bold text-[#2D2A26] mb-4">
                Tủ Sách & Tài Liệu Chiêm Nghiệm Đi Kèm
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {EBOOKS.map((eb) => (
                  <div key={eb.id} className="p-4 bg-white rounded-2xl border border-[#ECE7E1] space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-[#3D5A4C]/10 text-[#3D5A4C] flex items-center justify-center mb-2">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <h4 className="font-serif font-bold text-xs text-[#2D2A26] leading-snug">
                        {eb.title}
                      </h4>
                    </div>
                    <a
                      href={eb.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#3D5A4C] font-semibold hover:underline"
                    >
                      <span>Đọc Ebook PDF</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Journal Entries */}
        {activeTab === "journal" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#2D2A26] mb-1">
                  Nhật Ký Quán Sát Thân Tâm Của Bạn
                </h2>
                <p className="text-xs text-[#7A7165]">
                  Lược sử các lần quán sát các điểm đau trên cơ thể và bóc tách các tầng cảm xúc.
                </p>
              </div>

              <Link
                href="/journal"
                className="px-4 py-2 rounded-xl zen-btn-primary text-xs font-semibold flex items-center gap-2 shadow-xs"
              >
                <BookOpen className="w-4 h-4" />
                <span>Viết Nhật Ký Mới</span>
              </Link>
            </div>

            {journalEntries.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-[#ECE7E1] space-y-3">
                <p className="text-xs text-[#7A7165]">
                  Bạn chưa có bản ghi nhật ký nào. Hãy bắt đầu quán sát thân tâm sau mỗi buổi thiền!
                </p>
                <Link
                  href="/journal"
                  className="inline-block px-4 py-2 rounded-xl zen-btn-primary text-xs font-semibold"
                >
                  Mở Sổ Quán Sát Thân Tâm
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {journalEntries.map((j: any, idx: number) => (
                  <div key={j.id || idx} className="p-5 bg-white rounded-2xl border border-[#ECE7E1] space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#3D5A4C]">
                        {j.lesson_order ? `Bài Thiền ${j.lesson_order}` : "Quán sát tự do"}
                      </span>
                      <span className="text-[#9E9589]">
                        {new Date(j.created_at).toLocaleDateString("vi-VN", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    {j.body_spots && j.body_spots.length > 0 && (
                      <div>
                        <div className="text-[11px] font-semibold text-[#8C7355] mb-1">
                          Điểm tắc nghẽn trên thân:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {j.body_spots.map((spot: string, sIdx: number) => (
                            <span key={sIdx} className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                              {spot}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {j.surface_emotions && j.surface_emotions.length > 0 && (
                      <div>
                        <div className="text-[11px] font-semibold text-[#8C7355] mb-1">
                          Tầng cảm xúc bóc tách:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {j.surface_emotions.map((emo: string, eIdx: number) => (
                            <span key={eIdx} className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px]">
                              {emo}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {j.notes && (
                      <div className="text-xs text-[#5C554E] italic bg-[#FAF8F5] p-3 rounded-xl border border-[#ECE7E1]/60">
                        &quot;{j.notes}&quot;
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Bookings */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#2D2A26] mb-1">
                  Lịch Hẹn Tư Vấn 1:1 Đã Đăng Ký
                </h2>
                <p className="text-xs text-[#7A7165]">
                  Theo dõi trạng thái các buổi tư vấn riêng cùng Huấn luyện viên.
                </p>
              </div>

              <Link
                href="/booking"
                className="px-4 py-2 rounded-xl zen-btn-primary text-xs font-semibold flex items-center gap-2 shadow-xs"
              >
                <Calendar className="w-4 h-4" />
                <span>Đặt Lịch Hẹn Mới</span>
              </Link>
            </div>

            {bookings.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-[#ECE7E1] space-y-3">
                <p className="text-xs text-[#7A7165]">
                  Bạn chưa có lịch hẹn tư vấn nào. Hãy đăng ký một buổi tư vấn 1:1 khi gặp bế tắc cảm xúc!
                </p>
                <Link
                  href="/booking"
                  className="inline-block px-4 py-2 rounded-xl zen-btn-primary text-xs font-semibold"
                >
                  Đăng Ký Tư Vấn 1:1
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((b: any) => (
                  <div key={b.id} className="p-5 bg-white rounded-2xl border border-[#ECE7E1] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#2D2A26]">{b.topic}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.status === "confirmed"
                            ? "bg-emerald-100 text-emerald-800"
                            : b.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {b.status === "confirmed" ? "Đã xác nhận" : b.status === "completed" ? "Đã xong" : "Chờ xác nhận"}
                        </span>
                      </div>
                      <div className="text-xs text-[#8C7355]">
                        Ngày {new Date(b.booking_date).toLocaleDateString("vi-VN")} • Khung giờ: {b.time_slot}
                      </div>
                      <div className="text-xs text-[#7A7165]">
                        Hình thức: {b.mode === "online" ? "Online qua Google Meet" : "Trực tiếp (Hà Nội)"}
                      </div>
                    </div>

                    {b.mode === "online" && (
                      <a
                        href="https://meet.google.com/new"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-center"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Vào Phòng Google Meet</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal Lựa Chọn Coach Đồng Hành */}
      {isCoachModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b border-[#ECE7E1] pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#2D2A26]">
                  Lựa Chọn Người Hướng Dẫn (Coach) Đồng Hành
                </h3>
                <p className="text-xs text-[#7A7165] mt-1">
                  Chọn Huấn luyện viên phù hợp với năng lượng và vấn đề bế tắc bạn đang gặp phải
                </p>
              </div>
              <button
                onClick={() => setIsCoachModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF8F5] flex items-center justify-center text-[#7A7165] hover:bg-[#ECE7E1] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {coaches.map((c) => (
                <div
                  key={c.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    selectedCoach.id === c.id
                      ? "border-[#3D5A4C] bg-[#FAF8F5]"
                      : "border-[#ECE7E1] hover:border-[#3D5A4C]/40 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-full bg-[#3D5A4C] text-white flex items-center justify-center font-serif text-lg font-bold shrink-0 shadow-xs">
                        {c.avatarLetter}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-base text-[#2D2A26]">
                            {c.fullName}
                          </h4>
                          {c.badge && (
                            <span className="px-2 py-0.5 rounded-full bg-[#3D5A4C]/10 text-[#3D5A4C] text-[10px] font-bold">
                              {c.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#8C7355] font-semibold mt-0.5">
                          {c.expertise}
                        </div>
                        <p className="text-xs text-[#5C554E] mt-2 leading-relaxed">
                          {c.bio}
                        </p>
                        <div className="text-[11px] text-[#9E9589] mt-2 flex items-center gap-3">
                          <span>{c.yearsExp} năm kinh nghiệm</span>
                          <span>•</span>
                          <span>Liên hệ Zalo: {c.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {selectedCoach.id === c.id ? (
                        <span className="px-3 py-1.5 rounded-xl bg-[#3D5A4C] text-white text-xs font-semibold flex items-center gap-1 shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                          <span>Đang Chọn</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSelectCoach(c)}
                          className="px-3.5 py-1.5 rounded-xl border border-[#3D5A4C] text-[#3D5A4C] hover:bg-[#3D5A4C] hover:text-white text-xs font-semibold transition-all"
                        >
                          Chọn Đồng Hành
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Zen Player Modal */}
      <ZenPlayerModal
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        initialLesson={activeLesson}
      />
    </div>
  );
}
