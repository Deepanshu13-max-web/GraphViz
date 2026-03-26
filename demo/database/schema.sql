-- ============================================
-- File: database/schema.sql
-- Location: graph-visualizer-springboot/database/schema.sql
-- ============================================
-- Drop existing database if exists
DROP DATABASE IF EXISTS graph_visualizer;
-- Create fresh database
CREATE DATABASE graph_visualizer;
USE graph_visualizer;
-- ============================================
-- Users Table
-- ============================================
CREATE TABLE users (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
email VARCHAR(100) UNIQUE NOT NULL,
password VARCHAR(255) NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE
CURRENT_TIMESTAMP,
INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- ============================================
-- Graphs Table
-- ============================================
CREATE TABLE graphs (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(255) NOT NULL,
graph_data LONGTEXT,
user_id BIGINT NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE
CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
INDEX idx_graphs_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- ============================================
-- Sample Data (Optional)
-- ============================================
-- Insert a test user (password is 'password123' encrypted with BCrypt)
INSERT INTO users (name, email, password) VALUES('Test User', 'test@test.com',
'$2a$10$Nk9XqXqXqXqXqXqXqXqXqOuOqXqXqXqXqXqXqXqXqXqXqXqXqXq');
-- Insert sample graph for test user
INSERT INTO graphs (name, graph_data, user_id) VALUES
('Sample Graph 1',
'{"nodes":[{"id":"1","label":"A","x":100,"y":100},{"id":"2","label":"B","x":200,"y":100}],"edges":[{"sou
rce":"1","target":"2","weight":5}]}', 1),
('Sample Graph 2',
'{"nodes":[{"id":"1","label":"X","x":150,"y":150},{"id":"2","label":"Y","x":250,"y":150},{"id":"3","label":
"Z","x":200,"y":250}],"edges":[{"source":"1","target":"2","weight":3},{"source":"2","target":"3","weig
ht":4},{"source":"1","target":"3","weight":6}]}', 1);
-- ============================================
-- Verify Tables
-- ============================================
SHOW TABLES;
DESCRIBE users;
DESCRIBE graphs;
-- ============================================
-- Check Sample Data
-- ============================================
SELECT * FROM users;
SELECT * FROM graphs;
-- ============================================
-- Stored Procedure Example (Optional)
-- ============================================
DELIMITER //
CREATE PROCEDURE GetUserGraphs(IN userEmail VARCHAR(100))
BEGIN
SELECT g.* FROM graphs g
JOIN users u ON g.user_id = u.id
WHERE u.email = userEmail
ORDER BY g.updated_at DESC;
END //
DELIMITER ;