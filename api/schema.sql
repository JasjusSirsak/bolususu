-- =====================================================
-- INSIGHT DATABASE SCHEMA - MySQL VERSION
-- =====================================================

-- Drop existing tables (if rebuilding)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS dashboard_components;
DROP TABLE IF EXISTS dashboards;
DROP TABLE IF EXISTS csv_data;
DROP TABLE IF EXISTS csv_uploads;
DROP TABLE IF EXISTS project_members;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active TINYINT(1) DEFAULT 1
);

-- =====================================================
-- 2. PROJECTS TABLE
-- =====================================================
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unique_code VARCHAR(10) UNIQUE NOT NULL,
    owner_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active TINYINT(1) DEFAULT 1,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- 3. PROJECT_MEMBERS TABLE
-- =====================================================
CREATE TABLE project_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    user_id INT NOT NULL,
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP NULL,
    UNIQUE(project_id, user_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- 4. CSV_UPLOADS TABLE - PENTING UNTUK UPLOAD CSV
-- =====================================================
CREATE TABLE csv_uploads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    uploaded_by INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    row_count INT,
    column_count INT,
    primary_keys JSON, -- Array of column names used as primary keys
    column_names JSON, -- Array of all column names
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP NULL,
    is_deleted TINYINT(1) DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for csv_uploads table
CREATE INDEX idx_csv_uploads_project_id ON csv_uploads(project_id);
CREATE INDEX idx_csv_uploads_uploaded_by ON csv_uploads(uploaded_by);
CREATE INDEX idx_csv_uploads_uploaded_at ON csv_uploads(uploaded_at DESC);
CREATE INDEX idx_csv_uploads_is_deleted ON csv_uploads(is_deleted);

-- =====================================================
-- 5. CSV_DATA TABLE - PENTING UNTUK DATA CSV
-- =====================================================
CREATE TABLE csv_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    csv_upload_id INT NOT NULL,
    row_number INT NOT NULL,
    row_data JSON NOT NULL, -- Flexible storage for any CSV structure
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (csv_upload_id) REFERENCES csv_uploads(id) ON DELETE CASCADE
);

-- Indexes for csv_data table
CREATE INDEX idx_csv_data_csv_upload_id ON csv_data(csv_upload_id);
CREATE INDEX idx_csv_data_row_number ON csv_data(csv_upload_id, row_number);

-- =====================================================
-- 6. DASHBOARDS TABLE
-- =====================================================
CREATE TABLE dashboards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    created_by INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    csv_upload_id INT NULL,
    layout_config JSON,
    filters JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP NULL,
    is_deleted TINYINT(1) DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (csv_upload_id) REFERENCES csv_uploads(id) ON DELETE SET NULL
);

-- =====================================================
-- 7. DASHBOARD_COMPONENTS TABLE
-- =====================================================
CREATE TABLE dashboard_components (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dashboard_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    config JSON NOT NULL,
    position_x INT DEFAULT 0,
    position_y INT DEFAULT 0,
    width INT DEFAULT 4,
    height INT DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (dashboard_id) REFERENCES dashboards(id) ON DELETE CASCADE
);

-- =====================================================
-- FUNCTION TO GENERATE UNIQUE PROJECT CODES
-- =====================================================
DELIMITER //
CREATE FUNCTION generate_unique_code(length INT)
RETURNS VARCHAR(10)
DETERMINISTIC
BEGIN
    DECLARE chars VARCHAR(36) DEFAULT 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    DECLARE result VARCHAR(10) DEFAULT '';
    DECLARE i INT DEFAULT 1;
    DECLARE random_char INT;
    
    WHILE i <= length DO
        SET random_char = FLOOR(1 + RAND() * 36);
        SET result = CONCAT(result, SUBSTRING(chars, random_char, 1));
        SET i = i + 1;
    END WHILE;
    
    -- Check if code already exists
    WHILE EXISTS (SELECT 1 FROM projects WHERE unique_code = result) DO
        SET result = '';
        SET i = 1;
        WHILE i <= length DO
            SET random_char = FLOOR(1 + RAND() * 36);
            SET result = CONCAT(result, SUBSTRING(chars, random_char, 1));
            SET i = i + 1;
        END WHILE;
    END WHILE;
    
    RETURN result;
END//
DELIMITER ;

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View: Project members with user details
CREATE VIEW v_project_members_detail AS
SELECT 
    pm.id,
    pm.project_id,
    pm.user_id,
    pm.role,
    pm.joined_at,
    pm.last_accessed,
    u.email,
    u.full_name,
    u.avatar_url,
    p.name AS project_name
FROM project_members pm
JOIN users u ON pm.user_id = u.id
JOIN projects p ON pm.project_id = p.id
WHERE u.is_active = 1 AND p.is_active = 1;

-- View: Recent activity (CSV uploads and dashboards)
CREATE VIEW v_recent_activity AS
SELECT 
    'csv_upload' AS activity_type,
    csv.id,
    csv.project_id,
    csv.uploaded_by AS user_id,
    csv.filename AS name,
    csv.uploaded_at AS activity_date,
    csv.last_accessed
FROM csv_uploads csv
WHERE csv.is_deleted = 0
UNION ALL
SELECT 
    'dashboard' AS activity_type,
    d.id,
    d.project_id,
    d.created_by AS user_id,
    d.name,
    d.created_at AS activity_date,
    d.last_accessed
FROM dashboards d
WHERE d.is_deleted = 0
ORDER BY activity_date DESC;

-- View: User's projects with role and member count
CREATE VIEW v_user_projects AS
SELECT 
    p.id AS project_id,
    p.name AS project_name,
    p.description,
    p.unique_code,
    p.owner_id,
    pm.user_id,
    pm.role,
    pm.joined_at,
    COUNT(DISTINCT pm2.user_id) AS member_count,
    p.created_at,
    p.updated_at
FROM projects p
JOIN project_members pm ON p.id = pm.project_id
LEFT JOIN project_members pm2 ON p.id = pm2.project_id
WHERE p.is_active = 1
GROUP BY p.id, p.name, p.description, p.unique_code, p.owner_id, pm.user_id, pm.role, pm.joined_at, p.created_at, p.updated_at;

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample users
INSERT INTO users (email, password_hash, full_name, avatar_url) VALUES
('bintang@insight.com', '$2a$10$samplehash1', 'Bintang Callista', 'https://i.pravatar.cc/150?img=1'),
('jeihan@insight.com', '$2a$10$samplehash2', 'Jeihan Amadea', 'https://i.pravatar.cc/150?img=2'),
('muhazab@insight.com', '$2a$10$samplehash3', 'Zaki Muhazab', 'https://i.pravatar.cc/150?img=3');

-- Insert sample project
INSERT INTO projects (name, description, unique_code, owner_id) VALUES
('Marketing Analytics', 'Q1 2025 Campaign Data', generate_unique_code(6), 1),
('Sales Dashboard', 'Real-time sales tracking', generate_unique_code(6), 2);

-- Insert project members
INSERT INTO project_members (project_id, user_id, role) VALUES
(1, 1, 'admin'),
(1, 2, 'member'),
(2, 2, 'admin'),
(2, 3, 'member');

-- =====================================================
-- END OF SCHEMA
-- =====================================================
