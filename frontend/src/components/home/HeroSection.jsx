import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, HeartHandshake, Feather, Star } from 'lucide-react';

export default function HeroSection({ onExplore, onOpenCustomizer, onQuickViewFeatured }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F3ECE1] via-[#FAF7F2] to-[#FAF7F2] py-16 sm:py-24 border-b border-[#E8DFD3]">
      {/* Decorative subtle background accents */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-[#B86244]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-[#4E6857]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Text */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF7F2] border border-[#E8DFD3] text-xs font-medium text-[#B86244] shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#C09A58]" />
              <span>Chế Tác Thủ Công 100% · Độc Bản Cho Riêng Bạn</span>
            </div>

            <h1 className="font-serif-boutique text-4xl sm:text-5xl lg:text-6xl font-bold text-[#26211C] tracking-tight leading-[1.15]">
              Từng mối đan tỉ mỉ, <br className="hidden sm:inline" />
              <span className="text-[#B86244] italic font-normal">vạn ý niệm bình an</span> gửi gắm nơi cổ tay.
            </h1>

            <p className="text-[#6B6258] text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Không đơn thuần là trang sức, mỗi chiếc vòng tay tại <strong>KhánhVyMade</strong> là một câu chuyện bình an được đan kết từ sợi chỉ sáp dệt Macrame dẻo dai, phụ kiện gốm hoa pastel ngọt ngào và sự tỉ mỉ của đôi bàn tay nghệ nhân.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onOpenCustomizer}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#B86244] text-white font-medium hover:bg-[#A05237] shadow-artisan-hover transition-all flex items-center justify-center gap-2 text-sm sm:text-base group"
              >
                <Sparkles className="w-4 h-4 text-amber-200 group-hover:rotate-12 transition-transform" />
                <span>Tự Phối Vòng Tay Studio</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onExplore}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white border border-[#CFC1B0] text-[#26211C] font-medium hover:bg-[#F3ECE1] hover:border-[#B86244] transition-all text-sm sm:text-base shadow-sm"
              >
                Xem Bộ Sưu Tập Mới
              </button>
            </div>

            {/* Trust badges */}
            <div className="pt-8 border-t border-[#E8DFD3] grid grid-cols-3 gap-4 text-center lg:text-left">
              <div>
                <p className="font-serif-boutique text-2xl font-bold text-[#26211C]">100%</p>
                <p className="text-xs text-[#6B6258] mt-0.5">Sợi Dệt & Đan Tay</p>
              </div>
              <div>
                <p className="font-serif-boutique text-2xl font-bold text-[#26211C]">Custom</p>
                <p className="text-xs text-[#6B6258] mt-0.5">Đo May Theo Size Cổ Tay</p>
              </div>
              <div>
                <p className="font-serif-boutique text-2xl font-bold text-[#26211C]">Trọn Đời</p>
                <p className="text-xs text-[#6B6258] mt-0.5">Bảo Hành Thay Dây Miễn Phí</p>
              </div>
            </div>
          </div>

          {/* Right Hero Image Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Image Frame with Luxury Border */}
              <div className="relative rounded-2xl overflow-hidden shadow-artisan-lg border-8 border-white bg-[#F3ECE1] group">
                <img
                  src="/images/products/bracelet-whale-ceramic.jpg"
                  alt="Vòng Tay Dây Macrame Cá Voi Men Gốm KhánhVyMade"
                  className="w-full h-[400px] sm:h-[460px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />

                {/* Floating Artisan Card */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-[#E8DFD3] shadow-lg flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] tracking-wider uppercase font-semibold text-[#B86244] bg-[#FBEFEA] px-2 py-0.5 rounded-full inline-block">
                      Signature Macrame 2026
                    </span>
                    <h4 className="font-serif-boutique text-base font-bold text-[#26211C] leading-snug">
                      Vòng Dây Macrame Cá Voi Gốm & Sao Pha Lê
                    </h4>
                    <p className="text-xs text-[#6B6258] flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="font-semibold text-[#26211C]">5.0</span> (64 đánh giá nghệ nhân)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#8C8276] line-through">220.000₫</p>
                    <p className="text-base font-bold text-[#B86244]">185.000₫</p>
                  </div>
                </div>
              </div>

              {/* Decorative Floating Badges */}
              <div className="absolute -top-4 -left-4 bg-[#26211C] text-[#FAF7F2] py-2 px-3.5 rounded-xl shadow-lg border border-[#3D352E] hidden sm:flex items-center gap-2 animate-bounce duration-1000">
                <Feather className="w-4 h-4 text-[#C09A58]" />
                <span className="text-xs font-medium">Đan tay 3 tiếng tỉ mỉ</span>
              </div>

              <div className="absolute -bottom-3 -right-3 bg-white text-[#26211C] py-2 px-3 rounded-xl shadow-md border border-[#E8DFD3] hidden sm:flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-[#B86244]" />
                <span className="text-xs font-semibold">Tặng hộp quà lụa gấm</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
