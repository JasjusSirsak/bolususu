// auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator'); // Import express-validator
const pool = require('./db');
const router = express.Router();

// --- MIDDLEWARE AUTENTIKASI ---
// Middleware ini akan melindungi rute-rute yang memerlukan login
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Akses ditolak, token tidak ditemukan.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Simpan data user ke request object
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token tidak valid.' });
    }
};

// --- ROUTE LOGIN ---
router.post('/login', [
    body('email').isEmail().withMessage('Format email tidak valid'),
    body('password').notEmpty().withMessage('Password harus diisi')
], async (req, res) => {
    // Cek hasil validasi
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
        const { email, password } = req.body;
        
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }
        
        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }
        
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.status(200).json({
            message: 'Login berhasil',
            token,
            user: {
                id: user.id,
                username: user.username,
                fullname: user.fullname,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
});

// --- ROUTE SIGNUP (sebelumnya register) ---
router.post('/signup', [
    body('username').notEmpty().withMessage('Username harus diisi'),
    body('fullname').notEmpty().withMessage('Nama lengkap harus diisi'),
    body('email').isEmail().withMessage('Format email tidak valid'),
    body('password').isLength({ min: 8 }).withMessage('Password minimal 8 karakter')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
        const { username, fullname, email, password } = req.body;
        
        // Cek email sudah ada
        const [emailRows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (emailRows.length > 0) {
            return res.status(400).json({ message: 'Email sudah terdaftar' });
        }
        
        // Cek username sudah ada
        const [usernameRows] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
        if (usernameRows.length > 0) {
            return res.status(400).json({ message: 'Username sudah digunakan' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await pool.query(
            'INSERT INTO users (username, fullname, email, password, role) VALUES (?, ?, ?, ?, ?)',
            [username, fullname, email, hashedPassword, 'member'] // Default role adalah 'member'
        );
        
        res.status(201).json({ message: 'Registrasi berhasil, silakan login.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
});

// --- CONTOH ROUTE YANG DILINDUNGI ---
router.get('/profile', authMiddleware, async (req, res) => {
    // req.user berisi data dari token yang sudah didekode
    try {
        const [rows] = await pool.query('SELECT id, username, fullname, email, role FROM users WHERE id = ?', [req.user.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
});


module.exports = router;