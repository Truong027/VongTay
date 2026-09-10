import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Sparkles, 
  Coins, 
  Image as ImageIcon, 
  Compass, 
  Layers, 
  Eye, 
  Check, 
  AlertCircle, 
  HelpCircle,
  Tag,
  Package,
  Upload,
  RefreshCw,
  X,
  Trash2,
  Plus,
  Star,
  ChevronLeft,
  ChevronRight,
  Flame
} from 'lucide-react';

const defaultAngleLabels = [
  'Góc chính diện (Ảnh bìa)',
  'Cận cảnh charm & hạt',
  'Góc đeo trên cổ tay',
  'Mặt sau & nút rút freesize',
  'Kèm hộp quà lụa & phụ kiện',
  'Góc nghiêng 45 độ nghệ thuật'
];

const getAngleLabel = (idx) => {
  if (idx === 0) return 'Ảnh Bìa Chính';
  if (idx < defaultAngleLabels.length) return defaultAngleLabels[idx];
  return `Góc chụp ${idx + 1}`;
};

export default function ProductEditorView({
  editingProduct,
  productFormData,
  setProductFormData,
  onSave,
  isSaving,
  onCancel,
  cleanNumberInput,
  handleAutoAnalyzeImage,
  isAnalyzingCord,
  aiAnalysisStatus
}) {
  const [activeSubTab, setActiveSubTab] = useState('all'); // 'all' | 'pricing' | 'images' | 'attributes'
  const [newImageUrl, setNewImageUrl] = useState('');
  const [previewImageIndex, setPreviewImageIndex] = useState(0);

  const categories = [
    { id: 'macrame-pastel', label: '🌸 Vòng Dây Macrame Pastel & Hoa Gốm' },
    { id: 'guong-dinh', label: '🪞 Gương Đính Gập & Đơn (Bestseller)' },
    { id: 'vong-doi', label: '💞 Vòng Đôi Dây Sáp Nam Châm' },
    { id: 'day-do-may-man', label: '🧧 Vòng Chỉ Đỏ Bình An & Hộ Thân' },
    { id: 'day-lua-co-phong', label: '🎋 Vòng Dây Lụa & Dây Da Mộc' },
    { id: 'day-chuyen-vintage', label: '📿 Dây Chuyền Vintage' }
  ];

  const menhOptions = [
    { id: 'Tất cả', label: 'Tất Cả Mệnh', color: 'bg-stone-100 text-stone-700 border-stone-300' },
    { id: 'Kim', label: 'Mệnh Kim (Trắng, Vàng)', color: 'bg-amber-50 text-amber-800 border-amber-300' },
    { id: 'Mộc', label: 'Mệnh Mộc (Xanh Lục)', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
    { id: 'Thủy', label: 'Mệnh Thủy (Xanh Lam)', color: 'bg-sky-50 text-sky-800 border-sky-300' },
    { id: 'Hỏa', label: 'Mệnh Hỏa (Đỏ, Hồng)', color: 'bg-rose-50 text-rose-800 border-rose-300' },
    { id: 'Thổ', label: 'Mệnh Thổ (Vàng Đất, Nâu)', color: 'bg-orange-50 text-orange-800 border-orange-300' }
  ];

  const handleToggleMenh = (item) => {
    const current = productFormData.menh || [];
    if (item === 'Tất cả') {
      setProductFormData({ ...productFormData, menh: ['Tất cả'] });
      return;
    }
    let updated = current.filter(m => m !== 'Tất cả');
    if (updated.includes(item)) {
      updated = updated.filter(m => m !== item);
      if (updated.length === 0) updated = ['Tất cả'];
    } else {
      updated.push(item);
    }
    setProductFormData({ ...productFormData, menh: updated });
  };

  // Tải nhiều ảnh cùng lúc ở các góc độ khác nhau
  const handleMultipleFilesUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const readPromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    });

    const newBase64List = (await Promise.all(readPromises)).filter(Boolean);
    if (newBase64List.length > 0) {
      setProductFormData(prev => {
        const existing = Array.isArray(prev.images) ? prev.images : [];
        return {
          ...prev,
          images: [...existing, ...newBase64List]
        };
      });
    }
    e.target.value = '';
  };

  // Thêm ảnh từ liên kết URL
  const handleAddImageUrl = () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;
    setProductFormData(prev => {
      const existing = Array.isArray(prev.images) ? prev.images : [];
      if (existing.includes(trimmed)) return prev;
      return {
        ...prev,
        images: [...existing, trimmed]
      };
    });
    setNewImageUrl('');
  };

  // Xóa ảnh ở góc chụp cụ thể
  const handleRemoveImage = (indexToRemove) => {
    setProductFormData(prev => {
      const existing = Array.isArray(prev.images) ? prev.images : [];
      return {
        ...prev,
        images: existing.filter((_, idx) => idx !== indexToRemove)
      };
    });
    setPreviewImageIndex(prev => Math.max(0, prev >= indexToRemove ? prev - 1 : prev));
  };

  // Đặt làm ảnh đại diện chính (Ảnh bìa)
  const handleSetPrimaryImage = (indexToPrimary) => {
    setProductFormData(prev => {
      const existing = Array.isArray(prev.images) ? [...prev.images] : [];
      if (indexToPrimary <= 0 || indexToPrimary >= existing.length) return prev;
      const [chosen] = existing.splice(indexToPrimary, 1);
      return {
        ...prev,
        images: [chosen, ...existing]
      };
    });
    setPreviewImageIndex(0);
  };

  // Đổi thứ tự góc ảnh
  const handleMoveImage = (fromIndex, toIndex) => {
    setProductFormData(prev => {
      const existing = Array.isArray(prev.images) ? [...prev.images] : [];
      if (toIndex < 0 || toIndex >= existing.length) return prev;
      const [item] = existing.splice(fromIndex, 1);
      existing.splice(toIndex, 0, item);
      return {
        ...prev,
        images: existing
      };
    });
    setPreviewImageIndex(toIndex);
  };

  const retailPrice = Number(productFormData.price) || 0;
  const wholesalePrice = Number(productFormData.wholesalePrice) || 0;
  const originalPrice = Number(productFormData.originalPrice) || 0;

  return (
    <div className="min-h-screen py-4 sm:py-8 px-3 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* 1. TOP HEADER & BREADCRUMBS (TRANSLUCENT GLASS) */}
        <div className="glass-panel p-4 sm:p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="p-2.5 sm:p-3 rounded-2xl bg-white/80 hover:bg-white text-[#231F1C] border border-white/90 shadow-sm transition-all flex items-center gap-2 group cursor-pointer"
              title="Quay lại danh sách sản phẩm"
            >
              <ArrowLeft className="w-5 h-5 text-[#C59B6D] group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-xs font-bold hidden sm:inline">Quay Lại Kho</span>
            </button>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#C59B6D] bg-[#FAF4E8] px-2.5 py-0.5 rounded-full border border-[#EADBCC]">
                  {editingProduct ? 'Chế độ Chỉnh sửa' : 'Tạo mới sản phẩm'}
                </span>
                <span className="text-xs text-[#948A7E]">· Đồng bộ Neon PostgreSQL Cloud</span>
              </div>
              <h1 className="font-serif-boutique text-xl sm:text-3xl font-bold text-[#231F1C] mt-0.5">
                {editingProduct ? `CHỈNH SỬA: ${productFormData.name || 'Sản phẩm'}` : 'THÊM SẢN PHẨM MỚI VÀO KHO'}
              </h1>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-2xl bg-white/70 hover:bg-white text-[#6B6258] hover:text-[#231F1C] text-xs font-semibold border border-white transition-all shadow-xs cursor-pointer"
            >
              Hủy Bỏ
            </button>

            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="btn-luxury-cta px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang Lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{editingProduct ? 'Cập Nhật Sản Phẩm' : 'Lưu Sản Phẩm Mới'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2. MAIN 2-COLUMN LAYOUT (FORM + LIVE PREVIEW) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* CỘT TRÁI (COL 8): FORM THÔNG TIN CHI TIẾT */}
          <div className="lg:col-span-8 space-y-5">

            {/* CARD 1: TÊN SẢN PHẨM & DANH MỤC */}
            <div className="glass-card-luxury p-5 sm:p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8DFD3]/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#F7ECE8] text-[#C59B6D] flex items-center justify-center font-bold">
                    1
                  </div>
                  <h3 className="font-serif-boutique text-lg font-bold text-[#231F1C]">
                    Thông Tin Cơ Bản Vòng Tay
                  </h3>
                </div>
                <span className="text-[11px] text-[#948A7E] italic">* Bắt buộc điền</span>
              </div>

              {/* Tên sản phẩm */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-[#231F1C] text-xs sm:text-sm">
                    Tên sản phẩm vòng tay / gương đính: *
                  </label>
                  {productFormData.name && (
                    <button
                      type="button"
                      onClick={() => setProductFormData({ ...productFormData, name: '' })}
                      className="text-[11px] text-[#C59B6D] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Xóa tên
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Vòng Tay Cá Voi Xanh Gốm Men Pastel"
                    value={productFormData.name}
                    onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                    className="w-full glass-input p-3 pr-10 rounded-2xl text-sm font-semibold text-[#231F1C] placeholder:text-[#948A7E]/60"
                  />
                  {productFormData.name && (
                    <button
                      type="button"
                      onClick={() => setProductFormData({ ...productFormData, name: '' })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-stone-200/80 hover:bg-stone-300 text-stone-600 flex items-center justify-center text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Danh mục & Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="font-bold text-[#231F1C] text-xs block mb-1.5">
                    Danh mục sản phẩm: *
                  </label>
                  <select
                    value={productFormData.category}
                    onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value })}
                    className="w-full glass-input p-3 rounded-2xl text-xs font-semibold text-[#231F1C] cursor-pointer"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#231F1C] text-xs block mb-1.5">
                    Huy hiệu nhãn (Badge Tag):
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Hot Trend, Bán chạy, Độc bản xưởng..."
                    value={productFormData.tag}
                    onChange={(e) => setProductFormData({ ...productFormData, tag: e.target.value })}
                    className="w-full glass-input p-3 rounded-2xl text-xs font-medium text-[#231F1C]"
                  />
                </div>
              </div>
            </div>

            {/* CARD 2: GIÁ BÁN & TỒN KHO */}
            <div className="glass-card-luxury p-5 sm:p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8DFD3]/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FBF4E8] text-[#C59B6D] flex items-center justify-center font-bold">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif-boutique text-lg font-bold text-[#231F1C]">
                      Giá Bán & Quản Lý Kho Hàng
                    </h3>
                    <p className="text-[11px] text-[#948A7E]">Nhập số tự nhiên mượt mà, tự động định dạng VNĐ</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Giá bán lẻ (Khách trả) */}
                <div className="p-4 rounded-2xl bg-white/70 border border-white/90 shadow-2xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-[#C59B6D] text-xs flex items-center gap-1">
                      <span>Giá bán lẻ thực tế (₫): *</span>
                    </label>
                    {retailPrice > 0 && (
                      <span className="text-xs font-bold text-[#C59B6D] bg-[#FAF4E8] px-2 py-0.5 rounded-md">
                        {new Intl.NumberFormat('vi-VN').format(retailPrice)} đ
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Ví dụ: 25000 hoặc 195000"
                      value={productFormData.price}
                      onChange={(e) => {
                        const clean = cleanNumberInput(e.target.value);
                        setProductFormData(prev => ({
                          ...prev,
                          price: clean,
                          wholesalePrice: (!prev.wholesalePrice && clean) ? String(Math.round(Number(clean) * 0.7)) : prev.wholesalePrice
                        }));
                      }}
                      className="w-full glass-input p-3 rounded-xl font-bold text-[#C59B6D] text-base"
                    />
                  </div>
                  <p className="text-[10px] text-[#948A7E] mt-1.5">Giá khách thực sự thanh toán khi mua sản phẩm</p>
                </div>

                {/* Giá gốc niêm yết (Số tiền bị gạch) */}
                <div className="p-4 rounded-2xl bg-white/70 border border-white/90 shadow-2xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-[#6B6258] text-xs flex items-center gap-1.5">
                      <span>Giá gốc (₫) - <strong className="line-through text-red-500">Số tiền bị gạch</strong>:</span>
                    </label>
                    {originalPrice > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#8C8276] line-through bg-stone-100 px-2 py-0.5 rounded-md">
                          {new Intl.NumberFormat('vi-VN').format(originalPrice)} đ
                        </span>
                        {originalPrice > retailPrice && retailPrice > 0 && (
                          <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-md">
                            -{Math.round(((originalPrice - retailPrice) / originalPrice) * 100)}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Ví dụ: 220000 (để gạch ngang như ảnh)"
                      value={productFormData.originalPrice || ''}
                      onChange={(e) => setProductFormData({ ...productFormData, originalPrice: cleanNumberInput(e.target.value) })}
                      className="w-full glass-input p-3 rounded-xl font-bold text-[#4A453F] text-base"
                    />
                    {productFormData.originalPrice && (
                      <button
                        type="button"
                        onClick={() => setProductFormData({ ...productFormData, originalPrice: '' })}
                        className="absolute right-3 top-3 text-[11px] text-[#8C8276] hover:text-red-500 font-semibold cursor-pointer"
                        title="Xóa giá gạch ngang"
                      >
                        ✕ Bỏ gạch
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-[10px]">
                    <span className="text-[#948A7E]">Số tiền gạch ngang tạo cảm giác khuyến mãi</span>
                    {retailPrice > 0 && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setProductFormData({ ...productFormData, originalPrice: String(Math.round(retailPrice * 1.2 / 1000) * 1000) })}
                          className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 hover:bg-[#FAF4E8] hover:text-[#C59B6D] font-bold transition-colors cursor-pointer"
                          title="Gợi ý +20% giá bán"
                        >
                          +20%
                        </button>
                        <button
                          type="button"
                          onClick={() => setProductFormData({ ...productFormData, originalPrice: String(Math.round(retailPrice * 1.35 / 1000) * 1000) })}
                          className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 hover:bg-[#FAF4E8] hover:text-[#C59B6D] font-bold transition-colors cursor-pointer"
                          title="Gợi ý +35% giá bán"
                        >
                          +35%
                        </button>
                        <button
                          type="button"
                          onClick={() => setProductFormData({ ...productFormData, originalPrice: '220000' })}
                          className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 hover:bg-[#FAF4E8] hover:text-[#C59B6D] font-bold transition-colors cursor-pointer"
                          title="Điền 220.000đ"
                        >
                          220k
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Giá bán sỉ */}
                <div className="p-4 rounded-2xl bg-white/70 border border-white/90 shadow-2xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-[#4E6857] text-xs flex items-center gap-1">
                      <span>Giá sỉ xưởng (₫):</span>
                    </label>
                    {wholesalePrice > 0 && (
                      <span className="text-xs font-bold text-[#4E6857] bg-[#E5EDE8] px-2 py-0.5 rounded-md">
                        {new Intl.NumberFormat('vi-VN').format(wholesalePrice)} đ
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Tự tính ~70% giá lẻ"
                    value={productFormData.wholesalePrice}
                    onChange={(e) => setProductFormData({ ...productFormData, wholesalePrice: cleanNumberInput(e.target.value) })}
                    className="w-full glass-input p-3 rounded-xl font-bold text-[#4E6857] text-base"
                  />
                  <p className="text-[10px] text-[#948A7E] mt-1.5">Dành cho cộng tác viên và đại lý sỉ</p>
                </div>

                {/* Sỉ tối thiểu & Tồn kho */}
                <div className="p-4 rounded-2xl bg-white/70 border border-white/90 shadow-2xs">
                  <label className="font-bold text-[#231F1C] text-xs block mb-1.5">
                    Số lượng sỉ tối thiểu (chiếc):
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={productFormData.wholesaleMinQty}
                    onChange={(e) => setProductFormData({ ...productFormData, wholesaleMinQty: cleanNumberInput(e.target.value) })}
                    className="w-full glass-input p-2.5 rounded-xl font-semibold text-xs text-[#231F1C]"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white/70 border border-white/90 shadow-2xs">
                  <label className="font-bold text-[#231F1C] text-xs block mb-1.5">
                    Số lượng tồn kho (chiếc):
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={productFormData.stock}
                    onChange={(e) => setProductFormData({ ...productFormData, stock: cleanNumberInput(e.target.value) })}
                    className="w-full glass-input p-2.5 rounded-xl font-semibold text-xs text-[#231F1C]"
                  />
                </div>

              </div>
            </div>

            {/* CARD 3: HÌNH ẢNH SẢN PHẨM & GÓC CHỤP ĐA CHIỀU */}
            <div className="glass-card-luxury p-5 sm:p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8DFD3]/60 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#EFEBF6] text-[#6B5B95] flex items-center justify-center font-bold">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif-boutique text-lg font-bold text-[#231F1C]">
                        Hình Ảnh Sản Phẩm & Góc Chụp Đa Chiều
                      </h3>
                      {productFormData.images && productFormData.images.length > 0 && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          {productFormData.images.length} góc ảnh
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#948A7E]">
                      Tải lên nhiều ảnh ở các góc chụp khác nhau (chính diện, cận cảnh charm, đeo trên tay, mặt sau)
                    </p>
                  </div>
                </div>

                {/* AI Gemini Vision Button */}
                <button
                  type="button"
                  onClick={() => {
                    const currentImg = productFormData.images?.[previewImageIndex] || productFormData.images?.[0];
                    if (currentImg) handleAutoAnalyzeImage(currentImg, false);
                    else alert('Vui lòng tải lên hoặc nhập liên kết ảnh trước khi phân tích AI');
                  }}
                  disabled={isAnalyzingCord || !productFormData.images?.[0]}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#C59B6D] to-[#B86244] text-white text-xs font-bold shadow-sm hover:opacity-90 disabled:opacity-40 flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Gửi ảnh đang chọn đến AI Gemini Vision để thẩm định sản phẩm: tự động nhận diện Gương đính hoặc Vòng tay"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isAnalyzingCord ? 'animate-spin' : ''}`} />
                  <span>{isAnalyzingCord ? 'AI Đang Phân Tích...' : 'AI Nhận Diện Gương / Vòng'}</span>
                </button>
              </div>

              {/* Status banner nếu AI đang chạy */}
              {aiAnalysisStatus && (
                <div className="p-3 rounded-2xl bg-[#FAF4E8] border border-[#EADBCC] text-xs text-[#B86244] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 animate-pulse text-[#C59B6D]" />
                  <span>{aiAnalysisStatus}</span>
                </div>
              )}

              {/* KHUNG TẢI NHIỀU ẢNH CÙNG LÚC & NHẬP URL */}
              <div className="space-y-3">
                {/* 1. Drag & drop / Click to upload multiple files */}
                <label className="cursor-pointer group flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#FAF7F2] to-[#FAF4E8] border-2 border-dashed border-[#C59B6D]/50 hover:border-[#C59B6D] transition-all gap-3 shadow-2xs">
                  <div className="flex items-center gap-3 text-center sm:text-left">
                    <div className="w-10 h-10 rounded-xl bg-white text-[#C59B6D] flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#231F1C]">
                        Tải Lên Nhiều Ảnh Cùng Lúc (Đa Góc Độ)
                      </p>
                      <p className="text-[11px] text-[#8C8276]">
                        Bấm để chọn nhiều ảnh từ máy tính hoặc điện thoại (.jpg, .png, .webp)
                      </p>
                    </div>
                  </div>
                  <span className="px-4 py-2 rounded-xl bg-white border border-[#E8DFD3] text-xs font-bold text-[#231F1C] group-hover:bg-[#C59B6D] group-hover:text-white transition-colors shadow-2xs shrink-0">
                    + Chọn Tệp Ảnh
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleMultipleFilesUpload}
                    className="hidden"
                  />
                </label>

                {/* 2. Direct URL Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Hoặc dán đường dẫn ảnh trực tiếp (VD: /images/... hoặc https://...)"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddImageUrl(); } }}
                    className="flex-1 glass-input p-3 rounded-2xl text-xs font-medium text-[#231F1C]"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    disabled={!newImageUrl.trim()}
                    className="px-4 py-3 rounded-2xl bg-[#FAF4E8] hover:bg-[#F2E8D8] text-[#8C6239] border border-[#EADBCC] text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer shrink-0 transition-all disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm URL</span>
                  </button>
                </div>

                {/* Gợi ý các góc chụp tiêu chuẩn */}
                <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-[#8C8276]">
                  <span className="font-semibold text-[#6B6258]">Gợi ý góc chụp chuẩn xưởng:</span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-[#E8DFD3]/80">📷 Chính diện</span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-[#E8DFD3]/80">🔍 Cận cảnh hạt & charm</span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-[#E8DFD3]/80">🖐️ Đeo trên cổ tay</span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-[#E8DFD3]/80">🔄 Nút rút mặt sau</span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-[#E8DFD3]/80">🎁 Kèm hộp gấm</span>
                </div>

                {/* 3. LƯỚI HIỂN THỊ TẤT CẢ ẢNH ĐÃ THÊM VÀO */}
                <div className="pt-2">
                  {productFormData.images && productFormData.images.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#231F1C]">
                          Thư viện ảnh đã thêm ({productFormData.images.length} ảnh):
                        </span>
                        <span className="text-[11px] text-[#8C8276]">
                          Ảnh đầu tiên là ảnh bìa chính hiển thị ngoài gian hàng
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {productFormData.images.map((imgUrl, idx) => (
                          <div
                            key={idx}
                            className={`group relative rounded-2xl overflow-hidden border-2 bg-white shadow-xs transition-all flex flex-col justify-between ${
                              idx === 0
                                ? 'border-[#C59B6D] ring-2 ring-[#C59B6D]/20 shadow-sm'
                                : 'border-[#E8DFD3] hover:border-[#C59B6D]/60'
                            }`}
                          >
                            {/* Ảnh Thumbnail */}
                            <div className="relative aspect-square overflow-hidden bg-[#FAF7F2]">
                              <img
                                src={imgUrl}
                                alt={`Góc ${idx + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                onError={(e) => { e.target.src = '/images/products/bracelet-pastel-macrame-trio.jpg'; }}
                              />

                              {/* Badge nhãn góc chụp */}
                              <div className="absolute top-2 left-2">
                                {idx === 0 ? (
                                  <span className="bg-gradient-to-r from-amber-600 to-[#C59B6D] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                                    <Star className="w-2.5 h-2.5 fill-current" />
                                    <span>ẢNH BÌA CHÍNH</span>
                                  </span>
                                ) : (
                                  <span className="bg-[#231F1C]/80 backdrop-blur-xs text-white text-[9px] font-medium px-2 py-0.5 rounded-full">
                                    {getAngleLabel(idx)}
                                  </span>
                                )}
                              </div>

                              {/* Nút Xóa ảnh góc này */}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm"
                                title="Xóa ảnh góc này"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Toolbar quản lý góc ảnh */}
                            <div className="p-2 bg-[#FAF7F2] border-t border-[#E8DFD3]/60 flex items-center justify-between gap-1 text-[10px]">
                              {idx > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryImage(idx)}
                                  className="text-[#C59B6D] hover:text-[#A05237] font-bold hover:underline truncate"
                                  title="Đặt ảnh này lên làm ảnh đại diện chính ngoài gian hàng"
                                >
                                  ⭐ Đặt làm ảnh chính
                                </button>
                              ) : (
                                <span className="text-amber-700 font-bold">Đang là ảnh bìa</span>
                              )}

                              <div className="flex items-center gap-0.5">
                                {idx > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleMoveImage(idx, idx - 1)}
                                    className="p-1 rounded-md bg-white border border-[#E8DFD3] text-[#6B6258] hover:text-[#231F1C] cursor-pointer"
                                    title="Di chuyển sang trái"
                                  >
                                    <ChevronLeft className="w-3 h-3" />
                                  </button>
                                )}
                                {idx < productFormData.images.length - 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleMoveImage(idx, idx + 1)}
                                    className="p-1 rounded-md bg-white border border-[#E8DFD3] text-[#6B6258] hover:text-[#231F1C] cursor-pointer"
                                    title="Di chuyển sang phải"
                                  >
                                    <ChevronRight className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl bg-[#FAF7F2] border border-dashed border-[#E8DFD3] text-center space-y-1.5 text-[#948A7E]">
                      <ImageIcon className="w-8 h-8 mx-auto text-[#C59B6D]/60" />
                      <p className="text-xs font-semibold text-[#6B6258]">
                        Chưa có hình ảnh nào được thêm vào
                      </p>
                      <p className="text-[11px]">
                        Hãy tải ảnh lên từ máy tính hoặc nhập liên kết ảnh phía trên để hiển thị các góc độ sản phẩm.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* CARD 4: THUỘC TÍNH & PHONG THỦY */}
            <div className="glass-card-luxury p-5 sm:p-6 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E8DFD3]/60 pb-3">
                <div className="w-8 h-8 rounded-xl bg-[#E5EDE8] text-[#4E6857] flex items-center justify-center font-bold">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif-boutique text-lg font-bold text-[#231F1C]">
                    Thuộc Tính Thủ Công & Cung Mệnh
                  </h3>
                  <p className="text-[11px] text-[#948A7E]">Giúp khách hàng dễ dàng tìm kiếm theo ngũ hành phong thủy</p>
                </div>
              </div>

              {/* Ngũ hành Mệnh */}
              <div>
                <label className="font-bold text-[#231F1C] text-xs block mb-2">
                  Ngũ Hành Hợp Mệnh (Có thể chọn nhiều mệnh):
                </label>
                <div className="flex flex-wrap gap-2">
                  {menhOptions.map(m => {
                    const isSelected = (productFormData.menh || []).includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleToggleMenh(m.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? `${m.color} ring-2 ring-offset-1 ring-[#C59B6D]/40 font-bold shadow-xs`
                            : 'bg-white/60 text-[#6B6258] border-white/80 hover:bg-white'
                        }`}
                      >
                        {isSelected && '✓ '}
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chất liệu đá, dây, kích thước hạt */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="font-bold text-[#231F1C] text-xs block mb-1">Chất liệu đá / gốm:</label>
                  <input
                    type="text"
                    value={productFormData.stoneType}
                    onChange={(e) => setProductFormData({ ...productFormData, stoneType: e.target.value })}
                    placeholder="Gốm men nung & Thạch anh"
                    className="w-full glass-input p-2.5 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#231F1C] text-xs block mb-1">Loại dây đan:</label>
                  <input
                    type="text"
                    value={productFormData.cordType}
                    onChange={(e) => setProductFormData({ ...productFormData, cordType: e.target.value })}
                    placeholder="Dây chỉ sáp dệt Macrame"
                    className="w-full glass-input p-2.5 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#231F1C] text-xs block mb-1">Kích thước hạt:</label>
                  <input
                    type="text"
                    value={productFormData.beadSize}
                    onChange={(e) => setProductFormData({ ...productFormData, beadSize: e.target.value })}
                    placeholder="8mm hoặc Freesize"
                    className="w-full glass-input p-2.5 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

            {/* CARD 5: CÂU CHUYỆN & Ý NGHĨA */}
            <div className="glass-card-luxury p-5 sm:p-6 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E8DFD3]/60 pb-3">
                <div className="w-8 h-8 rounded-xl bg-[#FAF4E8] text-[#C59B6D] flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="font-serif-boutique text-lg font-bold text-[#231F1C]">
                  Câu Chuyện & Ý Nghĩa Phong Thủy
                </h3>
              </div>

              <div>
                <label className="font-bold text-[#231F1C] text-xs block mb-1.5">Mô tả sản phẩm:</label>
                <textarea
                  rows={3}
                  value={productFormData.description}
                  onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                  placeholder="Mô tả kỹ thuật đan, điểm nhấn charm và cảm xúc khi đeo..."
                  className="w-full glass-input p-3 rounded-2xl text-xs leading-relaxed text-[#231F1C]"
                />
              </div>

              <div>
                <label className="font-bold text-[#231F1C] text-xs block mb-1.5">Ý nghĩa phong thủy & may mắn:</label>
                <input
                  type="text"
                  value={productFormData.meaning}
                  onChange={(e) => setProductFormData({ ...productFormData, meaning: e.target.value })}
                  placeholder="Ví dụ: Bình an, thu hút tài lộc, giữ tâm an yên..."
                  className="w-full glass-input p-3 rounded-2xl text-xs text-[#231F1C]"
                />
              </div>

              {/* Tùy chọn ẩn hiện, best seller & ghim xu hướng */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 border-t border-[#E8DFD3]/60">
                <label className="flex items-center gap-2 text-xs font-semibold text-[#231F1C] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productFormData.isBestSeller || false}
                    onChange={(e) => setProductFormData({ ...productFormData, isBestSeller: e.target.checked })}
                    className="w-4 h-4 text-[#C59B6D] rounded-md"
                  />
                  <span>Bán Chạy (Best Seller)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-[#231F1C] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productFormData.isTrending || false}
                    onChange={(e) => setProductFormData({ ...productFormData, isTrending: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded-md"
                  />
                  <span className={productFormData.isTrending ? 'text-amber-800 font-bold flex items-center gap-1' : 'flex items-center gap-1 text-[#4A4238]'}>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Ghim Xu Hướng Đầu Trang (Hero)</span>
                  </span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-[#231F1C] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productFormData.isHidden || false}
                    onChange={(e) => setProductFormData({ ...productFormData, isHidden: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded-md"
                  />
                  <span className={productFormData.isHidden ? 'text-rose-600 font-bold' : ''}>
                    Ẩn tạm thời
                  </span>
                </label>
              </div>
            </div>

          </div>

          {/* CỘT PHẢI (COL 4): LIVE PRODUCT PREVIEW CARD (STICKY) */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-6">
            <div className="glass-panel p-5 sm:p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8DFD3]/60 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#C59B6D]" />
                  <h3 className="font-serif-boutique text-base font-bold text-[#231F1C]">
                    Xem Trước Trực Quan
                  </h3>
                </div>
                <span className="text-[10px] bg-[#FAF4E8] text-[#C59B6D] font-bold px-2 py-0.5 rounded-full">
                  LIVE
                </span>
              </div>

              {/* Card Mô Phỏng Giống Ngoài Gian Hàng */}
              <div className="bg-white/90 rounded-3xl overflow-hidden border border-white shadow-lg flex flex-col">
                <div className="relative aspect-square bg-[#FAF7F2] overflow-hidden">
                  {productFormData.images && productFormData.images.length > 0 ? (
                    <img
                      src={productFormData.images[previewImageIndex] || productFormData.images[0]}
                      alt={productFormData.name || 'Xem trước'}
                      className="w-full h-full object-cover transition-all"
                      onError={(e) => { e.target.src = '/images/products/bracelet-pastel-macrame-trio.jpg'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#948A7E] p-6 text-center space-y-2">
                      <ImageIcon className="w-10 h-10 stroke-[1.5] text-[#C59B6D]/60" />
                      <p className="text-xs font-semibold text-[#6B6258]">Chưa có ảnh sản phẩm</p>
                      <p className="text-[10px] text-[#B0A699]">Tải ảnh lên ở cột bên trái để xem trước các góc độ</p>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                    {productFormData.isTrending && (
                      <span className="bg-gradient-to-r from-amber-600 to-[#C59B6D] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                        <Flame className="w-3 h-3 text-yellow-200" />
                        <span>HERO TRENDING</span>
                      </span>
                    )}
                    {productFormData.isBestSeller && (
                      <span className="bg-gradient-to-r from-[#B86244] to-[#8C6239] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-yellow-200" />
                        <span>BEST SELLER</span>
                      </span>
                    )}
                    {productFormData.tag && (
                      <span className="bg-[#231F1C]/85 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                        {productFormData.tag}
                      </span>
                    )}
                    {productFormData.menh && productFormData.menh.length > 0 && productFormData.menh[0] !== 'Tất cả' && (
                      <span className="bg-white/95 text-[#C59B6D] border border-[#E8DFD3] text-[10px] font-medium px-2 py-0.5 rounded-full shadow-2xs">
                        Mệnh: {productFormData.menh.join(', ')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Thanh chọn góc ảnh xem trước */}
                {productFormData.images && productFormData.images.length > 1 && (
                  <div className="p-2.5 bg-[#FAF7F2] border-t border-[#E8DFD3]/60 flex items-center gap-1.5 overflow-x-auto">
                    <span className="text-[10px] text-[#948A7E] font-bold shrink-0 mr-1">Các góc:</span>
                    {productFormData.images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPreviewImageIndex(idx)}
                        className={`w-9 h-9 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          previewImageIndex === idx ? 'border-[#C59B6D] ring-2 ring-[#C59B6D]/30 scale-105' : 'border-white opacity-70 hover:opacity-100'
                        }`}
                        title={getAngleLabel(idx)}
                      >
                        <img src={img} alt={`Góc ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="p-4 space-y-2">
                  <span className="text-[10px] text-[#948A7E] uppercase tracking-wider font-semibold">
                    {productFormData.category === 'guong-dinh' 
                      ? (productFormData.stoneType || 'Gương Đính Độc Bản Handmade') 
                      : (productFormData.stoneType || 'Gốm men nung thủ công')}
                  </span>
                  <h4 className="font-serif-boutique text-base font-bold text-[#231F1C] leading-snug line-clamp-2">
                    {productFormData.name || (productFormData.category === 'guong-dinh' ? 'Gương Đính Thủ Công Mẫu' : 'Tên sản phẩm vòng tay mẫu')}
                  </h4>

                  <div className="pt-2 flex items-baseline justify-between border-t border-[#F5EFE6]">
                    <div>
                      <span className="text-base font-bold text-[#C59B6D]">
                        {retailPrice > 0 ? `${new Intl.NumberFormat('vi-VN').format(retailPrice)}₫` : '195.000₫'}
                      </span>
                      {originalPrice > retailPrice && (
                        <span className="text-xs text-[#948A7E] line-through ml-2">
                          {new Intl.NumberFormat('vi-VN').format(originalPrice)}₫
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#4E6857] font-semibold bg-[#E5EDE8] px-2 py-0.5 rounded-md">
                      Kho: {productFormData.stock || 20}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checklist sẵn sàng lưu */}
              <div className="p-3.5 rounded-2xl bg-white/60 border border-white text-xs space-y-2">
                <span className="font-bold text-[#231F1C] block text-[11px] uppercase tracking-wider">
                  Kiểm tra tính hợp lệ:
                </span>
                <div className="space-y-1 text-[11px]">
                  <div className={`flex items-center gap-1.5 ${productFormData.name?.trim() ? 'text-emerald-700' : 'text-amber-600'}`}>
                    <span>{productFormData.name?.trim() ? '✓ Đã nhập tên sản phẩm' : '⚠ Chưa nhập tên sản phẩm'}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${retailPrice > 0 ? 'text-emerald-700' : 'text-amber-600'}`}>
                    <span>{retailPrice > 0 ? '✓ Đã nhập giá bán hợp lệ' : '⚠ Chưa nhập giá bán'}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${(productFormData.images && productFormData.images.length > 0) ? 'text-emerald-700' : 'text-amber-600'}`}>
                    <span>
                      {(productFormData.images && productFormData.images.length > 0)
                        ? `✓ Đã nạp ${productFormData.images.length} ảnh (${productFormData.images.length} góc độ)`
                        : '⚠ Chưa có ảnh sản phẩm'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons in Preview Column */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={onSave}
                  disabled={isSaving || !productFormData.name?.trim() || !retailPrice}
                  className="w-full btn-luxury-cta py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang lưu vào Neon DB...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editingProduct ? 'Cập Nhật Ngay' : 'Lưu Vào Cơ Sở Dữ Liệu'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full py-2.5 rounded-2xl bg-white/70 hover:bg-white text-[#6B6258] hover:text-[#231F1C] font-semibold text-xs border border-white transition-all cursor-pointer"
                >
                  Hủy và quay lại kho
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
