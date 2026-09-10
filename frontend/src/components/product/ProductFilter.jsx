import React from 'react';
import { Sparkles, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

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

  return (
    <div className="space-y-4 mb-8 w-full max-w-full">
      
      {/* Category Glass Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none max-w-full w-full touch-pan-x">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                if (isSelected) {
                  onSelectCategory('all');
                } else {
                  onSelectCategory(cat.id);
                }
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ios-press ${
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

      {/* Secondary Bar: Feng Shui Mệnh Filter & Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-white/60 w-full max-w-full">
        
        {/* Mệnh Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs max-w-full w-full touch-pan-x">
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
