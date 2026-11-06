"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Headphones, BookOpen, Calendar, User, LogIn, LayoutDashboard, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function Navbar({ onOpenPlayer, onOpenBooking }: { onOpenPlayer?: () => void; onOpenBooking?: () => void }) {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    try {
      const supabase = createClient();

      const loadRole = async (uid: string) => {
        try {
          const { data } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", uid)
            .single();
          if (data?.role) setUserRole(data.role);
        } catch {
          // ignore
        }
      };

      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) {
          setUser(data.user);
          loadRole(data.user.id);
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          loadRole(session.user.id);
        } else {
          setUserRole(null);
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    } catch {
      // Supabase credentials not set or client error
    }
  }, []);

  const isAdminOrCoach = userRole === "admin" || userRole === "coach";

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#FAF8F5]/90 border-b border-[#ECE7E1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-[#3D5A4C]/10 flex items-center justify-center text-[#3D5A4C] group-hover:bg-[#3D5A4C] group-hover:text-white transition-all">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="font-serif text-lg font-semibold tracking-wide text-[#2D2A26]">
              Năng Lực Tự Nhiên
            </div>
            <div className="text-xs text-[#8C7355] font-medium tracking-wider uppercase">
              Minh Hằng Thiền
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-[#5C554E]">
          <Link href="/#triet-ly" className="hover:text-[#3D5A4C] transition-colors">
            Triết Lý
          </Link>
          <Link href="/#chuoi-thien" className="hover:text-[#3D5A4C] transition-colors flex items-center gap-1.5">
            <Headphones className="w-4 h-4 text-[#8C7355]" />
            6 Bài Thiền
          </Link>
          <Link href="/#goi-san-pham" className="hover:text-[#3D5A4C] transition-colors">
            Các Gói Dịch Vụ
          </Link>
          <Link href="/journal" className="hover:text-[#3D5A4C] transition-colors flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#8C7355]" />
            Sổ Quán Sát
          </Link>
          <Link href="/booking" className="hover:text-[#3D5A4C] transition-colors flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#8C7355]" />
            Đặt Lịch 1:1
          </Link>

          {user && (
            <Link 
              href="/dashboard" 
              className="text-[#3D5A4C] font-semibold flex items-center gap-1.5 px-3 py-1 bg-[#3D5A4C]/10 rounded-full"
            >
              <LayoutDashboard className="w-4 h-4" />
              Góc Học Viên
            </Link>
          )}

          {isAdminOrCoach && (
            <Link 
              href="/admin" 
              className="text-amber-800 font-semibold flex items-center gap-1.5 px-3 py-1 bg-amber-100/70 border border-amber-300/50 rounded-full text-xs"
            >
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              Cổng Quản Trị
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenPlayer && (
            <button
              onClick={onOpenPlayer}
              className="hidden sm:flex px-3.5 py-2 text-xs sm:text-sm font-medium rounded-full zen-btn-outline items-center gap-2"
            >
              <Headphones className="w-4 h-4" />
              <span>Nghe Thử</span>
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              {isAdminOrCoach ? (
                <Link
                  href="/admin"
                  className="px-4 py-2 text-xs sm:text-sm font-medium rounded-full bg-[#3D5A4C] text-white hover:bg-[#2D4539] shadow-sm flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Quản Trị</span>
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-xs sm:text-sm font-medium rounded-full zen-btn-primary shadow-sm hover:shadow flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Không Gian Của Bạn</span>
                  <span className="sm:hidden">Góc Riêng</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-2 text-xs sm:text-sm font-medium rounded-full text-[#5C554E] hover:text-[#3D5A4C] border border-[#ECE7E1] hover:border-[#3D5A4C]/30 transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng Nhập</span>
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-xs sm:text-sm font-medium rounded-full zen-btn-primary shadow-sm hover:shadow text-xs sm:text-sm"
              >
                Đăng Ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
