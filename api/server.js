// server.js - Complete Backend for Insight CSV Analyzer (MySQL Version)
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise'); // GANTI: Pake mysql2/promise
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware untuk memverifikasi JWT (Tidak berubah)
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ 
            success: false, 
            message: 'Access denied. Token is required.' 
        });
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        req.user = user; 
        next();
    } catch (err) {
        return res.status(403).json({ 
            success: false, 
            message: 'Invalid or expired token.' 
        });
    }
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Index (Tidak berubah)
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Insight CSV Analyzer API',
    version: '1.0.0',
    endpoints: {
      'GET /api': 'This documentation',
      'GET /api/health': 'Server health check',
      // ... dst
    }
  });
});

// MySQL Connection Pool
// GANTI: Konfigurasi pool untuk MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || '270.0.0.1',
  port: process.env.DB_PORT || 3306, // Port default MySQL
  database: process.env.DB_NAME || 'insight',
  user: process.env.DB_USER || 'bolususu',
  password: process.env.DB_PASSWORD || 'Susubolu1!',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
// GANTI: Cara test koneksi MySQL
pool.getConnection()
    .then(conn => {
        console.log('✅ Connected to MySQL database');
        conn.release();
    })
    .catch(err => {
        console.error('❌ Error connecting to MySQL:', err.message);
    });

// A. Register User Baru
app.post('/api/auth/register', async (req, res) => {
  const { full_name, email, password } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Full name, email, and password are required.' 
    });
  }
  
  if (password.length < 8) {
     return res.status(400).json({ 
      success: false, 
      message: 'Password must be at least 8 characters long.' 
    });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // GANTI: Query pake placeholder '?' dan cara ambil hasilnya
    const query = `
      INSERT INTO users (full_name, email, password_hash)
      VALUES (?, ?, ?)
    `;
    
    const [result] = await pool.query(query, [full_name, email, password_hash]);
    
    const newUser = {
      id: result.insertId, // MySQL pake insertId
      full_name: full_name,
      email: email,
      created_at: new Date()
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: newUser
    });

  } catch (error) {
    // GANTI: Error code untuk duplikat entry di MySQL
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Email already exists.'
      });
    }
    
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to register user',
      error: error.message 
    });
  }
});

// B. Login User
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email and password are required.' 
    });
  }

  try {
    // GANTI: Query pake placeholder '?' dan cara ambil hasilnya
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND is_active = TRUE', 
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invalid credentials or user not found.' 
      });
    }

    const user = users[0];

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials or user not found.' 
      });
    }
    
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    const secret = process.env.JWT_SECRET || 'your-secret-key-change-this';
      
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      secret,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        avatar_url: user.avatar_url
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to login',
      error: error.message 
    });
  }
});

// ==================== API ENDPOINTS ====================

// GET USER PROFILE
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    try {
        // GANTI: Placeholder '?' dan cara ambil hasil
        const query = `
            SELECT id, full_name, email, role, created_at, updated_at
            FROM users
            WHERE id = ?
        `;
        const [rows] = await pool.query(query, [userId]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = rows[0];
        
        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.full_name, // Asumsi kolom di DB adalah full_name
                email: user.email,
                role: user.role,
                joinDate: user.created_at,
                avatar: user.full_name.split(' ').map(n => n.charAt(0)).join('').toUpperCase()
            }
        });

    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user profile',
            error: error.message
        });
    }
});

// UPDATE USER PROFILE
app.put('/api/user/profile', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { name, email, phone, department } = req.body;

    try {
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Name and email are required'
            });
        }

        const emailCheck = await pool.query(
            'SELECT id FROM users WHERE email = ? AND id != ?',
            [email, userId]
        );

        if (emailCheck[0].length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already in use'
            });
        }

        const query = `
            UPDATE users
            SET full_name = ?, email = ?, updated_at = NOW()
            WHERE id = ?
        `;
        await pool.query(query, [name, email, userId]);

        // Ambil data yang sudah diupdate untuk dikembalikan
        const [updatedUser] = await pool.query('SELECT id, full_name, email, role, created_at FROM users WHERE id = ?', [userId]);

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: updatedUser[0].id,
                name: updatedUser[0].full_name,
                email: updatedUser[0].email,
                role: updatedUser[0].role,
                joinDate: updatedUser[0].created_at
            }
        });

    } catch (error) {
        console.error('Update user profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user profile',
            error: error.message
        });
    }
});

// GET USER PREFERENCES
app.get('/api/user/preferences', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    try {
        const query = `
            SELECT dark_mode, email_notifications, desktop_notifications, language, timezone
            FROM user_preferences
            WHERE user_id = ?
        `;
        const [rows] = await pool.query(query, [userId]);

        if (rows.length === 0) {
            return res.json({
                success: true,
                preferences: {
                    dark_mode: false,
                    email_notifications: true,
                    desktop_notifications: true,
                    language: 'en',
                    timezone: 'utc-7'
                }
            });
        }

        res.json({
            success: true,
            preferences: rows[0]
        });

    } catch (error) {
        console.error('Get user preferences error:', error);
        res.json({
            success: true,
            preferences: {
                dark_mode: false,
                email_notifications: true,
                desktop_notifications: true,
                language: 'en',
                timezone: 'utc-7'
            }
        });
    }
});

// UPDATE USER PREFERENCES
app.put('/api/user/preferences', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { dark_mode, email_notifications, desktop_notifications, language, timezone } = req.body;

    try {
        // GANTI: Pake ON DUPLICATE KEY UPDATE
        // PENTING: Pastikan tabel user_preferences punya PRIMARY KEY atau UNIQUE index di kolom user_id
        const query = `
            INSERT INTO user_preferences (user_id, dark_mode, email_notifications, desktop_notifications, language, timezone)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                dark_mode = VALUES(dark_mode),
                email_notifications = VALUES(email_notifications),
                desktop_notifications = VALUES(desktop_notifications),
                language = VALUES(language),
                timezone = VALUES(timezone),
                updated_at = NOW()
        `;
        await pool.query(query, [
            userId,
            dark_mode || false,
            email_notifications !== false,
            desktop_notifications !== false,
            language || 'en',
            timezone || 'utc-7'
        ]);

        // Ambil data yang sudah diupdate/insert untuk dikembalikan
        const [updatedPrefs] = await pool.query('SELECT * FROM user_preferences WHERE user_id = ?', [userId]);

        res.json({
            success: true,
            message: 'Preferences updated successfully',
            preferences: updatedPrefs[0]
        });

    } catch (error) {
        console.error('Update user preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update preferences',
            error: error.message
        });
    }
});

// GET TEAM MEMBERS
app.get('/api/team/members', authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT DISTINCT
                u.id,
                u.full_name,
                u.email,
                u.role,
                COUNT(DISTINCT pm.project_id) as project_count
            FROM users u
            LEFT JOIN project_members pm ON u.id = pm.user_id
            GROUP BY u.id, u.full_name, u.email, u.role
            LIMIT 20
        `;
        const [rows] = await pool.query(query);

        const members = rows.map(member => ({
            id: member.id,
            name: member.full_name,
            initials: member.full_name.split(' ').map(n => n.charAt(0)).join('').toUpperCase(),
            email: member.email,
            role: member.role,
            projectCount: parseInt(member.project_count)
        }));

        res.json({
            success: true,
            members: members
        });

    } catch (error) {
        console.error('Get team members error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch team members',
            error: error.message
        });
    }
});

// CREATE PROJECT
app.post('/api/projects/create', authenticateToken, async (req, res) => {
    const { name, description } = req.body;
    const ownerId = req.user.userId;

    if (!name) {
        return res.status(400).json({ success: false, message: 'Project name is required.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction(); // GANTI: Pake connection.beginTransaction()

        // GANTI: Fungsi generate_unique_code(6) harus dibuat di MySQL
        // Atau generate di sini. Contoh generate di sini:
        const unique_code = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        const projectQuery = `
            INSERT INTO projects (name, description, owner_id, unique_code)
            VALUES (?, ?, ?, ?)
        `;
        const [projectResult] = await connection.query(projectQuery, [name, description, ownerId, unique_code]);
        const projectId = projectResult.insertId; // GANTI: Pake insertId

        const memberQuery = `
            INSERT INTO project_members (project_id, user_id, role)
            VALUES (?, ?, 'admin')
        `;
        await connection.query(memberQuery, [projectId, ownerId]);

        await connection.commit(); // GANTI: Pake connection.commit()

        // Ambil data project yang baru dibuat
        const [newProject] = await connection.query('SELECT * FROM projects WHERE id = ?', [projectId]);

        res.status(201).json({
            success: true,
            message: 'Project created successfully!',
            project: newProject[0],
            role: 'admin'
        });

    } catch (error) {
        await connection.rollback(); // GANTI: Pake connection.rollback()
        console.error('Create project error:', error);
        res.status(500).json({ success: false, message: 'Failed to create project.', error: error.message });
    } finally {
        connection.release(); // GANTI: Pake connection.release()
    }
});

// JOIN PROJECT
app.post('/api/projects/join', authenticateToken, async (req, res) => {
    const { unique_code } = req.body;
    const userId = req.user.userId;

    if (!unique_code) {
        return res.status(400).json({ success: false, message: 'Unique code is required.' });
    }

    try {
        const [projectResult] = await pool.query(
            'SELECT id, name FROM projects WHERE unique_code = ? AND is_active = TRUE', 
            [unique_code]
        );

        if (projectResult.length === 0) {
            return res.status(404).json({ success: false, message: 'Invalid unique code or project not found.' });
        }

        const projectId = projectResult[0].id;
        const projectName = projectResult[0].name;

        const [existingMember] = await pool.query(
            'SELECT id FROM project_members WHERE project_id = ? AND user_id = ?',
            [projectId, userId]
        );
        
        if (existingMember.length > 0) {
            return res.status(409).json({ success: false, message: 'You are already a member of this project.' });
        }

        const memberQuery = `
            INSERT INTO project_members (project_id, user_id, role)
            VALUES (?, ?, 'member')
        `;
        const [memberResult] = await pool.query(memberQuery, [projectId, userId]);
        
        res.json({
            success: true,
            message: `Successfully joined project: ${projectName}`,
            project_id: projectId,
            project_name: projectName,
            role: 'member'
        });

    } catch (error) {
        console.error('Join project error:', error);
        res.status(500).json({ success: false, message: 'Failed to join project.', error: error.message });
    }
});

// GET USER PROJECTS
app.get('/api/user/projects', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    try {
        const query = `
            SELECT *
            FROM v_user_projects -- Asumsi view ini juga ada di MySQL
            WHERE user_id = ?
            ORDER BY joined_at DESC;
        `;
        
        const [rows] = await pool.query(query, [userId]);
        
        res.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error('Get user projects error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch user projects',
            error: error.message 
        });
    }
});

// UPLOAD CSV
app.post('/api/projects/:projectId/upload-csv', authenticateToken, async (req, res) => {
    const projectId = parseInt(req.params.projectId);
    const userId = req.user.userId;
    
    const connection = await pool.getConnection();
    
    try {
        const { filename, data, primaryKeys } = req.body;
        
        if (!filename || !data || !Array.isArray(data) || data.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid data. Filename and data array required.' 
            });
        }
        
        const [memberCheck] = await connection.query(
            'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
            [projectId, userId]
        );
        
        if (memberCheck.length === 0) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. You are not a member of this project.' 
            });
        }
        
        const columnNames = Object.keys(data[0]);
        const rowCount = data.length;
        const columnCount = columnNames.length;
        
        await connection.beginTransaction();
        
        const metadataQuery = `
            INSERT INTO csv_uploads (project_id, uploaded_by, filename, original_filename, file_size, row_count, column_count, column_names, primary_keys)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const metadataResult = await connection.query(metadataQuery, [
            projectId, userId, filename, filename, 0, rowCount, columnCount, JSON.stringify(columnNames), JSON.stringify(primaryKeys || [])
        ]);

        const csvUploadId = metadataResult[0].insertId; // GANTI: Pake insertId

        // Siapkan query untuk insert data batch biar lebih cepat
        const dataQuery = `
            INSERT INTO csv_data (csv_upload_id, row_number, row_data)
            VALUES ?
        `;
        const valuesToInsert = data.map((row, i) => [
            csvUploadId, 
            i + 1, 
            JSON.stringify(row) // GANTI: Kolom row_data di MySQL sebaiknya tipe JSON
        ]);

        await connection.query(dataQuery, [valuesToInsert]);

        await connection.commit();

        res.json({
            success: true,
            message: 'CSV uploaded successfully',
            data: {
                id: csvUploadId,
                filename: filename,
                rowCount: rowCount,
                columns: columnNames
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Upload error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to upload CSV',
            error: error.message 
        });
    } finally {
        connection.release();
    }
});

// GET CSV FILES LIST
app.get('/api/projects/:projectId/csv-files', authenticateToken, async (req, res) => {
    const projectId = parseInt(req.params.projectId);
    const userId = req.user.userId;

    try {
        const [memberCheck] = await pool.query(
            'SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?',
            [projectId, userId]
        );
        
        if (memberCheck.length === 0) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. You are not a member of this project.' 
            });
        }
        
        const query = `
            SELECT 
                cu.id, 
                cu.filename, 
                cu.uploaded_at AS upload_date, 
                cu.row_count, 
                cu.column_names,
                u.full_name AS uploaded_by_name
            FROM csv_uploads cu
            JOIN users u ON cu.uploaded_by = u.id
            WHERE cu.project_id = ? AND cu.is_deleted = FALSE
            ORDER BY cu.uploaded_at DESC
        `;
        
        const [rows] = await pool.query(query, [projectId]);
        
        res.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error('Get files error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch CSV files',
            error: error.message 
        });
    }
});

// GET SPECIFIC CSV DATA
app.get('/api/projects/:projectId/csv-files/:uploadId', authenticateToken, async (req, res) => {
    const projectId = parseInt(req.params.projectId);
    const uploadId = parseInt(req.params.uploadId);
    const userId = req.user.userId;

    try {
        const metadataQuery = `
            SELECT 
                cu.*, 
                u.full_name AS uploaded_by_name
            FROM csv_uploads cu
            JOIN users u ON cu.uploaded_by = u.id
            JOIN project_members pm ON cu.project_id = pm.project_id 
            WHERE cu.id = ? AND cu.project_id = ? AND pm.user_id = ?
        `;
        const [metadataResult] = await pool.query(metadataQuery, [uploadId, projectId, userId]);

        if (metadataResult.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'CSV file not found or access denied.' 
            });
        }

        const metadata = metadataResult[0];

        const dataQuery = `
            SELECT row_data FROM csv_data 
            WHERE csv_upload_id = ?
            ORDER BY row_number
        `;
        const [dataResult] = await pool.query(dataQuery, [uploadId]);
        
        const csvData = dataResult.map(row => row.row_data); // Kolom row_data tipe JSON, driver mysql2 akan parse otomatis

        res.json({
            success: true,
            data: {
                id: metadata.id,
                filename: metadata.filename,
                upload_date: metadata.uploaded_at,
                row_count: metadata.row_count,
                column_names: JSON.parse(metadata.column_names), // Kolom column_names tipe TEXT/JSON, perlu di-parse manual
                uploaded_by: metadata.uploaded_by_name,
                rows: csvData
            }
        });

    } catch (error) {
        console.error('Get CSV error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch CSV data',
            error: error.message 
        });
    }
});

// DELETE CSV
app.delete('/api/projects/:projectId/csv-files/:uploadId', authenticateToken, async (req, res) => {
    const projectId = parseInt(req.params.projectId);
    const uploadId = parseInt(req.params.uploadId);
    const userId = req.user.userId;
    
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        const [accessResult] = await connection.query(`
            SELECT 
                cu.uploaded_by, 
                pm.role 
            FROM csv_uploads cu
            JOIN project_members pm ON cu.project_id = pm.project_id 
            WHERE cu.id = ? AND cu.project_id = ? AND pm.user_id = ?
        `, [uploadId, projectId, userId]);

        if (accessResult.length === 0) {
            await connection.rollback();
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. You are not a member of this project or the file does not exist.' 
            });
        }
        
        const fileInfo = accessResult[0];
        const isOwner = fileInfo.uploaded_by === userId;
        const isAdmin = fileInfo.role === 'admin';

        if (!isOwner && !isAdmin) {
            await connection.rollback();
            return res.status(403).json({ 
                success: false, 
                message: 'Permission denied. Only the uploader or a Project Admin can delete this file.' 
            });
        }

        const [result] = await connection.query(
            'UPDATE csv_uploads SET is_deleted = TRUE WHERE id = ? AND project_id = ?',
            [uploadId, projectId]
        );

        if (result.affectedRows === 0) { // GANTI: Pake affectedRows
            await connection.rollback();
            return res.status(404).json({ 
                success: false, 
                message: 'CSV file not found or already deleted.' 
            });
        }

        await connection.commit();

        res.json({
            success: true,
            message: 'CSV file marked as deleted successfully (soft delete)'
        });

    } catch (error) {
        await connection.rollback();
        console.error('Delete error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete CSV',
            error: error.message 
        });
    } finally {
        connection.release();
    }
});

// Health check, 404 handler, Error handler, Graceful shutdown (Tidak berubah)
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    hint: 'Available endpoints can be found at GET /api'
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  pool.end(() => {
    console.log('Database pool closed');
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
});