import { dbGetConsultations, dbCreateConsultation } from '../data/dbStore.js';

export const getConsultations = async (req, res) => {
  try {
    const consultations = await dbGetConsultations();
    res.json({
      success: true,
      data: consultations
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Lỗi nạp danh sách yêu cầu tư vấn',
      error: err.message
    });
  }
};

export const createConsultation = async (req, res) => {
  try {
    const { customerName, phone, email, menh, wristCircumference, message } = req.body;
    if (!customerName || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp họ tên và số điện thoại liên hệ'
      });
    }

    const consultation = await dbCreateConsultation({
      customerName,
      phone,
      email,
      menh,
      wristCircumference,
      message
    });

    res.status(201).json({
      success: true,
      data: consultation,
      message: 'Đã gửi yêu cầu tư vấn thành công! Nghệ nhân xưởng sẽ liên hệ bạn sớm nhất.'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Lỗi gửi yêu cầu tư vấn',
      error: err.message
    });
  }
};
