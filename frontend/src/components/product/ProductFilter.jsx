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
    { id: 'Kim', label: 'Mệnh Kim (Trắng, Vàng, Nâu)', color: '#C09A58' },
    { id: 'Mộc', label: 'Mệnh Mộc (Xanh Lục, Đen)', color: '#4E6857' },
    { id: 'Thủy', label: 'Mệnh Thủy (Xanh Lam, Trắng)', color: '#4A7C9D' },
    { id: 'Hỏa', label: 'Mệnh Hỏa (Đỏ, Hồng, Tím)', color: '#B86244' },
    { id: 'Thổ', label: 'Mệnh Thổ (Vàng Đất, Đỏ, Nâu)', color: '#8A5D3B' }
  ];

  return (
    <div className="space-y-4 mb-8 w-full max-w-full">
      
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none max-w-full w-full touch-pan-x">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shadow-sm ${
              selectedCategory === cat.id
                ? 'bg-[#26211C] text-white shadow-md'
                : 'bg-white text-[#6B6258] hover:bg-[#F3ECE1] hover:text-[#26211C] border border-[#E8DFD3]'
            }`}
          >
            <span>{cat.name}</span>
            {cat.count && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-[#FAF7F2] text-[#8C8276]'
              }`}>
                {cat.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Secondary Bar: Feng Shui Mệnh Filter & Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#E8DFD3] w-full max-w-full">
        
        {/* Mệnh Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs max-w-full w-full touch-pan-x">
          <span className="text-[#8C8276] font-medium mr-1 flex items-center gap-1 flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-[#C09A58]" /> Mệnh:
          </span>
          {menhList.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelectMenh(m.id)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors flex-shrink-0 ${
                selectedMenh === m.id
                  ? 'bg-[#B86244] text-white shadow-sm'
                  : 'bg-white text-[#6B6258] hover:bg-[#F3ECE1] border border-[#E8DFD3]'
              }`}
            >
              {m.id === 'all' ? 'Tất cả' : m.id}
            </button>
          ))}
        </div>

        {/* Total count & Sort Dropdown */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 sm:gap-3 text-xs w-full sm:w-auto">
          <span className="text-[#8C8276]">
            Hiển thị <strong>{totalResults}</strong> mẫu vòng
          </span>

          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-[#E8DFD3] text-[#26211C]">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#8C8276]" />
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-transparent font-medium focus:outline-none text-xs cursor-pointer"
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
