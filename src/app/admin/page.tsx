"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  MessageCircle, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Search, 
  Send, 
  RefreshCw, 
  User, 
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Video,
  Lock,
  ArrowLeft,
  ArrowRight,
  Filter,
  Check,
  X,
  LogIn,
  LogOut,
  Mail,
  AlertCircle,
  Loader2,
  Users,
  Award,
  UserCheck,
  UserX,
  Edit3,
  Phone
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_COACHES, CoachProfile } from "@/lib/data";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: "student" | "coach" | "admin";
  coach_status?: string; // 'none' | 'pending' | 'approved' | 'rejected'
  bio?: string;
  expertise?: string;
  years_exp?: number;
  meet_url?: string;
  created_at: string;
}

interface Booking {
  id: string;
  full_name: string;
  phone: string;
  topic: string;
  mode: string;
  booking_date: string;
  time_slot: string;
  symptoms_note: string;
  status: string;
  created_at: string;
  coach_id?: string;
  coach_name?: string;
}

interface Order {
  id: string;
  order_code: string;
  full_name: string;
  phone: string;
  package_name: string;
  package_code: string;
  amount: number;
  status: string;
  created_at: string;
  paid_at?: string;
}

interface ChatMessage {
  id: string;
  user_id: string;
  coach_id?: string;
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
  coach_id?: string;
}

export default function AdminPage() {
  const router = useRouter();

  // Auth & Role states
  const [authStatus, setAuthStatus] = useState<"checking" | "unauthenticated" | "unauthorized" | "authorized">("checking");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);

  // Login form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<"users" | "messages" | "bookings" | "orders" | "coach_profile">("users");
  
  // Data lists
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userFilter, setUserFilter] = useState<"all" | "coach" | "student" | "pending">("all");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [threads, setThreads] = useState<StudentThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<StudentThread | null>(null);
  const [currentConversation, setCurrentConversation] = useState<ChatMessage[]>([]);
  const [coachReply, setCoachReply] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  // Coach personal profile editing (for logged in coaches)
  const [coachBio, setCoachBio] = useState("");
  const [coachExpertise, setCoachExpertise] = useState("");
  const [coachYearsExp, setCoachYearsExp] = useState(5);
  const [coachMeetUrl, setCoachMeetUrl] = useState("");
  const [isSavingCoachProfile, setIsSavingCoachProfile] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentConversation]);

  // Lắng nghe tin nhắn mới theo thời gian thực (Realtime)
  useEffect(() => {
    if (!selectedThread) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`admin_chat_${selectedThread.user_id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `user_id=eq.${selectedThread.user_id}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setCurrentConversation((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedThread]);

  // Kiểm tra vai trò của người dùng hiện tại
  const checkAdminAuth = async () => {
    setAuthStatus("checking");
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setAuthStatus("unauthenticated");
        return;
      }

      setCurrentUser(user);

      // Tra cứu bảng profiles để xác định vai trò
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setCurrentProfile(profile);

      if (profile && (profile.role === "admin" || profile.role === "coach")) {
        setAuthStatus("authorized");
        // Nếu là Admin mặc định mở tab users, nếu là Coach mặc định mở tab messages
        if (profile.role === "coach") {
          setActiveTab("messages");
          setCoachBio(profile.bio || "");
          setCoachExpertise(profile.expertise || "");
          setCoachYearsExp(profile.years_exp || 5);
          setCoachMeetUrl(profile.meet_url || "");
        } else {
          setActiveTab("users");
        }
        fetchData(profile);
      } else {
        setAuthStatus("unauthorized");
      }
    } catch (err) {
      console.error("Lỗi xác thực quyền:", err);
      setAuthStatus("unauthenticated");
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        setLoginError(
          error.message === "Invalid login credentials"
            ? "Email hoặc mật khẩu không chính xác."
            : error.message
        );
        setIsLoggingIn(false);
        return;
      }

      if (data.user) {
        setCurrentUser(data.user);
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        setCurrentProfile(profile);

        if (profile && (profile.role === "admin" || profile.role === "coach")) {
          setAuthStatus("authorized");
          if (profile.role === "coach") {
            setActiveTab("messages");
          } else {
            setActiveTab("users");
          }
          fetchData(profile);
        } else {
          setAuthStatus("unauthorized");
        }
      }
    } catch {
      setLoginError("Đã có lỗi xảy ra khi kết nối. Vui lòng thử lại!");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setCurrentUser(null);
    setCurrentProfile(null);
    setAuthStatus("unauthenticated");
  };

  const fetchData = async (userProf?: UserProfile | null) => {
    setIsLoading(true);
    const prof = userProf || currentProfile;
    try {
      const supabase = createClient();
      
      // 1. Nếu là Admin, lấy toàn bộ danh sách tài khoản profiles
      if (prof?.role === "admin") {
        const { data: uData } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });
        if (uData) setUsers(uData);
      }

      // 2. Lấy danh sách tin nhắn trao đổi
      let msgQuery = supabase.from("messages").select("*").order("created_at", { ascending: false });
      if (prof?.role === "coach") {
        // Coach lọc các tin nhắn của chính mình hoặc chưa gán
        msgQuery = msgQuery.or(`coach_id.eq.${prof.id},coach_id.is.null`);
      }
      const { data: mData } = await msgQuery;

      if (mData) {
        const map = new Map<string, StudentThread>();
        mData.forEach((m: any) => {
          if (!map.has(m.user_id)) {
            map.set(m.user_id, {
              user_id: m.user_id,
              student_name: m.sender_name || "Học viên",
              last_message: m.content,
              updated_at: m.created_at,
              coach_id: m.coach_id,
            });
          }
        });
        const threadList = Array.from(map.values());
        setThreads(threadList);
        if (threadList.length > 0 && !selectedThread) {
          selectStudentThread(threadList[0]);
        }
      }

      // 3. Lấy danh sách lịch hẹn
      let bookingQuery = supabase.from("bookings").select("*").order("created_at", { ascending: false });
      if (prof?.role === "coach") {
        bookingQuery = bookingQuery.or(`coach_id.eq.${prof.id},coach_id.is.null`);
      }
      const { data: bData } = await bookingQuery;
      if (bData) setBookings(bData);

      // 4. Lấy danh sách đơn hàng VietQR
      const { data: oData } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (oData) setOrders(oData);
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Admin thay đổi vai trò người dùng (Phê duyệt Coach, chuyển về học viên, v.v.)
  const handleUpdateUserRole = async (userId: string, newRole: "student" | "coach" | "admin", newStatus?: string) => {
    try {
      const supabase = createClient();
      const updateData: any = { role: newRole };
      if (newStatus) updateData.coach_status = newStatus;
      if (newRole === "coach" && !newStatus) updateData.coach_status = "approved";

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", userId);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...updateData } : u))
      );
      showFlashMessage(`Đã cập nhật vai trò người dùng thành: ${newRole.toUpperCase()}`);
    } catch (err) {
      console.error(err);
      showFlashMessage("Không thể cập nhật vai trò người dùng.");
    }
  };

  // Coach lưu thông tin giới thiệu chuyên môn
  const handleSaveCoachProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSavingCoachProfile(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({
          bio: coachBio,
          expertise: coachExpertise,
          years_exp: Number(coachYearsExp),
          meet_url: coachMeetUrl.trim() || null,
        })
        .eq("id", currentUser.id);

      if (error) throw error;

      showFlashMessage("Đã cập nhật hồ sơ chuyên môn của bạn!");
      if (currentProfile) {
        setCurrentProfile({
          ...currentProfile,
          bio: coachBio,
          expertise: coachExpertise,
          years_exp: Number(coachYearsExp),
          meet_url: coachMeetUrl.trim() || undefined,
        });
      }
    } catch (err) {
      console.error(err);
      showFlashMessage("Lỗi khi lưu hồ sơ chuyên môn.");
    } finally {
      setIsSavingCoachProfile(false);
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
        coach_id: currentUser?.id || null,
        sender_id: currentUser?.id || null,
        sender_name: currentProfile?.full_name || "Huấn Luyện Viên",
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

  const isAdmin = currentProfile?.role === "admin";
  const isCoach = currentProfile?.role === "coach";

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.includes(searchTerm);
    
    if (!matchesSearch) return false;
    if (userFilter === "coach") return u.role === "coach";
    if (userFilter === "student") return u.role === "student";
    if (userFilter === "pending") return u.coach_status === "pending";
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#8C7355] hover:text-[#3D5A4C] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay về trang chủ</span>
          </Link>

          {authStatus === "authorized" && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-[#2D2A26]">
                  {currentProfile?.full_name || currentUser?.email}
                </div>
                <div className="text-[10px] text-[#3D5A4C] font-semibold uppercase tracking-wider flex items-center justify-end gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#3D5A4C]" />
                  <span>
                    {isAdmin ? "Tổng Quản Trị (Admin)" : "Người Hướng Dẫn (Coach)"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => fetchData()}
                disabled={isLoading}
                className="px-3.5 py-1.5 rounded-xl border border-[#DED7CE] bg-white hover:bg-[#F5F2ED] text-xs font-semibold text-[#3D5A4C] flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                <span>Làm Mới</span>
              </button>

              <button
                onClick={handleLogout}
                className="px-3.5 py-1.5 rounded-xl border border-[#E2DDD5] bg-[#F4EFE9] text-xs font-semibold text-[#7A7165] hover:bg-[#EAE4DC] flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng Xuất</span>
              </button>
            </div>
          )}
        </div>

        {/* 1. Trạng thái Checking */}
        {authStatus === "checking" && (
          <div className="max-w-md mx-auto my-20 text-center py-12">
            <Loader2 className="w-8 h-8 text-[#3D5A4C] animate-spin mx-auto mb-4" />
            <p className="text-sm font-medium text-[#7A7165]">
              Đang xác thực quyền Admin / Coach...
            </p>
          </div>
        )}

        {/* 2. Trạng thái Unauthenticated */}
        {authStatus === "unauthenticated" && (
          <div className="max-w-md mx-auto my-12 zen-card p-8 bg-white text-center space-y-6">
            <div className="w-14 h-14 rounded-full bg-[#3D5A4C]/10 text-[#3D5A4C] mx-auto flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#2D2A26]">
                Cổng Quản Trị & Huấn Luyện Viên
              </h2>
              <p className="text-xs text-[#7A7165] mt-1.5 leading-relaxed">
                Đăng nhập tài khoản dành cho <strong>Tổng Quản Trị (Admin)</strong> hoặc <strong>Người Hướng Dẫn (Coach)</strong>
              </p>
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs text-center flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-[#5C554E] mb-1.5">
                  Email Đăng Nhập
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#9E9589] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="admin@naturezen.vn"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-[#DED7CE] bg-[#FAF8F5] focus:outline-none focus:border-[#3D5A4C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C554E] mb-1.5">
                  Mật Khẩu
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9E9589] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-[#DED7CE] bg-[#FAF8F5] focus:outline-none focus:border-[#3D5A4C]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 rounded-xl zen-btn-primary font-semibold text-sm shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang kiểm tra...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Đăng Nhập Cổng Quản Trị</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* 3. Trạng thái Unauthorized (Học viên thường) */}
        {authStatus === "unauthorized" && (
          <div className="max-w-lg mx-auto my-12 zen-card p-8 bg-white text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#2D2A26]">
                Chưa Được Cấp Quyền Huấn Luyện Viên / Quản Trị
              </h2>
              <p className="text-xs text-[#7A7165] mt-2 leading-relaxed">
                Tài khoản <strong>{currentUser?.email}</strong> hiện có vai trò: <span className="font-semibold text-[#3D5A4C] uppercase">{currentProfile?.role || "student"}</span>.
              </p>
              <p className="text-xs text-[#8C7355] mt-2 leading-relaxed">
                Nếu bạn là Người hướng dẫn (Coach) mới đăng ký, vui lòng liên hệ <strong>Tổng Quản Trị Viên</strong> để được bấm phê duyệt vai trò Coach.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 px-4 rounded-xl border border-[#DED7CE] bg-white hover:bg-[#F5F2ED] text-xs font-semibold text-[#5C554E]"
              >
                Đăng Xuất Đổi Tài Khoản
              </button>
              <Link
                href="/dashboard"
                className="flex-1 py-2.5 px-4 rounded-xl zen-btn-primary text-xs font-semibold text-center shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>Về Không Gian Học Viên</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* 4. Trạng thái Authorized (Admin hoặc Coach) */}
        {authStatus === "authorized" && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#ECE7E1]">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#8C7355] flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-[#3D5A4C]" />
                  <span>
                    {isAdmin ? "Bảng Điều Khiển Tổng Quản Trị" : "Không Gian Làm Việc Huấn Luyện Viên (Coach)"}
                  </span>
                </div>
                <h1 className="font-serif text-2xl font-bold text-[#2D2A26]">
                  {isAdmin ? "Giám Sát Hệ Thống & Phê Duyệt Coach" : `Chào Coach ${currentProfile?.full_name || "Minh Hằng"}`}
                </h1>
              </div>

              {/* Search box */}
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
              {/* Tab dành cho Admin */}
              {isAdmin && (
                <button
                  onClick={() => setActiveTab("users")}
                  className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
                    activeTab === "users"
                      ? "border-[#3D5A4C] text-[#3D5A4C]"
                      : "border-transparent text-[#7A7165] hover:text-[#2D2A26]"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Quản Lý Thành Viên & Duyệt Coach ({users.length})</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab("messages")}
                className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
                  activeTab === "messages"
                    ? "border-[#3D5A4C] text-[#3D5A4C]"
                    : "border-transparent text-[#7A7165] hover:text-[#2D2A26]"
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>Hộp Thư 1:1 ({threads.length})</span>
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
                <span>Lịch Tư Vấn 1:1 ({bookings.length})</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
                    activeTab === "orders"
                      ? "border-[#3D5A4C] text-[#3D5A4C]"
                      : "border-transparent text-[#7A7165] hover:text-[#2D2A26]"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Đơn Chuyển Khoản VietQR ({orders.length})</span>
                </button>
              )}

              {/* Tab cập nhật hồ sơ dành cho Coach */}
              {isCoach && (
                <button
                  onClick={() => setActiveTab("coach_profile")}
                  className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
                    activeTab === "coach_profile"
                      ? "border-[#3D5A4C] text-[#3D5A4C]"
                      : "border-transparent text-[#7A7165] hover:text-[#2D2A26]"
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>Hồ Sơ Giới Thiệu Của Bạn</span>
                </button>
              )}
            </div>

            {/* TAB 1: ADMIN QUẢN LÝ THÀNH VIÊN & DUYỆT COACH */}
            {activeTab === "users" && isAdmin && (
              <div className="space-y-6">
                {/* Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 bg-white rounded-2xl border border-[#ECE7E1]">
                    <div className="text-xs text-[#8C7355] font-semibold uppercase">Tổng Học Viên</div>
                    <div className="text-2xl font-serif font-bold text-[#2D2A26] mt-1">
                      {users.filter((u) => u.role === "student").length}
                    </div>
                  </div>
                  <div className="p-5 bg-white rounded-2xl border border-[#ECE7E1]">
                    <div className="text-xs text-emerald-700 font-semibold uppercase">Coachers Đã Phê Duyệt</div>
                    <div className="text-2xl font-serif font-bold text-emerald-800 mt-1">
                      {users.filter((u) => u.role === "coach").length}
                    </div>
                  </div>
                  <div className="p-5 bg-white rounded-2xl border border-[#ECE7E1]">
                    <div className="text-xs text-amber-700 font-semibold uppercase">Yêu Cầu Chờ Duyệt</div>
                    <div className="text-2xl font-serif font-bold text-amber-800 mt-1">
                      {users.filter((u) => u.coach_status === "pending").length}
                    </div>
                  </div>
                </div>

                {/* Filter buttons */}
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className="text-[#8C7355]">Lọc danh sách:</span>
                  {(["all", "coach", "student", "pending"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setUserFilter(f)}
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        userFilter === f
                          ? "bg-[#3D5A4C] text-white"
                          : "bg-white text-[#5C554E] border border-[#ECE7E1] hover:bg-[#FAF8F5]"
                      }`}
                    >
                      {f === "all" ? "Tất Cả" : f === "coach" ? "Huấn Luyện Viên" : f === "student" ? "Học Viên" : "Chờ Duyệt"}
                    </button>
                  ))}
                </div>

                {/* User table */}
                <div className="bg-white rounded-2xl border border-[#ECE7E1] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF8F5] text-[#5C554E] border-b border-[#ECE7E1]">
                        <tr>
                          <th className="p-4 font-bold">Thành Viên</th>
                          <th className="p-4 font-bold">Email</th>
                          <th className="p-4 font-bold">Số Điện Thoại</th>
                          <th className="p-4 font-bold">Vai Trò Hiện Tại</th>
                          <th className="p-4 font-bold">Chuyên Môn / Bio</th>
                          <th className="p-4 font-bold text-right">Phê Duyệt / Phân Quyền</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#ECE7E1]">
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-[#9E9589]">
                              Không tìm thấy thành viên nào.
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((u) => (
                            <tr key={u.id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                              <td className="p-4 font-bold text-[#2D2A26] flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-[#3D5A4C]/10 text-[#3D5A4C] flex items-center justify-center font-bold text-xs shrink-0">
                                  {u.full_name?.charAt(0) || "U"}
                                </div>
                                <span>{u.full_name || "Chưa đặt tên"}</span>
                              </td>
                              <td className="p-4 text-[#5C554E]">{u.email}</td>
                              <td className="p-4 text-[#5C554E]">{u.phone || "—"}</td>
                              <td className="p-4">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                                    u.role === "admin"
                                      ? "bg-purple-100 text-purple-800"
                                      : u.role === "coach"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-[#F0EDE8] text-[#5C554E]"
                                  }`}
                                >
                                  {u.role === "admin" ? "Quản Trị Viên" : u.role === "coach" ? "Huấn Luyện Viên" : "Học Viên"}
                                </span>
                              </td>
                              <td className="p-4 text-[#7A7165] max-w-xs text-[11px] truncate">
                                {u.expertise || u.bio || "Chưa có mô tả"}
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {u.role !== "coach" && (
                                    <button
                                      onClick={() => handleUpdateUserRole(u.id, "coach", "approved")}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white font-semibold text-[11px] hover:bg-emerald-800 flex items-center gap-1"
                                      title="Phê duyệt làm Huấn luyện viên"
                                    >
                                      <UserCheck className="w-3 h-3" />
                                      <span>Duyệt Coach</span>
                                    </button>
                                  )}

                                  {u.role === "coach" && (
                                    <button
                                      onClick={() => handleUpdateUserRole(u.id, "student", "none")}
                                      className="px-2.5 py-1 rounded-lg border border-[#DED7CE] text-[#7A7165] hover:bg-[#FAF8F5] text-[11px] font-semibold"
                                      title="Chuyển về quyền học viên thông thường"
                                    >
                                      Hạ Về Học Viên
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: HỘP THƯ 1:1 */}
            {activeTab === "messages" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white rounded-2xl border border-[#ECE7E1] overflow-hidden min-h-[550px]">
                {/* Left: Thread list */}
                <div className="md:col-span-4 border-r border-[#ECE7E1] flex flex-col bg-[#FAF8F5]/50">
                  <div className="p-4 border-b border-[#ECE7E1] bg-white font-semibold text-xs uppercase tracking-wider text-[#8C7355]">
                    Danh Sách Học Viên ({threads.length})
                  </div>
                  <div className="flex-1 overflow-y-auto divide-y divide-[#ECE7E1]/60">
                    {threads.length === 0 ? (
                      <div className="p-8 text-center text-xs text-[#9E9589]">
                        Chưa có tin nhắn nào từ học viên.
                      </div>
                    ) : (
                      threads.map((t) => (
                        <button
                          key={t.user_id}
                          onClick={() => selectStudentThread(t)}
                          className={`w-full text-left p-4 transition-all hover:bg-white flex items-start gap-3 ${
                            selectedThread?.user_id === t.user_id
                              ? "bg-white border-l-4 border-[#3D5A4C] shadow-xs"
                              : ""
                          }`}
                        >
                          <div className="w-9 h-9 rounded-full bg-[#3D5A4C]/10 text-[#3D5A4C] flex items-center justify-center font-bold text-xs shrink-0">
                            {t.student_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-[#2D2A26] truncate">
                                {t.student_name}
                              </span>
                              <span className="text-[10px] text-[#9E9589]">
                                {new Date(t.updated_at).toLocaleDateString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <p className="text-xs text-[#7A7165] truncate leading-tight">
                              {t.last_message}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Right: Message conversation stream */}
                <div className="md:col-span-8 flex flex-col">
                  {selectedThread ? (
                    <>
                      {/* Thread Header */}
                      <div className="p-4 border-b border-[#ECE7E1] bg-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#3D5A4C] text-white flex items-center justify-center font-bold text-xs">
                            {selectedThread.student_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-[#2D2A26]">
                              {selectedThread.student_name}
                            </div>
                            <div className="text-[11px] text-[#8C7355]">
                              Luồng tâm sự & hướng dẫn thiền riêng tư
                            </div>
                          </div>
                        </div>

                        <div className="text-xs text-[#9E9589]">
                          ID: {selectedThread.user_id.slice(0, 8)}...
                        </div>
                      </div>

                      {/* Chat messages stream */}
                      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[420px] bg-[#FAF8F5]/30">
                        {currentConversation.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${
                              msg.is_from_coach ? "items-end" : "items-start"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1 text-[11px]">
                              <span className="font-semibold text-[#5C554E]">
                                {msg.sender_name}
                              </span>
                              <span className="text-[#9E9589]">
                                {new Date(msg.created_at).toLocaleTimeString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>

                            <div
                              className={`p-3.5 rounded-2xl max-w-lg text-xs sm:text-sm leading-relaxed shadow-xs ${
                                msg.is_from_coach
                                  ? "bg-[#3D5A4C] text-white rounded-br-xs"
                                  : "bg-white text-[#2D2A26] border border-[#ECE7E1] rounded-bl-xs"
                              }`}
                            >
                              {msg.content}
                            </div>
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Coach Reply Form */}
                      <form
                        onSubmit={handleSendCoachReply}
                        className="p-4 border-t border-[#ECE7E1] bg-white flex items-center gap-3"
                      >
                        <input
                          type="text"
                          placeholder={`Viết lời hướng dẫn hoặc phản hồi cho ${selectedThread.student_name}...`}
                          value={coachReply}
                          onChange={(e) => setCoachReply(e.target.value)}
                          className="flex-1 text-xs sm:text-sm px-4 py-3 rounded-xl border border-[#DED7CE] bg-[#FAF8F5] focus:outline-none focus:border-[#3D5A4C]"
                        />
                        <button
                          type="submit"
                          disabled={isSending || !coachReply.trim()}
                          className="px-5 py-3 rounded-xl zen-btn-primary font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm disabled:opacity-50 shrink-0"
                        >
                          <span>Trả Lời</span>
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-xs text-[#9E9589] p-8">
                      Chọn một học viên từ cột bên trái để đọc tâm sự và gửi phản hồi.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: CONSULTATION BOOKINGS */}
            {activeTab === "bookings" && (
              <div className="bg-white rounded-2xl border border-[#ECE7E1] overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-[#ECE7E1] flex items-center justify-between">
                  <h3 className="font-serif text-lg font-bold text-[#2D2A26]">
                    Danh Sách Lịch Tư Vấn 1:1 {isCoach ? "Của Bạn" : "Toàn Hệ Thống"}
                  </h3>
                  <span className="text-xs text-[#8C7355] font-medium">
                    Tổng số: {bookings.length} lịch hẹn
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8F5] text-[#5C554E] border-b border-[#ECE7E1]">
                      <tr>
                        <th className="p-4 font-bold">Học Viên</th>
                        <th className="p-4 font-bold">Số Điện Thoại / Zalo</th>
                        <th className="p-4 font-bold">Chủ Đề Tư Vấn</th>
                        <th className="p-4 font-bold">Hình Thức</th>
                        <th className="p-4 font-bold">Ngày & Khung Giờ</th>
                        <th className="p-4 font-bold">Vấn Đề Bế Tắc</th>
                        <th className="p-4 font-bold">Trạng Thái</th>
                        <th className="p-4 font-bold text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ECE7E1]">
                      {bookings.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-[#9E9589]">
                            Chưa có lịch hẹn tư vấn nào được ghi nhận.
                          </td>
                        </tr>
                      ) : (
                        bookings
                          .filter(
                            (b) =>
                              b.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              b.phone?.includes(searchTerm)
                          )
                          .map((b) => (
                            <tr key={b.id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                              <td className="p-4 font-bold text-[#2D2A26]">{b.full_name}</td>
                              <td className="p-4">
                                <a
                                  href={`https://zalo.me/${b.phone.replace(/[^0-9]/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#3D5A4C] font-semibold hover:underline flex items-center gap-1"
                                >
                                  {b.phone}
                                  <ExternalLink className="w-3 h-3 text-[#9E9589]" />
                                </a>
                              </td>
                              <td className="p-4 text-[#4A453F] max-w-[180px]">{b.topic}</td>
                              <td className="p-4">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                                    b.mode === "online"
                                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                      : "bg-amber-50 text-amber-800 border border-amber-200"
                                  }`}
                                >
                                  {b.mode === "online" ? "Google Meet" : "Trực Tiếp (HN)"}
                                </span>
                              </td>
                              <td className="p-4 font-medium text-[#2D2A26]">
                                <div>{new Date(b.booking_date).toLocaleDateString("vi-VN")}</div>
                                <div className="text-[11px] text-[#8C7355]">{b.time_slot}</div>
                              </td>
                              <td className="p-4 text-[#665E55] max-w-xs text-[11px] leading-relaxed">
                                {b.symptoms_note || "Chưa có ghi chú"}
                              </td>
                              <td className="p-4">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                                    b.status === "confirmed"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : b.status === "completed"
                                      ? "bg-blue-100 text-blue-800"
                                      : b.status === "cancelled"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {b.status === "confirmed"
                                    ? "Đã xác nhận"
                                    : b.status === "completed"
                                    ? "Đã hoàn thành"
                                    : b.status === "cancelled"
                                    ? "Đã hủy"
                                    : "Chờ xác nhận"}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {b.mode === "online" && (
                                    <a
                                      href="https://meet.google.com/new"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                                      title="Mở phòng Google Meet"
                                    >
                                      <Video className="w-3.5 h-3.5" />
                                    </a>
                                  )}

                                  {b.status === "pending" && (
                                    <button
                                      onClick={() => handleUpdateBookingStatus(b.id, "confirmed")}
                                      className="px-2 py-1 rounded-lg bg-[#3D5A4C] text-white text-[11px] font-semibold hover:bg-[#2D4539]"
                                    >
                                      Duyệt
                                    </button>
                                  )}

                                  {b.status === "confirmed" && (
                                    <button
                                      onClick={() => handleUpdateBookingStatus(b.id, "completed")}
                                      className="px-2 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-700"
                                    >
                                      Xong
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: VIETQR ORDERS (ADMIN ONLY) */}
            {activeTab === "orders" && isAdmin && (
              <div className="bg-white rounded-2xl border border-[#ECE7E1] overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-[#ECE7E1] flex items-center justify-between">
                  <h3 className="font-serif text-lg font-bold text-[#2D2A26]">
                    Danh Sách Đơn Đăng Ký Khóa Học & Chuyển Khoản VietQR
                  </h3>
                  <span className="text-xs text-[#8C7355] font-medium">
                    Tổng số: {orders.length} đơn hàng
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8F5] text-[#5C554E] border-b border-[#ECE7E1]">
                      <tr>
                        <th className="p-4 font-bold">Mã Đơn / Nội Dung CK</th>
                        <th className="p-4 font-bold">Học Viên</th>
                        <th className="p-4 font-bold">Số Điện Thoại</th>
                        <th className="p-4 font-bold">Gói Đăng Ký</th>
                        <th className="p-4 font-bold">Số Tiền</th>
                        <th className="p-4 font-bold">Thời Gian</th>
                        <th className="p-4 font-bold">Trạng Thái</th>
                        <th className="p-4 font-bold text-right">Xử Lý</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ECE7E1]">
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-[#9E9589]">
                            Chưa có đơn hàng nào được tạo.
                          </td>
                        </tr>
                      ) : (
                        orders
                          .filter(
                            (o) =>
                              o.order_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              o.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              o.phone?.includes(searchTerm)
                          )
                          .map((o) => (
                            <tr key={o.id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                              <td className="p-4 font-mono font-bold text-[#3D5A4C]">
                                {o.order_code}
                              </td>
                              <td className="p-4 font-bold text-[#2D2A26]">{o.full_name}</td>
                              <td className="p-4">{o.phone}</td>
                              <td className="p-4 font-medium text-[#4A453F]">{o.package_name}</td>
                              <td className="p-4 font-bold text-[#2D2A26]">
                                {Number(o.amount).toLocaleString("vi-VN")} đ
                              </td>
                              <td className="p-4 text-[#9E9589] text-[11px]">
                                {new Date(o.created_at).toLocaleString("vi-VN")}
                              </td>
                              <td className="p-4">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                                    o.status === "paid"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : o.status === "cancelled"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {o.status === "paid"
                                    ? "Đã chuyển khoản"
                                    : o.status === "cancelled"
                                    ? "Đã hủy"
                                    : "Chờ chuyển khoản"}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                {o.status === "pending" ? (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(o.id, "paid")}
                                    className="px-3 py-1.5 rounded-lg bg-[#3D5A4C] text-white text-[11px] font-semibold hover:bg-[#2D4539] transition-colors"
                                  >
                                    Xác Nhận Đã Nhận Tiền
                                  </button>
                                ) : (
                                  <span className="text-[11px] text-[#9E9589]">Đã kích hoạt</span>
                                )}
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: COACH PROFILE SETTINGS (FOR COACHES) */}
            {activeTab === "coach_profile" && isCoach && (
              <div className="max-w-2xl bg-white rounded-2xl border border-[#ECE7E1] p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#2D2A26]">
                    Hồ Sơ Giới Thiệu Chuyên Môn
                  </h3>
                  <p className="text-xs text-[#7A7165] mt-1">
                    Thông tin này sẽ hiển thị để học viên xem và lựa chọn bạn làm Người hướng dẫn đồng hành.
                  </p>
                </div>

                <form onSubmit={handleSaveCoachProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#5C554E] mb-1.5">
                      Lĩnh Vực Thế Mạnh / Chuyên Môn
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Thiền Năng Lực Tự Nhiên & Chuyển Hóa Cảm Xúc Thân Tâm"
                      value={coachExpertise}
                      onChange={(e) => setCoachExpertise(e.target.value)}
                      className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl border border-[#DED7CE] bg-[#FAF8F5] focus:outline-none focus:border-[#3D5A4C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5C554E] mb-1.5">
                      Số Năm Kinh Nghiệm Thiền Định & Khai Vấn
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={40}
                      value={coachYearsExp}
                      onChange={(e) => setCoachYearsExp(Number(e.target.value))}
                      className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl border border-[#DED7CE] bg-[#FAF8F5] focus:outline-none focus:border-[#3D5A4C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5C554E] mb-1.5 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-[#3D5A4C]" />
                      <span>Đường Link Phòng Google Meet Cố Định Của Bạn</span>
                    </label>
                    <input
                      type="url"
                      placeholder="Ví dụ: https://meet.google.com/minh-hang-naturezen"
                      value={coachMeetUrl}
                      onChange={(e) => setCoachMeetUrl(e.target.value)}
                      className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl border border-[#DED7CE] bg-[#FAF8F5] focus:outline-none focus:border-[#3D5A4C]"
                    />
                    <p className="text-[11px] text-[#7A7165] mt-1 leading-relaxed">
                      Link này sẽ được gửi tự động cho học viên khi đặt lịch tư vấn 1:1 hoặc khi bấm &quot;Vào phòng Google Meet&quot;.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5C554E] mb-1.5">
                      Giới Thiệu Bản Thân & Triết Lý Đồng Hành (Bio)
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Chia sẻ kinh nghiệm thực hành thiền, phương pháp hỗ trợ học viên tháo gỡ bế tắc..."
                      value={coachBio}
                      onChange={(e) => setCoachBio(e.target.value)}
                      className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl border border-[#DED7CE] bg-[#FAF8F5] focus:outline-none focus:border-[#3D5A4C] leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingCoachProfile}
                    className="px-6 py-3 rounded-xl zen-btn-primary font-semibold text-xs sm:text-sm shadow-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>{isSavingCoachProfile ? "Đang lưu..." : "Lưu Thay Đổi"}</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
