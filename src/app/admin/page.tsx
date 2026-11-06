"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Calendar, 
  ShoppingBag, 
  CheckCircle2, 
  Phone, 
  Video, 
  MessageCircle, 
  RefreshCw, 
  Lock, 
  Search,
  Send,
  User,
  Heart
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";

interface Booking {
  id: string;
  full_name: string;
  phone: string;
  topic: string;
  mode: string;
  booking_date: string;
  time_slot: string;
  symptoms_note?: string;
  status: string;
  created_at: string;
}

interface Order {
  id: string;
  order_code: string;
  full_name: string;
  phone: string;
  package_name: string;
  amount: number;
  status: string;
  created_at: string;
  paid_at?: string;
}

interface ChatMessage {
  id: string;
  user_id: string;
  sender_name: string;
  content: string;
  is_from_coach: boolean;
  created_at: string;
}

interface StudentThread {
  user_id: string;
  student_name: string;
  last_message: string;
  updated_at: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinCode, setPinCode] = useState("");
  const [activeTab, setActiveTab] = useState<"messages" | "bookings" | "orders">("messages");
  
  // Data states
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [threads, setThreads] = useState<StudentThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<StudentThread | null>(null);
  const [currentConversation, setCurrentConversation] = useState<ChatMessage[]>([]);
  const [coachReply, setCoachReply] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Mã PIN quản trị mặc định (có thể đổi)
  const ADMIN_PIN = "8888";

  useEffect(() => {
    const savedAuth = sessionStorage.getItem("admin_auth");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
      fetchData();
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentConversation]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode === ADMIN_PIN) {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_auth", "true");
      fetchData();
    } else {
      alert("Mã PIN quản trị không đúng. Vui lòng thử lại!");
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      
      // 1. Lấy danh sách tin nhắn trao đổi
      const { data: mData } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (mData) {
        // Nhóm tin nhắn theo user_id thành các luồng học viên
        const map = new Map<string, StudentThread>();
        mData.forEach((m: any) => {
          if (!map.has(m.user_id)) {
            map.set(m.user_id, {
              user_id: m.user_id,
              student_name: m.sender_name || "Học viên",
              last_message: m.content,
              updated_at: m.created_at,
            });
          }
        });
        const threadList = Array.from(map.values());
        setThreads(threadList);
        if (threadList.length > 0 && !selectedThread) {
          selectStudentThread(threadList[0]);
        }
      }

      // 2. Lấy danh sách lịch hẹn
      const { data: bData } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });
      if (bData) setBookings(bData);

      // 3. Lấy danh sách đơn hàng VietQR
      const { data: oData } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (oData) setOrders(oData);
    } catch (err) {
      console.error("Lỗi tải dữ liệu admin:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectStudentThread = async (t: StudentThread) => {
    setSelectedThread(t);
    const supabase = createClient();
    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .eq("user_id", t.user_id)
      .order("created_at", { ascending: true });
    if (msgs) setCurrentConversation(msgs);
  };

  const handleSendCoachReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachReply.trim() || !selectedThread) return;

    setIsSending(true);
    const replyText = coachReply.trim();
    setCoachReply("");

    try {
      const supabase = createClient();
      const newMsg = {
        user_id: selectedThread.user_id,
        sender_name: "Chị Minh Hằng",
        content: replyText,
        is_from_coach: true,
      };

      const { data } = await supabase
        .from("messages")
        .insert(newMsg)
        .select()
        .single();

      if (data) {
        setCurrentConversation((prev) => [...prev, data]);
      } else {
        setCurrentConversation((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            ...newMsg,
            created_at: new Date().toISOString(),
          },
        ]);
      }
      showFlashMessage("Đã gửi phản hồi đến học viên!");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdateBookingStatus = async (id: string, newStatus: string) => {
    try {
      const supabase = createClient();
      await supabase.from("bookings").update({ status: newStatus }).eq("id", id);
      setBookings(bookings.map((b) => (b.id === id ? { ...b, status: newStatus } : b)));
      showFlashMessage("Đã cập nhật trạng thái lịch hẹn!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (id: string, newStatus: string) => {
    try {
      const supabase = createClient();
      await supabase.from("orders").update({ 
        status: newStatus,
        paid_at: newStatus === "paid" ? new Date().toISOString() : null 
      }).eq("id", id);
      setOrders(orders.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
      showFlashMessage("Đã cập nhật đơn hàng & kích hoạt học viên!");
    } catch (err) {
      console.error(err);
    }
  };

  const showFlashMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        {/* Top header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#8C7355] hover:text-[#3D5A4C] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay về trang chủ</span>
          </Link>

          {isAuthenticated && (
            <div className="flex items-center gap-3">
              <button
                onClick={fetchData}
                disabled={isLoading}
                className="px-3.5 py-1.5 rounded-xl border border-[#DED7CE] bg-white hover:bg-[#F5F2ED] text-xs font-semibold text-[#3D5A4C] flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                <span>Làm Mới</span>
              </button>
              <button
                onClick={() => {
                  sessionStorage.removeItem("admin_auth");
                  setIsAuthenticated(false);
                }}
                className="px-3.5 py-1.5 rounded-xl border border-[#E2DDD5] bg-[#F4EFE9] text-xs font-semibold text-[#7A7165] hover:bg-[#EAE4DC]"
              >
                Đăng Xuất
              </button>
            </div>
          )}
        </div>

        {/* PIN Login screen */}
        {!isAuthenticated ? (
          <div className="max-w-md mx-auto my-12 zen-card p-8 bg-white text-center space-y-6">
            <div className="w-14 h-14 rounded-full bg-[#3D5A4C]/10 text-[#3D5A4C] mx-auto flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#2D2A26]">
                Không Gian Quản Trị • Chị Minh Hằng
              </h2>
              <p className="text-xs text-[#7A7165] mt-1.5">
                Nhập mã PIN để trả lời học viên, quản lý lịch hẹn và đơn hàng VietQR
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="Mã PIN (Mặc định: 8888)"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-full text-center text-lg tracking-widest px-4 py-3 rounded-xl border border-[#DED7CE] bg-[#FAF8F5] focus:outline-none focus:border-[#3D5A4C] font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl zen-btn-primary font-semibold text-sm shadow-sm"
              >
                Vào Bảng Điều Khiển
              </button>
            </form>
          </div>
        ) : (
          /* Admin Dashboard Content */
          <div className="space-y-6">
            {/* Title & Notification */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#ECE7E1]">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#8C7355] flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-[#3D5A4C]" />
                  <span>Cổng Dành Cho Chị Minh Hằng</span>
                </div>
                <h1 className="font-serif text-2xl font-bold text-[#2D2A26]">
                  Tương Tác Học Viên & Vận Hành
                </h1>
              </div>

              {/* Search input */}
              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 text-[#9E9589] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm học viên, số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-[#DED7CE] bg-[#FAF8F5] focus:outline-none focus:border-[#3D5A4C]"
                />
              </div>
            </div>

            {message && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs text-center font-medium animate-fade-in">
                {message}
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex border-b border-[#ECE7E1] gap-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab("messages")}
                className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
                  activeTab === "messages"
                    ? "border-[#3D5A4C] text-[#3D5A4C]"
                    : "border-transparent text-[#7A7165] hover:text-[#2D2A26]"
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>Hộp Thư Tâm Sự Với Học Viên ({threads.length})</span>
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

              <button
                onClick={() => setActiveTab("orders")}
                className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
                  activeTab === "orders"
                    ? "border-[#3D5A4C] text-[#3D5A4C]"
                    : "border-transparent text-[#7A7165] hover:text-[#2D2A26]"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Đơn Hàng VietQR ({orders.length})</span>
              </button>
            </div>

            {/* Tab 1: Messages / Conversation Center */}
            {activeTab === "messages" && (
              <div className="zen-card bg-white grid grid-cols-1 md:grid-cols-12 h-[650px] overflow-hidden border border-[#ECE7E1]">
                {/* Left list: Student threads */}
                <div className="md:col-span-4 border-r border-[#ECE7E1] flex flex-col h-full bg-[#FAF8F5]/50">
                  <div className="p-4 border-b border-[#ECE7E1] font-serif font-bold text-sm text-[#2D2A26]">
                    Danh sách học viên ({threads.length})
                  </div>
                  <div className="flex-1 overflow-y-auto divide-y divide-[#ECE7E1]">
                    {threads.length === 0 ? (
                      <div className="p-8 text-center text-xs text-[#8C847A]">
                        Chưa có học viên nào gửi tin nhắn.
                      </div>
                    ) : (
                      threads.map((t) => (
                        <button
                          key={t.user_id}
                          onClick={() => selectStudentThread(t)}
                          className={`w-full p-4 text-left flex items-start gap-3 transition-colors ${
                            selectedThread?.user_id === t.user_id
                              ? "bg-white border-l-4 border-[#3D5A4C] shadow-xs"
                              : "hover:bg-white/80"
                          }`}
                        >
                          <div className="w-9 h-9 rounded-full bg-[#3D5A4C]/10 text-[#3D5A4C] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            {t.student_name[0]?.toUpperCase() || <User className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-xs text-[#2D2A26] truncate">
                              {t.student_name}
                            </div>
                            <div className="text-[11px] text-[#7A7165] truncate mt-0.5">
                              {t.last_message}
                            </div>
                            <div className="text-[10px] text-[#A39A8F] mt-1">
                              {new Date(t.updated_at).toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "2-digit",
                                month: "2-digit",
                              })}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Right chat panel: Coach replies */}
                <div className="md:col-span-8 flex flex-col h-full">
                  {selectedThread ? (
                    <>
                      {/* Chat header */}
                      <div className="px-6 py-4 border-b border-[#ECE7E1] bg-white flex items-center justify-between">
                        <div>
                          <div className="font-serif font-bold text-sm text-[#2D2A26]">
                            Học viên: {selectedThread.student_name}
                          </div>
                          <div className="text-[11px] text-[#8C7355]">
                            Đoạn hội thoại tư vấn & đồng hành 1:1
                          </div>
                        </div>

                        <a
                          href="https://meet.google.com/new"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-[#3D5A4C] text-white hover:bg-[#31493D] text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Mở Meet Tư Vấn</span>
                        </a>
                      </div>

                      {/* Chat messages stream */}
                      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FAF8F5]/30">
                        {currentConversation.map((m) => (
                          <div
                            key={m.id}
                            className={`flex flex-col ${m.is_from_coach ? "items-end" : "items-start"}`}
                          >
                            <div className="text-[11px] text-[#8C847A] mb-1 px-1">
                              {m.is_from_coach ? "Bạn (Chị Minh Hằng)" : selectedThread.student_name} •{" "}
                              {new Date(m.created_at).toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                            <div
                              className={`max-w-md p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                                m.is_from_coach
                                  ? "bg-[#3D5A4C] text-white rounded-tr-xs shadow-sm"
                                  : "bg-white border border-[#ECE7E1] text-[#2D2A26] rounded-tl-xs shadow-xs"
                              }`}
                            >
                              {m.content}
                            </div>
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Reply form */}
                      <form onSubmit={handleSendCoachReply} className="p-4 border-t border-[#ECE7E1] bg-white flex items-center gap-3">
                        <input
                          type="text"
                          placeholder={`Gõ lời nhắn / phản hồi cho bạn ${selectedThread.student_name}...`}
                          value={coachReply}
                          onChange={(e) => setCoachReply(e.target.value)}
                          className="flex-1 text-xs sm:text-sm px-4 py-3 rounded-xl border border-[#DED7CE] bg-[#FAF8F5] focus:outline-none focus:border-[#3D5A4C]"
                        />
                        <button
                          type="submit"
                          disabled={isSending || !coachReply.trim()}
                          className="px-5 py-3 rounded-xl zen-btn-primary font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm disabled:opacity-50 shrink-0"
                        >
                          <span>Gửi Phản Hồi</span>
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 text-xs text-[#8C847A]">
                      Chọn một học viên ở cột bên trái để bắt đầu đọc và trả lời tâm sự.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Bookings List */}
            {activeTab === "bookings" && (
              <div className="space-y-4">
                {bookings.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-[#DDD7CD] text-xs text-[#8C847A]">
                    Chưa có lịch hẹn nào được ghi nhận.
                  </div>
                ) : (
                  bookings.map((b) => (
                    <div
                      key={b.id}
                      className="zen-card p-5 bg-white border border-[#ECE7E1] space-y-4 hover:border-[#3D5A4C]/40 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F2EDE4] pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-base text-[#2D2A26]">
                              {b.full_name}
                            </span>
                            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                              b.status === "confirmed"
                                ? "bg-emerald-100 text-emerald-800"
                                : b.status === "completed"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                            }`}>
                              {b.status === "confirmed" ? "Đã Xác Nhận" : b.status === "completed" ? "Đã Hoàn Thành" : "Chờ Xử Lý"}
                            </span>
                          </div>
                          <div className="text-xs text-[#7A7165] mt-0.5 flex items-center gap-3">
                            <span>SĐT: <strong className="text-[#2D2A26]">{b.phone}</strong></span>
                            <span>•</span>
                            <span className="capitalize">Hình thức: <strong>{b.mode === "online" ? "Google Meet" : "Trực Tiếp (Hà Nội)"}</strong></span>
                          </div>
                        </div>

                        {/* Quick actions for Coach */}
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${b.phone}`}
                            className="p-2 rounded-xl border border-[#DED7CE] hover:bg-[#FAF8F5] text-[#3D5A4C]"
                            title="Gọi điện"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                          <a
                            href={`https://zalo.me/${b.phone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                            title="Nhắn tin Zalo"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                          {b.mode === "online" && (
                            <a
                              href="https://meet.google.com/new"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-[#3D5A4C] text-white hover:bg-[#31493D] text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>Mở Meet</span>
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="p-3 bg-[#FAF8F5] rounded-xl space-y-1">
                          <div className="text-[11px] text-[#8C847A] uppercase font-bold">Chủ đề tư vấn:</div>
                          <div className="font-semibold text-[#2D2A26]">{b.topic}</div>
                        </div>
                        <div className="p-3 bg-[#FAF8F5] rounded-xl space-y-1">
                          <div className="text-[11px] text-[#8C847A] uppercase font-bold">Thời gian hẹn:</div>
                          <div className="font-semibold text-[#8C7355]">
                            {b.booking_date} ({b.time_slot})
                          </div>
                        </div>
                      </div>

                      {/* Intake note */}
                      {b.symptoms_note && (
                        <div className="p-3 rounded-xl bg-[#F9F6F0] border-l-4 border-[#8C7355] text-xs space-y-1">
                          <div className="font-bold text-[#8C7355]">Vấn đề & Tâm sự của học viên trước buổi gặp:</div>
                          <p className="text-[#4A453F] leading-relaxed italic">
                            "{b.symptoms_note}"
                          </p>
                        </div>
                      )}

                      {/* Status toggle button */}
                      <div className="flex items-center justify-end gap-2 pt-1">
                        {b.status !== "confirmed" && (
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, "confirmed")}
                            className="px-3 py-1.5 rounded-lg border border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Đánh dấu Đã Xác Nhận</span>
                          </button>
                        )}
                        {b.status !== "completed" && (
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, "completed")}
                            className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-semibold flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Đã Tư Vấn Xong</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 3: Orders List */}
            {activeTab === "orders" && (
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-[#DDD7CD] text-xs text-[#8C847A]">
                    Chưa có đơn hàng nào được tạo.
                  </div>
                ) : (
                  orders.map((o) => (
                    <div
                      key={o.id}
                      className="zen-card p-5 bg-white border border-[#ECE7E1] space-y-4 hover:border-[#3D5A4C]/40 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F2EDE4] pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-[#3D5A4C] bg-[#3D5A4C]/10 px-2.5 py-0.5 rounded-md">
                              {o.order_code}
                            </span>
                            <span className="font-serif font-bold text-base text-[#2D2A26]">
                              {o.full_name}
                            </span>
                            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                              o.status === "paid"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}>
                              {o.status === "paid" ? "Đã Thanh Toán" : "Chờ Chuyển Khoản"}
                            </span>
                          </div>
                          <div className="text-xs text-[#7A7165] mt-1">
                            SĐT: <strong className="text-[#2D2A26]">{o.phone}</strong> • Gói: <strong className="text-[#8C7355]">{o.package_name}</strong>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-serif font-bold text-lg text-[#2D2A26]">
                            {Number(o.amount).toLocaleString("vi-VN")} đ
                          </div>
                          <div className="text-[11px] text-[#A39A8F]">
                            {new Date(o.created_at).toLocaleDateString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric"
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-1">
                        <a
                          href={`https://zalo.me/${o.phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-700 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Nhắn Zalo cho học viên</span>
                        </a>

                        <div className="flex items-center gap-2">
                          {o.status !== "paid" ? (
                            <button
                              onClick={() => handleUpdateOrderStatus(o.id, "paid")}
                              className="px-4 py-2 rounded-xl bg-[#3D5A4C] text-white hover:bg-[#31493D] text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Xác Nhận Đã Nhận Tiền</span>
                            </button>
                          ) : (
                            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Đã kích hoạt khóa học</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
