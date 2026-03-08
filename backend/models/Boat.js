const db = require('../db');

// ============================================================
//  TABLE: boat
// ============================================================
// CREATE TABLE SQL:
//
// CREATE TABLE boat (
//     id                      INT UNSIGNED  NOT NULL AUTO_INCREMENT,
//     user_id                 INT UNSIGNED  NOT NULL,
//
//     -- Vessel identity
//     boat_name               VARCHAR(120)  NOT NULL,
//     boat_type               ENUM('motorboat','sailboat') NOT NULL,
//
//     -- Technical characteristics
//     engine_power_hp         DECIMAL(8,2)  NOT NULL DEFAULT 0
//                             COMMENT 'Engine power in horsepower (CV)',
//     construction_year       YEAR          NOT NULL,
//     construction_materials  ENUM('steel','wood','polyester','inflatable') NOT NULL,
//     gross_tonnage           DECIMAL(10,3) NOT NULL DEFAULT 0
//                             COMMENT 'Gross tonnage in tonnes (Tx)',
//     length_m                DECIMAL(7,2)  NOT NULL DEFAULT 0
//                             COMMENT 'Length in metres',
//     beam_width_m            DECIMAL(7,2)  NOT NULL DEFAULT 0
//                             COMMENT 'Width / beam in metres',
//
//     -- Insured value
//     total_insured_value     DECIMAL(15,2) NOT NULL
//                             COMMENT 'Total Insured Value in DA (VTA)',
//
//     -- Registration
//     registration_number     VARCHAR(50)   DEFAULT NULL,
//     home_port               VARCHAR(100)  DEFAULT NULL,
//
//     -- Photos
//     photo_main              VARCHAR(500)  DEFAULT NULL,
//     photo_front             VARCHAR(500)  DEFAULT NULL,
//     photo_rear              VARCHAR(500)  DEFAULT NULL,
//     photo_interior          VARCHAR(500)  DEFAULT NULL,
//     photo_engine            VARCHAR(500)  DEFAULT NULL,
//     photo_hull              VARCHAR(500)  DEFAULT NULL,
//
//     -- Documents
//     doc_ownership_title     VARCHAR(500)  DEFAULT NULL,
//     doc_registration_card   VARCHAR(500)  DEFAULT NULL,
//
//     created_at              DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
//     updated_at              DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//
//     PRIMARY KEY (id),
//     CONSTRAINT fk_boat_user FOREIGN KEY (user_id)
//         REFERENCES user_account(id) ON DELETE RESTRICT ON UPDATE CASCADE,
//     INDEX idx_boat_user (user_id)
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

const Boat = {

  // Get all boats for a user
  findByUser: async (userId) => {
    const [rows] = await db.execute(
      `SELECT * FROM boat WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );
    return rows;
  },

  // Get one boat (must belong to user)
  findById: async (id, userId) => {
    const [rows] = await db.execute(
      `SELECT * FROM boat WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
    return rows[0] || null;
  },

  // Create a new boat
  create: async (userId, data) => {
    const {
      boat_name, boat_type, engine_power_hp, construction_year,
      construction_materials, gross_tonnage, length_m, beam_width_m,
      total_insured_value, registration_number, home_port,
      photo_main, photo_front, photo_rear, photo_interior,
      photo_engine, photo_hull, doc_ownership_title, doc_registration_card,
    } = data;

    const [result] = await db.execute(
      `INSERT INTO boat (
         user_id, boat_name, boat_type, engine_power_hp, construction_year,
         construction_materials, gross_tonnage, length_m, beam_width_m,
         total_insured_value, registration_number, home_port,
         photo_main, photo_front, photo_rear, photo_interior,
         photo_engine, photo_hull, doc_ownership_title, doc_registration_card
       ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        userId, boat_name, boat_type, engine_power_hp, construction_year,
        construction_materials, gross_tonnage, length_m, beam_width_m,
        total_insured_value, registration_number || null, home_port || null,
        photo_main || null, photo_front || null, photo_rear || null,
        photo_interior || null, photo_engine || null, photo_hull || null,
        doc_ownership_title || null, doc_registration_card || null,
      ]
    );
    return result.insertId;
  },

  // Update a boat
  update: async (id, userId, fields) => {
    const allowed = [
      'boat_name', 'boat_type', 'engine_power_hp', 'construction_year',
      'construction_materials', 'gross_tonnage', 'length_m', 'beam_width_m',
      'total_insured_value', 'registration_number', 'home_port',
    ];
    const setClauses = [];
    const values = [];
    for (const key of allowed) {
      if (fields[key] !== undefined) {
        setClauses.push(`${key} = ?`);
        values.push(fields[key]);
      }
    }
    if (setClauses.length === 0) return false;
    values.push(id, userId);
    await db.execute(
      `UPDATE boat SET ${setClauses.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );
    return true;
  },

  // Delete a boat
  delete: async (id, userId) => {
    const [result] = await db.execute(
      `DELETE FROM boat WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
    return result.affectedRows > 0;
  },
};

module.exports = Boat;
