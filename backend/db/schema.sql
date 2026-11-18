-- Library stock management schema (MySQL)
DROP DATABASE IF EXISTS library_db;
CREATE DATABASE library_db;
USE library_db;

CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  membership_id VARCHAR(30)  NOT NULL UNIQUE,
  role          ENUM('admin','member') NOT NULL DEFAULT 'member',
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE books (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  title      VARCHAR(200) NOT NULL,
  author     VARCHAR(150) NOT NULL,
  genre      VARCHAR(60)  NOT NULL,
  isbn       VARCHAR(20)  NOT NULL UNIQUE,
  quantity   INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (quantity >= 0)
);

-- every stock movement ends up here, so we can show borrowing history
CREATE TABLE transactions (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  book_id    INT NOT NULL,
  user_id    INT NULL,
  type       ENUM('restock','borrow','return') NOT NULL,
  quantity   INT NOT NULL,
  note       VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
