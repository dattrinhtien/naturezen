"use client";

import { useState } from "react";
import { X, Check, Copy, ShieldCheck, MessageCircle, ArrowRight } from "lucide-react";
import { PackagePlan, BANK_CONFIG } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";

interface VietQRModalProps {
  packagePlan: PackagePlan | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function VietQRModal({ packagePlan, isOpen, onClose }: VietQRModalProps) {
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !packagePlan) return null;

  const orderCode = `HT_${packagePlan.code}_${phone.slice(-4) || "8888"}`;
  const qrUrl = `https://img.vietqr.io/image/${BANK_CONFIG.bankId}-${BANK_CONFIG.accountNumber}-compact2.jpg?amount=${packagePlan.price}&addInfo=${encodeURIComponent(orderCode)}&accountName=${encodeURIComponent(BANK_CONFIG.accountName)}`;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmTransfer = async () => {
    setIsSaving(true);
    try {
      const supabase = createClient();
      await supabase.from("orders").insert({
        order_code: orderCode,
        full_name: fullName || "Học viên",
        phone: phone || "0988888888",
        package_code: packagePlan.code,
        package_name: packagePlan.name,
        amount: packagePlan.price,
        status: "pending"
      });
    } catch (err) {
      console.warn("Lưu đơn hàng Supabase:", err);
    } finally {
      setIsSaving(false);
      setIsSubmitted(true);
    }
  };

  const zaloChatUrl = `https://zalo.me/${BANK_CONFIG.accountNumber}?text=${encodeURIComponent(
    `Xin chào Chị Minh Hằng, tôi là ${fullName || "Học viên"} (SĐT: ${phone}). Tôi vừa chuyển khoản thanh toán gói: ${packagePlan.name} (Mã CK: ${orderCode}). Nhờ Chị kiểm tra và kích hoạt tài khoản giúp tôi ạ.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#E8E2D9] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#ECE7E1] flex items-center justify-between bg-white/70">
          <div>
            <span className="text-xs font-bold text-[#8C7355] uppercase tracking-wider">
              Thanh Toán Quét Mã VietQR
            </span>
            <h3 className="font-serif text-lg font-bold text-[#2D2A26]">
              {packagePlan.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#EFECE6] hover:bg-[#E2DDD5] text-[#5C554E] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!isSubmitted ? (
            <>
              {/* Form info */}
              <div className="p-4 rounded-2xl bg-white border border-[#ECE7E1] space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[#3D5A4C]">
                  1. Thông tin người học
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#665E55] mb-1">
                      Họ và tên của bạn
                    </label>
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full text-sm px-3.5 py-2 rounded-xl border border-[#DED7CE] bg-[#FAF8F5] focus:outline-none focus:border-[#3D5A4C]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#665E55] mb-1">
                      Số điện thoại / Zalo *
                    </label>
                    <input
                      type="tel"
                      placeholder="0912345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-sm px-3.5 py-2 rounded-xl border border-[#DED7CE] bg-[#FAF8F5] focus:outline-none focus:border-[#3D5A4C]"
                    />
                  </div>
                </div>
              </div>

              {/* QR Section */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center bg-white p-5 rounded-2xl border border-[#ECE7E1]">
                <div className="sm:col-span-5 flex flex-col items-center">
                  <div className="p-2 bg-white rounded-2xl shadow-sm border border-[#ECE7E1]">
                    <img
                      src={qrUrl}
                      alt="VietQR Chuyển Khoản"
                      className="w-48 h-auto object-contain rounded-xl"
                    />
                  </div>
                  <span className="text-[11px] text-[#8C7355] mt-2 text-center">
                    Mở app ngân hàng quét mã QR để điền tự động
                  </span>
                </div>

                <div className="sm:col-span-7 space-y-2.5 text-xs sm:text-sm">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#3D5A4C] mb-1">
                    2. Chuyển khoản thủ công
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#ECE7E1]">
                    <div className="text-[11px] text-[#8C847A]">Ngân hàng:</div>
                    <div className="font-semibold text-[#2D2A26]">{BANK_CONFIG.bankName}</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#ECE7E1] flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-[#8C847A]">Số tài khoản:</div>
                      <div className="font-mono font-bold text-base text-[#3D5A4C]">
                        {BANK_CONFIG.accountNumber}
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(BANK_CONFIG.accountNumber, "acc")}
                      className="px-2.5 py-1 text-xs rounded-lg border border-[#D6CEC4] hover:bg-white flex items-center gap-1 text-[#5C554E]"
                    >
                      {copiedField === "acc" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === "acc" ? "Đã chép" : "Sao chép"}</span>
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#ECE7E1]">
                    <div className="text-[11px] text-[#8C847A]">Chủ tài khoản:</div>
                    <div className="font-semibold text-[#2D2A26] uppercase">
                      {BANK_CONFIG.accountName}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#ECE7E1] flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-[#8C847A]">Số tiền:</div>
                      <div className="font-bold text-base text-[#8C7355]">
                        {packagePlan.price.toLocaleString("vi-VN")} đ
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#ECE7E1] flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-[#8C847A]">Nội dung chuyển khoản:</div>
                      <div className="font-mono font-bold text-[#3D5A4C]">{orderCode}</div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(orderCode, "code")}
                      className="px-2.5 py-1 text-xs rounded-lg border border-[#D6CEC4] hover:bg-white flex items-center gap-1 text-[#5C554E]"
                    >
                      {copiedField === "code" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === "code" ? "Đã chép" : "Sao chép"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Confirm actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleConfirmTransfer}
                  className="flex-1 py-3 px-4 rounded-xl zen-btn-primary text-sm font-semibold flex items-center justify-center gap-2 shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Tôi Đã Chuyển Khoản Thành Công</span>
                </button>
                <a
                  href={zaloChatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-5 rounded-xl border border-[#3D5A4C] text-[#3D5A4C] hover:bg-[#3D5A4C]/10 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Nhắn Zalo Xác Nhận Nhanh</span>
                </a>
              </div>
            </>
          ) : (
            <div className="p-8 text-center space-y-4 bg-white rounded-2xl border border-[#ECE7E1]">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="font-serif text-2xl font-bold text-[#2D2A26]">
                Đã Tiếp Nhận Thông Tin Chuyển Khoản!
              </h4>
              <p className="text-sm text-[#5C554E] max-w-md mx-auto leading-relaxed">
                Cảm ơn bạn {fullName ? <strong>{fullName}</strong> : ""}. Chúng tôi sẽ kiểm tra đối soát mã giao dịch <strong>{orderCode}</strong> và kích hoạt khóa học/liên hệ xếp lịch tư vấn ngay cho bạn trong vòng 15-30 phút.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
                <a
                  href={zaloChatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-6 rounded-xl zen-btn-primary text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Gửi Biên Lai Qua Zalo Chị Minh Hằng</span>
                </a>
                <button
                  onClick={onClose}
                  className="py-3 px-6 rounded-xl border border-[#DED7CE] text-[#5C554E] hover:bg-[#FAF8F5] text-sm font-semibold"
                >
                  Quay Lại Trang Chủ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

