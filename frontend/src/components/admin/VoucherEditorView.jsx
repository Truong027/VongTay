import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Ticket, 
  Tag, 
  Sparkles, 
  Clock, 
  Calendar, 
  DollarSign, 
  Percent, 
  ShieldCheck, 
  AlertCircle, 
  Info,
  CheckCircle2
} from 'lucide-react';

export default function VoucherEditorView({
  editingVoucher,
  voucherFormData,
  setVoucherFormData,
  onSave,
  isSaving,
  onCancel,
  errorMessage,
  setErrorMessage
}) {
  const isEditing = Boolean(editingVoucher);

  const formatCurrency = (val) => {
    if (!val && val !== 0) return '0';
    return Number(val).toLocaleString('vi-VN');
  };

  const discountPreviewText = () => {
    const val = Number(voucherFormData.discountValue) || 0;
    if (voucherFormData.discountType === 'percentage') {
      return `Giảm ${val}%${voucherFormData.maxDiscount ? ` (tối đa ${formatCurrency(voucherFormData.maxDiscount)}₫)` : ''}`;
    }
    return `Giảm ${formatCurrency(val)}₫`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn pb-16">
      
      {/* Top Navigation & Action Header */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#E8DFD3] shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2.5 rounded-2xl bg-[#FAF7F2] text-[#6B6258] hover:text-[#26211C] hover:bg-[#E8DFD3] transition-all border border-[#E8DFD3] cursor-pointer"
            title="Quay lại danh sách mã giảm giá"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#B86244]/10 text-[#B86244] uppercase tracking-wider">
                {isEditing ? 'Cập Nhật Mã' : 'Tạo Mới'}
              </span>
              <span className="text-xs text-[#8C8276] font-medium">Trang Cứng Quản Trị</span>
            </div>
            <h2 className="font-serif-boutique text-2xl font-bold text-[#26211C] mt-0.5">
              {isEditing ? `Chỉnh Sửa Mã "${editingVoucher.code}"` : 'Thiết Lập Mã Giảm Giá Mới'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-[#E8DFD3] text-xs font-semibold text-[#6B6258] hover:bg-white transition-all cursor-pointer"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-[#B86244] hover:bg-[#A05237] text-white text-xs font-bold shadow-artisan-hover transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Đang Lưu...' : (isEditing ? 'Lưu Thay Đổi' : 'Tạo Mã Ngay')}</span>
          </button>
        </div>
      </div>

      {/* Inline Error Notice (Không dùng alert) */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs animate-shake">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="flex-1 font-medium">{errorMessage}</div>
          <button 
            type="button" 
            onClick={() => setErrorMessage('')}
            className="text-rose-600 hover:text-rose-800 text-[11px] underline font-bold cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Main Grid: Form Left, Live Ticket Preview Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Full Configuration Form */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Section 1: Thông tin cơ bản mã */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-[#F3ECE1] pb-3">
              <Ticket className="w-5 h-5 text-[#B86244]" />
              <h3 className="font-serif-boutique text-lg font-bold text-[#26211C]">
                1. Thông Tin Nhận Diện Mã
              </h3>
            </div>

            <div>
              <label className="text-xs font-bold text-[#26211C] block mb-1">
                Mã Giảm Giá (Code): *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: TRIAN20K, CHAOBAN, HE2026..."
                  value={voucherFormData.code || ''}
                  onChange={(e) => {
                    if (setErrorMessage) setErrorMessage('');
                    setVoucherFormData({
                      ...voucherFormData,
                      code: e.target.value.replace(/[^a-zA-Z0-9_-]/g, '').toUpperCase()
                    });
                  }}
                  className="w-full bg-[#FAF7F2] pl-3 pr-24 py-3 rounded-2xl border border-[#E8DFD3] focus:outline-none focus:ring-2 focus:ring-[#B86244]/20 font-mono font-bold uppercase tracking-wider text-base text-[#B86244]"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#8C8276] bg-white px-2 py-1 rounded-lg border border-[#E8DFD3]">
                  Viết hoa, không dấu
                </span>
              </div>
              <p className="text-[11px] text-[#8C8276] mt-1.5 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-[#B86244]" />
                Khách hàng sẽ nhập chính xác mã này tại Giỏ Hàng hoặc Bước Thanh Toán.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-[#26211C] block mb-1">
                Mô Tả Chương Trình / Điều Kiện:
              </label>
              <textarea
                rows={2}
                placeholder="Ví dụ: Giảm 20.000₫ cho đơn hàng vòng tay từ 150.000₫ dịp ra mắt mẫu mới"
                value={voucherFormData.description || ''}
                onChange={(e) => setVoucherFormData({ ...voucherFormData, description: e.target.value })}
                className="w-full bg-[#FAF7F2] p-3 rounded-2xl border border-[#E8DFD3] text-xs focus:outline-none focus:ring-2 focus:ring-[#B86244]/20 text-[#26211C]"
              />
            </div>
          </div>

          {/* Section 2: Hình thức & Giá trị chiết khấu */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-[#F3ECE1] pb-3">
              <DollarSign className="w-5 h-5 text-[#B86244]" />
              <h3 className="font-serif-boutique text-lg font-bold text-[#26211C]">
                2. Giá Trị Chiết Khấu
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#26211C] block mb-1">
                  Hình Thức Giảm: *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVoucherFormData({ ...voucherFormData, discountType: 'percentage' })}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      voucherFormData.discountType === 'percentage'
                        ? 'bg-[#B86244] text-white border-[#B86244] shadow-sm'
                        : 'bg-[#FAF7F2] text-[#6B6258] border-[#E8DFD3] hover:bg-[#E8DFD3]'
                    }`}
                  >
                    <Percent className="w-3.5 h-3.5" />
                    <span>Theo Tỷ Lệ %</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVoucherFormData({ ...voucherFormData, discountType: 'fixed' })}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      voucherFormData.discountType === 'fixed'
                        ? 'bg-[#B86244] text-white border-[#B86244] shadow-sm'
                        : 'bg-[#FAF7F2] text-[#6B6258] border-[#E8DFD3] hover:bg-[#E8DFD3]'
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Số Tiền Cố Định</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#26211C] block mb-1">
                  {voucherFormData.discountType === 'percentage' ? 'Tỷ Lệ Giảm (%): *' : 'Số Tiền Giảm (₫): *'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max={voucherFormData.discountType === 'percentage' ? 100 : 10000000}
                    placeholder={voucherFormData.discountType === 'percentage' ? '15' : '30000'}
                    value={voucherFormData.discountValue || ''}
                    onChange={(e) => setVoucherFormData({ ...voucherFormData, discountValue: e.target.value })}
                    className="w-full bg-[#FAF7F2] p-3 rounded-2xl border border-[#E8DFD3] text-sm font-bold text-[#26211C] focus:outline-none focus:ring-2 focus:ring-[#B86244]/20 pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8C8276]">
                    {voucherFormData.discountType === 'percentage' ? '%' : '₫'}
                  </span>
                </div>
              </div>
            </div>

            {/* Điều kiện đơn tối thiểu & Giảm tối đa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#F3ECE1]">
              <div>
                <label className="text-xs font-bold text-[#26211C] block mb-1">
                  Đơn Hàng Tối Thiểu (₫):
                </label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  placeholder="0 (Không giới hạn)"
                  value={voucherFormData.minOrderValue || ''}
                  onChange={(e) => setVoucherFormData({ ...voucherFormData, minOrderValue: e.target.value })}
                  className="w-full bg-[#FAF7F2] p-3 rounded-2xl border border-[#E8DFD3] text-xs font-semibold text-[#26211C] focus:outline-none focus:ring-2 focus:ring-[#B86244]/20"
                />
                <span className="text-[10px] text-[#8C8276] mt-1 block">
                  Chỉ áp dụng khi tổng tiền hàng đạt mức này (0₫ nếu không yêu cầu).
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-[#26211C] block mb-1">
                  Mức Giảm Tối Đa (₫):
                </label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  disabled={voucherFormData.discountType === 'fixed'}
                  placeholder={voucherFormData.discountType === 'fixed' ? 'Chỉ áp dụng cho giảm %' : '50000 (Để trống nếu không giới hạn)'}
                  value={voucherFormData.discountType === 'fixed' ? '' : (voucherFormData.maxDiscount || '')}
                  onChange={(e) => setVoucherFormData({ ...voucherFormData, maxDiscount: e.target.value })}
                  className={`w-full p-3 rounded-2xl border border-[#E8DFD3] text-xs font-semibold focus:outline-none ${
                    voucherFormData.discountType === 'fixed' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#FAF7F2] text-[#26211C]'
                  }`}
                />
                <span className="text-[10px] text-[#8C8276] mt-1 block">
                  Giới hạn trần số tiền được giảm khi áp dụng chiết khấu %.
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Giới hạn & Trạng thái */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-[#F3ECE1] pb-3">
              <Clock className="w-5 h-5 text-[#B86244]" />
              <h3 className="font-serif-boutique text-lg font-bold text-[#26211C]">
                3. Giới Hạn Sử Dụng & Kích Hoạt
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#26211C] block mb-1">
                  Giới Hạn Lượt Dùng Toàn Xưởng:
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="500"
                  value={voucherFormData.usageLimit || ''}
                  onChange={(e) => setVoucherFormData({ ...voucherFormData, usageLimit: e.target.value })}
                  className="w-full bg-[#FAF7F2] p-3 rounded-2xl border border-[#E8DFD3] text-xs font-semibold text-[#26211C] focus:outline-none"
                />
                <span className="text-[10px] text-[#8C8276] mt-1 block">
                  Mã sẽ tự động khóa khi đạt đủ số lượt đặt hàng thành công.
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-[#26211C] block mb-1">
                  Hạn Sử Dụng (Tùy chọn):
                </label>
                <input
                  type="date"
                  value={voucherFormData.expiresAt ? voucherFormData.expiresAt.substring(0, 10) : ''}
                  onChange={(e) => setVoucherFormData({ ...voucherFormData, expiresAt: e.target.value })}
                  className="w-full bg-[#FAF7F2] p-3 rounded-2xl border border-[#E8DFD3] text-xs font-semibold text-[#26211C] focus:outline-none"
                />
                <span className="text-[10px] text-[#8C8276] mt-1 block">
                  Để trống nếu mã có giá trị vô thời hạn.
                </span>
              </div>
            </div>

            {/* Bật/Tắt hoạt động */}
            <div className="p-4 bg-[#FAF4ED] rounded-2xl border border-[#EADBCC] flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-[#26211C] block">
                  Kích Hoạt Sử Dụng Ngay
                </span>
                <span className="text-[11px] text-[#6B6258] block mt-0.5">
                  Bật công tắc này để khách hàng có thể áp dụng mã này khi đặt hàng.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={voucherFormData.isActive !== false}
                  onChange={(e) => setVoucherFormData({ ...voucherFormData, isActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B86244]"></div>
              </label>
            </div>
          </div>

        </div>

        {/* Right 1 Column: Live Realistic Preview Ticket */}
        <div className="space-y-4">
          <div className="sticky top-6 space-y-4">
            <h4 className="font-serif-boutique text-base font-bold text-[#26211C] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#B86244]" />
              Xem Trước Phiếu Ưu Đãi
            </h4>

            {/* Realistic Boutique Coupon Ticket */}
            <div className="bg-white rounded-3xl border border-[#E8DFD3] shadow-md overflow-hidden relative">
              <div className="bg-gradient-to-r from-[#B86244] to-[#8C432A] p-4 text-white text-center relative">
                <span className="text-[10px] tracking-widest font-semibold uppercase opacity-80 block">
                  Vòng Tay Nhà Zy • Voucher
                </span>
                <div className="font-mono font-bold text-2xl tracking-wider mt-1">
                  {voucherFormData.code || 'MA_GIAM_GIA'}
                </div>
                <div className="text-xs font-semibold mt-1 text-white/90">
                  {discountPreviewText()}
                </div>
              </div>

              {/* Perforation line simulation */}
              <div className="relative flex items-center justify-between px-2 py-1 bg-[#FAF7F2] border-y border-dashed border-[#E8DFD3]">
                <div className="w-4 h-4 rounded-full bg-[#FAF7F2] -ml-4 border-r border-[#E8DFD3]"></div>
                <span className="text-[9px] font-mono text-[#8C8276] uppercase tracking-widest">
                  ƯU ĐÃI NGHỆ NHÂN
                </span>
                <div className="w-4 h-4 rounded-full bg-[#FAF7F2] -mr-4 border-l border-[#E8DFD3]"></div>
              </div>

              <div className="p-4 space-y-2.5 text-xs text-[#6B6258] bg-white">
                <p className="text-xs text-[#26211C] leading-relaxed">
                  {voucherFormData.description || 'Chưa có mô tả ưu đãi'}
                </p>

                <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Đơn tối thiểu:</span>
                    <strong className="text-[#26211C]">
                      {voucherFormData.minOrderValue ? `${formatCurrency(voucherFormData.minOrderValue)}₫` : '0₫'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Lượt dùng tối đa:</span>
                    <strong className="text-[#26211C]">
                      {voucherFormData.usageLimit || 'Không giới hạn'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Hạn dùng:</span>
                    <strong className="text-[#26211C]">
                      {voucherFormData.expiresAt ? new Date(voucherFormData.expiresAt).toLocaleDateString('vi-VN') : 'Vô thời hạn'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Trạng thái:</span>
                    <strong className={voucherFormData.isActive !== false ? 'text-emerald-600' : 'text-gray-400'}>
                      {voucherFormData.isActive !== false ? '● Đang kích hoạt' : '○ Tạm ngưng'}
                    </strong>
                  </div>
                </div>

                <div className="pt-2 text-center text-[10px] text-[#8C8276] flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#B86244]" />
                  Tự động kiểm tra tính hợp lệ khi khách đặt hàng
                </div>
              </div>
            </div>

            {/* Help Callout */}
            <div className="p-4 bg-white rounded-2xl border border-[#E8DFD3] text-xs text-[#6B6258] space-y-2 shadow-2xs">
              <div className="flex items-center gap-1.5 font-bold text-[#26211C]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Quy tắc vận hành chuẩn:</span>
              </div>
              <ul className="text-[11px] space-y-1 list-disc pl-4 text-[#8C8276]">
                <li>Mã sau khi lưu sẽ có hiệu lực ngay lập tức.</li>
                <li>Khách hàng có thể nhập tại Giỏ hàng hoặc Thanh toán.</li>
                <li>Không tạo mã trùng lặp với mã đang tồn tại.</li>
              </ul>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
