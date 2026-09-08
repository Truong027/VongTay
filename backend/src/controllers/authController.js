import { 
  dbGetUsers, 
  dbCreateUser, 
  dbFindUserByEmail, 
  dbUpdateUserRole, 
  dbUpdateUserProfile,
  dbDeleteUser 
} from '../data/dbStore.js';
import { initNeonDb, getConnectionInfo, isNeonConnected, ensureNeonConnected } from '../data/neonDb.js';

export const register = async (req, res) => {
  try {
    const { email, password, fullName, phone, address } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng điền đầy đủ email, mật khẩu và họ tên.' 
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check existing
    const existing = await dbFindUserByEmail(cleanEmail);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email này đã được đăng ký tài khoản.' });
    }

    // Yêu cầu 3: Form đăng ký chỉ đăng ký tài khoản khách ('customer'), không cần tài khoản nhân viên
    const newUser = await dbCreateUser({
      email: cleanEmail,
      password,
      fullName: fullName.trim(),
      phone: (phone || '').trim(),
      address: (address || '').trim(),
      role: 'customer'
    });

    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản khách hàng thành công và đã lưu vào cơ sở dữ liệu!',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.fullName,
          phone: newUser.phone || '',
          address: newUser.address || '',
          role: newUser.role,
          createdAt: newUser.createdAt
        },
        token: `token-${newUser.id}`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await dbFindUserByEmail(cleanEmail);

    if (!user || user.password !== password) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email hoặc mật khẩu không chính xác.' 
      });
    }

    res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone || '',
          address: user.address || '',
          role: user.role,
          createdAt: user.createdAt
        },
        token: `token-${user.id}`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { id, fullName, phone, address, currentPassword, newPassword } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mã tài khoản (id).' });
    }

    const allUsers = await dbGetUsers();
    // Also check raw memoryData for password checking
    const existing = await dbFindUserByEmail(req.body.email || '') || allUsers.find(u => u.id === id);

    const updates = {};
    if (fullName !== undefined) updates.fullName = fullName.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (address !== undefined) updates.address = address.trim();

    // Check password change if requested
    if (newPassword) {
      if (newPassword.trim().length < 3) {
        return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 3 ký tự.' });
      }
      if (currentPassword && existing && existing.password && existing.password !== currentPassword) {
        return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng.' });
      }
      updates.password = newPassword.trim();
    }

    const updated = await dbUpdateUserProfile(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản để cập nhật.' });
    }

    res.json({
      success: true,
      message: newPassword ? 'Cập nhật thông tin & mật khẩu thành công!' : 'Cập nhật thông tin tài khoản thành công!',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await dbGetUsers();
    res.json({
      success: true,
      total: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { email, password, fullName, phone, address, role = 'customer' } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ email, mật khẩu và họ tên.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await dbFindUserByEmail(cleanEmail);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email này đã tồn tại trong hệ thống.' });
    }

    const user = await dbCreateUser({ 
      email: cleanEmail, 
      password, 
      fullName: fullName.trim(), 
      phone: (phone || '').trim(), 
      address: (address || '').trim(), 
      role 
    });
    res.status(201).json({ success: true, data: user, message: 'Tạo tài khoản mới thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['admin', 'customer', 'artisan'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Vai trò không hợp lệ (admin, customer, artisan)' });
    }

    const updated = await dbUpdateUserRole(id, role);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    res.json({ success: true, data: updated, message: `Đã cập nhật vai trò thành ${role}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === 'user-admin') {
      return res.status(400).json({ success: false, message: 'Không thể xóa tài khoản Quản trị viên mặc định!' });
    }

    const success = await dbDeleteUser(id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng để xóa' });
    }

    res.json({ success: true, message: 'Đã xóa tài khoản thành công khỏi cơ sở dữ liệu' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  await ensureNeonConnected();
  res.json({
    success: true,
    data: {
      dbStatus: getConnectionInfo()
    }
  });
};

export const updateDatabaseConnection = async (req, res) => {
  try {
    const { connectionString } = req.body;
    if (!connectionString) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp chuỗi kết nối Neon PostgreSQL.' });
    }

    const result = await initNeonDb(connectionString);
    if (result.success) {
      res.json({ success: true, message: result.message });
    } else {
      res.status(400).json({ success: false, message: result.message });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
