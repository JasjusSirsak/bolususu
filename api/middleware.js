// middleware.js
const jwt = require('jsonwebtoken');
const pool = require('./db');

// Verifikasi token JWT
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token diperlukan' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Dapatkan data user terbaru dari database
    const [rows] = await pool.query('SELECT id, username, fullname, email, role FROM users WHERE id = ?', [decoded.id]);
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'User tidak ditemukan' });
    }
    
    req.user = rows[0];
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token tidak valid' });
  }
};

// Cek role admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak. Memerlukan role admin' });
  }
  next();
};

// Cek apakah user adalah admin proyek
const requireProjectAdmin = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.projectId;
    
    if (!projectId) {
      return res.status(400).json({ message: 'ID proyek diperlukan' });
    }
    
    // Cek apakah user adalah pembuat proyek atau admin di proyek
    const [rows] = await pool.query(
      `SELECT p.id FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE (p.creator_id = ? OR (pm.user_id = ? AND pm.role = 'admin'))
      AND p.id = ?`,
      [req.user.id, req.user.id, projectId]
    );
    
    if (rows.length === 0) {
      return res.status(403).json({ message: 'Akses ditolak. Memerlukan role admin proyek' });
    }
    
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireProjectAdmin
};