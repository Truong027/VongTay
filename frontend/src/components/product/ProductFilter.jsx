import React, { useRef, useState, useEffect } from 'react';
import { Sparkles, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedMenh,
  onSelectMenh,
  sortOption,
  onSortChange,
  totalResults
}) {
  const menhList = [
    { id: 'all', label: 'Tất Cả Mệnh', color: '#6B6258' },
    { id: 'Kim', label: 'Mệnh Kim (Trắng, Vàng)', color: '#C59B6D' },
    { id: 'Mộc', label: 'Mệnh Mộc (Xanh Lục)', color: '#4E6857' },
    { id: 'Thủy', label: 'Mệnh Thủy (Xanh Lam)', color: '#4A7C9D' },
    { id: 'Hỏa', label: 'Mệnh Hỏa (Hồng, Đỏ)', color: '#C85A32' },
    { id: 'Thổ', label: 'Mệnh Thổ (Nâu, Vàng Đất)', color: '#8A5D3B' }
  ];

  // Ref & State cho thanh trượt danh mục (vuốt chuột, lăn chuột ngang & nút mũi tên ‹ ›)
  const catRailRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const isDraggingRail = useRef(false);
  const startXRail = useRef(0);
  const scrollLeftRail = useRef(0);
  const hasMovedRail = useRef(false);

  const checkRailScroll = () => {
    if (catRailRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = catRailRef.current;
      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
    }
  };

  useEffect(() => {
    const el = catRailRef.current;
    if (!el) return;

    checkRailScroll();
    const timer = setTimeout(checkRailScroll, 150);
    el.addEventListener('scroll', checkRailScroll, { passive: true });
    window.addEventListener('resize', checkRailScroll);

    // Chuyển lăn chuột dọc thành cuộn ngang mượt mà
    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      clearTimeout(timer);
      el.removeEventListener('scroll', checkRailScroll);
      window.removeEventListener('resize', checkRailScroll);
      el.removeEventListener('wheel', handleWheel);
    };
  }, [categories]);

  const handleMouseDown = (e) => {
    if (!catRailRef.current) return;
    isDraggingRail.current = true;
    startXRail.current = e.pageX - catRailRef.current.offsetLeft;
    scrollLeftRail.current = catRailRef.current.scrollLeft;
    hasMovedRail.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRail.current || !catRailRef.current) return;
    const x = e.pageX - catRailRef.current.offsetLeft;
    const walk = (x - startXRail.current) * 1.6;
    if (Math.abs(walk) > 4) {
      hasMovedRail.current = true;
    }
    catRailRef.current.scrollLeft = scrollLeftRail.current - walk;
  };

  const handleMouseUp = () => {
    isDraggingRail.current = false;
    setTimeout(() => {
      hasMovedRail.current = false;
    }, 60);
  };

  return (
    <div className="space-y-4 mb-8 w-full max-w-full">
      
      {/* Category Glass Pills Slider với hỗ trợ Vuốt chuột, Lăn bánh xe & Nút trượt ‹ › */}
      <div className="relative flex items-center w-full max-w-full group/catrail">
        {/* Nút trượt sang trái */}
        <button
          type="button"
          onClick={() => catRailRef.current?.scrollBy({ left: -240, behavior: 'smooth' })}
          className={`absolute left-0 z-10 w-7 h-7 rounded-full bg-white/95 text-[#26211C] shadow-md border border-[#EADBCC] flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95 ${
            canScrollLeft ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-75 pointer-events-none'
          }`}
          title="Trượt sang trái"
        >
          <ChevronLeft className="w-4 h-4 text-[#B86244]" />
        </button>

        <div
          ref={catRailRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none max-w-full w-full touch-pan-x cursor-grab active:cursor-grabbing select-none scroll-smooth"
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  if (hasMovedRail.current) return;
                  if (isSelected) {
                    onSelectCategory('all');
                  } else {
                    onSelectCategory(cat.id);
                  }
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ios-press shrink-0 ${
                  isSelected
                    ? 'btn-luxury-cta shadow-md'
                    : 'ios-pill text-[#6B6258] hover:text-[#231F1C] hover:bg-white/80'
                }`}
              >
                <span>{cat.name}</span>
                {cat.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-[#FAF4E8] text-[#C59B6D]'
                  }`}>
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Nút trượt sang phải */}
        <button
          type="button"
          onClick={() => catRailRef.current?.scrollBy({ left: 240, behavior: 'smooth' })}
          className={`absolute right-0 z-10 w-7 h-7 rounded-full bg-white/95 text-[#26211C] shadow-md border border-[#EADBCC] flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95 ${
            canScrollRight ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-75 pointer-events-none'
          }`}
          title="Trượt sang phải"
        >
          <ChevronRight className="w-4 h-4 text-[#B86244]" />
        </button>
      </div>

      {/* Secondary Bar: Feng Shui Mệnh Filter & Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-white/60 w-full max-w-full">
        
        {/* Mệnh Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs max-w-full w-full touch-pan-x scrollbar-none">
          <span className="text-[#948A7E] font-medium mr-1 flex items-center gap-1 flex-shrink-0 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-[#C59B6D]" /> Cung Mệnh:
          </span>
          {menhList.map((m) => {
            const isSelected = selectedMenh === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  if (isSelected && m.id !== 'all') {
                    onSelectMenh('all');
                  } else {
                    onSelectMenh(m.id);
                  }
                }}
                className={`px-3 py-1 rounded-xl font-semibold transition-all flex-shrink-0 cursor-pointer text-xs ios-press ${
                  isSelected
                    ? 'bg-[#C59B6D] text-white shadow-xs'
                    : 'ios-pill text-[#6B6258] hover:text-[#231F1C] hover:bg-white/80'
                }`}
              >
                {m.id === 'all' ? 'Tất cả' : m.id}
              </button>
            );
          })}
        </div>

        {/* Total count & Sort Dropdown */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 sm:gap-3 text-xs w-full sm:w-auto">
          <span className="text-[#948A7E] text-[11px]">
            Hiển thị <strong className="text-[#231F1C]">{totalResults}</strong> mẫu vòng thủ công
          </span>

          <div className="flex items-center gap-1.5 ios-pill px-3 py-1.5 rounded-2xl text-[#231F1C] shadow-2xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#C59B6D]" />
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-transparent font-semibold focus:outline-none text-xs cursor-pointer"
            >
              <option value="popular">Bán chạy nhất</option>
              <option value="price-asc">Giá: Thấp đến cao</option>
              <option value="price-desc">Giá: Cao đến thấp</option>
              <option value="rating">Đánh giá cao nhất</option>
            </select>
          </div>
        </div>

      </div>

    </div>
  );
}
