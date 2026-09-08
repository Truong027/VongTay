import { 
  dbGetUsers, 
  dbCreateUser, 
  dbFindUserByEmail, 
  dbUpdateUserRole, 
  dbDeleteUser 
} from '../data/dbStore.js';
import { initNeonDb, getConnectionInfo, isNeonConnected, ensureNeonConnected } from '../data/neonDb.js';

export const register = async (req, res) => {
  try {
    const { email, password, fullName, role = 'customer' } = req.body;

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

    const newUser = await dbCreateUser({
      email: cleanEmail,
      password,
      fullName,
      role
    });

    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công và đã lưu vào cơ sở dữ liệu!',
      data: {
        user: newUser,
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
          role: user.role
        },
        token: `token-${user.id}`
      }
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
    const { email, password, fullName, role = 'customer' } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ email, mật khẩu và họ tên.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await dbFindUserByEmail(cleanEmail);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email này đã tồn tại trong hệ thống.' });
    }

    const user = await dbCreateUser({ email: cleanEmail, password, fullName, role });
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
