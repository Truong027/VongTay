import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Heart, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Feather, 
  Compass,
  ArrowRight,
  Filter,
  Camera,
  Palette,
  Flower2
} from 'lucide-react';
import { CartProvider, useCart } from './context/CartContext';
import { api } from './services/api';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HeroSection from './components/home/HeroSection';
import ProductCard from './components/product/ProductCard';
import ProductFilter from './components/product/ProductFilter';
import ProductModal from './components/product/ProductModal';
import WristSizeModal from './components/product/WristSizeModal';
import BraceletStudio from './components/customizer/BraceletStudio';
import CartDrawer from './components/cart/CartDrawer';
import WishlistDrawer from './components/cart/WishlistDrawer';
import CheckoutModal from './components/checkout/CheckoutModal';
import OrderTrackingModal from './components/tracking/OrderTrackingModal';
import AdminDashboard from './components/admin/AdminDashboard';
import AICameraModal from './components/ai/AICameraModal';
import AuthModal from './components/auth/AuthModal';
import UserProfileModal from './components/auth/UserProfileModal';
import PersonalizedSection from './components/personalization/PersonalizedSection';

function MainShop({ currentUser, setCurrentUser }) {
  const { wishlist, isWishlisted } = useCart();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileDefaultTab, setProfileDefaultTab] = useState('orders');

  const handleOpenProfile = (tab = 'orders') => {
    setProfileDefaultTab(tab);
    setIsProfileOpen(true);
  };

  // Navigation & view states
  const [activeTab, setActiveTab] = useState('all');
  const [selectedMenh, setSelectedMenh] = useState('all');
  const [sortOption, setSortOption] = useState('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdminView, setIsAdminView] = useState(false);

  // Modals states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [isAICameraOpen, setIsAICameraOpen] = useState(false);
  const [aiModalMode, setAiModalMode] = useState('wrist');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [aiCustomPreset, setAiCustomPreset] = useState(null);

  const handleOpenAiWrist = () => {
    setAiModalMode('wrist');
    setIsAICameraOpen(true);
  };

  const handleOpenAiMatch = () => {
    setAiModalMode('catalog_match');
    setIsAICameraOpen(true);
  };

  // Data
  const [products, setProducts] = useState([]);
  const [allProductsMaster, setAllProductsMaster] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Nạp toàn bộ kho sản phẩm nền (Master list) ngay khi ứng dụng khởi chạy
  useEffect(() => {
    api.getProducts({}).then(res => {
      if (res.success && Array.isArray(res.data)) {
        setAllProductsMaster(res.data);
      }
    }).catch(console.error);
  }, []);

  // Fetch products and categories from backend
  const loadShopData = async () => {
    setLoading(true);
    try {
      const isWishlistTab = activeTab === 'wishlist';

      // Luôn lấy toàn bộ danh mục sản phẩm nền nếu chưa có
      const [prodRes, catRes] = await Promise.all([
        api.getProducts(isWishlistTab ? {} : {
          category: activeTab !== 'all' ? activeTab : undefined,
          menh: selectedMenh !== 'all' ? selectedMenh : undefined,
          sort: sortOption,
          search: searchQuery
        }),
        api.getCategories()
      ]);

      if (prodRes.success && Array.isArray(prodRes.data)) {
        // Cập nhật kho sản phẩm tổng thể
        setAllProductsMaster(prev => {
          const map = new Map();
          [...prev, ...prodRes.data].forEach(item => map.set(item.id, item));
          return Array.from(map.values());
        });

        if (isWishlistTab) {
          // Lọc chính xác các sản phẩm có id nằm trong danh sách yêu thích
          const fullPool = prodRes.data.length > 0 ? prodRes.data : allProductsMaster;
          const wishlisted = fullPool.filter(p => isWishlisted(p.id));
          setProducts(wishlisted);
        } else {
          setProducts(prodRes.data);
        }
      }
      if (catRes.success) {
        setCategories(catRes.data);
      }
    } catch (err) {
      console.error('Lỗi nạp dữ liệu:', err);
    } finally {
      setLoading(false);
    }
  };

  // Khi danh sách wishlist hoặc kho sản phẩm thay đổi, cập nhật ngay nếu đang xem tab wishlist
  useEffect(() => {
    if (activeTab === 'wishlist') {
      const source = allProductsMaster.length > 0 ? allProductsMaster : products;
      setProducts(source.filter(p => isWishlisted(p.id)));
    }
  }, [wishlist, activeTab, allProductsMaster]);

  // Tự động cuộn xuống phần sản phẩm khi mở tab wishlist
  useEffect(() => {
    if (activeTab === 'wishlist') {
      const el = document.getElementById('products-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [activeTab]);

  useEffect(() => {
    loadShopData();
  }, [activeTab, selectedMenh, sortOption, searchQuery]);

  const handleProceedToCheckout = (data) => {
    setCheckoutData(data);
    setIsCheckoutOpen(true);
  };

  const handleScrollToProducts = () => {
    const el = document.getElementById('products-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('viban_user');
    setCurrentUser(null);
    setIsAdminView(false);
  };

  const handleApplyCustomPreset = (preset) => {
    setAiCustomPreset(preset);
    setIsAICameraOpen(false);
    setIsCustomizerOpen(true);
  };

  // Chỉ tài khoản có quyền admin mới được mở trang quản trị
  if (isAdminView) {
    if (currentUser?.role !== 'admin') {
      setIsAdminView(false);
      return null;
    }

    return (
      <>
        <AdminDashboard
          onBackToStore={() => {
            setIsAdminView(false);
            loadShopData();
          }}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
        />
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onAuthSuccess={(user) => {
            setCurrentUser(user);
            setIsAuthOpen(false);
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCustomizer={() => {
          setAiCustomPreset(null);
          setIsCustomizerOpen(true);
        }}
        onOpenAICamera={handleOpenAiWrist}
        onOpenTracking={() => setIsTrackingOpen(true)}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onOpenAdmin={(targetState) => {
          if (targetState === false) {
            setIsAdminView(false);
            loadShopData();
          } else {
            if (currentUser?.role === 'admin') {
              setIsAdminView(true);
            } else {
              setIsAuthOpen(true);
            }
          }
        }}
        isAdminView={isAdminView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={handleOpenProfile}
        onLogout={handleLogout}
      />

      {/* Hero Section (only on default view) */}
      {activeTab === 'all' && !searchQuery && (
        <HeroSection
          onExplore={handleScrollToProducts}
          onOpenCustomizer={() => setIsCustomizerOpen(true)}
          onQuickViewFeatured={() => {
            const featured = products.find(p => p.id === 'vt-pastel-whale') || products[0];
            if (featured) setSelectedProduct(featured);
          }}
        />
      )}

      {/* Automated Personalized Recommendation Section */}
      {activeTab === 'all' && !searchQuery && (
        <PersonalizedSection
          products={allProductsMaster.length > 0 ? allProductsMaster : products}
          onQuickView={(p) => setSelectedProduct(p)}
          currentUser={currentUser}
        />
      )}

      {/* Main Products Content */}
      <main id="products-section" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full">
        
        {/* Section Header */}
        <div className="mb-8 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-[#B86244] font-bold">
                {activeTab === 'wishlist' ? 'Bộ Sưu Tập Của Bạn' : activeTab === 'best-seller' ? 'Được Yêu Thích Nhất' : 'Nghệ Thuật Đan Tay'}
              </span>
              <h2 className="font-serif-boutique text-3xl sm:text-4xl font-bold text-[#26211C]">
                {activeTab === 'wishlist' ? (
                  `Vòng Dây Yêu Thích (${products.length})`
                ) : activeTab === 'best-seller' ? (
                  'Top Vòng Tay Dây Bán Chạy Nhất (Best Sellers)'
                ) : activeTab === 'macrame-pastel' ? (
                  'Vòng Dây Macrame Pastel (Cá Voi, Hoa Cúc & Bướm Tiên)'
                ) : activeTab === 'vong-doi' ? (
                  'Vòng Đôi Dây Sáp Nam Châm Khắc Tên'
                ) : activeTab === 'day-do-may-man' ? (
                  'Vòng Dây Chỉ Đỏ Tây Tạng Hộ Thân Bình An'
                ) : activeTab === 'day-lua-co-phong' ? (
                  'Vòng Dây Lụa Cổ Phong & Dây Da Bò Mộc'
                ) : (
                  'Các Mẫu Vòng Tay Dây Đan Thủ Công Mới Nhất'
                )}
              </h2>
            </div>

            {/* AI Camera & Customizer Quick Triggers */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleOpenAiWrist}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-amber-600 to-[#B86244] text-white text-xs font-bold hover:opacity-95 transition-all shadow-sm"
              >
                <Camera className="w-3.5 h-3.5 text-amber-200" />
                <span>AI Quét Cổ Tay</span>
              </button>

              <button
                onClick={handleOpenAiMatch}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-[#B86244] to-[#C09A58] text-white text-xs font-bold hover:opacity-95 transition-all shadow-sm"
              >
                <Palette className="w-3.5 h-3.5 text-amber-200" />
                <span>Tải Ảnh Gợi Ý Hạt & Charm Có Sẵn</span>
              </button>

              <button
                onClick={() => {
                  setAiCustomPreset(null);
                  setIsCustomizerOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FAF4ED] text-[#B86244] border border-[#EADBCC] text-xs font-semibold hover:bg-[#B86244] hover:text-white transition-all shadow-sm"
              >
                <Flower2 className="w-3.5 h-3.5 text-amber-500" />
                <span>Tự phối vòng thủ công</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        {activeTab !== 'wishlist' && (
          <ProductFilter
            categories={categories}
            selectedCategory={activeTab}
            onSelectCategory={setActiveTab}
            selectedMenh={selectedMenh}
            onSelectMenh={setSelectedMenh}
            sortOption={sortOption}
            onSortChange={setSortOption}
            totalResults={products.length}
          />
        )}

        {/* Product Grid */}
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-12 h-12 rounded-full border-2 border-[#B86244] border-t-transparent animate-spin mx-auto" />
            <p className="text-xs text-[#6B6258] font-medium">Đang tải bộ sưu tập vòng tay thủ công...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-[#E8DFD3] p-8 space-y-3">
            {activeTab === 'wishlist' ? (
              <>
                <div className="w-14 h-14 rounded-full bg-[#FAF4ED] text-[#B86244] flex items-center justify-center mx-auto mb-2 border border-[#EADBCC]">
                  <Heart className="w-7 h-7 stroke-[1.5]" />
                </div>
                <p className="font-serif-boutique text-2xl font-bold text-[#26211C]">
                  Bộ sưu tập yêu thích của bạn đang trống
                </p>
                <p className="text-xs text-[#6B6258] max-w-sm mx-auto leading-relaxed">
                  Bạn chưa lưu mẫu vòng tay nào. Hãy nhấn vào biểu tượng trái tim ❤️ ở góc bất kỳ mẫu vòng tay nào trên trang chủ để lưu vào đây nhé!
                </p>
                <button
                  onClick={() => { setActiveTab('all'); setSelectedMenh('all'); setSearchQuery(''); }}
                  className="mt-3 px-6 py-2.5 rounded-full bg-[#B86244] hover:bg-[#A05237] text-white text-xs font-bold transition-all shadow-sm"
                >
                  Khám Phá Các Mẫu Vòng Tay
                </button>
              </>
            ) : (
              <>
                <p className="font-serif-boutique text-xl font-bold text-[#26211C]">
                  Không tìm thấy sản phẩm nào
                </p>
                <p className="text-xs text-[#6B6258] max-w-sm mx-auto">
                  Không có mẫu vòng tay nào phù hợp với bộ lọc hiện tại. Bạn có thể chọn lại mệnh hoặc mở xưởng tự phối vòng theo ý thích.
                </p>
                <button
                  onClick={() => { setActiveTab('all'); setSelectedMenh('all'); setSearchQuery(''); }}
                  className="mt-2 px-5 py-2 rounded-xl bg-[#26211C] text-white text-xs font-semibold"
                >
                  Xem Tất Cả Vòng Tay
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setSelectedProduct}
              />
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer
        onOpenCustomizer={() => {
          setAiCustomPreset(null);
          setIsCustomizerOpen(true);
        }}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onOpenTracking={() => setIsTrackingOpen(true)}
      />

      {/* Modals & Drawers */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onOpenSizeGuide={() => {
          setSelectedProduct(null);
          setIsSizeGuideOpen(true);
        }}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <BraceletStudio
        isOpen={isCustomizerOpen}
        onClose={() => {
          setIsCustomizerOpen(false);
          setAiCustomPreset(null);
        }}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onOpenAiVision={handleOpenAiMatch}
        initialPreset={aiCustomPreset}
      />

      <WristSizeModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />

      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
      />

      <CartDrawer
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Slide-out Wishlist Drawer */}
      <WishlistDrawer
        products={allProductsMaster.length > 0 ? allProductsMaster : products}
        onOpenProduct={(prod) => setSelectedProduct(prod)}
        onSelectWishlistTab={() => {
          setActiveTab('wishlist');
          handleScrollToProducts();
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        checkoutData={checkoutData}
        currentUser={currentUser}
        onOrderSuccess={(order) => {
          // Success handled in modal
        }}
      />

      {/* NEW: AI Camera Stylist Modal */}
      <AICameraModal
        isOpen={isAICameraOpen}
        onClose={() => setIsAICameraOpen(false)}
        onApplyCustomPreset={handleApplyCustomPreset}
        initialMode={aiModalMode}
      />

      {/* NEW: Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthOpen(false);
          if (user.role === 'admin') {
            setIsAdminView(true);
          }
        }}
      />

      {/* NEW: User Profile & Order History Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        defaultTab={profileDefaultTab}
        products={allProductsMaster.length > 0 ? allProductsMaster : products}
        onOpenProduct={(prod) => {
          setIsProfileOpen(false);
          setSelectedProduct(prod);
        }}
        onLogout={handleLogout}
        onSelectOrderForTracking={(orderId) => {
          setIsProfileOpen(false);
          setIsTrackingOpen(true);
        }}
      />

    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('viban_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  return (
    <CartProvider currentUser={currentUser}>
      <MainShop currentUser={currentUser} setCurrentUser={setCurrentUser} />
    </CartProvider>
  );
}
