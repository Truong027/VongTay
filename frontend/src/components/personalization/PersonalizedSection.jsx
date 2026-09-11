import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  Heart, 
  ShoppingBag, 
  Eye, 
  SlidersHorizontal, 
  CheckCircle2, 
  RefreshCw,
  Compass,
  Flame,
  Palette,
  Ruler,
  Tag
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { isBraceletProduct } from '../../utils/productUtils';

export default function PersonalizedSection({ products, onQuickView, currentUser }) {
  const { addToCart, isWishlisted, toggleWishlist } = useCart();

  // Load preferences from localStorage or initialize with smart defaults
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('khanhvy_user_preferences');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      styleCategory: 'macrame-pastel',
      wristSize: '15 - 16 cm',
      purpose: 'tinh-duyen-may-man'
    };
  });

  const [isCustomizing, setIsCustomizing] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  // Save to localStorage when preferences change
  const updatePreference = (key, value) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    try {
      localStorage.setItem('khanhvy_user_preferences', JSON.stringify(updated));
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2000);
    } catch {
      // ignore
    }
  };

  // Compute personalized recommendations based on preference matching algorithm
  const recommendations = useMemo(() => {
    if (!products || products.length === 0) return [];

    return products.map(prod => {
      let score = 85; // base score

      // Category match
      if (preferences.styleCategory === 'all' || prod.category === preferences.styleCategory) {
        score += 8;
      }

      // Best seller boost
      if (prod.isBestSeller) {
        score += 5;
      }

      // Purpose matching heuristics
      if (preferences.purpose === 'tinh-duyen-may-man' && (prod.meaning?.includes('tình') || prod.meaning?.includes('duyên') || prod.category === 'vong-doi')) {
        score += 4;
      } else if (preferences.purpose === 'binh-an-ho-than' && (prod.category === 'day-do-may-man' || prod.meaning?.includes('bình an') || prod.meaning?.includes('hộ thân'))) {
        score += 4;
      } else if (preferences.purpose === 'vintage-aesthetic' && (prod.category === 'day-lua-co-phong' || prod.category === 'macrame-pastel')) {
        score += 4;
      }

      // Cap at 99%
      score = Math.min(99, score);

      return {
        ...prod,
        matchScore: score,
        matchReason: prod.category === preferences.styleCategory 
          ? `Chuẩn gu ${preferences.styleCategory === 'macrame-pastel' ? 'Macrame Pastel' : preferences.styleCategory === 'vong-doi' ? 'Vòng Đôi' : preferences.styleCategory === 'day-do-may-man' ? 'Chỉ Đỏ' : 'Dây Lụa Cổ Phong'}` 
          : 'Dây rút freesize tùy chỉnh ôm khít cổ tay bạn'
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3); // top 3 tailored for the user
  }, [products, preferences]);

  if (!products || products.length === 0) return null;

  return (
    <section className="bg-gradient-to-b from-[#FAF4ED] via-white to-[#FAF7F2] py-8 sm:py-10 px-3 sm:px-6 lg:px-8 border-y border-[#EADBCC] relative overflow-hidden w-full max-w-full">
      {/* Decorative background blurs */}
      <div className="absolute -top-12 left-1/4 w-72 h-72 bg-[#B86244]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 right-1/4 w-72 h-72 bg-[#4E6857]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-5 sm:space-y-6 w-full max-w-full">
        
        {/* Section Header with Personal Badge */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#26211C] text-white px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold shadow-sm mb-2.5 max-w-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
              <span className="truncate">GỢI Ý THIẾT KẾ RIÊNG CHO {currentUser?.fullName ? currentUser.fullName.toUpperCase() : 'BẠN'}</span>
              <span className="text-[9px] sm:text-[10px] bg-[#B86244] px-1.5 py-0.2 rounded font-mono shrink-0">AI</span>
            </div>

            <h2 className="font-serif-boutique text-2xl sm:text-3xl font-bold text-[#26211C] tracking-tight">
              Gợi Ý Cá Nhân Hóa Dành Riêng Cho Bạn
            </h2>
            <p className="text-xs sm:text-sm text-[#6B6258] mt-1 max-w-xl">
              Hệ thống tự động bóc tách sở thích, size cổ tay và phong cách để đề xuất những mẫu vòng dây đan thủ công hợp gu nhất.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {savedNotice && (
              <span className="text-xs text-[#4E6857] font-semibold flex items-center gap-1 animate-fadeIn">
                <CheckCircle2 className="w-3.5 h-3.5" /> Đã cập nhật gu!
              </span>
            )}
            <button
              onClick={() => setIsCustomizing(!isCustomizing)}
              className="px-4 py-2 rounded-xl bg-white border border-[#E8DFD3] hover:bg-[#FAF4ED] text-xs font-semibold text-[#26211C] shadow-xs flex items-center gap-1.5 transition-all"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#B86244]" />
              <span>{isCustomizing ? 'Thu Gọn Bộ Gu' : 'Tùy Chỉnh Gu Riêng Của Bạn'}</span>
            </button>
          </div>
        </div>

        {/* Interactive Preferences Panel (Collapsible / Customizable) */}
        {isCustomizing && (
          <div className="bg-white p-5 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-4 animate-fadeIn text-xs">
            <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-2">
              <span className="font-bold text-sm text-[#26211C] flex items-center gap-1.5">
                <span>🎯</span> Thiết Lập Hồ Sơ Gu Cá Nhân (Chạm để đổi ngay)
              </span>
              <span className="text-[10px] text-[#8C8276]">Lưu tự động vào trình duyệt</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Style Category */}
              <div>
                <label className="font-bold text-[#26211C] block mb-2 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-[#B86244]" /> Phong cách dây yêu thích:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'macrame-pastel', label: '🌸 Macrame Pastel' },
                    { id: 'vong-doi', label: '💑 Vòng Đôi Nam Châm' },
                    { id: 'day-do-may-man', label: '🧧 Chỉ Đỏ Hộ Thân' },
                    { id: 'day-lua-co-phong', label: '🌿 Cổ Phong & Dây Da' }
                  ].map(st => (
                    <button
                      key={st.id}
                      onClick={() => updatePreference('styleCategory', st.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        preferences.styleCategory === st.id
                          ? 'bg-[#B86244] text-white font-bold shadow-xs'
                          : 'bg-[#FAF7F2] text-[#6B6258] border border-[#E8DFD3] hover:bg-[#F0EAE1]'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wrist Size */}
              <div>
                <label className="font-bold text-[#26211C] block mb-2 flex items-center gap-1">
                  <Ruler className="w-3.5 h-3.5 text-[#4E6857]" /> Kích thước cổ tay bạn:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { size: '13 - 14 cm', label: '13-14cm (Nhỏ mảnh)' },
                    { size: '15 - 16 cm', label: '15-16cm (Tiêu chuẩn)' },
                    { size: '17 - 18 cm', label: '17-18cm (Đậm đà/Nam)' },
                    { size: 'freesize', label: 'Dây rút Freesize' }
                  ].map(sz => (
                    <button
                      key={sz.size}
                      onClick={() => updatePreference('wristSize', sz.size)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        preferences.wristSize === sz.size
                          ? 'bg-[#4E6857] text-white font-bold shadow-xs'
                          : 'bg-[#FAF7F2] text-[#6B6258] border border-[#E8DFD3] hover:bg-[#F0EAE1]'
                      }`}
                    >
                      {sz.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="font-bold text-[#26211C] block mb-2 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-amber-600" /> Mục đích tìm vòng:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'tinh-duyen-may-man', label: '💘 Tình duyên & Thu hút' },
                    { id: 'binh-an-ho-than', label: '🙏 Bình an & Sức khỏe' },
                    { id: 'vintage-aesthetic', label: '✨ Phối đồ thời trang' }
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => updatePreference('purpose', p.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        preferences.purpose === p.id
                          ? 'bg-[#26211C] text-white font-bold shadow-xs'
                          : 'bg-[#FAF7F2] text-[#6B6258] border border-[#E8DFD3] hover:bg-[#F0EAE1]'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Current Active Gu Pill */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-[#6B6258] bg-white/80 backdrop-blur-xs px-3 sm:px-3.5 py-2 rounded-2xl border border-[#EADBCC] w-full sm:w-fit max-w-full">
          <span className="font-bold text-[#26211C] whitespace-nowrap">Gu của bạn:</span>
          <span className="bg-[#FAF4ED] text-[#B86244] font-semibold px-2 py-0.5 rounded-lg border border-[#EADBCC] whitespace-nowrap">
            {preferences.styleCategory === 'macrame-pastel' ? '🌸 Macrame Pastel' : preferences.styleCategory === 'vong-doi' ? '💑 Vòng Đôi' : preferences.styleCategory === 'day-do-may-man' ? '🧧 Chỉ Đỏ' : '🌿 Dây Lụa'}
          </span>
          <span className="hidden sm:inline">·</span>
          <span className="whitespace-nowrap">Cổ tay: <strong>{preferences.wristSize}</strong></span>
          <span className="hidden sm:inline">·</span>
          <span className="text-[#4E6857] font-semibold text-[11px] sm:text-xs">Tự động đề xuất 3 mẫu khớp nhất</span>
        </div>

        {/* Top 3 Personalized Product Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {recommendations.map((prod, idx) => (
            <div 
              key={prod.id}
              onClick={() => onQuickView(prod)}
              className="group bg-white rounded-3xl p-3.5 sm:p-4 border border-[#E8DFD3] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden"
            >
              {/* Match Score Badge */}
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex flex-col gap-1 items-start">
                <span className="bg-[#26211C] text-[#FAF7F2] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 border border-amber-400/40">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>{prod.matchScore}% PHÙ HỢP GU BẠN</span>
                </span>
                {prod.isBestSeller && (
                  <span className="bg-gradient-to-r from-amber-600 to-rose-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    🔥 BEST SELLER {prod.salesCount > 0 ? `(${prod.salesCount})` : ''}
                  </span>
                )}
              </div>

              {/* Product Image */}
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#E8DFD3] mb-3">
                <img
                  src={prod.images?.[0] || '/images/products/bracelet-pastel-macrame-trio.jpg'}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(prod.id);
                  }}
                  className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 backdrop-blur-md text-[#6B6258] hover:text-[#B86244] transition-transform hover:scale-110 shadow-xs"
                >
                  <Heart className={`w-3.5 h-3.5 ${isWishlisted(prod.id) ? 'fill-[#B86244] text-[#B86244]' : ''}`} />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[11px] text-[#4E6857] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{prod.matchReason}</span>
                  </p>
                  <h3 className="font-serif-boutique font-bold text-sm text-[#26211C] group-hover:text-[#B86244] transition-colors line-clamp-2 mt-1">
                    {prod.name}
                  </h3>
                  <p className="text-[11px] text-[#8C8276] line-clamp-1 mt-0.5">
                    {prod.cordComposition?.coreMaterial || prod.cordType}
                  </p>
                </div>

                {/* Price & Add */}
                <div className="pt-3 border-t border-[#F0EAE1] mt-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-bold text-[#B86244]">
                        {prod.price.toLocaleString('vi-VN')}₫
                      </span>
                      <span className="text-[10px] text-[#8C8276]">lẻ</span>
                    </div>
                    {prod.wholesalePrice && (
                      <span className="text-[10px] text-[#4E6857] font-semibold block">
                        Sỉ: {prod.wholesalePrice.toLocaleString('vi-VN')}₫ (từ {prod.wholesaleMinQty || 5}c)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickView(prod);
                      }}
                      className="p-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F0EAE1] text-[#26211C] text-xs transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(prod, 1, { wristSize: isBraceletProduct(prod) ? preferences.wristSize : null });
                      }}
                      className="px-3 py-2 rounded-xl bg-[#B86244] hover:bg-[#A05237] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Chọn Mua</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
