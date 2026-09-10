import { categories } from '../data/seedData.js';
import { 
  dbGetProducts, 
  dbCreateProduct, 
  dbUpdateProduct, 
  dbDeleteProduct,
  dbToggleProductVisibility,
  dbSetHeroTrending,
  dbGetCategories
} from '../data/dbStore.js';

export const getProducts = async (req, res) => {
  try {
    const includeHidden = req.query.includeHidden === 'true' || req.query.all === 'true';
    const allProducts = await dbGetProducts(includeHidden);
    let result = [...allProducts];
    const { category, menh, search, sort } = req.query;

    if (category && category !== 'all' && category !== 'undefined' && category !== 'null') {
      if (category === 'best-seller') {
        result = result.filter(p => p.isBestSeller);
      } else {
        result = result.filter(p => p.category === category);
      }
    }

    if (menh && menh !== 'all' && menh !== 'undefined' && menh !== 'null') {
      result = result.filter(p => p.menh && (p.menh.includes(menh) || p.menh.includes('Tất cả')));
    }

    if (search && search !== 'undefined' && search !== 'null') {
      const q = search.toLowerCase().trim();
      if (q) {
        result = result.filter(p => 
          (p.name && p.name.toLowerCase().includes(q)) || 
          (p.stoneType && p.stoneType.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
        );
      }
    }

    if (sort === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      // Default: best sellers first based on sales count & reviews
      result.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0) || (b.reviewsCount || 0) - (a.reviewsCount || 0));
    }

    res.json({
      success: true,
      total: result.length,
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const products = await dbGetProducts();
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const allProducts = await dbGetProducts(false);
    const dbCats = await dbGetCategories();

    const standardMasterTabs = [
      { id: 'all', name: 'Tất Cả Sản Phẩm', icon: 'Sparkles', count: allProducts.length },
      { id: 'best-seller', name: '🔥 Bán Chạy Nhất', icon: 'Flame', count: allProducts.filter(p => p.isBestSeller).length }
    ];

    // Merge base categories
    const baseSource = dbCats && dbCats.length > 0 ? dbCats : categories;
    const cleanList = baseSource.filter(c => c.id !== 'all' && c.id !== 'best-seller' && c.slug !== 'all' && c.slug !== 'best-seller');

    const mappedCats = cleanList.map(c => {
      const catId = c.slug || c.id;
      const count = allProducts.filter(p => p.category === catId).length;
      return {
        id: catId,
        name: c.name,
        slug: catId,
        icon: c.icon || 'Sparkles',
        description: c.description || c.name,
        count
      };
    });

    // Ensure all categories present on any product are represented
    const existingCatIds = new Set(mappedCats.map(c => c.id));
    const knownLabels = {
      'macrame-pastel': 'Vòng Dây Macrame Pastel',
      'guong-dinh': '🪞 Gương Đính Gập & Đơn',
      'vong-doi': 'Vòng Đôi & Summer Set',
      'day-do-may-man': 'Vòng Dây Chỉ Đỏ May Mắn',
      'day-chuyen-vintage': 'Dây Chuyền & Choker Boho',
      'day-lua-co-phong': 'Vòng Dây Lụa Cổ Phong'
    };

    allProducts.forEach(p => {
      if (p.category && !existingCatIds.has(p.category)) {
        existingCatIds.add(p.category);
        mappedCats.push({
          id: p.category,
          name: knownLabels[p.category] || p.category,
          slug: p.category,
          icon: 'Sparkles',
          count: allProducts.filter(x => x.category === p.category).length
        });
      }
    });

    res.json({
      success: true,
      data: [...standardMasterTabs, ...mappedCats]
    });
  } catch (error) {
    res.json({
      success: true,
      data: categories
    });
  }
};

// Deduplication cache to prevent duplicate creations when clicked repeatedly within 3 seconds
const recentCreations = new Map();

export const createProduct = async (req, res) => {
  try {
    const { name, price, category } = req.body;
    if (!name || price === undefined || price === null || price === '' || !category) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp tên, giá và danh mục sản phẩm.' });
    }

    const dedupeKey = `${String(name).trim().toLowerCase()}-${price}`;
    const now = Date.now();
    if (recentCreations.has(dedupeKey)) {
      const lastTime = recentCreations.get(dedupeKey);
      if (now - lastTime < 3000) {
        return res.status(200).json({ 
          success: true, 
          message: 'Yêu cầu đang được xử lý, đã bỏ qua thao tác nhấn trùng lặp.',
          isDuplicateIgnored: true 
        });
      }
    }
    recentCreations.set(dedupeKey, now);
    if (recentCreations.size > 100) {
      for (const [k, v] of recentCreations.entries()) {
        if (now - v > 10000) recentCreations.delete(k);
      }
    }

    const created = await dbCreateProduct(req.body);
    res.status(201).json({ success: true, data: created, message: 'Thêm sản phẩm mới vào cơ sở dữ liệu thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const updated = await dbUpdateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm để cập nhật' });
    }
    res.json({ success: true, data: updated, message: 'Đã cập nhật sản phẩm thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const success = await dbDeleteProduct(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm để xóa' });
    }
    res.json({ success: true, message: 'Đã xóa sản phẩm khỏi cơ sở dữ liệu thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleProductVisibility = async (req, res) => {
  try {
    const result = await dbToggleProductVisibility(req.params.id);
    res.json({
      success: true,
      data: result,
      message: result.isHidden 
        ? 'Đã ẩn sản phẩm khỏi gian hàng thành công (chỉ lưu hiển thị trong trang quản trị).' 
        : 'Đã hiển thị sản phẩm trở lại gian hàng cho khách hàng đặt mua.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const setHeroTrending = async (req, res) => {
  try {
    const updated = await dbSetHeroTrending(req.params.id);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }
    res.json({
      success: true,
      data: updated,
      message: `Đã đặt "${updated.name}" làm sản phẩm xu hướng đầu trang chủ!`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
