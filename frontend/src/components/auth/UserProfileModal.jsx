import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Mail, ShoppingBag, Shield, Clock, LogOut, Package, Heart, Trash2, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';

export default function UserProfileModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  products = [], 
  onOpenProduct, 
  onLogout, 
  onSelectOrderForTracking,
  defaultTab = 'orders'
}) {
  if (!isOpen || !currentUser) return null;

  const { wishlist, toggleWishlist, addToCart } = useCart();
  const [activeTab, setActiveTab] = useState(defaultTab || 'orders'); // 'orders' | 'wishlist' | 'profile'
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Cập nhật tab khi mở modal với tab chỉ định
  useEffect(() => {
    if (isOpen && defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  // Danh sách sản phẩm yêu thích của riêng tài khoản này
  const wishlistedProducts = (products || []).filter(p => wishlist.includes(p.id));

  useEffect(() => {
    const fetchUserOrders = async () => {
      setLoadingOrders(true);
      try {
        const res = await api.getOrders();
        if (res.success && res.data) {
          // Filter orders matching customer name, phone or email
          const filtered = res.data.filter(o => 
            (currentUser.fullName && o.customerName?.toLowerCase().includes(currentUser.fullName.toLowerCase())) ||
            (currentUser.phone && o.phone === currentUser.phone)
          );
          setUserOrders(filtered.length > 0 ? filtered : res.data.slice(0, 3));
        }
      } catch (err) {
        console.warn('Lỗi nạp đơn hàng của người dùng:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchUserOrders();
  }, [currentUser]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-[#FAF7F2] rounded-3xl shadow-2xl border border-[#E8DFD3] overflow-hidden my-6 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#26211C] text-white p-5 flex items-center justify-between border-b border-[#3D352E]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#B86244] flex items-center justify-center text-white font-bold text-base">
              {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="font-serif-boutique text-xl font-bold tracking-wide">
                {currentUser.fullName}
              </h3>
              <p className="text-[11px] text-[#CFC1B0]">
                {currentUser.email} · {currentUser.role === 'admin' ? 'Quản Trị Viên KhánhVyMade' : 'Khách Hàng Thành Viên'}
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

        {/* Tab switch */}
        <div className="flex border-b border-[#E8DFD3] bg-white text-xs font-bold">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-3 transition-all border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'orders' 
                ? 'border-[#B86244] text-[#B86244] bg-[#FAF7F2]' 
                : 'border-transparent text-[#6B6258] hover:text-[#26211C]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Đơn Hàng ({userOrders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`flex-1 py-3 transition-all border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'wishlist' 
                ? 'border-[#B86244] text-[#B86244] bg-[#FAF7F2]' 
                : 'border-transparent text-[#6B6258] hover:text-[#26211C]'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${wishlistedProducts.length > 0 ? 'text-[#B86244] fill-[#B86244]' : ''}`} />
            <span>Yêu Thích ({wishlistedProducts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 transition-all border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'profile' 
                ? 'border-[#B86244] text-[#B86244] bg-[#FAF7F2]' 
                : 'border-transparent text-[#6B6258] hover:text-[#26211C]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Tài Khoản</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          
          {activeTab === 'orders' && (
            <div className="space-y-3">
              {loadingOrders ? (
                <div className="py-10 text-center text-[#8C8276]">
                  Đang tải danh sách đơn hàng...
                </div>
              ) : userOrders.length === 0 ? (
                <div className="py-10 text-center space-y-2">
                  <Package className="w-8 h-8 text-[#B86244] mx-auto opacity-50" />
                  <p className="text-[#6B6258] font-medium">Bạn chưa có đơn hàng nào.</p>
                  <p className="text-[11px] text-[#8C8276]">Hãy khám phá bộ sưu tập và chọn chiếc vòng ưng ý nhé!</p>
                </div>
              ) : (
                userOrders.map((order) => (
                  <div key={order.id} className="p-4 bg-white rounded-2xl border border-[#E8DFD3] shadow-sm space-y-2">
                    <div className="flex justify-between items-center border-b border-[#F0EAE1] pb-2">
                      <div>
                        <span className="font-mono font-bold text-[#B86244]">#{order.id}</span>
                        <span className="text-[10px] text-[#8C8276] ml-2">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : ''}
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[#FAF4ED] text-[#B86244] border border-[#EADBCC]">
                        {order.orderStatus}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {order.items?.map((it, idx) => (
                        <p key={idx} className="text-[#26211C]">
                          • <span className="font-semibold">{it.quantity}x</span> {it.name}
                        </p>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-[#F0EAE1]">
                      <span className="font-bold text-sm text-[#26211C]">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}
                      </span>
                      <button
                        onClick={() => {
                          if (onSelectOrderForTracking) onSelectOrderForTracking(order.id);
                          onClose();
                        }}
                        className="text-[#B86244] hover:underline font-semibold text-[11px]"
                      >
                        Theo dõi tiến độ đan hạt →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8DFD3]">
                <div>
                  <h4 className="font-bold text-[#26211C] text-sm flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-[#B86244] fill-[#B86244]" />
                    <span>Bộ Sưu Tập Yêu Thích Của Bạn</span>
                  </h4>
                  <p className="text-[10px] text-[#8C8276]">
                    Danh sách riêng cho tài khoản: <span className="font-semibold text-[#B86244]">{currentUser.email}</span>
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-[#FAF4ED] text-[#B86244] rounded-full border border-[#EADBCC]">
                  {wishlistedProducts.length} mẫu vòng
                </span>
              </div>

              {wishlistedProducts.length === 0 ? (
                <div className="py-10 text-center space-y-3 bg-white rounded-2xl border border-[#E8DFD3] p-6">
                  <div className="w-12 h-12 rounded-full bg-[#FAF4ED] flex items-center justify-center mx-auto text-[#B86244]">
                    <Heart className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-[#26211C]">Chưa có mẫu vòng tay yêu thích nào</p>
                    <p className="text-xs text-[#8C8276] max-w-xs mx-auto">
                      Hãy nhấn vào biểu tượng trái tim ❤️ ở bất kỳ mẫu vòng tay nào trên gian hàng để lưu riêng vào tài khoản của bạn.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="mt-2 px-5 py-2.5 rounded-xl bg-[#B86244] hover:bg-[#A05237] text-white text-xs font-bold transition-all shadow-sm"
                  >
                    Khám Phá Bộ Sưu Tập Ngay
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {wishlistedProducts.map(prod => (
                    <div 
                      key={prod.id} 
                      className="p-3 bg-white rounded-2xl border border-[#E8DFD3] shadow-sm flex items-center justify-between gap-3 hover:shadow-md transition-all group"
                    >
                      <div 
                        onClick={() => {
                          if (onOpenProduct) onOpenProduct(prod);
                        }}
                        className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                      >
                        <img
                          src={prod.images?.[0] || '/images/products/bracelet-pastel-macrame-trio.jpg'}
                          alt={prod.name}
                          className="w-14 h-14 rounded-xl object-cover border border-[#E8DFD3] shrink-0"
                        />
                        <div className="min-w-0">
                          <h5 className="font-bold text-xs text-[#26211C] truncate group-hover:text-[#B86244] transition-colors">
                            {prod.name}
                          </h5>
                          <p className="text-[10px] text-[#8C8276] truncate mt-0.5">
                            {prod.cordType || 'Dây macrame thủ công'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-[#B86244]">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(prod.price)}
                            </span>
                            {prod.wholesalePrice && (
                              <span className="text-[10px] text-[#4E6857] font-semibold bg-[#EDF3EF] px-1.5 py-0.5 rounded">
                                Sỉ: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(prod.wholesalePrice)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            addToCart(prod, 1);
                          }}
                          className="px-3 py-1.5 bg-[#26211C] hover:bg-[#3D352E] text-white text-[11px] font-semibold rounded-xl flex items-center gap-1 transition-colors shadow-sm"
                          title="Thêm vào giỏ hàng"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span className="hidden sm:inline">Thêm giỏ</span>
                        </button>
                        <button
                          onClick={() => toggleWishlist(prod.id)}
                          className="p-2 rounded-xl hover:bg-rose-50 text-rose-500 transition-colors"
                          title="Xóa khỏi danh sách yêu thích của bạn"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-3 bg-white p-5 rounded-2xl border border-[#E8DFD3]">
              <div className="flex items-center gap-2 border-b border-[#F0EAE1] pb-3">
                <User className="w-4 h-4 text-[#B86244]" />
                <div>
                  <span className="text-[10px] text-[#8C8276] block">Họ và tên</span>
                  <strong className="text-sm text-[#26211C]">{currentUser.fullName}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2 border-b border-[#F0EAE1] pb-3">
                <Mail className="w-4 h-4 text-[#B86244]" />
                <div>
                  <span className="text-[10px] text-[#8C8276] block">Email đăng nhập</span>
                  <strong className="text-xs text-[#26211C] font-mono">{currentUser.email}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2 border-b border-[#F0EAE1] pb-3">
                <Phone className="w-4 h-4 text-[#B86244]" />
                <div>
                  <span className="text-[10px] text-[#8C8276] block">Số điện thoại</span>
                  <strong className="text-xs text-[#26211C]">{currentUser.phone || 'Chưa cập nhật'}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2 border-b border-[#F0EAE1] pb-3">
                <MapPin className="w-4 h-4 text-[#B86244]" />
                <div>
                  <span className="text-[10px] text-[#8C8276] block">Địa chỉ giao hàng mặc định</span>
                  <strong className="text-xs text-[#26211C]">{currentUser.address || 'Chưa cập nhật'}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Shield className="w-4 h-4 text-[#4E6857]" />
                <div>
                  <span className="text-[10px] text-[#8C8276] block">Vai trò trong hệ thống</span>
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EDF3EF] text-[#4E6857] uppercase">
                    {currentUser.role}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="p-4 bg-white border-t border-[#E8DFD3] flex justify-between items-center">
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="text-rose-600 hover:text-rose-700 font-semibold text-xs flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng Xuất</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#26211C] text-white font-bold text-xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
