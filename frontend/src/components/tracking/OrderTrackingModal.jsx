import React, { useState } from 'react';
import { X, Search, Truck, Clock, CheckCircle2, Package, Sparkles, MapPin } from 'lucide-react';
import { api } from '../../services/api';

export default function OrderTrackingModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setOrder(null);

    try {
      // First try by ID
      try {
        const res = await api.getOrderById(query.trim().toUpperCase());
        if (res.success && res.data) {
          setOrder(res.data);
          setLoading(false);
          return;
        }
      } catch {
        // Fall back to query by search params (phone or ID)
      }

      const resList = await api.getOrders({ search: query.trim() });
      if (resList.success && resList.data && resList.data.length > 0) {
        setOrder(resList.data[0]);
      } else {
        setErrorMsg('Không tìm thấy đơn hàng với mã hoặc số điện thoại này. Vui lòng kiểm tra lại.');
      }
    } catch (err) {
      setErrorMsg('Lỗi kết nối máy chủ, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-[#FAF7F2] rounded-3xl shadow-2xl border border-[#E8DFD3] overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#26211C] text-white px-6 py-4 flex items-center justify-between border-b border-[#3D352E]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#B86244] flex items-center justify-center text-amber-200">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif-boutique text-xl font-bold tracking-wide">
                TRA CỨU HÀNH TRÌNH ĐƠN HÀNG
              </h3>
              <p className="text-[11px] text-[#CFC1B0]">
                Xem tiến độ nghệ nhân đan vòng thủ công & lộ trình vận chuyển
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#CFC1B0] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Search Input Box */}
          <form onSubmit={handleSearch} className="space-y-2">
            <label className="text-xs font-bold text-[#26211C] block">
              Nhập mã đơn hàng (ví dụ: DH-8921) hoặc số điện thoại đặt hàng:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#8C8276] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Ví dụ: DH-8921 hoặc 0982345678"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 rounded-xl border border-[#E8DFD3] bg-white focus:outline-none focus:ring-1 focus:ring-[#B86244]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-[#B86244] hover:bg-[#A05237] text-white font-semibold text-xs sm:text-sm transition-colors shadow-sm"
              >
                {loading ? 'Đang tìm...' : 'Tra Cứu'}
              </button>
            </div>
            <p className="text-[11px] text-[#8C8276]">
              Gợi ý thử: Mã có sẵn trong hệ thống <strong>DH-8921</strong> hoặc <strong>DH-8922</strong>
            </p>
          </form>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Result Card */}
          {order && (
            <div className="space-y-5 animate-fadeIn">
              
              {/* Status Header */}
              <div className="p-4 bg-white rounded-2xl border border-[#E8DFD3] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-[#26211C]">Đơn hàng #{order.id}</span>
                    <span className="text-xs bg-[#EDF3EF] text-[#4E6857] px-2.5 py-0.5 rounded-full font-bold">
                      {order.orderStatus}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B6258] mt-1">
                    Người nhận: <strong>{order.customerName}</strong> ({order.phone})
                  </p>
                  <p className="text-xs text-[#8C8276] truncate">
                    Địa chỉ: {order.address}
                  </p>
                </div>

                <div className="text-right sm:border-l sm:border-[#F3ECE1] sm:pl-4">
                  <p className="text-xs text-[#8C8276]">Tổng thanh toán:</p>
                  <p className="font-bold text-lg text-[#B86244]">
                    {order.totalAmount.toLocaleString('vi-VN')}₫
                  </p>
                  <span className="text-[10px] text-[#4E6857] font-semibold bg-[#EDF3EF] px-2 py-0.5 rounded inline-block mt-0.5">
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Items in order */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#26211C] uppercase tracking-wider">
                  Sản phẩm trong đơn ({order.items.length}):
                </h4>
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-xl border border-[#E8DFD3] flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-[#26211C]">{item.name}</p>
                        {item.isCustom && item.customDetails ? (
                          <p className="text-[11px] text-[#4E6857]">
                            [Tự Phối] {item.customDetails.cord} · {item.customDetails.mainBead} · {item.customDetails.charm} ({item.customDetails.size})
                          </p>
                        ) : (
                          <p className="text-[11px] text-[#8C8276]">
                            Size tay: {item.wristSize} {item.note ? `· ${item.note}` : ''}
                          </p>
                        )}
                      </div>
                      <span className="font-bold text-[#B86244] ml-2">
                        {item.price.toLocaleString('vi-VN')}₫ x {item.quantity || 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-time Timeline */}
              <div className="p-4 bg-[#FAF4ED] rounded-2xl border border-[#EADBCC] space-y-3">
                <h4 className="text-xs font-bold text-[#845339] uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#B86244]" />
                  Tiến Trình Chế Tác Thủ Công & Vận Chuyển:
                </h4>

                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#D4C3B3]">
                  {order.timeline && order.timeline.map((step, sIdx) => (
                    <div key={sIdx} className="relative">
                      <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-[#B86244] border-2 border-white shadow-sm" />
                      <p className="text-xs font-bold text-[#26211C]">{step.status}</p>
                      <p className="text-[10px] text-[#8C8276] mt-0.5">{step.time}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
