import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  CreditCard, 
  Banknote, 
  Copy, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  ArrowRight,
  QrCode,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';

export default function CheckoutModal({ isOpen, onClose, checkoutData, onOrderSuccess, currentUser }) {
  if (!isOpen) return null;

  const { cartItems, clearCart } = useCart();

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('VietQR');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);
  const [copiedField, setCopiedField] = useState('');

  const finalTotal = checkoutData?.finalTotal || 0;
  const discount = checkoutData?.discount || 0;
  const shippingFee = checkoutData?.shippingFee || 25000;

  // Real bank info for VietQR
  const bankInfo = {
    bankName: 'MBBank (Ngân Hàng Quân Đội)',
    accountNumber: '0988668899',
    accountName: 'KHANH VY MADE',
    transferContent: `KHANHVY ${Math.floor(1000 + Math.random() * 9000)}`
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 1500);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ nhận hàng.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customerName: fullName,
        phone,
        address,
        note,
        paymentMethod,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.effectivePrice || item.price,
          retailPrice: item.price,
          wholesalePrice: item.wholesalePrice,
          isWholesale: Boolean(item.isWholesale),
          quantity: item.quantity,
          wristSize: item.wristSize || 'Dây rút 14-18cm',
          isCustom: item.isCustom || false,
          customDetails: item.customDetails || null,
          note: item.note || ''
        })),
        totalAmount: finalTotal,
        shippingFee,
        discount,
        wholesaleSavings: checkoutData?.wholesaleSavings || 0
      };

      const res = await api.createOrder(orderPayload);

      if (res.success && res.data) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        setCompletedOrder(res.data);
        clearCart();
        if (onOrderSuccess) onOrderSuccess(res.data);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Không thể tạo đơn hàng, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-3xl bg-[#FAF7F2] rounded-3xl shadow-2xl border border-[#E8DFD3] overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#26211C] text-white px-6 py-4 flex items-center justify-between border-b border-[#3D352E]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#B86244] flex items-center justify-center text-white font-bold text-sm">
              ✓
            </div>
            <div>
              <h3 className="font-serif-boutique text-xl font-bold tracking-wide">
                {completedOrder ? 'ĐẶT HÀNG THÀNH CÔNG' : 'XÁC NHẬN ĐƠN HÀNG & THANH TOÁN'}
              </h3>
              <p className="text-[11px] text-[#CFC1B0]">
                {completedOrder ? 'Nghệ nhân xưởng đang chuẩn bị chọn đá và xâu vòng cho bạn' : 'Điền thông tin nhận hàng và chọn hình thức thanh toán thuận tiện'}
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

        {/* ORDER COMPLETED STATE */}
        {completedOrder ? (
          <div className="p-6 sm:p-8 space-y-6 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-[#EDF3EF] text-[#4E6857] flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest font-bold text-[#4E6857] bg-[#EDF3EF] px-3 py-1 rounded-full">
                Mã Đơn Hàng: #{completedOrder.id}
              </span>
              <h4 className="font-serif-boutique text-2xl sm:text-3xl font-bold text-[#26211C]">
                Cảm ơn bạn, {completedOrder.customerName}!
              </h4>
              <p className="text-xs sm:text-sm text-[#6B6258] max-w-md mx-auto">
                Đơn hàng vòng tay thủ công của bạn đã được tiếp nhận. Nghệ nhân sẽ kiểm tra kích thước cổ tay và xâu hạt tỉ mỉ theo đúng yêu cầu.
              </p>
            </div>

            {/* Order summary card */}
            <div className="p-4 bg-white rounded-2xl border border-[#E8DFD3] text-left text-xs max-w-md mx-auto space-y-2 shadow-sm">
              <div className="flex justify-between border-b border-[#F3ECE1] pb-2">
                <span className="text-[#8C8276]">Người nhận:</span>
                <span className="font-semibold text-[#26211C]">{completedOrder.customerName} ({completedOrder.phone})</span>
              </div>
              <div className="flex justify-between border-b border-[#F3ECE1] pb-2">
                <span className="text-[#8C8276]">Địa chỉ giao:</span>
                <span className="font-medium text-[#26211C] text-right truncate max-w-[65%]">{completedOrder.address}</span>
              </div>
              <div className="flex justify-between border-b border-[#F3ECE1] pb-2">
                <span className="text-[#8C8276]">Hình thức thanh toán:</span>
                <span className="font-semibold text-[#B86244]">{completedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="font-bold text-[#26211C]">Tổng tiền:</span>
                <span className="font-bold text-base text-[#B86244]">{completedOrder.totalAmount.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={onClose}
                className="px-8 py-3 rounded-xl bg-[#26211C] text-white font-semibold text-xs sm:text-sm hover:bg-[#3D352E] transition-colors"
              >
                Tiếp Tục Mua Sắm
              </button>
            </div>
          </div>
        ) : (
          /* CHECKOUT FORM */
          <form onSubmit={handleSubmitOrder} className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
            
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Customer Form */}
              <div className="space-y-4">
                <h4 className="font-serif-boutique text-lg font-bold text-[#26211C] border-b border-[#E8DFD3] pb-2">
                  1. Thông Tin Người Nhận
                </h4>

                <div>
                  <label className="text-xs font-semibold text-[#26211C] block mb-1">
                    Họ và tên của bạn: *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Minh Anh"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E8DFD3] bg-white focus:outline-none focus:ring-1 focus:ring-[#B86244]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#26211C] block mb-1">
                    Số điện thoại nhận hàng: *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ví dụ: 0988234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E8DFD3] bg-white focus:outline-none focus:ring-1 focus:ring-[#B86244]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#26211C] block mb-1">
                    Địa chỉ nhận hàng chi tiết: *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Số nhà, tên ngõ/đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E8DFD3] bg-white focus:outline-none focus:ring-1 focus:ring-[#B86244]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#26211C] block mb-1">
                    Ghi chú thêm cho bưu tá hoặc nghệ nhân:
                  </label>
                  <input
                    type="text"
                    placeholder="Giao giờ hành chính, gọi trước 15p..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E8DFD3] bg-white focus:outline-none focus:ring-1 focus:ring-[#B86244]"
                  />
                </div>
              </div>

              {/* Right Column: Payment Method & VietQR */}
              <div className="space-y-4">
                <h4 className="font-serif-boutique text-lg font-bold text-[#26211C] border-b border-[#E8DFD3] pb-2">
                  2. Phương Thức Thanh Toán
                </h4>

                {/* Payment Selection Options */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('VietQR')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      paymentMethod === 'VietQR'
                        ? 'border-[#B86244] bg-[#FBEFEA] ring-1 ring-[#B86244]'
                        : 'border-[#E8DFD3] bg-white hover:bg-[#F3ECE1]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <QrCode className="w-5 h-5 text-[#B86244]" />
                      <span className="text-[9px] bg-[#B86244] text-white px-1.5 py-0.5 rounded font-bold">Khuyên dùng</span>
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#26211C]">VietQR Ngân Hàng</p>
                      <p className="text-[10px] text-[#6B6258]">Quét mã chuyển nhanh 24/7</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      paymentMethod === 'COD'
                        ? 'border-[#B86244] bg-[#FBEFEA] ring-1 ring-[#B86244]'
                        : 'border-[#E8DFD3] bg-white hover:bg-[#F3ECE1]'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-[#4E6857] mb-1" />
                    <div>
                      <p className="font-bold text-xs text-[#26211C]">COD Nhận Hàng</p>
                      <p className="text-[10px] text-[#6B6258]">Thanh toán tiền mặt bưu tá</p>
                    </div>
                  </button>
                </div>

                {/* VIETQR SIMULATOR DETAILS */}
                {paymentMethod === 'VietQR' && (
                  <div className="p-4 bg-white rounded-2xl border border-[#E8DFD3] space-y-3 shadow-sm animate-fadeIn">
                    <div className="flex items-center justify-between text-xs border-b border-[#F3ECE1] pb-2">
                      <span className="font-bold text-[#B86244] flex items-center gap-1">
                        <QrCode className="w-4 h-4" /> Mã VietQR Tự Động
                      </span>
                      <span className="text-[10px] text-[#4E6857] font-semibold bg-[#EDF3EF] px-2 py-0.5 rounded">
                        Miễn phí chuyển khoản
                      </span>
                    </div>

                    {/* QR Code graphic representation */}
                    <div className="flex items-center justify-center p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFD3]">
                      <div className="text-center space-y-1">
                        <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl shadow-inner border border-[#E8DFD3] flex flex-col items-center justify-center">
                          {/* Simulated realistic VietQR visual */}
                          <div className="grid grid-cols-6 gap-1 w-full h-full p-1 bg-stone-900 rounded">
                            <div className="col-span-2 row-span-2 bg-white rounded-sm" />
                            <div className="col-span-2 bg-white rounded-sm" />
                            <div className="col-span-2 row-span-2 bg-white rounded-sm" />
                            <div className="col-span-2 bg-white rounded-sm" />
                            <div className="col-span-2 bg-white rounded-sm" />
                            <div className="col-span-2 bg-white rounded-sm" />
                            <div className="col-span-2 row-span-2 bg-white rounded-sm" />
                            <div className="col-span-4 bg-white rounded-sm" />
                          </div>
                        </div>
                        <p className="text-[10px] text-[#8C8276] font-medium">
                          Mở app ngân hàng bất kỳ để quét mã
                        </p>
                      </div>
                    </div>

                    {/* Bank Copy Info */}
                    <div className="space-y-1.5 text-xs text-[#26211C]">
                      <div className="flex justify-between items-center bg-[#FAF7F2] p-2 rounded-lg">
                        <span className="text-[#8C8276]">Số tài khoản:</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(bankInfo.accountNumber, 'stk')}
                          className="font-bold flex items-center gap-1 text-[#B86244] hover:underline"
                        >
                          {bankInfo.accountNumber}
                          {copiedField === 'stk' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>

                      <div className="flex justify-between items-center bg-[#FAF7F2] p-2 rounded-lg">
                        <span className="text-[#8C8276]">Chủ tài khoản:</span>
                        <span className="font-semibold">{bankInfo.accountName}</span>
                      </div>

                      <div className="flex justify-between items-center bg-[#FAF7F2] p-2 rounded-lg">
                        <span className="text-[#8C8276]">Nội dung CK:</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(bankInfo.transferContent, 'nd')}
                          className="font-bold flex items-center gap-1 text-[#B86244] hover:underline"
                        >
                          {bankInfo.transferContent}
                          {copiedField === 'nd' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Final Price Breakdown */}
                <div className="p-3 bg-white rounded-xl border border-[#E8DFD3] space-y-1 text-xs">
                  <div className="flex justify-between text-[#8C8276]">
                    <span>Số lượng sản phẩm:</span>
                    <span className="font-medium text-[#26211C]">{cartItems.length} món ({cartItems.reduce((s, i) => s + i.quantity, 0)} chiếc)</span>
                  </div>
                  {checkoutData?.wholesaleSavings > 0 && (
                    <div className="flex justify-between text-[#2E583A] font-medium bg-[#EDF5F0] -mx-1 px-2 py-1 rounded">
                      <span>Chiết khấu giá sỉ xưởng:</span>
                      <span className="font-bold">-{checkoutData.wholesaleSavings.toLocaleString('vi-VN')}₫</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between text-[#4E6857]">
                      <span>Mã giảm giá:</span>
                      <span>-{discount.toLocaleString('vi-VN')}₫</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#8C8276]">
                    <span>Phí ship bưu tá:</span>
                    <span>{shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}₫`}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-[#26211C] border-t border-[#F3ECE1] pt-1.5">
                    <span>Tổng cần thanh toán:</span>
                    <span className="text-base text-[#B86244]">{finalTotal.toLocaleString('vi-VN')}₫</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-[#E8DFD3] flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[#E8DFD3] text-xs font-semibold text-[#6B6258] hover:bg-white"
              >
                ← Trở lại Giỏ Hàng
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3.5 rounded-xl bg-[#B86244] hover:bg-[#A05237] text-white font-bold text-sm shadow-artisan-hover transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <span>Đang gửi đơn hàng...</span>
                ) : (
                  <>
                    <span>Hoàn Tất Đặt Hàng ({finalTotal.toLocaleString('vi-VN')}₫)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
