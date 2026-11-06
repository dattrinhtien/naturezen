"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Headphones, 
  Play, 
  Check, 
  ShieldCheck, 
  ArrowRight, 
  Heart, 
  Compass, 
  Feather, 
  Clock, 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  Layers, 
  Activity,
  FileText,
  Download
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ZenPlayerModal from "@/components/ZenPlayerModal";
import VietQRModal from "@/components/VietQRModal";
import { LESSONS, PACKAGES, EBOOKS, PackagePlan, Lesson } from "@/lib/data";

export default function Home() {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [activeLesson, setActiveLesson] = useState<Lesson>(LESSONS[0]);
  const [selectedPackage, setSelectedPackage] = useState<PackagePlan | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const handleOpenPreview = (lesson?: Lesson) => {
    setActiveLesson(lesson || LESSONS[0]);
    setIsPlayerOpen(true);
  };

  const handleSelectPackage = (pkg: PackagePlan) => {
    setSelectedPackage(pkg);
    setIsQRModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      {/* Top Navigation */}
      <Navbar onOpenPlayer={() => handleOpenPreview(LESSONS[0])} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-[#ECE7E1] zen-gradient">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3D5A4C]/10 text-[#3D5A4C] text-xs font-semibold tracking-wider uppercase mb-6">
            <Sparkles className="w-4 h-4 text-[#8C7355]" />
            <span>Đồng hành cùng Chị Minh Hằng • Phương pháp Năng lượng & Thiền Quán</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#2D2A26] leading-tight sm:leading-tight mb-6">
            Đánh Thức <span className="text-[#3D5A4C] italic font-normal">Năng Lực Tự Nhiên</span>
            <br className="hidden sm:inline" /> & Thấu Hiểu Cảm Xúc
          </h1>

          <p className="text-base sm:text-xl text-[#5C554E] max-w-3xl mx-auto leading-relaxed mb-10 font-normal">
            Lắng nghe tiếng gọi sâu thẳm bên trong (<em>the calling</em>), bóc tách từng tầng lớp cảm xúc dồn nén và tháo gỡ điểm đau trên cơ thể để tìm về sự tĩnh tại của <strong>Tính Không</strong>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => handleOpenPreview(LESSONS[0])}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full zen-btn-primary font-medium text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Nghe Thử Bài 1: Quan Sát Cảm Xúc (13 Phút)</span>
            </button>
            <a
              href="#goi-san-pham"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full zen-btn-outline font-medium text-sm sm:text-base flex items-center justify-center gap-2"
            >
              <span>Xem Các Gói Tư Vấn & Khoá Học</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Quick Pillars */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-white/70 border border-[#ECE7E1]">
              <Compass className="w-5 h-5 text-[#3D5A4C] mb-2" />
              <div className="font-bold text-xs uppercase tracking-wider text-[#8C7355]">Tinh Thần</div>
              <div className="text-xs text-[#5C554E] mt-1">Thiền thấy Năng Lực Tự Nhiên trong đời sống</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/70 border border-[#ECE7E1]">
              <Activity className="w-5 h-5 text-[#3D5A4C] mb-2" />
              <div className="font-bold text-xs uppercase tracking-wider text-[#8C7355]">Vật Lý</div>
              <div className="text-xs text-[#5C554E] mt-1">Đặt tay năng lượng tháo gỡ điểm đau trên thân</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/70 border border-[#ECE7E1]">
              <Clock className="w-5 h-5 text-[#3D5A4C] mb-2" />
              <div className="font-bold text-xs uppercase tracking-wider text-[#8C7355]">Thời Gian</div>
              <div className="text-xs text-[#5C554E] mt-1">Xem Timeline bài học cuộc đời & kiếp sống</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/70 border border-[#ECE7E1]">
              <Feather className="w-5 h-5 text-[#3D5A4C] mb-2" />
              <div className="font-bold text-xs uppercase tracking-wider text-[#8C7355]">Tính Không</div>
              <div className="text-xs text-[#5C554E] mt-1">Hòa nhập trọn vẹn với sự an lạc thuần khiết</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Triết lý Năng Lực Tự Nhiên */}
      <section id="triet-ly" className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold text-[#8C7355] tracking-widest uppercase">
              Bản Chất Cốt Lõi
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2D2A26] leading-tight">
              Năng Lực Tự Nhiên là gì? Và vì sao nó lại trở thành nỗi đau?
            </h2>
            <p className="text-sm sm:text-base text-[#5C554E] leading-relaxed">
              Năng lực tự nhiên là thiên hướng bẩm sinh gắn liền với tiếng gọi bên trong của mỗi con người. Đó không chỉ là tài năng hay kỹ năng kiếm sống, mà là năng lượng riêng có tích lũy qua nhiều kiếp sống, không có “mức trần” cho sự phát triển.
            </p>
            <div className="p-5 rounded-2xl bg-[#F2EDE4] border-l-4 border-[#3D5A4C] space-y-2">
              <div className="font-semibold text-[#2D2A26] text-sm">
                Khi Năng Lực Tự Nhiên bị đè nén:
              </div>
              <p className="text-xs sm:text-sm text-[#665E55] leading-relaxed">
                Khi không được thể hiện và lắng nghe, năng lực tự nhiên trở thành các khối bế tắc ở tư tưởng, cảm xúc và biểu hiện thẳng lên thân thể (đau dạ dày, mỏi vai gáy, tức ngực, mệt mỏi kinh niên). Chúng trở thành tiếng lòng sâu kín kêu cứu của chính bạn.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-3">
              <Link
                href="/journal"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#3D5A4C] hover:text-[#253930]"
              >
                <span>Thực hành Sổ Quán Sát Thân - Tâm ngay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="zen-card p-7 space-y-6 relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-[#3D5A4C]/10 text-[#3D5A4C] flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#2D2A26]">
                Cơ Chế 4 Tầng Bế Tắc & Chuyển Hóa
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-[#FAF8F5] border border-[#DDD7CD] flex items-center justify-center text-xs font-bold text-[#3D5A4C] shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#2D2A26]">Tầng Tư Tưởng & Ham Muốn</div>
                    <div className="text-xs text-[#665E55]">Ham muốn cuốn bạn đi, hút cạn sinh lực và để lại những khối ức tắc dằn vặt.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-[#FAF8F5] border border-[#DDD7CD] flex items-center justify-center text-xs font-bold text-[#3D5A4C] shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#2D2A26]">Tầng Hồ Nước Cảm Xúc</div>
                    <div className="text-xs text-[#665E55]">Nhiều lớp như củ hành tây: Tức giận bên ngoài che đậy nỗi sợ và thiếu thốn bên trong.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-[#FAF8F5] border border-[#DDD7CD] flex items-center justify-center text-xs font-bold text-[#3D5A4C] shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#2D2A26]">Tầng Cảm Giác Thân Thể</div>
                    <div className="text-xs text-[#665E55]">Lo lắng buốt dạ dày, buồn bã kiệt sức. Thân và Tâm là một.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-[#FAF8F5] border border-[#DDD7CD] flex items-center justify-center text-xs font-bold text-[#3D5A4C] shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#2D2A26]">Ôm Ấp Hai Con Người Bên Trong</div>
                    <div className="text-xs text-[#665E55]">Chấp nhận con người nhược điểm (ích kỷ, cô đơn, nạn nhân) bằng tình yêu thương thuần khiết.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Chuỗi 6 Bài Thiền Hướng Dẫn */}
      <section id="chuoi-thien" className="py-20 bg-[#F4EFE9]/60 border-y border-[#ECE7E1]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-[#8C7355] tracking-widest uppercase">
              Lộ Trình Tự Thực Hành
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2D2A26] mt-2 mb-4">
              Chuỗi 6 Bài Thiền "Thấu Hiểu & Chuyển Hoá Cảm Xúc"
            </h2>
            <p className="text-sm sm:text-base text-[#5C554E]">
              Được hướng dẫn trực tiếp bởi Chị Minh Hằng, giúp bạn lần lượt đi qua các tầng sâu của nội tâm, đón nhận và để cảm xúc tự tan biến vĩnh viễn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {LESSONS.map((lesson) => (
              <div
                key={lesson.id}
                className="zen-card p-6 flex flex-col justify-between hover:border-[#3D5A4C]/50 transition-all hover:shadow-md bg-white"
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

                  <h3 className="font-serif font-bold text-lg text-[#2D2A26] mb-2 leading-snug">
                    {lesson.title}
                  </h3>
                  <p className="text-xs text-[#665E55] italic mb-4">
                    "{lesson.subtitle}"
                  </p>
                  <p className="text-xs text-[#5C554E] line-clamp-3 mb-4 leading-relaxed">
                    {lesson.coreMeaning}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#ECE7E1] flex items-center justify-between">
                  {lesson.isFreePreview ? (
                    <button
                      onClick={() => handleOpenPreview(lesson)}
                      className="text-xs font-semibold px-4 py-2 rounded-full bg-[#3D5A4C] text-white hover:bg-[#31493D] flex items-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Nghe Thử Miễn Phí</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSelectPackage(PACKAGES[0])}
                      className="text-xs font-medium text-[#8C7355] hover:text-[#3D5A4C] flex items-center gap-1"
                    >
                      <span>Mở khóa trong gói</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span className="text-[11px] text-[#A39A8F]">
                    {lesson.isFreePreview ? "Bài mở đầu" : "Có Ebook kèm"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => handleOpenPreview(LESSONS[0])}
              className="px-6 py-3 rounded-full zen-btn-outline text-sm font-semibold inline-flex items-center gap-2"
            >
              <Headphones className="w-4 h-4" />
              <span>Bật Trình Phát Thiền & Đọc Ebook Chiêm Nghiệm</span>
            </button>
          </div>

          {/* Ebook & PDF Library */}
          <div className="mt-16 pt-12 border-t border-[#ECE7E1]">
            <div className="text-center mb-8">
              <span className="text-xs font-bold text-[#8C7355] tracking-widest uppercase">
                Tài Liệu Chiêm Nghiệm & Lưu Trữ
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#2D2A26] mt-1">
                Tủ Sách Ebook Gốc Của Chị Minh Hằng
              </h3>
              <p className="text-xs text-[#665E55] mt-1">Đã được lưu trữ và tối ưu hoá trên Supabase Cloud Storage</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {EBOOKS.map((eb) => (
                <a
                  key={eb.id}
                  href={eb.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl bg-white border border-[#ECE7E1] hover:border-[#3D5A4C] hover:shadow-sm transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-[#3D5A4C]/10 text-[#3D5A4C] flex items-center justify-center mb-3 group-hover:bg-[#3D5A4C] group-hover:text-white transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="font-serif font-bold text-sm text-[#2D2A26] mb-1 leading-snug group-hover:text-[#3D5A4C] transition-colors">
                      {eb.title}
                    </div>
                    <span className="text-[11px] text-[#8C7355] block">Định dạng PDF chuẩn</span>
                  </div>
                  <div className="pt-3 mt-3 border-t border-[#F2ECE4] flex items-center justify-between text-xs font-medium text-[#3D5A4C]">
                    <span>Đọc & Tải Về</span>
                    <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Bảng Các Gói Dịch Vụ & Tư Vấn 1:1 */}
      <section id="goi-san-pham" className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-[#8C7355] tracking-widest uppercase">
            Hệ Sinh Thái Sản Phẩm
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2D2A26] mt-2 mb-4">
            Lựa Chọn Gói Đồng Hành Phù Hợp
          </h2>
          <p className="text-sm sm:text-base text-[#5C554E]">
            Từ khóa học số hóa tự thực hành tại nhà đến các buổi tư vấn 1:1 chuyên sâu và đặt tay năng lượng trực tiếp cùng Chị Minh Hằng.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`zen-card p-8 flex flex-col justify-between relative transition-all ${
                pkg.popular
                  ? "border-2 border-[#3D5A4C] shadow-xl bg-white"
                  : "bg-white/80 hover:border-[#3D5A4C]/50"
              }`}
            >
              {pkg.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-[#3D5A4C] text-white text-[11px] font-bold tracking-wider uppercase shadow-sm">
                  {pkg.badge}
                </div>
              )}

              <div>
                <h3 className="font-serif text-xl font-bold text-[#2D2A26] mb-2">
                  {pkg.name}
                </h3>
                <p className="text-xs text-[#665E55] mb-6 leading-relaxed">
                  {pkg.description}
                </p>

                <div className="mb-6 pb-6 border-b border-[#ECE7E1]">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-serif font-bold text-[#2D2A26]">
                      {pkg.price.toLocaleString("vi-VN")} đ
                    </span>
                    {pkg.originalPrice && (
                      <span className="text-xs text-[#9E9589] line-through">
                        {pkg.originalPrice.toLocaleString("vi-VN")} đ
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#8C7355] mt-1 block">
                    {pkg.type === "digital" ? "Truy cập trọn đời" : "Buổi tư vấn riêng 1:1"}
                  </span>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#3D5A4C]">
                    Quyền lợi bao gồm:
                  </div>
                  {pkg.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-[#4A453F]">
                      <CheckCircle2 className="w-4 h-4 text-[#3D5A4C] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <button
                  onClick={() => handleSelectPackage(pkg)}
                  className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 ${
                    pkg.popular
                      ? "zen-btn-primary"
                      : "border border-[#3D5A4C] text-[#3D5A4C] hover:bg-[#3D5A4C] hover:text-white"
                  }`}
                >
                  <span>Đăng Ký & Nhận Mã VietQR</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="text-center text-[11px] text-[#8C847A] mt-2.5">
                  Thanh toán qua quét mã QR tài khoản cá nhân
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: Lời chứng thực & Cảm nhận */}
      <section className="py-20 bg-[#FAF8F5] border-t border-[#ECE7E1]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Heart className="w-6 h-6 text-[#8C7355] mx-auto mb-2" />
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D2A26]">
              Sự Chuyển Hóa Từ Những Người Đã Thực Hành
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-[#ECE7E1] space-y-3">
              <p className="text-xs text-[#5C554E] italic leading-relaxed">
                "Tôi từng bị đau thắt vùng dạ dày suốt 3 năm mỗi khi căng thẳng công việc. Khi thực hành bài thiền 4 và 5 của Chị Hằng, học cách chìm vào cơn đau thay vì sợ hãi nó, chỉ sau 2 tuần các cơn co thắt đã giảm rõ rệt."
              </p>
              <div className="font-semibold text-xs text-[#2D2A26] pt-2 border-t border-[#ECE7E1]">
                Thu Hương • Chuyên viên Tài chính, Hà Nội
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#ECE7E1] space-y-3">
              <p className="text-xs text-[#5C554E] italic leading-relaxed">
                "Buổi tư vấn xem Năng Lực Tự Nhiên giúp tôi vỡ òa nhận ra vì sao suốt 10 năm qua tôi luôn cảm thấy trống rỗng dù kiếm được tiền. Tôi đã tìm lại được tiếng gọi bẩm sinh của mình."
              </p>
              <div className="font-semibold text-xs text-[#2D2A26] pt-2 border-t border-[#ECE7E1]">
                Quang Minh • Quản lý Dự án, TP.HCM
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#ECE7E1] space-y-3">
              <p className="text-xs text-[#5C554E] italic leading-relaxed">
                "Bài thiền số 6 về việc chấp nhận hai con người bên trong đã cứu vớt tâm lý tôi. Thay vì dằn vặt phần yếu đuối ích kỷ, tôi đã biết ôm ấp và yêu thương bản thân đúng cách."
              </p>
              <div className="font-semibold text-xs text-[#2D2A26] pt-2 border-t border-[#ECE7E1]">
                Minh Trang • Nhà giáo dục tự do
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 bg-[#2D2A26] text-[#E5DEC3] border-t border-[#3D3A35]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 text-xs">
          <div className="md:col-span-5 space-y-3">
            <div className="font-serif text-lg font-bold text-white tracking-wide">
              Năng Lực Tự Nhiên • Minh Hằng Thiền
            </div>
            <p className="text-[#B3A999] leading-relaxed max-w-sm">
              Hệ thống tư vấn phát triển theo thiên hướng bẩm sinh, giải tỏa bế tắc thân tâm và hướng về tính Không an lạc.
            </p>
          </div>

          <div className="md:col-span-3 space-y-2">
            <div className="font-bold text-white uppercase tracking-wider">Liên Kết Nhanh</div>
            <ul className="space-y-1.5 text-[#B3A999]">
              <li><a href="#triet-ly" className="hover:text-white">Triết lý NLTN</a></li>
              <li><a href="#chuoi-thien" className="hover:text-white">6 Bài thiền chuyển hoá</a></li>
              <li><Link href="/journal" className="hover:text-white">Sổ quán sát thân tâm</Link></li>
              <li><Link href="/booking" className="hover:text-white">Đặt lịch tư vấn 1:1</Link></li>
              <li><Link href="/dashboard" className="hover:text-white">Không gian học viên</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-2">
            <div className="font-bold text-white uppercase tracking-wider">Hỗ Trợ & Liên Hệ</div>
            <p className="text-[#B3A999]">
              Đồng hành: Chị Minh Hằng<br />
              Hotline/Zalo: 0906.115.528<br />
              Thời gian tư vấn: 08:30 - 21:00 (Tất cả các ngày trong tuần)
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-white/10 text-center text-[#8C847A] text-[11px]">
          © 2026 Năng Lực Tự Nhiên. Toàn bộ nội dung thiền dẫn và ebook thuộc bản quyền Chị Minh Hằng.
        </div>
      </footer>

      {/* Modals */}
      <ZenPlayerModal
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        initialLesson={activeLesson}
        onSelectPackage={() => {
          setIsPlayerOpen(false);
          handleSelectPackage(PACKAGES[0]);
        }}
      />

      <VietQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        packagePlan={selectedPackage}
      />
    </div>
  );
}
