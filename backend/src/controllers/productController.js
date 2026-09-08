import { categories } from '../data/seedData.js';
import { 
  dbGetProducts, 
  dbCreateProduct, 
  dbUpdateProduct, 
  dbDeleteProduct,
  dbToggleProductVisibility 
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

export const getCategories = (req, res) => {
  res.json({
    success: true,
    data: categories
  });
};

export const createProduct = async (req, res) => {
  try {
    const { name, price, category } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp tên, giá và danh mục sản phẩm.' });
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
