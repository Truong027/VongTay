import React from 'react';
import { ShieldAlert, LogIn, X, AlertTriangle, Smartphone, Laptop } from 'lucide-react';

export default function ConcurrentSessionModal({ isOpen, message, onClose, onReLogin }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="relative w-full max-w-lg bg-[#FAF7F2] rounded-3xl shadow-2xl border-2 border-[#E07A5F]/30 overflow-hidden transform animate-scaleUp text-[#26211C]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Gradient */}
        <div className="h-2 w-full bg-gradient-to-r from-[#E07A5F] via-[#D4A373] to-[#B86244]" />

        {/* Header with Warning Icon */}
        <div className="p-6 sm:p-8 text-center">
          <div className="relative mx-auto w-20 h-20 mb-4 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[#E07A5F]/15 animate-ping opacity-75" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-[#E07A5F] to-[#B86244] text-white flex items-center justify-center shadow-lg shadow-[#E07A5F]/30">
              <ShieldAlert className="w-10 h-10" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E07A5F]/10 text-[#B86244] text-xs font-bold uppercase tracking-wider mb-3">
            <AlertTriangle className="w-3.5 h-3.5" />
            Chỉ Cho Phép 1 Thiết Bị Đăng Nhập
          </div>

          <h3 className="text-xl sm:text-2xl font-bold font-serif text-[#26211C] mb-2">
            Phiên Đăng Nhập Đã Kết Thúc
          </h3>

          <p className="text-sm text-[#5C5248] leading-relaxed mb-6">
            {message || 'Tài khoản của bạn vừa được đăng nhập trên một thiết bị khác. Để bảo mật thông tin đơn hàng và tài khoản, hệ thống chỉ cho phép 1 thiết bị duy nhất hoạt động tại một thời điểm.'}
          </p>

          {/* Device Sync Info Box */}
          <div className="bg-[#F0EAE1] rounded-2xl p-4 mb-6 border border-[#DFD5C6] text-left text-xs text-[#6B5E51] space-y-2.5">
            <div className="flex items-start gap-2.5">
              <div className="p-1 rounded-lg bg-white text-[#B86244] mt-0.5 shadow-sm">
                <Laptop className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-[#26211C]">Quy tắc 1 Thiết Bị Duy Nhất:</p>
                <p>Tránh trường hợp 2 thiết bị thao tác cùng lúc gây lỗi tồn kho hoặc đơn hàng bị ghi đè chéo.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="p-1 rounded-lg bg-white text-[#E07A5F] mt-0.5 shadow-sm">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-[#26211C]">Nếu bạn không thực hiện đăng nhập này:</p>
                <p>Hãy đăng nhập lại ngay lập tức và đổi mật khẩu trong mục Quản lý tài khoản.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onReLogin) onReLogin();
              }}
              className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-[#B86244] to-[#E07A5F] text-white font-semibold text-sm hover:from-[#A25236] hover:to-[#D0694F] transition-all shadow-md shadow-[#B86244]/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              Đăng Nhập Lại Trên Máy Này
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-3 px-5 rounded-xl border border-[#D5C7B8] text-[#5C5248] font-medium text-sm hover:bg-[#EAE2D7] transition-all cursor-pointer"
            >
              Xem Với Tư Cách Khách
            </button>
          </div>
        </div>

        {/* Close Button top right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#8C7E72] hover:text-[#26211C] hover:bg-[#EAE2D7]/60 transition-colors cursor-pointer"
          title="Đóng thông báo"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
