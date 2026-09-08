import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Heart, 
  Sparkles, 
  Search, 
  Menu, 
  X, 
  Camera,
  Ruler, 
  Truck,
  LayoutDashboard,
  User,
  LogOut,
  LogIn,
  ChevronDown
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenCustomizer, 
  onOpenAICamera,
  onOpenTracking, 
  onOpenSizeGuide,
  onOpenAdmin,
  isAdminView,
  searchQuery,
  setSearchQuery,
  currentUser,
  onOpenAuth,
  onOpenProfile,
  onLogout
}) {
  const { totalCount, openCart, wishlist, openWishlist } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DFD3] shadow-xs transition-all w-full max-w-full">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-1.5 sm:gap-3">
          
          {/* 1. LEFT: Brand Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 sm:p-2 rounded-xl text-[#26211C] hover:bg-[#EFE6DA] transition-colors lg:hidden"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Brand Monogram & Title */}
            <div 
              className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none group" 
              onClick={() => { setActiveTab('all'); if (isAdminView) onOpenAdmin(false); }}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#B86244] text-white flex items-center justify-center font-serif font-bold text-sm sm:text-lg shadow-sm border border-[#A05237]/40 group-hover:scale-105 transition-transform shrink-0">
                KV
              </div>
              <div>
                <span className="font-serif-boutique text-lg sm:text-2xl font-bold tracking-wide sm:tracking-wider text-[#26211C] block leading-none group-hover:text-[#B86244] transition-colors whitespace-nowrap">
                  KHÁNHVYMADE
                </span>
                <span className="text-[8px] sm:text-[9px] tracking-wider sm:tracking-[0.22em] text-[#B86244] uppercase font-semibold hidden sm:block mt-1 whitespace-nowrap">
                  Chuyên Vòng Tay Dây Thủ Công
                </span>
              </div>
            </div>
          </div>

          {/* 2. CENTER: Perfectly Balanced Boutique Navigation */}
          <nav className="hidden lg:flex items-center justify-center gap-1 xl:gap-3 flex-1 mx-4">
            <button
              onClick={() => { setActiveTab('all'); if (isAdminView) onOpenAdmin(false); }}
              className={`px-3 py-1.5 text-xs font-semibold tracking-wide transition-all relative ${
                !isAdminView && activeTab === 'all'
                  ? 'text-[#B86244] font-bold after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:bg-[#B86244] after:rounded-full' 
                  : 'text-[#5A5147] hover:text-[#26211C]'
              }`}
            >
              Tất Cả Vòng Dây
            </button>

            <button
              onClick={() => { setActiveTab('macrame-pastel'); if (isAdminView) onOpenAdmin(false); }}
              className={`px-3 py-1.5 text-xs font-semibold tracking-wide transition-all relative flex items-center gap-1.5 ${
                !isAdminView && activeTab === 'macrame-pastel'
                  ? 'text-[#B86244] font-bold after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:bg-[#B86244] after:rounded-full' 
                  : 'text-[#5A5147] hover:text-[#26211C]'
              }`}
            >
              <span>Macrame Pastel</span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            </button>

            <button
              onClick={() => { setActiveTab('vong-doi'); if (isAdminView) onOpenAdmin(false); }}
              className={`px-3 py-1.5 text-xs font-semibold tracking-wide transition-all relative ${
                !isAdminView && activeTab === 'vong-doi'
                  ? 'text-[#B86244] font-bold after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:bg-[#B86244] after:rounded-full' 
                  : 'text-[#5A5147] hover:text-[#26211C]'
              }`}
            >
              Vòng Đôi Dây Sáp
            </button>

            <button
              onClick={() => { setActiveTab('day-do-may-man'); if (isAdminView) onOpenAdmin(false); }}
              className={`px-3 py-1.5 text-xs font-semibold tracking-wide transition-all relative ${
                !isAdminView && activeTab === 'day-do-may-man'
                  ? 'text-[#B86244] font-bold after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:bg-[#B86244] after:rounded-full' 
                  : 'text-[#5A5147] hover:text-[#26211C]'
              }`}
            >
              Dây Đỏ Hộ Thân
            </button>

            <div className="h-4 w-[1px] bg-[#E8DFD3] mx-1"></div>

            {/* Customizer button */}
            <button
              onClick={onOpenCustomizer}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-[#FAF4ED] text-[#B86244] border border-[#EADBCC] hover:bg-[#B86244] hover:text-white transition-all whitespace-nowrap inline-flex items-center gap-1.5 shadow-2xs hover:shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Tự Phối Vòng</span>
            </button>

            {/* AI Camera Stylist */}
            <button
              onClick={onOpenAICamera}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-[#B86244] hover:bg-[#A05237] text-white transition-all whitespace-nowrap inline-flex items-center gap-1.5 shadow-xs hover:shadow-sm"
              title="Quét cổ tay đo size & Tải ảnh gợi ý phối từ hạt và charm có sẵn"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
              <span>AI Quét & Gợi Ý Vòng</span>
            </button>
          </nav>

          {/* 3. RIGHT: Actions (Search, Wishlist, ĐĂNG NHẬP, QUẢN TRỊ, GIỎ HÀNG) */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0 ml-auto">
            
            {/* Search Icon Trigger */}
            <button
              onClick={() => setShowSearchInput(!showSearchInput)}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all ${
                showSearchInput 
                  ? 'bg-[#26211C] text-white' 
                  : 'text-[#5A5147] hover:text-[#26211C] hover:bg-[#EFE6DA]'
              }`}
              title="Tìm kiếm vòng tay dây"
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => {
                openWishlist();
                setActiveTab('wishlist');
              }}
              className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all ${
                activeTab === 'wishlist' 
                  ? 'bg-[#FAF4ED] text-[#B86244]' 
                  : 'text-[#5A5147] hover:text-[#B86244] hover:bg-[#EFE6DA]'
              }`}
              title="Bộ sưu tập yêu thích của bạn"
            >
              <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${wishlist.length > 0 ? 'fill-[#B86244] text-[#B86244]' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#B86244] text-white text-[9px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center border-2 border-[#FAF7F2] shadow-2xs">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* USER AUTH / PROFILE */}
            {currentUser ? (
              <div className="relative shrink-0">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-1 sm:gap-1.5 bg-[#FAF4ED] p-1 sm:pl-1.5 sm:pr-2.5 sm:py-1 rounded-full border border-[#E8DFD3] text-xs font-semibold text-[#26211C] hover:bg-[#F0E6D8] transition-all shadow-2xs whitespace-nowrap"
                >
                  <div className="w-6 h-6 rounded-full bg-[#B86244] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[80px] sm:max-w-[110px] truncate hidden sm:inline">
                    {currentUser.fullName}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#8C8276]" />
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E8DFD3] py-2 z-50 animate-fadeIn text-xs">
                    <div className="px-4 py-2 border-b border-[#F0EAE1]">
                      <p className="font-bold text-[#26211C] truncate">{currentUser.fullName}</p>
                      <p className="text-[11px] text-[#8C8276] truncate">{currentUser.email}</p>
                      {currentUser.phone && (
                        <p className="text-[10px] text-[#B86244] mt-0.5">SĐT: {currentUser.phone}</p>
                      )}
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-[#F3ECE1] text-[#6B6258] font-semibold">
                        Vai trò: {currentUser.role === 'admin' ? 'Quản Trị Viên' : 'Khách Hàng'}
                      </span>
                    </div>

                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => { onOpenAdmin(true); setShowUserDropdown(false); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-[#FAF4ED] text-[#4E6857] font-semibold flex items-center gap-2"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Mở Trang Quản Trị</span>
                      </button>
                    )}

                    <button
                      onClick={() => { onOpenProfile('orders'); setShowUserDropdown(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-[#FAF4ED] text-[#26211C] font-medium flex items-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4 text-[#B86244]" />
                      <span>Lịch sử đơn hàng của tôi</span>
                    </button>

                    <button
                      onClick={() => { openWishlist(); setShowUserDropdown(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-[#FAF4ED] text-[#26211C] font-medium flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-[#B86244] fill-[#B86244]" />
                        <span>Bộ sưu tập yêu thích của tôi</span>
                      </span>
                      <span className="text-[10px] bg-[#FAF4ED] text-[#B86244] font-bold px-2 py-0.5 rounded-full border border-[#EADBCC]">
                        {wishlist.length}
                      </span>
                    </button>

                    <button
                      onClick={() => { onOpenProfile('profile'); setShowUserDropdown(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-[#FAF4ED] text-[#26211C] font-medium flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-[#B86244]" />
                      <span>Thông tin tài khoản</span>
                    </button>

                    <button
                      onClick={() => { onOpenTracking(); setShowUserDropdown(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-[#FAF4ED] text-[#26211C] flex items-center gap-2"
                    >
                      <Truck className="w-4 h-4 text-[#B86244]" />
                      <span>Tra cứu vận chuyển đơn</span>
                    </button>

                    {currentUser?.role === 'admin' && (
                      <button
                        onClick={() => { onOpenAdmin(true); setShowUserDropdown(false); }}
                        className="w-full text-left px-4 py-2 hover:bg-[#EDF3EF] text-[#4E6857] font-semibold flex items-center gap-2"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#4E6857]" />
                        <span>Khu Vực Quản Trị Viên (Admin)</span>
                      </button>
                    )}

                    <div className="border-t border-[#F0EAE1] mt-1 pt-1">
                      <button
                        onClick={() => { onLogout(); setShowUserDropdown(false); }}
                        className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 font-semibold flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng Xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-bold bg-[#FAF4ED] text-[#B86244] border border-[#EADBCC] hover:bg-[#B86244] hover:text-white transition-all shadow-2xs whitespace-nowrap shrink-0 hover:shadow-sm"
                title="Đăng nhập hoặc đăng ký tài khoản"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Đăng Nhập</span>
              </button>
            )}

            {/* Admin Toggle Button - ONLY VISIBLE WHEN LOGGED IN AS ADMIN */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => onOpenAdmin(!isAdminView)}
                className={`px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                  isAdminView 
                    ? 'bg-[#4E6857] text-white shadow-xs' 
                    : 'bg-[#EDF3EF] text-[#4E6857] hover:bg-[#D8E6DE]'
                }`}
                title="Khu vực Quản Trị Hệ Thống"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isAdminView ? 'Về Shop' : 'Quản Trị'}</span>
              </button>
            )}

            {/* Shopping Cart Button */}
            <button
              onClick={openCart}
              className="relative w-8 h-8 sm:w-9 sm:h-9 bg-[#26211C] text-[#FAF7F2] rounded-full hover:bg-[#3D352E] transition-all shadow-xs flex items-center justify-center shrink-0"
              aria-label="Giỏ hàng"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#B86244] text-white text-[9px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center border-2 border-[#FAF7F2] shadow-xs">
                  {totalCount}
                </span>
              )}
            </button>

          </div>
        </div>

        {/* Search Input Popover Row (Opens cleanly below navbar, never crowding items) */}
        {showSearchInput && (
          <div className="pb-3 pt-1 border-t border-[#E8DFD3]/70 animate-fadeIn flex items-center justify-center">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 text-[#8C8276] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm vòng tay dây macrame, cá voi, hoa cúc, bướm fairy..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-white rounded-full border border-[#E8DFD3] text-xs sm:text-sm text-[#26211C] placeholder-[#8C8276] focus:outline-none focus:ring-1 focus:ring-[#B86244] shadow-xs"
                autoFocus
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8276] hover:text-[#26211C]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF7F2] border-b border-[#E8DFD3] px-4 pt-2 pb-6 space-y-3 shadow-lg animate-fadeIn">
          
          {/* Mobile User Profile / Login Card */}
          <div className="bg-[#FAF4ED] p-3 rounded-2xl border border-[#E8DFD3]">
            {currentUser ? (
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#B86244] text-white flex items-center justify-center font-bold text-xs">
                      {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#26211C]">{currentUser.fullName}</p>
                      <p className="text-[10px] text-[#8C8276]">{currentUser.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                    className="px-2 py-1 text-xs text-rose-600 bg-rose-50 rounded-lg font-semibold"
                  >
                    Đăng Xuất
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-[#E8DFD3]">
                  <button
                    onClick={() => { onOpenProfile('orders'); setIsMobileMenuOpen(false); }}
                    className="py-1.5 px-2.5 bg-white rounded-xl border border-[#E8DFD3] text-[11px] font-semibold text-[#26211C] flex items-center justify-center gap-1.5 hover:bg-[#FAF4ED]"
                  >
                    <ShoppingBag className="w-3 h-3 text-[#B86244]" />
                    <span>Đơn Hàng</span>
                  </button>
                  <button
                    onClick={() => { onOpenProfile('wishlist'); setIsMobileMenuOpen(false); }}
                    className="py-1.5 px-2.5 bg-white rounded-xl border border-[#E8DFD3] text-[11px] font-semibold text-[#26211C] flex items-center justify-center gap-1.5 hover:bg-[#FAF4ED]"
                  >
                    <Heart className="w-3 h-3 text-[#B86244] fill-[#B86244]" />
                    <span>Yêu Thích ({wishlist.length})</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-[#6B6258]">
                  👋 Đăng nhập tài khoản để nhận ưu đãi và đồng bộ đơn hàng:
                </p>
                <button
                  onClick={() => { onOpenAuth(); setIsMobileMenuOpen(false); }}
                  className="w-full py-2 rounded-xl bg-[#B86244] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5 text-amber-200" />
                  <span>Đăng Nhập / Đăng Ký Tài Khoản</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => { setActiveTab('all'); if (isAdminView) onOpenAdmin(false); setIsMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold ${
              activeTab === 'all' && !isAdminView ? 'bg-[#26211C] text-white' : 'text-[#26211C] hover:bg-[#EFE6DA]'
            }`}
          >
            Tất Cả Vòng Tay Dây
          </button>

          <button
            onClick={() => { setActiveTab('macrame-pastel'); if (isAdminView) onOpenAdmin(false); setIsMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold ${
              activeTab === 'macrame-pastel' && !isAdminView ? 'bg-[#26211C] text-white' : 'text-[#26211C] hover:bg-[#EFE6DA]'
            }`}
          >
            Vòng Dây Macrame Pastel (Cá Voi, Hoa Cúc & Bướm Tiên)
          </button>

          <button
            onClick={() => { setActiveTab('vong-doi'); if (isAdminView) onOpenAdmin(false); }}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold ${
              activeTab === 'vong-doi' && !isAdminView ? 'bg-[#26211C] text-white' : 'text-[#26211C] hover:bg-[#EFE6DA]'
            }`}
          >
            Vòng Đôi Dây Sáp Nam Châm
          </button>

          <button
            onClick={() => { setActiveTab('day-do-may-man'); if (isAdminView) onOpenAdmin(false); }}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold ${
              activeTab === 'day-do-may-man' && !isAdminView ? 'bg-[#26211C] text-white' : 'text-[#26211C] hover:bg-[#EFE6DA]'
            }`}
          >
            Vòng Dây Chỉ Đỏ Hộ Thân
          </button>

          <button
            onClick={() => { onOpenAICamera(); setIsMobileMenuOpen(false); }}
            className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-[#B86244] text-white flex items-center justify-between shadow-xs"
          >
            <span className="flex items-center gap-2">
              <Camera className="w-3.5 h-3.5 text-amber-200" />
              AI Quét Cổ Tay Nhận Diện Vòng Hợp
            </span>
            <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full uppercase">VIP</span>
          </button>

          <button
            onClick={() => { openWishlist(); setIsMobileMenuOpen(false); }}
            className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#FAF4ED] text-[#B86244] border border-[#EADBCC] flex items-center justify-between shadow-2xs"
          >
            <span className="flex items-center gap-2">
              <Heart className="w-3.5 h-3.5 text-[#B86244] fill-[#B86244]" />
              Bộ Sưu Tập Yêu Thích Của Bạn
            </span>
            <span className="text-[10px] bg-[#B86244] text-white font-bold px-2 py-0.5 rounded-full">
              {wishlist.length}
            </span>
          </button>

          <button
            onClick={() => { onOpenCustomizer(); setIsMobileMenuOpen(false); }}
            className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#FAF4ED] text-[#B86244] border border-[#EADBCC] flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Xưởng Tự Phối Vòng Studio
            </span>
          </button>

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => { onOpenAdmin(!isAdminView); setIsMobileMenuOpen(false); }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#EDF3EF] text-[#4E6857] flex items-center gap-2"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Trang Quản Trị (Đơn hàng, Mã giảm giá, Sản phẩm, DB)</span>
            </button>
          )}

          <div className="pt-2 grid grid-cols-2 gap-2">
            <button
              onClick={() => { onOpenSizeGuide(); setIsMobileMenuOpen(false); }}
              className="px-3 py-2 text-xs font-medium rounded-xl bg-[#EFE6DA] text-[#26211C] flex items-center justify-center gap-1.5"
            >
              <Ruler className="w-3 h-3 text-[#B86244]" />
              Đo Size Cổ Tay
            </button>
            <button
              onClick={() => { onOpenTracking(); setIsMobileMenuOpen(false); }}
              className="px-3 py-2 text-xs font-medium rounded-xl bg-[#EFE6DA] text-[#26211C] flex items-center justify-center gap-1.5"
            >
              <Truck className="w-3 h-3 text-[#B86244]" />
              Tra Cứu Đơn
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
