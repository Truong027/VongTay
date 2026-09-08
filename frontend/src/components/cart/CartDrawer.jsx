import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Sparkles, Tag, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function CartDrawer({ onProceedToCheckout }) {
  const { 
    cartItems, 
    isCartOpen, 
    closeCart, 
    removeFromCart, 
    updateQuantity, 
    subtotal, 
    retailSubtotal,
    wholesaleSavings,
    hasWholesaleDiscount,
    totalCount 
  } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  if (!isCartOpen) return null;

  const freeShippingThreshold = 400000;
  const remainingForFreeShip = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError('');
    if (promoCode.trim().toUpperCase() === 'MAYMAN' || promoCode.trim().toUpperCase() === 'ANYEN') {
      setDiscount(30000);
      setPromoApplied(true);
    } else {
      setPromoError('Mã ưu đãi không hợp lệ. Thử: MAYMAN hoặc ANYEN');
    }
  };

  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 25000;
  const finalTotal = Math.max(0, subtotal - discount + (subtotal > 0 ? shippingFee : 0));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-full sm:w-screen max-w-md bg-[#FAF7F2] shadow-2xl flex flex-col justify-between border-l border-[#E8DFD3]">
          
          {/* Header */}
          <div className="p-5 bg-white border-b border-[#E8DFD3] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#B86244]" />
              <h3 className="font-serif-boutique text-xl font-bold text-[#26211C]">
                Giỏ Hàng Thủ Công ({totalCount})
              </h3>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 rounded-full hover:bg-[#F3ECE1] text-[#6B6258] hover:text-[#26211C] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Wholesale Status Banner if wholesale unlocked */}
          {hasWholesaleDiscount && (
            <div className="bg-[#EDF5F0] border-b border-[#C2DEC8] px-4 py-2.5 flex items-center justify-between text-xs text-[#2E583A]">
              <span className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#3A754B]" />
                Đang áp dụng GIÁ SỈ XƯỞNG
              </span>
              <span className="font-bold bg-[#3A754B] text-white px-2 py-0.5 rounded-full text-[10px]">
                Tiết kiệm {(wholesaleSavings || 0).toLocaleString('vi-VN')}₫
              </span>
            </div>
          )}

          {/* Free Shipping Progress */}
          <div className="p-4 bg-[#FAF4ED] border-b border-[#EADBCC] text-xs">
            {remainingForFreeShip > 0 ? (
              <p className="text-[#845339] font-medium flex items-center gap-1 mb-2">
                <Truck className="w-4 h-4 text-[#B86244]" />
                Mua thêm <strong>{remainingForFreeShip.toLocaleString('vi-VN')}₫</strong> để được Miễn Phí Vận Chuyển!
              </p>
            ) : (
              <p className="text-[#4E6857] font-bold flex items-center gap-1 mb-2">
                <Truck className="w-4 h-4 text-[#4E6857]" />
                Đơn hàng của bạn đã đủ điều kiện MIỄN PHÍ VẬN CHUYỂN TOÀN QUỐC!
              </p>
            )}
            <div className="w-full h-2 bg-[#E8DFD3] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#B86244] transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#F3ECE1] text-[#8C8276] flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8 text-[#B86244]/50" />
                </div>
                <h4 className="font-serif-boutique text-lg font-bold text-[#26211C]">
                  Giỏ hàng của bạn đang trống
                </h4>
                <p className="text-xs text-[#6B6258] max-w-xs mx-auto">
                  Hãy dạo xem những mẫu vòng tay phong thủy hoặc tự phối một chiếc vòng độc bản cho riêng mình nhé!
                </p>
                <button
                  onClick={closeCart}
                  className="mt-2 px-6 py-2.5 rounded-full bg-[#B86244] text-white text-xs font-semibold hover:bg-[#A05237] transition-colors"
                >
                  Khám Phá Sản Phẩm
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div 
                  key={item.cartKey}
                  className="p-3.5 bg-white rounded-2xl border border-[#E8DFD3] flex gap-3 shadow-sm"
                >
                  {/* Item Image */}
                  <img
                    src={item.images ? item.images[0] : '/images/products/bracelet-pastel-macrame-trio.jpg'}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover border border-[#E8DFD3] flex-shrink-0 bg-[#F3ECE1]"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-serif-boutique font-bold text-sm text-[#26211C] truncate">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.cartKey)}
                          className="text-[#8C8276] hover:text-red-600 p-0.5 transition-colors"
                          title="Xóa khỏi giỏ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Wholesale active tag or prompt */}
                      {item.isWholesale ? (
                        <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-[#2E583A] bg-[#EDF5F0] px-2 py-0.5 rounded-md">
                          <span>🏷️ GIÁ SỈ XƯỞNG</span>
                          <span className="font-normal text-[#5A7E64]">({item.effectivePrice.toLocaleString('vi-VN')}₫/c)</span>
                        </div>
                      ) : (
                        <p className="text-[10px] text-[#8C8276] mt-0.5">
                          Mua từ {item.wholesaleMinQty || 5}c để nhận giá sỉ: <strong className="text-[#4E6857]">{(item.wholesalePrice || Math.round(item.price * 0.7)).toLocaleString('vi-VN')}₫</strong>
                        </p>
                      )}

                      {/* Custom Details Tag */}
                      {item.isCustom && item.customDetails ? (
                        <div className="mt-1 text-[10px] text-[#4E6857] bg-[#EDF3EF] p-1.5 rounded-lg space-y-0.5">
                          <p><strong>Dây:</strong> {item.customDetails.cord}</p>
                          <p><strong>Đá:</strong> {item.customDetails.mainBead} ({item.customDetails.beadCount} hạt)</p>
                          <p><strong>Charm:</strong> {item.customDetails.charm} {item.customDetails.letter ? `[${item.customDetails.letter}]` : ''}</p>
                        </div>
                      ) : (
                        <p className="text-[11px] text-[#8C8276] mt-0.5">
                          Size cổ tay: <span className="font-semibold text-[#26211C]">{item.wristSize || 'Dây rút 14-18cm'}</span>
                        </p>
                      )}

                      {item.note && (
                        <p className="text-[10px] text-[#B86244] italic truncate mt-0.5">
                          Ghi chú: {item.note}
                        </p>
                      )}
                    </div>

                    {/* Price & Quantity Adjuster */}
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#F3ECE1]">
                      <div>
                        {item.isWholesale && (
                          <span className="text-[10px] line-through text-[#8C8276] block">
                            {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                          </span>
                        )}
                        <span className={`text-xs font-bold ${item.isWholesale ? 'text-[#2E583A]' : 'text-[#B86244]'}`}>
                          {(item.effectivePrice * item.quantity).toLocaleString('vi-VN')}₫
                        </span>
                      </div>

                      <div className="flex items-center border border-[#E8DFD3] rounded-lg bg-[#FAF7F2] overflow-hidden text-xs">
                        <button
                          onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
                          className="px-2 py-0.5 text-[#26211C] hover:bg-[#E8DFD3]"
                        >
                          -
                        </button>
                        <span className="px-2 font-semibold text-[#26211C]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                          className="px-2 py-0.5 text-[#26211C] hover:bg-[#E8DFD3]"
                        >
                          +
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Trigger */}
          {cartItems.length > 0 && (
            <div className="p-5 bg-white border-t border-[#E8DFD3] space-y-3.5">
              
              {/* Promo code box */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-[#8C8276] absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Nhập mã: MAYMAN (-30k)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-[#E8DFD3] bg-[#FAF7F2] uppercase focus:outline-none focus:ring-1 focus:ring-[#B86244]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#26211C] text-white text-xs font-semibold hover:bg-[#3D352E] transition-colors"
                >
                  Áp Dụng
                </button>
              </form>

              {promoApplied && (
                <p className="text-[11px] text-[#4E6857] font-semibold flex items-center gap-1">
                  ✓ Đã áp dụng mã ưu đãi: Giảm ngay 30.000₫
                </p>
              )}
              {promoError && (
                <p className="text-[11px] text-red-600 font-medium">
                  {promoError}
                </p>
              )}

              {/* Price Calculation rows */}
              <div className="space-y-1.5 text-xs text-[#6B6258] border-t border-[#F3ECE1] pt-2">
                {hasWholesaleDiscount ? (
                  <>
                    <div className="flex justify-between">
                      <span>Tổng tiền giá lẻ:</span>
                      <span className="line-through text-[#8C8276]">{retailSubtotal.toLocaleString('vi-VN')}₫</span>
                    </div>
                    <div className="flex justify-between text-[#2E583A] font-medium">
                      <span>Chiết khấu giá sỉ xưởng:</span>
                      <span>-{wholesaleSavings.toLocaleString('vi-VN')}₫</span>
                    </div>
                    <div className="flex justify-between font-semibold text-[#26211C]">
                      <span>Tạm tính sau giá sỉ:</span>
                      <span>{subtotal.toLocaleString('vi-VN')}₫</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between">
                    <span>Tạm tính tiền vòng:</span>
                    <span className="font-semibold text-[#26211C]">{subtotal.toLocaleString('vi-VN')}₫</span>
                  </div>
                )}

                {discount > 0 && (
                  <div className="flex justify-between text-[#4E6857]">
                    <span>Ưu đãi mã giảm:</span>
                    <span>-{discount.toLocaleString('vi-VN')}₫</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Phí vận chuyển bưu tá:</span>
                  <span>{shippingFee === 0 ? <strong className="text-[#4E6857]">Miễn Phí</strong> : `${shippingFee.toLocaleString('vi-VN')}₫`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#26211C] border-t border-[#E8DFD3] pt-2">
                  <span>Tổng thanh toán:</span>
                  <span className="text-base text-[#B86244]">{finalTotal.toLocaleString('vi-VN')}₫</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  closeCart();
                  onProceedToCheckout({
                    discount,
                    shippingFee,
                    finalTotal,
                    retailSubtotal,
                    wholesaleSavings
                  });
                }}
                className="w-full py-3.5 rounded-xl bg-[#B86244] hover:bg-[#A05237] text-white font-bold text-sm shadow-artisan-hover transition-all flex items-center justify-center gap-2"
              >
                <span>Thanh Toán & Xác Nhận Đơn</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[10px] text-center text-[#8C8276] flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C09A58]" /> Hỗ trợ VietQR MB Bank & Nhận hàng kiểm tra (COD)
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
