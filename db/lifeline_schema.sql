-- LifeLine MySQL schema for XAMPP
-- Run this in phpMyAdmin or with the MySQL console.

CREATE DATABASE IF NOT EXISTS lifeline_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE lifeline_db;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'counselor') NOT NULL DEFAULT 'student',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migration safety for existing databases created before first_name/last_name was added.
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) NULL AFTER id;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) NULL AFTER first_name;

UPDATE users
SET
  first_name = COALESCE(NULLIF(first_name, ''), SUBSTRING_INDEX(TRIM(name), ' ', 1)),
  last_name = COALESCE(
    NULLIF(last_name, ''),
    NULLIF(TRIM(SUBSTRING(TRIM(name), LENGTH(SUBSTRING_INDEX(TRIM(name), ' ', 1)) + 1)), ''),
    'Student'
  )
WHERE first_name IS NULL OR first_name = '' OR last_name IS NULL OR last_name = '';

UPDATE users
SET name = CONCAT(TRIM(first_name), ' ', TRIM(last_name))
WHERE name IS NULL OR name = '' OR name <> CONCAT(TRIM(first_name), ' ', TRIM(last_name));

ALTER TABLE users MODIFY first_name VARCHAR(100) NOT NULL;
ALTER TABLE users MODIFY last_name VARCHAR(100) NOT NULL;

CREATE TABLE IF NOT EXISTS chat_sessions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  nickname VARCHAR(150) NOT NULL,
  real_student_name VARCHAR(150) NOT NULL,
  student_email VARCHAR(255) NOT NULL,
  is_anonymous TINYINT(1) NOT NULL DEFAULT 1,
  revealed_real_name TINYINT(1) NOT NULL DEFAULT 0,
  risk_level ENUM('low', 'moderate', 'high') NOT NULL DEFAULT 'low',
  status ENUM('active', 'resolved') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_chat_sessions_user_id (user_id),
  KEY idx_chat_sessions_status (status),
  KEY idx_chat_sessions_risk_level (risk_level),
  KEY idx_chat_sessions_last_message_at (last_message_at),
  CONSTRAINT fk_chat_sessions_user_id
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS messages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  session_id INT UNSIGNED NOT NULL,
  sender ENUM('student', 'counselor') NOT NULL,
  content TEXT NOT NULL,
  risk_level ENUM('low', 'moderate', 'high') NOT NULL DEFAULT 'low',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_messages_session_id (session_id),
  KEY idx_messages_created_at (created_at),
  CONSTRAINT fk_messages_session_id
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Demo users for fresh local setup.
-- Credentials:
-- student@uic.edu.ph / student123
-- counselor@uic.edu.ph / counselor123
INSERT INTO users (first_name, last_name, name, email, password_hash, role) VALUES
('Demo', 'Student', 'Demo Student', 'student@uic.edu.ph', '$2a$10$0Dhh.67V7z40.KOhFbBgj.oWtSnQ9Rhn7Qu0g7Bkg6aA0NL5DKfOy', 'student'),
('Demo', 'Counselor', 'Demo Counselor', 'counselor@uic.edu.ph', '$2a$10$NvgTlh/nxj247B4qXYNEKOVCLnTDqEATKSghTcuPFvBbyuSl4eS9m', 'counselor')
ON DUPLICATE KEY UPDATE
  first_name = VALUES(first_name),
  last_name = VALUES(last_name),
  name = VALUES(name),
  password_hash = VALUES(password_hash),
  role = VALUES(role);
