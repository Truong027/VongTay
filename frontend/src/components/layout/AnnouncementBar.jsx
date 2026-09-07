import React from 'react';
import { Sparkles, Truck, ShieldCheck, Heart, User, LogIn } from 'lucide-react';

export default function AnnouncementBar({ currentUser, onOpenAuth }) {
  return (
    <div className="bg-[#26211C] text-[#FAF7F2] text-xs py-2 px-4 border-b border-[#3D352E]">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center bg-[#B86244] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            MỚI
          </span>
          <span className="font-medium text-amber-100">
            Tặng hộp gấm lụa & túi thanh tẩy trầm hương cho mọi đơn hàng hôm nay
          </span>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6 text-[#CFC1B0] text-[11px]">
          <span className="hidden md:flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-[#B86244]" /> Miễn phí ship từ 400.000₫
          </span>
          <span className="hidden sm:flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C09A58]" /> 100% Vòng Dây Đan Tay Thủ Công
          </span>
          
          {/* Direct Auth Prompt */}
          {currentUser ? (
            <span className="text-amber-200 font-medium flex items-center gap-1">
              <span>🌿 Chào mừng,</span>
              <strong className="text-white">{currentUser.fullName}</strong>
            </span>
          ) : (
            <button
              onClick={onOpenAuth}
              className="text-amber-300 hover:text-white underline font-semibold flex items-center gap-1 transition-colors cursor-pointer"
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
