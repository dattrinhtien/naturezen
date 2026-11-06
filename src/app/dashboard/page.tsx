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
  FileText
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ZenPlayerModal from "@/components/ZenPlayerModal";
import { createClient } from "@/lib/supabase/client";
import { LESSONS, Lesson, EBOOKS } from "@/lib/data";

interface MessageItem {
  id: string;
  sender_id: string;
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

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

    // Lấy tin nhắn trao đổi với Chị Minh Hằng
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
        <div className="zen-card p-6 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
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
            <span>Tâm Sự & Trao Đổi 1:1 Với Chị Minh Hằng</span>
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

        {/* Tab 1: Chat 1:1 with Coach Minh Hằng */}
        {activeTab === "chat" && (
          <div className="zen-card bg-white flex flex-col h-[600px] overflow-hidden border border-[#ECE7E1]">
            {/* Chat header */}
            <div className="px-6 py-4 border-b border-[#ECE7E1] bg-[#FAF8F5] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#3D5A4C] text-white flex items-center justify-center font-serif font-bold text-sm">
                  MH
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#2D2A26]">
                    Chị Minh Hằng • Người Đồng Hành
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
                    Đây là không gian riêng giữa bạn và Chị Minh Hằng. Bạn có thể chia sẻ những cảm xúc đang bế tắc, những điểm đau trên thân thể hoặc hỏi thêm về cách thực hành thiền. Chị Minh Hằng sẽ đọc và phản hồi trực tiếp cho bạn tại đây.
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.is_from_coach ? "items-start" : "items-end"}`}
                  >
                    <div className="text-[11px] text-[#8C847A] mb-1 px-1">
                      {msg.is_from_coach ? "Chị Minh Hằng" : "Bạn"} •{" "}
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
                placeholder="Nhập tâm sự, câu hỏi hoặc cảm xúc bế tắc của bạn để chia sẻ với Chị Minh Hằng..."
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
                Toàn bộ audio chất lượng cao được lưu trữ an toàn trên Supabase Cloud Storage.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {LESSONS.map((lesson) => (
                <div
                  key={lesson.id}
                  className="zen-card p-6 bg-white border border-[#ECE7E1] flex flex-col justify-between hover:border-[#3D5A4C] transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="w-8 h-8 rounded-full bg-[#3D5A4C]/10 text-[#3D5A4C] font-bold text-xs flex items-center justify-center">
                        0{lesson.orderIndex}
                      </span>
                      <span className="text-xs font-medium text-[#8C7355] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {lesson.durationMinutes} phút
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-base text-[#2D2A26] mb-2">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-[#7A7165] line-clamp-3 mb-4 leading-relaxed">
                      {lesson.coreMeaning}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#ECE7E1] flex items-center justify-between">
                    <button
                      onClick={() => {
                        setActiveLesson(lesson);
                        setIsPlayerOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl zen-btn-primary text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Bật Bài Thiền</span>
                    </button>
                    {lesson.ebookPdfUrl && (
                      <a
                        href={lesson.ebookPdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#3D5A4C] font-medium hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Ebook</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Ebook Library */}
            <div className="pt-8 border-t border-[#ECE7E1]">
              <h3 className="font-serif text-lg font-bold text-[#2D2A26] mb-4">
                Tài Liệu & Ebook Gốc Tải Về
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {EBOOKS.map((eb) => (
                  <a
                    key={eb.id}
                    href={eb.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-xl bg-white border border-[#ECE7E1] hover:border-[#3D5A4C] transition-all flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-[#3D5A4C]" />
                      <span className="font-semibold text-[#2D2A26]">{eb.title}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#8C7355]" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Journal List */}
        {activeTab === "journal" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#2D2A26]">
                  Lịch Sử Sổ Quán Sát Của Bạn ({journalEntries.length})
                </h2>
                <p className="text-xs text-[#7A7165]">
                  Ghi chép hành trình quan sát cảm xúc và điểm tắc trên thân thể.
                </p>
              </div>
              <Link
                href="/journal"
                className="px-4 py-2 rounded-xl zen-btn-primary text-xs font-semibold flex items-center gap-2 shadow-xs"
              >
                <span>Viết Nhật Ký Hôm Nay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {journalEntries.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-[#DDD7CD] text-xs text-[#8C847A] space-y-3">
                <BookOpen className="w-8 h-8 text-[#8C7355] mx-auto opacity-60" />
                <p>Bạn chưa có bài ghi chép quán sát nào.</p>
                <Link href="/journal" className="inline-block text-[#3D5A4C] font-semibold underline">
                  Bấm vào đây để viết bài đầu tiên
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {journalEntries.map((j) => (
                  <div key={j.id} className="zen-card p-5 bg-white space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#8C7355] font-semibold">
                      <span>{j.date || new Date(j.created_at).toLocaleDateString("vi-VN")}</span>
                      <div className="flex gap-4">
                        <span>Tâm trước thiền: <strong>{j.mood_before || j.moodBefore}/5</strong></span>
                        <span>Tâm sau thiền: <strong className="text-[#3D5A4C]">{j.mood_after || j.moodAfter}/5</strong></span>
                      </div>
                    </div>

                    {(j.body_spots || j.bodySpots) && (
                      <div className="flex flex-wrap gap-1.5">
                        {(j.body_spots || j.bodySpots).map((spot: string, idx: number) => (
                          <span key={idx} className="px-2.5 py-0.5 rounded-full bg-[#3D5A4C]/10 text-[#3D5A4C] text-[11px] font-medium">
                            {spot}
                          </span>
                        ))}
                      </div>
                    )}

                    {(j.deep_layers || j.deepLayerText) && (
                      <div className="text-xs border-l-2 border-[#8C7355] pl-3 py-1 text-[#4A453F]">
                        <span className="font-semibold text-[#8C7355] block mb-0.5">Tầng sâu bên dưới:</span>
                        {j.deep_layers || j.deepLayerText}
                      </div>
                    )}

                    {(j.notes) && (
                      <div className="text-xs border-l-2 border-[#3D5A4C] pl-3 py-1 text-[#4A453F]">
                        <span className="font-semibold text-[#3D5A4C] block mb-0.5">Lời yêu thương bản thân:</span>
                        {j.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Bookings List */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#2D2A26]">
                  Lịch Hẹn Tư Vấn 1:1 Cùng Chị Minh Hằng
                </h2>
                <p className="text-xs text-[#7A7165]">
                  Thông tin các buổi tư vấn riêng đã được đặt lịch.
                </p>
              </div>
              <Link
                href="/booking"
                className="px-4 py-2 rounded-xl zen-btn-primary text-xs font-semibold flex items-center gap-2 shadow-xs"
              >
                <span>Đặt Thêm Lịch Hẹn Mới</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {bookings.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-[#DDD7CD] text-xs text-[#8C847A] space-y-3">
                <Calendar className="w-8 h-8 text-[#8C7355] mx-auto opacity-60" />
                <p>Bạn chưa có lịch hẹn tư vấn 1:1 nào.</p>
                <Link href="/booking" className="inline-block text-[#3D5A4C] font-semibold underline">
                  Bấm vào đây để đặt lịch hẹn với Chị Minh Hằng
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((b) => (
                  <div key={b.id} className="zen-card p-5 bg-white space-y-3">
                    <div className="flex items-center justify-between border-b border-[#F2EDE4] pb-2">
                      <div className="font-serif font-bold text-sm text-[#2D2A26]">
                        {b.topic}
                      </div>
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                        b.status === "confirmed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {b.status === "confirmed" ? "Đã Xác Nhận" : "Chờ Xử Lý"}
                      </span>
                    </div>

                    <div className="text-xs text-[#7A7165] flex flex-wrap items-center gap-4">
                      <span>Thời gian: <strong className="text-[#2D2A26]">{b.booking_date} ({b.time_slot})</strong></span>
                      <span>Hình thức: <strong className="text-[#3D5A4C] capitalize">{b.mode === "online" ? "Google Meet" : "Trực Tiếp (Hà Nội)"}</strong></span>
                    </div>

                    {b.mode === "online" && (
                      <div className="pt-2">
                        <a
                          href="https://meet.google.com/new"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3D5A4C] text-white text-xs font-semibold hover:bg-[#31493D]"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Vào Phòng Google Meet</span>
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Zen Player Modal */}
      <ZenPlayerModal
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        initialLesson={activeLesson}
      />
    </div>
  );
}

