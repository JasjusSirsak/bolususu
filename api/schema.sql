-- schema.sql - PostgreSQL Database Schema for Insight

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS csv_data CASCADE;
DROP TABLE IF EXISTS csv_files CASCADE;

-- Table 1: csv_files (Metadata)
CREATE TABLE csv_files (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    row_count INTEGER NOT NULL,
    column_names JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE csv_data (
    id SERIAL PRIMARY KEY,
    csv_file_id INTEGER NOT NULL REFERENCES csv_files(id) ON DELETE CASCADE,
    row_key TEXT NOT NULL,
    row_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (csv_file_id, row_key)
);

-- Create indexes for better performance
CREATE INDEX idx_csv_files_upload_date ON csv_files(upload_date DESC);
CREATE INDEX idx_csv_files_filename ON csv_files(filename);
CREATE INDEX idx_csv_data_csv_file_id ON csv_data(csv_file_id);
CREATE INDEX idx_csv_data_row_data ON csv_data USING GIN(row_data);
-- Optional index on row_key to speed up lookups
CREATE INDEX idx_csv_data_row_key ON csv_data(row_key);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for csv_files
CREATE TRIGGER update_csv_files_updated_at 
    BEFORE UPDATE ON csv_files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify tables created
SELECT 
    table_name, 
    table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('csv_files', 'csv_data');

-- Show table structures
\d csv_files
\d csv_data