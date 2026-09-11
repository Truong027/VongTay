/**
 * Tiện ích phân loại và xử lý đặc thù sản phẩm cho Vòng Tay Nhà Zy
 */

/**
 * Kiểm tra xem một sản phẩm có phải là vòng tay / lắc tay hay không
 * (Để quyết định có hiển thị mục chọn Size Cổ Tay hay không)
 * 
 * @param {Object} product - Đối tượng sản phẩm
 * @returns {boolean} true nếu là vòng tay, false nếu là gương, dây chuyền, choker, phụ kiện...
 */
export const isBraceletProduct = (product) => {
  if (!product) return false;

  const category = (product.category || '').toLowerCase();
  
  // 1. Nhóm sản phẩm chắc chắn KHÔNG phải vòng tay
  if (
    category === 'guong-dinh' ||
    category.includes('guong') ||
    category === 'day-chuyen-vintage' ||
    category.includes('chuyen') ||
    category.includes('choker') ||
    category === 'charm' ||
    category.includes('charm') ||
    category.includes('phu-kien')
  ) {
    return false;
  }

  const name = (product.name || '').toLowerCase();

  // 2. Tên sản phẩm chứa các từ khóa không phải vòng tay
  if (
    name.includes('gương') ||
    name.includes('dây chuyền') ||
    name.includes('choker') ||
    name.includes('móc khóa') ||
    name.includes('kẹp tóc') ||
    name.includes('cột tóc') ||
    name.includes('nhẫn') ||
    name.includes('hoa tai') ||
    name.includes('khuyên tai')
  ) {
    return false;
  }

  // 3. Nhóm sản phẩm vòng tay
  if (
    category === 'macrame-pastel' ||
    category === 'vong-doi' ||
    category === 'day-do-may-man' ||
    category.includes('vong') ||
    name.includes('vòng') ||
    name.includes('lắc tay') ||
    name.includes('summer set')
  ) {
    return true;
  }

  // 4. Kiểm tra qua loại dây hoặc hạt
  const cordType = (product.cordType || '').toLowerCase();
  const beadSize = (product.beadSize || '').toLowerCase();
  if (cordType.includes('gương') || beadSize.includes('gương') || cordType.includes('dây chuyền')) {
    return false;
  }

  // Mặc định cho các sản phẩm trang sức cổ tay
  return true;
};
