"use client";

import Link from "next/link";
import { Sparkles, Headphones, BookOpen, Calendar, HeartHandshake } from "lucide-react";

export default function Navbar({ onOpenPlayer, onOpenBooking }: { onOpenPlayer?: () => void; onOpenBooking?: () => void }) {
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

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#5C554E]">
          <a href="#triet-ly" className="hover:text-[#3D5A4C] transition-colors">
            Triết Lý
          </a>
          <a href="#chuoi-thien" className="hover:text-[#3D5A4C] transition-colors flex items-center gap-1.5">
            <Headphones className="w-4 h-4 text-[#8C7355]" />
            6 Bài Thiền
          </a>
          <a href="#goi-san-pham" className="hover:text-[#3D5A4C] transition-colors">
            Các Gói Dịch Vụ
          </a>
          <Link href="/journal" className="hover:text-[#3D5A4C] transition-colors flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#8C7355]" />
            Sổ Quán Sát
          </Link>
          <Link href="/booking" className="hover:text-[#3D5A4C] transition-colors flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#8C7355]" />
            Đặt Lịch 1:1
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {onOpenPlayer && (
            <button
              onClick={onOpenPlayer}
              className="px-4 py-2 text-xs sm:text-sm font-medium rounded-full zen-btn-outline flex items-center gap-2"
            >
              <Headphones className="w-4 h-4" />
              <span>Nghe Thử Bài 1</span>
            </button>
          )}
          <a
            href="#goi-san-pham"
            className="px-4 py-2 text-xs sm:text-sm font-medium rounded-full zen-btn-primary shadow-sm hover:shadow"
          >
            Đăng Ký Khóa Học
          </a>
        </div>
      </div>
    </header>
  );
}

