import React, { useState, useEffect } from 'react';
import { X, Search, Truck, Clock, CheckCircle2, Package, Sparkles, MapPin, AlertCircle, Phone, Hash } from 'lucide-react';
import { api } from '../../services/api';

export default function OrderTrackingModal({ isOpen, onClose, currentUser }) {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Reset or pre-fill phone if available
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      if (!order && currentUser?.phone) {
        setQuery(currentUser.phone);
      }
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const executeSearch = async (searchTerm) => {
    const rawKey = (searchTerm || query).trim();
    if (!rawKey) {
      setErrorMsg('Vui lòng nhập mã đơn hàng (ví dụ: DH-8921) hoặc số điện thoại nhận hàng để tra cứu.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setOrder(null);

    try {
      // 1. Normalize query
      let candidateId = rawKey.toUpperCase();
      if (/^\d{4,5}$/.test(candidateId) && !candidateId.startsWith('DH-')) {
        candidateId = `DH-${candidateId}`;
      }

      // 2. Try direct ID lookup
      try {
        const resId = await api.getOrderById(candidateId);
        if (resId.success && resId.data) {
          setOrder(resId.data);
          setLoading(false);
          return;
        }
      } catch {
        // Fall back to general search
      }

      // 3. Try search by phone or text
      const cleanPhoneOrText = rawKey.replace(/[\s.-]/g, '');
      const resList = await api.getOrders({ search: cleanPhoneOrText });

      if (resList.success && Array.isArray(resList.data) && resList.data.length > 0) {
        setOrder(resList.data[0]);
      } else {
        // 4. Try raw query fallback
        const resRaw = await api.getOrders({ search: rawKey });
        if (resRaw.success && Array.isArray(resRaw.data) && resRaw.data.length > 0) {
          setOrder(resRaw.data[0]);
        } else {
          setErrorMsg(`Không tìm thấy đơn hàng nào khớp với "${rawKey}". Vui lòng kiểm tra lại mã đơn hoặc số điện thoại.`);
        }
      }
    } catch (err) {
      setErrorMsg('Lỗi kết nối máy chủ khi tra cứu, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleQuickSearch = (code) => {
    setQuery(code);
    executeSearch(code);
  };

  const safeItems = order?.items 
    ? (Array.isArray(order.items) ? order.items : (typeof order.items === 'string' ? JSON.parse(order.items || '[]') : []))
    : [];

  const safeTimeline = order?.timeline
    ? (Array.isArray(order.timeline) ? order.timeline : (typeof order.timeline === 'string' ? JSON.parse(order.timeline || '[]') : []))
    : [];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-sm overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
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
          <form onSubmit={handleSearch} className="space-y-3">
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
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  className={`w-full text-xs sm:text-sm pl-10 pr-4 py-3 rounded-xl border transition-all focus:outline-none ${
                    errorMsg 
                      ? 'border-rose-500 bg-rose-50/50 ring-2 ring-rose-200/70' 
                      : 'border-[#E8DFD3] bg-white focus:ring-1 focus:ring-[#B86244]'
                  }`}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-[#B86244] hover:bg-[#A05237] text-white font-bold text-xs sm:text-sm transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'Đang tra...' : 'Tra Cứu'}
              </button>
            </div>

            {/* Quick Clickable Suggestions */}
            <div className="flex items-center gap-2 pt-1 flex-wrap text-xs">
              <span className="text-[11px] text-[#8C8276]">Gợi ý tra nhanh:</span>
              <button
                type="button"
                onClick={() => handleQuickSearch('DH-8921')}
                className="px-2.5 py-1 rounded-lg bg-white text-[#B86244] border border-[#EADBCC] text-xs font-bold hover:bg-[#B86244] hover:text-white transition-all shadow-2xs"
              >
                🏷️ DH-8921
              </button>
              <button
                type="button"
                onClick={() => handleQuickSearch('DH-8922')}
                className="px-2.5 py-1 rounded-lg bg-white text-[#B86244] border border-[#EADBCC] text-xs font-bold hover:bg-[#B86244] hover:text-white transition-all shadow-2xs"
              >
                🏷️ DH-8922
              </button>
              {currentUser?.phone && (
                <button
                  type="button"
                  onClick={() => handleQuickSearch(currentUser.phone)}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF4ED] text-[#26211C] border border-[#E8DFD3] text-xs font-semibold hover:bg-[#B86244] hover:text-white transition-all shadow-2xs"
                >
                  📱 SĐT của tôi ({currentUser.phone})
                </button>
              )}
            </div>
          </form>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border-2 border-rose-300 text-rose-800 text-xs font-medium rounded-xl flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
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
                    {Number(order.totalAmount || 0).toLocaleString('vi-VN')}₫
                  </p>
                  <span className="text-[10px] text-[#4E6857] font-semibold bg-[#EDF3EF] px-2 py-0.5 rounded inline-block mt-0.5">
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Items in order */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#26211C] uppercase tracking-wider">
                  Sản phẩm trong đơn ({safeItems.length}):
                </h4>
                <div className="space-y-2">
                  {safeItems.map((item, idx) => (
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
                        {Number(item.price || 0).toLocaleString('vi-VN')}₫ x {item.quantity || 1}
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
                  {(safeTimeline.length > 0 ? safeTimeline : [
                    { status: 'Đã nhận đơn hàng', time: order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'Vừa xong' },
                    { status: order.orderStatus || 'Đang chuẩn bị hạt và chỉ sáp', time: 'Đang thực hiện' }
                  ]).map((step, sIdx) => (
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
