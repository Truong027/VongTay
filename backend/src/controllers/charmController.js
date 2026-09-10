import { 
  dbGetCharms, 
  dbGetCharmById, 
  dbCreateCharm, 
  dbUpdateCharm, 
  dbDeleteCharm, 
  dbToggleCharmStock 
} from '../data/dbStore.js';

export const getCharms = async (req, res) => {
  try {
    const { q, material, category, inStock } = req.query;
    const charms = await dbGetCharms({ q, material, category, inStock });
    res.json({
      success: true,
      data: charms,
      total: charms.length
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách charm:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy danh sách charm' });
  }
};

export const getCharmById = async (req, res) => {
  try {
    const { id } = req.params;
    const charm = await dbGetCharmById(id);
    if (!charm) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy charm' });
    }
    res.json({ success: true, data: charm });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCharm = async (req, res) => {
  try {
    const { name, material, price } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên charm' });
    }
    if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập giá hợp lệ cho charm' });
    }

    const newCharm = await dbCreateCharm(req.body);
    res.status(201).json({
      success: true,
      data: newCharm,
      message: 'Đã thêm charm mới vào kho thành công!'
    });
  } catch (error) {
    console.error('Lỗi thêm charm:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi tạo charm' });
  }
};

export const updateCharm = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await dbUpdateCharm(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy charm để cập nhật' });
    }
    res.json({
      success: true,
      data: updated,
      message: 'Đã cập nhật thông tin charm thành công!'
    });
  } catch (error) {
    console.error('Lỗi cập nhật charm:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCharm = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await dbDeleteCharm(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy charm để xóa' });
    }
    res.json({
      success: true,
      message: 'Đã xóa charm khỏi kho thành công!'
    });
  } catch (error) {
    console.error('Lỗi xóa charm:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleCharmStock = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await dbToggleCharmStock(id);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy charm' });
    }
    res.json({
      success: true,
      data: updated,
      message: `Đã đổi trạng thái sang: ${updated.inStock ? 'Còn hàng' : 'Hết hàng'}`
    });
  } catch (error) {
    console.error('Lỗi toggle kho charm:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
