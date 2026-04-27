const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'gizli_anahtar_super_guvenli_123';

const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Yetkisiz erişim, token geçersiz.' });
    }
  } else {
    res.status(401).json({ message: 'Yetkisiz erişim, token bulunamadı.' });
  }
};

module.exports = { protect };
