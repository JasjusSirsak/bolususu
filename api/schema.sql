-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    role ENUM('ADMIN', 'MEMBER') DEFAULT 'MEMBER',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Data Sources table (GANTI NAMA DARI 'databases')
CREATE TABLE IF NOT EXISTS data_sources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Dashboards table
CREATE TABLE IF NOT EXISTS dashboards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    data_source_id INT, -- GANTI NAMA DARI 'database_id'
    creator_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
    -- FIX: Foreign key sekarang merujuk ke tabel yang benar dan bukan keyword
    FOREIGN KEY (data_source_id) REFERENCES data_sources(id) ON DELETE SET NULL
);

-- Dashboard members table
CREATE TABLE IF NOT EXISTS dashboard_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dashboard_id INT NOT NULL,
    user_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dashboard_id) REFERENCES dashboards(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_dashboard_user (dashboard_id, user_id)
);

-- Chats table
CREATE TABLE IF NOT EXISTS chats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat participants table
CREATE TABLE IF NOT EXISTS chat_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chat_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_chat_user (chat_id, user_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    sender_id INT NOT NULL,
    chat_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
);

-- Analytics data table (for dashboard analytics)
CREATE TABLE IF NOT EXISTS analytics_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dashboard_id INT NOT NULL,
    keyword VARCHAR(100) NOT NULL,
    sentiment ENUM('POSITIVE', 'NEGATIVE', 'NEUTRAL') NOT NULL,
    count INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dashboard_id) REFERENCES dashboards(id) ON DELETE CASCADE,
    UNIQUE KEY unique_dashboard_keyword_sentiment (dashboard_id, keyword, sentiment)
);

-- Insert sample admin user
INSERT INTO users (username, full_name, email, password_hash, role) VALUES 
('admin', 'Administrator', 'admin@insight.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO2', 'ADMIN');

-- Insert sample member user
INSERT INTO users (username, full_name, email, password_hash, role) VALUES 
('member', 'Test Member', 'member@insight.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO2', 'MEMBER');

-- Create indexes for better performance
CREATE INDEX idx_dashboards_creator ON dashboards(creator_id);
CREATE INDEX idx_dashboards_data_source ON dashboards(data_source_id); -- Nama index disesuaikan
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_chat ON messages(chat_id);
CREATE INDEX idx_analytics_dashboard ON analytics_data(dashboard_id);
CREATE INDEX idx_analytics_keyword ON analytics_data(keyword);
