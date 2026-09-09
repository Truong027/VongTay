import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, HeartHandshake, Feather, Star, Gem, Compass } from 'lucide-react';

export default function HeroSection({ onExplore, onOpenCustomizer, onQuickViewFeatured }) {
  return (
    <section className="relative overflow-hidden py-6 sm:py-14 px-3 sm:px-6 lg:px-8 w-full">
      {/* Translucent Centered Box with Subtle White Borders (Glassmorphism Effect) */}
      <div className="glass-panel max-w-6xl mx-auto rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-12 lg:p-14 border border-white/90 shadow-[0_20px_60px_-15px_rgba(180,150,130,0.15)] relative overflow-hidden backdrop-blur-2xl">
        
        {/* Soft Ambient Light Gradient Inside Box */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-[#F7ECE8]/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-[#E5EDE8]/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/20 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          
          {/* Left Hero Content: Elegant Serif Typography & Minimalist Layout */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left">
            
            {/* Top Eyebrow Glass Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/85 border border-white/90 text-xs font-bold text-[#C59B6D] shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#DFB78C] shrink-0" />
              <span className="tracking-wider uppercase text-[11px] sm:text-xs">
                KHÁNHVYMADE · HAUTE ARTISANAL JEWELRY
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif-boutique text-3xl sm:text-5xl lg:text-6xl font-bold text-[#231F1C] tracking-tight leading-[1.18]">
              Tuyệt tác vòng tay thủ công <br className="hidden sm:inline" />
              <span className="text-[#C59B6D] italic font-normal">tinh tuyển từ đá tự nhiên</span> & sợi dệt độc bản.
            </h1>

            {/* Minimalist Subtitle */}
            <p className="text-[#6B6258] text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
              Được kiến tạo từ niềm đam mê trang sức nghệ thuật: từng sợi chỉ sáp Macrame dẻo dai, charm gốm men pastel nung thủ công và đá phong thủy tự nhiên mang đến vẻ đẹp nhẹ nhàng, thuần khiết và thanh lịch cho người đeo.
            </p>

            {/* Clear CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={onOpenCustomizer}
                className="w-full sm:w-auto btn-luxury-cta px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg group cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-100 group-hover:rotate-12 transition-transform" />
                <span>Tự Phối Vòng Tay Studio</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onExplore}
                className="w-full sm:w-auto btn-luxury-secondary px-7 py-3.5 rounded-full text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
              >
                Xem Bộ Sưu Tập Mới
              </button>
            </div>

            {/* Minimalist Luxury Trust Badges */}
            <div className="pt-6 sm:pt-8 border-t border-white/60 grid grid-cols-3 gap-4 text-center lg:text-left">
              <div>
                <p className="font-serif-boutique text-2xl sm:text-3xl font-bold text-[#C59B6D]">100%</p>
                <p className="text-[11px] sm:text-xs text-[#6B6258] mt-0.5 font-medium">Đá Quý & Gốm Tự Nhiên</p>
              </div>
              <div>
                <p className="font-serif-boutique text-2xl sm:text-3xl font-bold text-[#C59B6D]">May Đo</p>
                <p className="text-[11px] sm:text-xs text-[#6B6258] mt-0.5 font-medium">Chuẩn Theo Cỡ Cổ Tay</p>
              </div>
              <div>
                <p className="font-serif-boutique text-2xl sm:text-3xl font-bold text-[#C59B6D]">Trọn Đời</p>
                <p className="text-[11px] sm:text-xs text-[#6B6258] mt-0.5 font-medium">Bảo Hành Đan Dây Miễn Phí</p>
              </div>
            </div>

          </div>

          {/* Right Hero Image Card (Frosted Glass Card with Delicate White Border) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Image Frame with Subtle White Glass Border */}
              <div className="relative rounded-3xl overflow-hidden shadow-[0_15px_35px_-5px_rgba(180,150,130,0.2)] border-4 border-white/95 bg-white/40 backdrop-blur-md group">
                <img
                  src="/images/products/vong-dia-chuon-chuon-logo.jpg"
                  alt="Vòng Tay Dây Đĩa Men Sứ Chuồn Chuồn KhánhVyMade"
                  className="w-full h-[360px] sm:h-[440px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />

                {/* Floating Translucent Glass Card */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/88 backdrop-blur-xl border border-white shadow-lg flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] tracking-wider uppercase font-bold text-[#C59B6D] bg-[#FAF4E8] px-2.5 py-0.5 rounded-full inline-block border border-[#EADBCC]">
                      Haute Signature 2026
                    </span>
                    <h4 className="font-serif-boutique text-base sm:text-lg font-bold text-[#231F1C] leading-snug">
                      Vòng Dây Đĩa Men Sứ Chuồn Chuồn
                    </h4>
                    <p className="text-xs text-[#6B6258] flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="font-bold text-[#231F1C]">5.0</span> 
                      <span className="text-[11px] text-[#948A7E]">(128 đánh giá từ khách hàng)</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-[#948A7E] line-through">235.000₫</p>
                    <p className="text-base sm:text-lg font-bold text-[#C59B6D]">195.000₫</p>
                  </div>
                </div>
              </div>

              {/* Decorative Floating Badges */}
              <div className="absolute -top-3 -left-3 glass-pill py-2 px-3.5 rounded-2xl shadow-md border border-white hidden sm:flex items-center gap-2">
                <Feather className="w-4 h-4 text-[#C59B6D]" />
                <span className="text-xs font-semibold text-[#231F1C]">Đan tay 3 tiếng tỉ mỉ</span>
              </div>

              <div className="absolute -bottom-3 -right-3 glass-pill py-2 px-3.5 rounded-2xl shadow-md border border-white hidden sm:flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-[#C59B6D]" />
                <span className="text-xs font-semibold text-[#231F1C]">Tặng hộp lụa gấm</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
