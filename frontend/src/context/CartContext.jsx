import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { isBraceletProduct } from '../utils/productUtils';

const CartContext = createContext();

const getWishlistKey = (user) => {
  if (user?.id) return `khanhvy_wishlist_user_${user.id}`;
  if (user?.email) return `khanhvy_wishlist_user_${user.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
  return 'khanhvy_wishlist_guest';
};

const extractNormalizedIds = (raw) => {
  if (!raw) return [];
  try {
    const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!Array.isArray(arr)) return [];
    return Array.from(new Set(
      arr.map(item => {
        if (!item) return null;
        if (typeof item === 'object') return item.id || item._id ? String(item.id || item._id) : null;
        return String(item);
      }).filter(Boolean)
    ));
  } catch {
    return [];
  }
};

const loadStoredWishlist = (user) => {
  try {
    const userKey = user?.id ? `khanhvy_wishlist_user_${user.id}` : (user?.email ? `khanhvy_wishlist_user_${user.email.replace(/[^a-zA-Z0-9]/g, '_')}` : null);
    
    // 1. Kiểm tra tài khoản người dùng đăng nhập
    if (userKey) {
      const userSaved = localStorage.getItem(userKey);
      if (userSaved) {
        const ids = extractNormalizedIds(userSaved);
        if (ids.length > 0) return ids;
      }
    }

    // 2. Kiểm tra bộ nhớ khách (guest)
    const guestSaved = localStorage.getItem('khanhvy_wishlist_guest');
    if (guestSaved) {
      const ids = extractNormalizedIds(guestSaved);
      if (ids.length > 0) return ids;
    }

    // 3. Kiểm tra khóa tương thích cũ viban_wishlist
    const legacySaved = localStorage.getItem('viban_wishlist');
    if (legacySaved) {
      const ids = extractNormalizedIds(legacySaved);
      if (ids.length > 0) return ids;
    }
  } catch (e) {
    console.error('Lỗi đọc wishlist từ localStorage:', e);
  }
  return [];
};

export const CartProvider = ({ children, currentUser }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('viban_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => loadStoredWishlist(currentUser));
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, icon = '❤️') => {
    setToast({ message, icon, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  // Đồng bộ và kế thừa danh sách yêu thích khi đăng nhập / đăng xuất
  useEffect(() => {
    const currentStored = loadStoredWishlist(currentUser);
    setWishlist(prev => {
      // Kết hợp các mục hiện tại với bộ nhớ để không bao giờ bị mất sản phẩm vừa bấm thích
      const combined = Array.from(new Set([...prev, ...currentStored]));
      const activeKey = getWishlistKey(currentUser);
      try {
        localStorage.setItem(activeKey, JSON.stringify(combined));
        localStorage.setItem('khanhvy_wishlist_guest', JSON.stringify(combined));
        localStorage.setItem('viban_wishlist', JSON.stringify(combined));
      } catch (e) {
        console.error(e);
      }
      return combined;
    });
  }, [currentUser?.id, currentUser?.email]);

  useEffect(() => {
    try {
      localStorage.setItem('viban_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  // Luôn lưu danh sách yêu thích vào bộ nhớ trình duyệt
  useEffect(() => {
    if (!Array.isArray(wishlist)) return;
    const activeKey = getWishlistKey(currentUser);
    try {
      localStorage.setItem(activeKey, JSON.stringify(wishlist));
      localStorage.setItem('khanhvy_wishlist_guest', JSON.stringify(wishlist));
      localStorage.setItem('viban_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }

    // Cloud Database Synchronization for Authenticated Users
    if (currentUser?.id && wishlist.length > 0) {
      api.syncWishlistDb(currentUser.id, wishlist).catch(() => {});
    }
  }, [wishlist, currentUser?.id, currentUser?.email]);

  const addToCart = (product, quantity = 1, options = {}) => {
    const isBracelet = options.isCustom ? true : isBraceletProduct(product);
    const finalWristSize = options.wristSize !== undefined 
      ? options.wristSize 
      : (isBracelet ? '15 - 16 cm' : null);

    setCartItems(prev => {
      // If it's a custom bracelet, treat each uniquely
      if (options.isCustom) {
        return [...prev, {
          ...product,
          quantity,
          isCustom: true,
          customDetails: options.customDetails,
          wristSize: finalWristSize || '15 - 16 cm',
          note: options.note || '',
          cartKey: `custom-${Date.now()}`
        }];
      }

      // If standard product, check if same id and wristSize exists
      const existingIndex = prev.findIndex(item => 
        !item.isCustom && 
        item.id === product.id && 
        item.wristSize === finalWristSize
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      }

      return [...prev, {
        ...product,
        quantity,
        isCustom: false,
        wristSize: finalWristSize,
        note: options.note || '',
        cartKey: `${product.id}-${finalWristSize || 'std'}-${Date.now()}`
      }];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (cartKey) => {
    setCartItems(prev => prev.filter(item => item.cartKey !== cartKey));
  };

  const updateQuantity = (cartKey, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartKey);
      return;
    }
    setCartItems(prev => prev.map(item => 
      item.cartKey === cartKey ? { ...item, quantity: newQty } : item
    ));
  };

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  const clearCart = () => {
    setCartItems([]);
  };

  const isWishlisted = (productOrId) => {
    if (!productOrId) return false;
    const strId = typeof productOrId === 'object' 
      ? String(productOrId.id || productOrId._id || '') 
      : String(productOrId);
    if (!strId) return false;
    return (wishlist || []).some(id => {
      if (!id) return false;
      const existingId = typeof id === 'object' ? String(id.id || id._id || '') : String(id);
      return existingId === strId;
    });
  };

  const toggleWishlist = (productOrId) => {
    if (!productOrId) return;
    const strId = typeof productOrId === 'object' 
      ? String(productOrId.id || productOrId._id || '') 
      : String(productOrId);
    if (!strId) return;

    setWishlist(prev => {
      const exists = (prev || []).some(id => {
        const currentId = typeof id === 'object' ? String(id.id || id._id || '') : String(id);
        return currentId === strId;
      });

      const next = exists 
        ? (prev || []).filter(id => {
            const currentId = typeof id === 'object' ? String(id.id || id._id || '') : String(id);
            return currentId !== strId;
          })
        : [...(prev || []).filter(id => {
            const currentId = typeof id === 'object' ? String(id.id || id._id || '') : String(id);
            return currentId !== strId;
          }), strId];
      
      if (exists) {
        showToast('Đã bỏ khỏi danh sách yêu thích', '🤍');
      } else {
        showToast('Đã lưu mẫu vòng vào mục Yêu Thích!', '❤️');
      }

      const activeKey = getWishlistKey(currentUser);
      try {
        localStorage.setItem(activeKey, JSON.stringify(next));
        localStorage.setItem('khanhvy_wishlist_guest', JSON.stringify(next));
        localStorage.setItem('viban_wishlist', JSON.stringify(next));
      } catch (e) {
        console.error('Lỗi lưu wishlist:', e);
      }

      if (currentUser?.id) {
        api.toggleWishlistDb(currentUser.id, strId).catch(() => {});
      }

      return next;
    });
  };

  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Compute wholesale-adjusted cart items
  const processedCartItems = cartItems.map(item => {
    const isWholesale = item.quantity >= (item.wholesaleMinQty || 5) || totalCount >= 10;
    const effectivePrice = isWholesale ? (item.wholesalePrice || Math.round(item.price * 0.7)) : item.price;
    return {
      ...item,
      isWholesale,
      effectivePrice,
      itemTotal: effectivePrice * item.quantity,
      savings: (item.price - effectivePrice) * item.quantity
    };
  });

  const retailSubtotal = processedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const subtotal = processedCartItems.reduce((sum, item) => sum + item.itemTotal, 0);
  const wholesaleSavings = retailSubtotal - subtotal;
  const hasWholesaleDiscount = wholesaleSavings > 0;

  return (
    <CartContext.Provider value={{
      cartItems: processedCartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      openCart: () => setIsCartOpen(true),
      closeCart: () => setIsCartOpen(false),
      isWishlistOpen,
      setIsWishlistOpen,
      openWishlist: () => setIsWishlistOpen(true),
      closeWishlist: () => setIsWishlistOpen(false),
      totalCount,
      subtotal,
      retailSubtotal,
      wholesaleSavings,
      hasWholesaleDiscount,
      wishlist,
      isWishlisted,
      toggleWishlist,
      showToast
    }}>
      {children}

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] bg-[#26211C]/95 backdrop-blur-md text-white px-5 py-2.5 rounded-full shadow-2xl border border-white/10 flex items-center gap-2.5 text-xs font-semibold animate-slideUp pointer-events-none">
          <span className="text-base">{toast.icon}</span>
          <span>{toast.message}</span>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
