import React, { useState, useEffect, useRef } from 'react';
import { isBraceletProduct } from '../../utils/productUtils';
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
  Check,
  Gift,
  Tag,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';

export default function CheckoutModal({ isOpen, onClose, checkoutData, onOrderSuccess, currentUser }) {
  if (!isOpen) return null;

  const { clearCart, cartItems: contextCartItems } = useCart();
  const cartItems = (checkoutData?.items && checkoutData.items.length > 0)
    ? checkoutData.items
    : (contextCartItems && contextCartItems.length > 0)
      ? contextCartItems
      : [];

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('VietQR');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ fullName: '', phone: '', address: '' });
  const [completedOrder, setCompletedOrder] = useState(null);
  const [copiedField, setCopiedField] = useState('');

  const fullNameRef = useRef(null);
  const phoneRef = useRef(null);
  const addressRef = useRef(null);

  // Auto-sync profile info from currentUser whenever checkout opens or user changes
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setFieldErrors({ fullName: '', phone: '', address: '' });
      setCompletedOrder(null);
      if (currentUser) {
        if (currentUser.fullName) setFullName(currentUser.fullName);
        if (currentUser.phone) setPhone(currentUser.phone);
        if (currentUser.address) setAddress(currentUser.address);
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

  // Gift Packaging Service
  const [isGiftBox, setIsGiftBox] = useState(false);
  const [giftCardMessage, setGiftCardMessage] = useState('');

  // Voucher Promotion state
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState('');
  const [isCheckingVoucher, setIsCheckingVoucher] = useState(false);

  const rawTotal = checkoutData?.finalTotal || 0;
  const discount = (checkoutData?.discount || 0) + (appliedVoucher?.discountAmount || 0);
  const shippingFee = checkoutData?.shippingFee || 25000;
  const giftBoxFee = isGiftBox ? 25000 : 0;
  const finalTotal = Math.max(0, rawTotal + giftBoxFee - (appliedVoucher?.discountAmount || 0));

  const handleApplyVoucher = async (codeToApply = null) => {
    const code = (codeToApply || voucherCodeInput).trim().toUpperCase();
    if (!code) {
      setVoucherError('Vui lòng nhập mã voucher');
      return;
    }
    setVoucherError('');
    setIsCheckingVoucher(true);
    try {
      const res = await api.applyVoucher(code, rawTotal);
      if (res.success) {
        setAppliedVoucher(res);
        setVoucherCodeInput(res.code);
      } else {
        setVoucherError(res.message || 'Mã giảm giá không hợp lệ');
        setAppliedVoucher(null);
      }
    } catch (e) {
      setVoucherError('Lỗi kiểm tra mã giảm giá');
      setAppliedVoucher(null);
    } finally {
      setIsCheckingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCodeInput('');
    setVoucherError('');
  };

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

    const errors = {};
    if (!fullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ và tên người nhận hàng.';
    }
    const cleanPhone = phone.trim().replace(/[\s.-]/g, '');
    if (!cleanPhone) {
      errors.phone = 'Vui lòng nhập số điện thoại để bưu tá liên hệ giao hàng.';
    } else if (!/^[0-9]{9,11}$/.test(cleanPhone)) {
      errors.phone = 'Số điện thoại không hợp lệ (cần đủ 10 số di động).';
    }
    if (!address.trim()) {
      errors.address = 'Vui lòng nhập địa chỉ nhận hàng chi tiết (số nhà, ngõ/đường, phường/xã, tỉnh/thành).';
    } else if (address.trim().length < 5) {
      errors.address = 'Địa chỉ nhận hàng quá ngắn, vui lòng ghi rõ địa chỉ để bưu tá giao.';
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setErrorMsg('Vui lòng kiểm tra và điền đầy đủ các thông tin được báo đỏ bên dưới để hoàn tất đặt hàng.');
      if (errors.fullName && fullNameRef.current) {
        fullNameRef.current.focus();
      } else if (errors.phone && phoneRef.current) {
        phoneRef.current.focus();
      } else if (errors.address && addressRef.current) {
        addressRef.current.focus();
      }
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      setErrorMsg('Giỏ hàng chưa có sản phẩm nào. Vui lòng chọn mẫu vòng tay bạn thích trước khi tạo đơn.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        userId: currentUser?.id || null,
        customerName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        note: isGiftBox 
          ? `[HỘP QUÀ GẤM & THIỆP TAY: "${giftCardMessage || 'Thương gửi'}"]. ${note}`.trim()
          : note,
        paymentMethod,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.effectivePrice || item.price,
          retailPrice: item.price,
          wholesalePrice: item.wholesalePrice,
          isWholesale: Boolean(item.isWholesale),
          quantity: item.quantity,
          wristSize: item.wristSize || (isBraceletProduct(item) ? '15 - 16 cm' : null),
          isCustom: item.isCustom || false,
          customDetails: item.customDetails || null,
          note: item.note || ''
        })),
        totalAmount: finalTotal,
        shippingFee,
        discount,
        voucherCode: appliedVoucher?.code || null,
        voucherDiscount: appliedVoucher?.discountAmount || 0,
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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-sm overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
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
          /* CHECKOUT FORM */
          <form onSubmit={handleSubmitOrder} noValidate className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
            
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border-2 border-rose-400 text-rose-800 text-xs font-semibold rounded-2xl flex items-center gap-2.5 shadow-xs animate-fadeIn">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <p>{errorMsg}</p>
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
                    ref={fullNameRef}
                    type="text"
                    placeholder="Ví dụ: Nguyễn Minh Anh"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (fieldErrors.fullName) setFieldErrors(p => ({ ...p, fullName: '' }));
                    }}
                    className={`w-full text-xs p-3 rounded-xl transition-all focus:outline-none ${
                      fieldErrors.fullName
                        ? 'border-2 border-rose-500 bg-rose-50/70 text-rose-950 ring-2 ring-rose-200/80 focus:border-rose-600 focus:ring-rose-300'
                        : 'border border-[#E8DFD3] bg-white text-[#26211C] focus:ring-1 focus:ring-[#B86244]'
                    }`}
                  />
                  {fieldErrors.fullName && (
                    <div className="flex items-center gap-1.5 text-rose-600 text-xs font-semibold mt-1.5 animate-fadeIn">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{fieldErrors.fullName}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#26211C] block mb-1">
                    Số điện thoại nhận hàng: *
                  </label>
                  <input
                    ref={phoneRef}
                    type="tel"
                    placeholder="Ví dụ: 0988234567"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (fieldErrors.phone) setFieldErrors(p => ({ ...p, phone: '' }));
                    }}
                    className={`w-full text-xs p-3 rounded-xl transition-all focus:outline-none ${
                      fieldErrors.phone
                        ? 'border-2 border-rose-500 bg-rose-50/70 text-rose-950 ring-2 ring-rose-200/80 focus:border-rose-600 focus:ring-rose-300'
                        : 'border border-[#E8DFD3] bg-white text-[#26211C] focus:ring-1 focus:ring-[#B86244]'
                    }`}
                  />
                  {fieldErrors.phone && (
                    <div className="flex items-center gap-1.5 text-rose-600 text-xs font-semibold mt-1.5 animate-fadeIn">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{fieldErrors.phone}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#26211C] block mb-1">
                    Địa chỉ nhận hàng chi tiết: *
                  </label>
                  <textarea
                    ref={addressRef}
                    rows={2}
                    placeholder="Số nhà, tên ngõ/đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (fieldErrors.address) setFieldErrors(p => ({ ...p, address: '' }));
                    }}
                    className={`w-full text-xs p-3 rounded-xl transition-all focus:outline-none ${
                      fieldErrors.address
                        ? 'border-2 border-rose-500 bg-rose-50/70 text-rose-950 ring-2 ring-rose-200/80 focus:border-rose-600 focus:ring-rose-300'
                        : 'border border-[#E8DFD3] bg-white text-[#26211C] focus:ring-1 focus:ring-[#B86244]'
                    }`}
                  />
                  {fieldErrors.address && (
                    <div className="flex items-center gap-1.5 text-rose-600 text-xs font-semibold mt-1.5 animate-fadeIn">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{fieldErrors.address}</span>
                    </div>
                  )}
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
                    className="w-full text-xs p-3 rounded-xl border border-[#E8DFD3] bg-white focus:outline-none focus:ring-1 focus:ring-[#B86244]"
                  />
                </div>

                {/* Dịch vụ Hộp Quà Gấm & Thiệp Viết Tay */}
                <div className="p-3.5 bg-[#FAF4ED] rounded-2xl border border-[#EADBCC] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isGiftBox}
                        onChange={(e) => setIsGiftBox(e.target.checked)}
                        className="w-4 h-4 rounded accent-[#B86244]"
                      />
                      <span className="text-xs font-bold text-[#26211C] flex items-center gap-1.5">
                        <Gift className="w-4 h-4 text-[#B86244]" />
                        Đóng Hộp Quà Gấm Nam Châm (+25.000₫)
                      </span>
                    </label>
                    <span className="text-[10px] bg-[#B86244]/10 text-[#B86244] font-bold px-2 py-0.5 rounded-full">
                      Tặng rơm & túi thơm
                    </span>
                  </div>

                  {isGiftBox && (
                    <div className="space-y-1.5 pt-2 border-t border-[#EADBCC]/80 animate-fadeIn">
                      <label className="text-[11px] font-semibold text-[#6B6258] block">
                        ✍️ Lời chúc trên thiệp tay (Nghệ nhân viết tặng miễn phí):
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Ví dụ: Chúc em tuổi mới luôn rực rỡ, bình an và hạnh phúc!"
                        value={giftCardMessage}
                        onChange={(e) => setGiftCardMessage(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl border border-[#EADBCC] bg-white focus:outline-none focus:ring-1 focus:ring-[#B86244]"
                      />
                    </div>
                  )}
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

                {/* NEW: Voucher Promo Code Box */}
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EADBCC] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#26211C] flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#B86244]" />
                      Mã Giảm Giá / Voucher Xưởng
                    </span>
                    {appliedVoucher && (
                      <button
                        type="button"
                        onClick={handleRemoveVoucher}
                        className="text-[10px] text-rose-600 hover:underline font-semibold"
                      >
                        Gỡ bỏ
                      </button>
                    )}
                  </div>

                  {appliedVoucher ? (
                    <div className="p-2 bg-[#EDF5F0] border border-[#C2DEC8] rounded-lg flex items-center justify-between text-xs text-[#2E583A]">
                      <span className="font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#3A754B]" />
                        Đã áp dụng: {appliedVoucher.code} (-{appliedVoucher.discountAmount.toLocaleString('vi-VN')}₫)
                      </span>
                      <span className="text-[10px] font-medium text-[#4E6857]">
                        {appliedVoucher.description}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Nhập mã (VD: KHANHVY10, FREESHIP)..."
                          value={voucherCodeInput}
                          onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                          className="flex-1 text-xs p-2 rounded-lg border border-[#E8DFD3] bg-white uppercase font-bold tracking-wider focus:outline-none focus:ring-1 focus:ring-[#B86244]"
                        />
                        <button
                          type="button"
                          onClick={() => handleApplyVoucher()}
                          disabled={isCheckingVoucher}
                          className="px-3.5 py-2 bg-[#B86244] hover:bg-[#A05237] text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap shadow-xs"
                        >
                          {isCheckingVoucher ? 'Đang kiểm tra...' : 'Áp Dụng'}
                        </button>
                      </div>

                      {voucherError && (
                        <p className="text-[11px] text-rose-600 font-medium">
                          ⚠️ {voucherError}
                        </p>
                      )}

                      {/* Quick Voucher Suggestions */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-[#8C8276]">Gợi ý mã:</span>
                        {['KHANHVY10', 'FREESHIP', 'BANMOI20K'].map(code => (
                          <button
                            key={code}
                            type="button"
                            onClick={() => handleApplyVoucher(code)}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-[#EADBCC] text-[#845339] font-semibold hover:border-[#B86244] hover:text-[#B86244] transition-colors"
                          >
                            🏷️ {code}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

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
                  {isGiftBox && (
                    <div className="flex justify-between text-[#B86244] font-semibold bg-[#FAF4ED] -mx-1 px-2 py-1 rounded">
                      <span>Hộp quà gấm & thiệp viết tay:</span>
                      <span>+25.000₫</span>
                    </div>
                  )}
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
