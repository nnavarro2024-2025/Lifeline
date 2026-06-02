import 'dotenv/config';
import mysql from 'mysql2/promise';

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'lifeline_db',
  port: Number(process.env.DB_PORT || 3306),
};

const conn = await mysql.createConnection(config);

try {
  await conn.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) NULL AFTER id');
  await conn.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) NULL AFTER first_name');

  await conn.query(`
    UPDATE users
    SET
      first_name = COALESCE(NULLIF(first_name, ''), SUBSTRING_INDEX(TRIM(name), ' ', 1)),
      last_name = COALESCE(
        NULLIF(last_name, ''),
        NULLIF(TRIM(SUBSTRING(TRIM(name), LENGTH(SUBSTRING_INDEX(TRIM(name), ' ', 1)) + 1)), ''),
        'Student'
      )
    WHERE first_name IS NULL OR first_name = '' OR last_name IS NULL OR last_name = ''
  `);

  await conn.query(`
    UPDATE users
    SET name = CONCAT(TRIM(first_name), ' ', TRIM(last_name))
    WHERE name IS NULL OR name = '' OR name <> CONCAT(TRIM(first_name), ' ', TRIM(last_name))
  `);

  await conn.query('ALTER TABLE users MODIFY first_name VARCHAR(100) NOT NULL');
  await conn.query('ALTER TABLE users MODIFY last_name VARCHAR(100) NOT NULL');

  const [rows] = await conn.query(
    'SELECT email, first_name, last_name, role FROM users WHERE email IN (?, ?) ORDER BY email ASC',
    ['student@uic.edu.ph', 'counselor@uic.edu.ph']
  );

  console.log(JSON.stringify(rows));
} finally {
  await conn.end();
}
