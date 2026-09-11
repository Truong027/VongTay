import { 
  dbGetBeads, 
  dbGetBeadById, 
  dbCreateBead, 
  dbUpdateBead, 
  dbDeleteBead, 
  dbToggleBeadStock 
} from '../data/dbStore.js';

export const getBeads = async (req, res) => {
  try {
    const { q, menh, inStock } = req.query;
    const beads = await dbGetBeads({ q, menh, inStock });
    res.json({
      success: true,
      data: beads,
      total: beads.length
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách hạt đá:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy danh sách hạt đá' });
  }
};

export const getBeadById = async (req, res) => {
  try {
    const { id } = req.params;
    const bead = await dbGetBeadById(id);
    if (!bead) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hạt đá phong thủy' });
    }
    res.json({ success: true, data: bead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBead = async (req, res) => {
  try {
    const { name, pricePerBead } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên hạt đá phong thủy' });
    }
    if (pricePerBead === undefined || isNaN(Number(pricePerBead)) || Number(pricePerBead) < 0) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đơn giá hợp lệ cho từng hạt đá' });
    }

    const newBead = await dbCreateBead(req.body);
    res.status(201).json({
      success: true,
      data: newBead,
      message: 'Đã thêm hạt đá phong thủy mới vào kho thành công!'
    });
  } catch (error) {
    console.error('Lỗi thêm hạt đá:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi tạo hạt đá' });
  }
};

export const updateBead = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await dbUpdateBead(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hạt đá để cập nhật' });
    }
    res.json({
      success: true,
      data: updated,
      message: 'Đã cập nhật thông tin hạt đá thành công!'
    });
  } catch (error) {
    console.error('Lỗi cập nhật hạt đá:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBead = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await dbDeleteBead(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hạt đá để xóa' });
    }
    res.json({
      success: true,
      message: 'Đã xóa hạt đá khỏi kho thành công!'
    });
  } catch (error) {
    console.error('Lỗi xóa hạt đá:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleBeadStock = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await dbToggleBeadStock(id);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hạt đá' });
    }
    res.json({
      success: true,
      data: updated,
      message: `Đã đổi trạng thái sang: ${updated.inStock ? 'Còn hàng' : 'Hết hàng'}`
    });
  } catch (error) {
    console.error('Lỗi toggle kho hạt đá:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
