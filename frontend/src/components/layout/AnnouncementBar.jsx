import React from 'react';
import { Sparkles, Truck, ShieldCheck, Heart, User, LogIn } from 'lucide-react';

export default function AnnouncementBar({ currentUser, onOpenAuth }) {
  return (
    <div className="bg-gradient-to-r from-[#FBF4E8]/90 via-white/80 to-[#F7ECE8]/90 text-[#473F38] text-xs py-2 px-4 border-b border-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div className="flex items-center gap-2 justify-center sm:justify-start">
          <span className="inline-flex items-center justify-center bg-[#C59B6D] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
            ✨ MỚI
          </span>
          <span className="font-semibold text-[#231F1C] text-[11px] sm:text-xs">
            Tặng hộp lụa gấm cao cấp & túi trầm hương thanh tẩy cho mọi đơn hàng hôm nay
          </span>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6 text-[#6B6258] text-[11px]">
          <span className="hidden md:flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-[#C59B6D]" /> Miễn phí giao hàng từ 400.000₫
          </span>
          <span className="hidden sm:flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C59B6D]" /> 100% Trang Sức Thủ Công Độc Bản
          </span>
          
          {/* Direct Auth Prompt */}
          {currentUser ? (
            <span className="text-[#C59B6D] font-semibold flex items-center gap-1">
              <span>🌿 Chào mừng,</span>
              <strong className="text-[#231F1C]">{currentUser.fullName}</strong>
            </span>
          ) : (
            <button
              onClick={onOpenAuth}
              className="text-[#C59B6D] hover:text-[#9A744A] underline font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <LogIn className="w-3 h-3" />
              <span>Đăng nhập / Đăng ký nhận voucher 10%</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
