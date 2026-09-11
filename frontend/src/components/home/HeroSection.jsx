import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  HeartHandshake, 
  Feather, 
  Star, 
  Flame, 
  ChevronLeft, 
  ChevronRight,
  Eye
} from 'lucide-react';

export default function HeroSection({ 
  products = [], 
  featuredProduct = null, 
  onExplore, 
  onOpenCustomizer, 
  onQuickViewFeatured 
}) {
  // 1. Danh sách các sản phẩm xu hướng (ưu tiên isTrending, sau đó best seller, hoặc toàn bộ)
  const trendingList = useMemo(() => {
    if (!products || products.length === 0) return [];
    const pinned = products.filter(p => (p.isTrending || p.is_trending) && !p.isHidden);
    if (pinned.length > 0) return pinned;
    const bestSellers = products.filter(p => (p.isBestSeller || p.is_best_seller) && !p.isHidden);
    if (bestSellers.length > 0) return bestSellers;
    return products.filter(p => !p.isHidden);
  }, [products]);

  const [activeProductIndex, setActiveProductIndex] = useState(0);
  const [activeAngleIndex, setActiveAngleIndex] = useState(0);

  // Đặt lại góc chụp khi đổi sản phẩm
  useEffect(() => {
    setActiveAngleIndex(0);
  }, [activeProductIndex]);

  // Sản phẩm hiển thị hiện tại
  const activeProduct = featuredProduct || (trendingList.length > 0 ? trendingList[activeProductIndex % trendingList.length] : products[0]);

  // Các góc ảnh của sản phẩm
  const productImages = useMemo(() => {
    if (activeProduct && Array.isArray(activeProduct.images) && activeProduct.images.length > 0) {
      return activeProduct.images;
    }
    if (activeProduct && activeProduct.image) {
      return [activeProduct.image];
    }
    return ['/images/products/vong-dia-chuon-chuon-logo.jpg'];
  }, [activeProduct]);

  const currentImage = productImages[activeAngleIndex % productImages.length] || productImages[0];

  const handleNextProduct = (e) => {
    e.stopPropagation();
    if (trendingList.length <= 1) return;
    setActiveProductIndex(prev => (prev + 1) % trendingList.length);
  };

  const handlePrevProduct = (e) => {
    e.stopPropagation();
    if (trendingList.length <= 1) return;
    setActiveProductIndex(prev => (prev - 1 + trendingList.length) % trendingList.length);
  };

  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('vi-VN').format(num) + '₫';
  };

  const retailPrice = activeProduct?.price || 195000;
  const originalPrice = activeProduct?.originalPrice && Number(activeProduct.originalPrice) > Number(retailPrice)
    ? Number(activeProduct.originalPrice)
    : null;

  return (
    <section className="relative overflow-hidden py-6 sm:py-14 px-3 sm:px-6 lg:px-8 w-full animate-fadeIn">
      {/* Translucent Centered Box with Subtle White Borders (Glassmorphism Effect) */}
      <div className="glass-panel max-w-6xl mx-auto rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-12 lg:p-14 border border-white/90 shadow-[0_20px_60px_-15px_rgba(180,150,130,0.15)] relative overflow-hidden backdrop-blur-2xl">
        
        {/* Soft Ambient Light Gradient Inside Box */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-[#F7ECE8]/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-[#E5EDE8]/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/20 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          
          {/* Left Hero Content: Elegant Typography & Minimalist Layout */}
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
                type="button"
                onClick={onOpenCustomizer}
                className="w-full sm:w-auto btn-luxury-cta px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg group cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-100 group-hover:rotate-12 transition-transform" />
                <span>Tự Phối Vòng Tay Studio</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
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

          {/* Right Hero Image Card (ĐỘNG: Nạp bất kỳ sản phẩm/hình ảnh xu hướng nào) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Image Frame with Subtle White Glass Border */}
              <div 
                onClick={() => {
                  if (activeProduct && onQuickViewFeatured) {
                    onQuickViewFeatured(activeProduct);
                  }
                }}
                className="relative rounded-3xl overflow-hidden shadow-[0_20px_40px_-10px_rgba(180,150,130,0.25)] border-4 border-white/95 bg-white/40 backdrop-blur-md group cursor-pointer transition-transform duration-500 hover:-translate-y-1"
                title="Bấm để xem chi tiết sản phẩm xu hướng này"
              >
                <div className="relative aspect-[4/5] sm:aspect-[3/4] w-full overflow-hidden bg-[#FAF7F2]">
                  <img
                    src={currentImage}
                    alt={activeProduct?.name || 'Sản phẩm xu hướng Vòng Tay Nhà Zy'}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => { e.target.src = '/images/products/bracelet-pastel-macrame-trio.jpg'; }}
                  />

                  {/* Nút chuyển đổi sản phẩm xu hướng khác (nếu có nhiều sản phẩm trending) */}
                  {trendingList.length > 1 && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 z-20">
                      <button
                        type="button"
                        onClick={handlePrevProduct}
                        className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#231F1C] border border-white flex items-center justify-center shadow-md backdrop-blur-md transition-all active:scale-90 cursor-pointer"
                        title="Xem mẫu xu hướng trước"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextProduct}
                        className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#231F1C] border border-white flex items-center justify-center shadow-md backdrop-blur-md transition-all active:scale-90 cursor-pointer"
                        title="Xem mẫu xu hướng tiếp theo"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Thanh chọn góc ảnh nếu sản phẩm có nhiều ảnh */}
                  {productImages.length > 1 && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/40"
                    >
                      {productImages.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveAngleIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                            (activeAngleIndex % productImages.length) === idx
                              ? 'w-5 bg-white'
                              : 'bg-white/50 hover:bg-white/80'
                          }`}
                          title={`Góc chụp ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Hover Quick View Overlay Hint */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="px-4 py-2 rounded-full bg-white/95 text-[#231F1C] font-bold text-xs flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                      <Eye className="w-3.5 h-3.5 text-[#C59B6D]" />
                      <span>Xem Chi Tiết Mẫu Này</span>
                    </span>
                  </div>
                </div>

                {/* Floating Translucent Glass Card */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/90 backdrop-blur-xl border border-white shadow-lg flex items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] tracking-wider uppercase font-bold text-[#C59B6D] bg-[#FAF4E8] px-2.5 py-0.5 rounded-full inline-block border border-[#EADBCC]">
                        {activeProduct?.tag || 'Haute Signature 2026'}
                      </span>
                      {(activeProduct?.isTrending || activeProduct?.is_trending) && (
                        <span className="text-[9px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                          <Flame className="w-2.5 h-2.5" />
                          <span>Xu Hướng</span>
                        </span>
                      )}
                    </div>
                    <h4 className="font-serif-boutique text-base sm:text-lg font-bold text-[#231F1C] leading-snug line-clamp-1">
                      {activeProduct?.name || 'Vòng Tay Thủ Công KhánhVyMade'}
                    </h4>
                    <p className="text-xs text-[#6B6258] flex items-center gap-1">
                      <Star className={`w-3.5 h-3.5 ${((activeProduct?.reviewsCount || activeProduct?.reviews_count) > 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                      {(activeProduct?.reviewsCount || activeProduct?.reviews_count) > 0 ? (
                        <>
                          <span className="font-bold text-[#26211C]">{Number(activeProduct.rating || 5.0).toFixed(1)}</span> 
                          <span className="text-[11px] text-[#948A7E]">
                            ({activeProduct.reviewsCount || activeProduct.reviews_count} đánh giá)
                          </span>
                        </>
                      ) : (
                        <span className="text-[11px] text-[#948A7E]">Mới ra mắt</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {originalPrice && (
                      <p className="text-[11px] text-[#948A7E] line-through">{formatCurrency(originalPrice)}</p>
                    )}
                    <p className="text-base sm:text-lg font-bold text-[#C59B6D]">{formatCurrency(retailPrice)}</p>
                  </div>
                </div>
              </div>

              {/* Decorative Floating Badges */}
              <div className="absolute -top-3 -left-3 glass-pill py-2 px-3.5 rounded-2xl shadow-md border border-white hidden sm:flex items-center gap-2 pointer-events-none">
                <Feather className="w-4 h-4 text-[#C59B6D]" />
                <span className="text-xs font-semibold text-[#231F1C]">
                  {activeProduct?.leadTime || 'Đan tay 3 tiếng tỉ mỉ'}
                </span>
              </div>

              <div className="absolute -bottom-3 -right-3 glass-pill py-2 px-3.5 rounded-2xl shadow-md border border-white hidden sm:flex items-center gap-2 pointer-events-none">
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
