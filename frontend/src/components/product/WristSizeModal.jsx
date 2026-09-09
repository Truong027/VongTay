import React, { useEffect } from 'react';
import { X, Ruler, CheckCircle2, Scissors, Info } from 'lucide-react';

export default function WristSizeModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-[#FAF7F2] rounded-3xl shadow-2xl border border-[#E8DFD3] p-6 sm:p-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white hover:bg-[#F3ECE1] text-[#26211C] transition-all shadow-sm"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#B86244]/10 text-[#B86244] flex items-center justify-center">
            <Ruler className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif-boutique text-2xl font-bold text-[#26211C]">
              Hướng Dẫn Đo Size Cổ Tay Chuẩn Xác
            </h3>
            <p className="text-xs text-[#6B6258]">
              Đảm bảo chiếc vòng đeo vừa vặn, êm ái và không bị chật bó
            </p>
          </div>
        </div>

        {/* 2 Ways to measure */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          
          <div className="p-4 bg-white rounded-2xl border border-[#E8DFD3] space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#B86244]">
              <Ruler className="w-4 h-4" />
              <span>Cách 1: Dùng Thước Dây</span>
            </div>
            <p className="text-xs text-[#6B6258] leading-relaxed">
              Quấn thước dây vừa khít quanh vị trí cổ tay bạn thường đeo vòng (ngay dưới mắt cá tay). Đọc chỉ số cm chính xác trên thước.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-[#E8DFD3] space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#4E6857]">
              <Scissors className="w-4 h-4" />
              <span>Cách 2: Dùng Sợi Dây / Mảnh Giấy</span>
            </div>
            <p className="text-xs text-[#6B6258] leading-relaxed">
              Dùng một sợi chỉ hoặc dải giấy nhỏ quấn quanh cổ tay, lấy bút đánh dấu điểm giao nhau, sau đó trải thẳng đặt lên thước kẻ để đo độ dài cm.
            </p>
          </div>

        </div>

        {/* Size Table Reference */}
        <div className="overflow-hidden border border-[#E8DFD3] rounded-2xl bg-white mb-6">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F3ECE1] text-[#26211C] font-semibold border-b border-[#E8DFD3]">
              <tr>
                <th className="p-3">Chu vi cổ tay</th>
                <th className="p-3">Kích thước Size</th>
                <th className="p-3">Phù hợp với</th>
                <th className="p-3">Số hạt chuẩn (8mm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3ECE1] text-[#6B6258]">
              <tr>
                <td className="p-3 font-medium text-[#26211C]">14 - 15 cm</td>
                <td className="p-3"><span className="font-semibold text-[#B86244]">Size XS</span></td>
                <td className="p-3">Nữ cổ tay rất nhỏ, thanh mảnh</td>
                <td className="p-3">19 - 20 hạt</td>
              </tr>
              <tr className="bg-[#FAF7F2]">
                <td className="p-3 font-medium text-[#26211C]">15 - 16 cm</td>
                <td className="p-3"><span className="font-semibold text-[#B86244]">Size S (Phổ biến)</span></td>
                <td className="p-3">Đa số các bạn nữ Việt Nam</td>
                <td className="p-3">21 - 22 hạt</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-[#26211C]">16 - 17 cm</td>
                <td className="p-3"><span className="font-semibold text-[#B86244]">Size M</span></td>
                <td className="p-3">Nữ tay tròn đầy hoặc Nam tay thon</td>
                <td className="p-3">23 - 24 hạt</td>
              </tr>
              <tr className="bg-[#FAF7F2]">
                <td className="p-3 font-medium text-[#26211C]">17 - 18 cm</td>
                <td className="p-3"><span className="font-semibold text-[#B86244]">Size L</span></td>
                <td className="p-3">Đa số các bạn nam Việt Nam</td>
                <td className="p-3">25 - 26 hạt</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-[#26211C]">18 - 19 cm</td>
                <td className="p-3"><span className="font-semibold text-[#B86244]">Size XL</span></td>
                <td className="p-3">Nam cổ tay đậm hoặc thích đeo rộng</td>
                <td className="p-3">27 - 28 hạt</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Artisan tip */}
        <div className="space-y-2 mb-6">
          <div className="flex items-start gap-2.5 p-3.5 bg-[#EDF5F0] rounded-xl border border-[#C2DEC8] text-xs text-[#2E583A]">
            <CheckCircle2 className="w-4 h-4 text-[#3A754B] mt-0.5 flex-shrink-0" />
            <p>
              <strong>Ưu điểm vượt trội vòng tay dây Vòng Tay Nhà Zy:</strong> Tất cả sản phẩm vòng dây đan macrame, dây sáp, chỉ đỏ đều dùng <strong>kỹ thuật nút thắt rút đôi trượt tự do (Freesize 13cm - 19cm)</strong>. Bạn có thể tự kéo mở rộng để xỏ tay và thắt rút ôm vừa khít cổ tay mình dễ dàng chỉ bằng một tay!
            </p>
          </div>
          <div className="flex items-start gap-2.5 p-3 bg-[#FAF4ED] rounded-xl border border-[#EADBCC] text-xs text-[#845339]">
            <Info className="w-4 h-4 text-[#B86244] mt-0.5 flex-shrink-0" />
            <p>
              <strong>Bảo hành đan lại dây trọn đời:</strong> Nếu sau thời gian sử dụng dây bị giãn hoặc bạn muốn cắt bớt phần đuôi dây theo ý muốn, nghệ nhân xưởng hỗ trợ chỉnh sửa hoàn toàn miễn phí.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-[#26211C] text-white font-medium text-sm hover:bg-[#3D352E] transition-colors"
        >
          Tôi Đã Hiểu & Quay Lại Chọn Vòng
        </button>

      </div>
    </div>
  );
}
