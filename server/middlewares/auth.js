import jwt from 'jsonwebtoken';

export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Bearer <token>
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ success: false, message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' });
      }
      req.user = user;
      req.headers['x-username'] = user.username; // Keep backwards compatibility with existing route logic
      next();
    });
  } else {
    return res.status(401).json({ success: false, message: 'Chưa cung cấp mã xác thực.' });
  }
};
