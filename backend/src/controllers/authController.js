import { 
  dbGetUsers, 
  dbCreateUser, 
  dbFindUserByEmail, 
  dbFindUserById,
  dbUpdateUserRole, 
  dbUpdateUserProfile,
  dbDeleteUser,
  dbUpdateUserSession,
  dbValidateUserSession
} from '../data/dbStore.js';
import { initNeonDb, getConnectionInfo, isNeonConnected, ensureNeonConnected } from '../data/neonDb.js';

export const register = async (req, res) => {
  try {
    const { email, password, fullName, phone, address, deviceInfo } = req.body;

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

    const newSessionToken = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
    const clientDevice = (deviceInfo || req.headers['user-agent'] || 'Trình duyệt Web').substring(0, 250);

    const newUser = await dbCreateUser({
      email: cleanEmail,
      password,
      fullName: fullName.trim(),
      phone: (phone || '').trim(),
      address: (address || '').trim(),
      role: 'customer',
      sessionToken: newSessionToken,
      deviceInfo: clientDevice
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
        token: newUser.sessionToken || newSessionToken
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, deviceInfo } = req.body;

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

    // Tạo mã phiên độc nhất cho thiết bị đăng nhập mới này
    const newSessionToken = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
    const clientDevice = (deviceInfo || req.headers['user-agent'] || 'Trình duyệt Web').substring(0, 250);

    // Vô hiệu hóa thiết bị trước và chỉ cho phép thiết bị mới này hoạt động
    await dbUpdateUserSession(user.id, newSessionToken, clientDevice);

    res.json({
      success: true,
      message: 'Đăng nhập thành công! Thiết bị của bạn hiện là phiên duy nhất hoạt động.',
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
        token: newSessionToken
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { id, email, fullName, phone, address, currentPassword, newPassword } = req.body;

    if (!id && !email) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mã tài khoản hoặc email.' });
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const existing = (cleanEmail ? await dbFindUserByEmail(cleanEmail) : null) || (id ? (await dbGetUsers()).find(u => u.id === id) : null);

    const updates = { email: cleanEmail };
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

    const targetId = id || (existing ? existing.id : null);
    const updated = await dbUpdateUserProfile(targetId, updates);
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

export const validateSession = async (req, res) => {
  try {
    let token = '';
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }
    if (!token && req.body && req.body.token) {
      token = req.body.token;
    }
    if (!token && req.query && req.query.token) {
      token = req.query.token;
    }

    const userId = req.body?.userId || req.query?.userId || req.headers['x-user-id'];

    if (!userId || !token) {
      return res.status(200).json({
        success: true,
        valid: true,
        guest: true,
        message: 'Chưa có phiên làm việc đăng nhập.'
      });
    }

    const validation = await dbValidateUserSession(userId, token);
    if (!validation.valid) {
      return res.status(401).json({
        success: false,
        valid: false,
        sessionExpired: true,
        code: validation.code || 'CONCURRENT_DEVICE_LOGIN',
        message: validation.message || 'Tài khoản của bạn đã được đăng nhập từ một thiết bị khác. Phiên làm việc trên thiết bị này đã kết thúc.'
      });
    }

    res.json({
      success: true,
      valid: true,
      message: 'Phiên làm việc hợp lệ.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const userId = req.body?.userId || req.headers['x-user-id'];
    if (userId) {
      await dbUpdateUserSession(userId, null, '');
    }
    res.json({ success: true, message: 'Đăng xuất thành công.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
