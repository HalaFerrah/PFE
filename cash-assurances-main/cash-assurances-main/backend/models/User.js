const db = require('../db');

// ============================================================
//  TABLE: user_account
// ============================================================
// CREATE TABLE SQL:
//
// CREATE TABLE user_account (
//     id                  INT UNSIGNED     NOT NULL AUTO_INCREMENT,
//     last_name           VARCHAR(80)      NOT NULL,
//     first_name          VARCHAR(80)      NOT NULL,
//     address             VARCHAR(255)     NOT NULL,
//     wilaya              VARCHAR(80)      NOT NULL,
//     postal_code         VARCHAR(10)      NOT NULL,
//     phone_number        VARCHAR(20)      NOT NULL,
//     email               VARCHAR(120)     NOT NULL UNIQUE,
//     password_hash       VARCHAR(255)     NOT NULL,
//     role                ENUM('client','agent','admin') NOT NULL DEFAULT 'client',
//     is_active           BOOLEAN          NOT NULL DEFAULT TRUE,
//     email_verified      BOOLEAN          NOT NULL DEFAULT FALSE,
//     preferred_payment   ENUM('CIB','Dahabia') DEFAULT NULL,
//     payment_token       VARCHAR(255)     DEFAULT NULL COMMENT 'Tokenized card ref - PCI-DSS',
//     created_at          DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
//     updated_at          DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//     PRIMARY KEY (id),
//     INDEX idx_email (email)
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

const User = {

  // Find user by email
  findByEmail: async (email) => {
    const [rows] = await db.execute(
      `SELECT * FROM user_account WHERE email = ? AND is_active = TRUE`,
      [email]
    );
    return rows[0] || null;
  },

  // Find user by ID
  findById: async (id) => {
    const [rows] = await db.execute(
      `SELECT id, last_name, first_name, address, wilaya, postal_code,
              phone_number, email, role, preferred_payment, created_at
       FROM user_account WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  // Create new user
  create: async ({ last_name, first_name, address, wilaya, postal_code,
                   phone_number, email, password_hash, preferred_payment }) => {
    const [result] = await db.execute(
      `INSERT INTO user_account
         (last_name, first_name, address, wilaya, postal_code,
          phone_number, email, password_hash, preferred_payment)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [last_name, first_name, address, wilaya, postal_code,
       phone_number, email, password_hash, preferred_payment || null]
    );
    return result.insertId;
  },

  // Update user info
  update: async (id, fields) => {
    const allowed = ['last_name', 'first_name', 'address', 'wilaya',
                     'postal_code', 'phone_number', 'preferred_payment', 'payment_token'];
    const setClauses = [];
    const values = [];
    for (const key of allowed) {
      if (fields[key] !== undefined) {
        setClauses.push(`${key} = ?`);
        values.push(fields[key]);
      }
    }
    if (setClauses.length === 0) return false;
    values.push(id);
    await db.execute(
      `UPDATE user_account SET ${setClauses.join(', ')} WHERE id = ?`,
      values
    );
    return true;
  },

  // Check if email already exists
  emailExists: async (email) => {
    const [rows] = await db.execute(
      `SELECT id FROM user_account WHERE email = ?`, [email]
    );
    return rows.length > 0;
  },
};

module.exports = User;
