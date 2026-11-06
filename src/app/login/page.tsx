"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Lock, Mail, ArrowLeft, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message === "Invalid login credentials" 
          ? "Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!" 
          : error.message);
        return;
      }

      if (data.user) {
        // Kiểm tra xem có phải role coach/admin không
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profile?.role === "coach" || profile?.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      setErrorMessage("Đã có lỗi xảy ra khi kết nối. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-md zen-card p-8 bg-white space-y-6">
          <div className="text-center space-y-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C7355] hover:text-[#3D5A4C] mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay về trang chủ</span>
            </Link>
            <div className="w-12 h-12 rounded-full bg-[#3D5A4C]/10 text-[#3D5A4C] mx-auto flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#2D2A26]">
              Đăng Nhập Không Gian Riêng
            </h1>
            <p className="text-xs text-[#7A7165]">
              Quay trở về với không gian tĩnh lặng, sổ quán sát và trao đổi cùng Chị Minh Hằng.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#5C554E] mb-1.5">
                Địa chỉ Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9E9589] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="hocvien@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs sm:text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-[#DED7CE] bg-[#FAF8F5] focus:outline-none focus:border-[#3D5A4C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5C554E] mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9E9589] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs sm:text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-[#DED7CE] bg-[#FAF8F5] focus:outline-none focus:border-[#3D5A4C]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl zen-btn-primary font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <span>{isLoading ? "Đang xử lý..." : "Đăng Nhập"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-[#ECE7E1] text-center text-xs text-[#7A7165]">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="font-semibold text-[#3D5A4C] hover:underline">
              Đăng ký ngay tại đây
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
