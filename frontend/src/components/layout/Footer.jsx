import React from 'react';
import { Heart, Sparkles, MapPin, Phone, Mail, Clock, ShieldCheck, Share2, MessageCircle } from 'lucide-react';

const FacebookIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
  </svg>
);

export default function Footer({ onOpenCustomizer, onOpenSizeGuide, onOpenTracking }) {
  return (
    <footer className="bg-[#26211C] text-[#FAF7F2] border-t border-[#3D352E] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#3D352E]">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#B86244] text-white flex items-center justify-center font-serif font-bold text-xl border border-[#A05237]">
                KV
              </div>
              <span className="font-serif-boutique text-2xl font-bold tracking-wider text-white">
                KHÁNHVYMADE
              </span>
            </div>
            <p className="text-sm text-[#CFC1B0] leading-relaxed">
              Xưởng đan vòng tay dây thủ công KhánhVyMade. Từng nút thắt Macrame, sợi chỉ sáp dệt mộc mạc và phụ kiện gốm hoa pastel đều được nghệ nhân đan tay tỉ mỉ, gửi trọn nét bình an & may mắn đến tay bạn.
            </p>
            <div className="flex items-center space-x-3 text-[#CFC1B0]">
              <a
                href="https://www.facebook.com/nguyen.khanh.vy.522878"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#3D352E] flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-colors cursor-pointer"
                title="Ghé thăm Facebook Khánh Vy"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <span className="w-9 h-9 rounded-full bg-[#3D352E] flex items-center justify-center hover:bg-[#B86244] hover:text-white transition-colors cursor-pointer">
                <Share2 className="w-4 h-4" />
              </span>
              <span className="w-9 h-9 rounded-full bg-[#3D352E] flex items-center justify-center hover:bg-[#B86244] hover:text-white transition-colors cursor-pointer">
                <MessageCircle className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-serif-boutique text-lg font-bold text-white mb-4 tracking-wide">
              Chăm Sóc & Trợ Giúp
            </h4>
            <ul className="space-y-2.5 text-sm text-[#CFC1B0]">
              <li>
                <button onClick={onOpenSizeGuide} className="hover:text-white transition-colors text-left">
                  Hướng Dẫn Đo Size Cổ Tay Chuẩn
                </button>
              </li>
              <li>
                <button onClick={onOpenCustomizer} className="hover:text-white transition-colors text-left flex items-center gap-1.5 text-amber-200">
                  <Sparkles className="w-3.5 h-3.5" />
                  Tự Phối Vòng Dây Thủ Công
                </button>
              </li>
              <li>
                <button onClick={onOpenTracking} className="hover:text-white transition-colors text-left">
                  Tra Cứu Tiến Độ Đan Dây & Đơn Hàng
                </button>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer block">
                  Chính Sách Bảo Hành & Đan Lại Dây Trọn Đời
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer block">
                  Hướng Dẫn Bảo Quản Sợi Chỉ Sáp Macrame
                </span>
              </li>
            </ul>
          </div>

          {/* Crafting Studio Info */}
          <div>
            <h4 className="font-serif-boutique text-lg font-bold text-white mb-4 tracking-wide">
              Xưởng Thủ Công
            </h4>
            <div className="space-y-3 text-sm text-[#CFC1B0]">
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#B86244] mt-0.5 flex-shrink-0" />
                <span><strong>Xưởng KhánhVyMade:</strong> Tổ 15, Phường Hòa Thọ Tây, Quận Cẩm Lệ, TP. Đà Nẵng</span>
              </p>
              <p className="flex items-center gap-2.5">
                <FacebookIcon className="w-4 h-4 text-[#1877F2] flex-shrink-0" />
                <a 
                  href="https://www.facebook.com/nguyen.khanh.vy.522878"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white hover:underline text-amber-200"
                >
                  facebook.com/nguyen.khanh.vy.522878
                </a>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#B86244] flex-shrink-0" />
                <span>Hotline/Zalo: 0988.234.567</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#B86244] flex-shrink-0" />
                <span>Mở cửa đan dây: 08:00 - 21:30 hàng ngày</span>
              </p>
            </div>
          </div>

          {/* Guarantee Card */}
          <div className="bg-[#332C25] p-5 rounded-xl border border-[#4A3F35]">
            <div className="flex items-center gap-2 text-[#C09A58] mb-2 font-medium text-sm">
              <ShieldCheck className="w-5 h-5" />
              <span>Cam Kết Vòng Dây Thủ Công</span>
            </div>
            <ul className="text-xs text-[#CFC1B0] space-y-2">
              <li>✓ 100% Sợi chỉ sáp dệt Macrame dẻo dai, chống nước</li>
              <li>✓ Kỹ thuật thắt nút đan tay tỉ mỉ từng chi tiết</li>
              <li>✓ Khóa rút trượt đôi thông minh vừa vặn mọi cỡ tay</li>
              <li>✓ Bảo hành thay sợi và đan lại dây trọn đời</li>
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8C8276] gap-4">
          <p>© 2026 KhánhVyMade - Xưởng Đan Vòng Tay Dây Thủ Công. All rights reserved.</p>
          <p className="flex items-center gap-1 text-[#CFC1B0]">
            Chế tác với tất cả sự nâng niu <Heart className="w-3.5 h-3.5 text-[#B86244] fill-[#B86244]" /> từ nghệ nhân KhánhVyMade
          </p>
        </div>
      </div>
    </footer>
  );
}
