-- ============================================================
--  CASH Assurances — Pleasure Boat Hull Insurance (3414)
--  Tables: user_account + boat
--  MySQL / MariaDB
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS boat;
DROP TABLE IF EXISTS user_account;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- TABLE: user_account
-- ============================================================
CREATE TABLE user_account (
    id                  INT UNSIGNED     NOT NULL AUTO_INCREMENT,

    -- Identity
    last_name           VARCHAR(80)      NOT NULL,
    first_name          VARCHAR(80)      NOT NULL,

    -- Contact
    address             VARCHAR(255)     NOT NULL,
    wilaya              VARCHAR(80)      NOT NULL,
    postal_code         VARCHAR(10)      NOT NULL,
    phone_number        VARCHAR(20)      NOT NULL,
    email               VARCHAR(120)     NOT NULL UNIQUE,

    -- Security
    password_hash       VARCHAR(255)     NOT NULL   COMMENT 'bcrypt hash',
    role                ENUM('client','agent','admin')
                                         NOT NULL DEFAULT 'client',
    is_active           BOOLEAN          NOT NULL DEFAULT TRUE,
    email_verified      BOOLEAN          NOT NULL DEFAULT FALSE,

    -- Payment
    preferred_payment   ENUM('CIB','Dahabia')
                                         DEFAULT NULL,
    payment_token       VARCHAR(255)     DEFAULT NULL
                                         COMMENT 'Tokenized card reference — PCI-DSS compliant',

    -- Timestamps
    created_at          DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP
                                         ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_email (email)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Policyholder accounts';


-- ============================================================
-- TABLE: boat
-- ============================================================
CREATE TABLE boat (
    id                      INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    user_id                 INT UNSIGNED  NOT NULL
                            COMMENT 'Owner — references user_account',

    -- Vessel identity
    boat_name               VARCHAR(120)  NOT NULL
                            COMMENT 'Name of the vessel',
    boat_type               ENUM('motorboat','sailboat')
                                          NOT NULL
                            COMMENT 'Type: motorboat or sailboat only',

    -- Technical characteristics
    engine_power_hp         DECIMAL(8,2)  NOT NULL DEFAULT 0
                            COMMENT 'Engine power in horsepower (CV)',
    construction_year       YEAR          NOT NULL
                            COMMENT 'Year the vessel was built',
    construction_materials  ENUM('steel','wood','polyester','inflatable')
                                          NOT NULL
                            COMMENT 'Hull construction material',
    gross_tonnage           DECIMAL(10,3) NOT NULL DEFAULT 0
                            COMMENT 'Gross tonnage in tonnes (Tx)',
    length_m                DECIMAL(7,2)  NOT NULL DEFAULT 0
                            COMMENT 'Length in metres',
    beam_width_m            DECIMAL(7,2)  NOT NULL DEFAULT 0
                            COMMENT 'Width / beam in metres',

    -- Insured value (in Algerian Dinars)
    total_insured_value     DECIMAL(15,2) NOT NULL
                            COMMENT 'Total Insured Value in DA (VTA — base for premium calculation)',

    -- Registration info
    registration_number     VARCHAR(50)   DEFAULT NULL
                            COMMENT 'Official vessel registration number',
    home_port               VARCHAR(100)  DEFAULT NULL
                            COMMENT 'Usual home port',

    -- Photos (stored as file paths / URLs)
    photo_main              VARCHAR(500)  DEFAULT NULL,
    photo_front             VARCHAR(500)  DEFAULT NULL,
    photo_rear              VARCHAR(500)  DEFAULT NULL,
    photo_interior          VARCHAR(500)  DEFAULT NULL,
    photo_engine            VARCHAR(500)  DEFAULT NULL,
    photo_hull              VARCHAR(500)  DEFAULT NULL,

    -- Supporting documents (scans)
    doc_ownership_title     VARCHAR(500)  DEFAULT NULL
                            COMMENT 'Vessel ownership title scan',
    doc_registration_card   VARCHAR(500)  DEFAULT NULL
                            COMMENT 'Registration card scan',

    -- Timestamps
    created_at              DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                          ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    CONSTRAINT fk_boat_user FOREIGN KEY (user_id)
        REFERENCES user_account(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_boat_user        (user_id),
    INDEX idx_boat_reg_number  (registration_number)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Insured pleasure craft — Pleasure Boat Hull product (3414)';


-- ============================================================
-- Sample data
-- ============================================================
INSERT INTO user_account
    (last_name, first_name, address, wilaya, postal_code,
     phone_number, email, password_hash, role, is_active, email_verified, preferred_payment)
VALUES
('Benali',    'Karim',   '12 Rue des Fleurs, Bab El Oued', 'Algiers', '16000',
 '0555 12 34 56', 'karim.benali@gmail.com',    '$2b$12$hashKarim',    'client', TRUE, TRUE,  'CIB'),
('Rahmani',   'Fatima',  '45 Cité Universitaire',          'Oran',    '31000',
 '0661 98 76 54', 'fatima.rahmani@yahoo.fr',   '$2b$12$hashFatima',   'client', TRUE, TRUE,  'Dahabia'),
('Bouzidi',   'Mohamed', '7 Chemin du Littoral',           'Annaba',  '23000',
 '0770 44 55 66', 'mbouzidi@hotmail.com',       '$2b$12$hashMohamed',  'client', TRUE, TRUE,  'CIB'),
('Boukhalfa', 'Nadia',   'CASH Agency — Algiers Centre',   'Algiers', '16000',
 '0213 21 63 78', 'n.boukhalfa@cash-assurances.dz', '$2b$12$agentNadia', 'agent', TRUE, TRUE, NULL),
('Messaoudi', 'Ahmed',   'CASH Head Office, Algiers',      'Algiers', '16000',
 '0213 21 47 16', 'a.messaoudi@cash-assurances.dz', '$2b$12$adminAhmed','admin', TRUE, TRUE, NULL);

INSERT INTO boat
    (user_id, boat_name, boat_type, engine_power_hp, construction_year,
     construction_materials, gross_tonnage, length_m, beam_width_m,
     total_insured_value, registration_number, home_port)
VALUES
(1, 'Mediterranean I', 'motorboat', 250.00, 2018, 'steel',      4.500,  9.50, 3.20, 12500000.00, 'ALG-16-0042', 'Sidi Fredj Marina, Algiers'),
(2, 'North Star',      'sailboat',   45.00, 2015, 'polyester',  3.200,  7.80, 2.50,  4800000.00, 'ORA-31-0117', 'Port of Mers El Kebir, Oran'),
(3, 'Blue Horizon',    'motorboat', 150.00, 2020, 'steel',      6.800, 11.20, 3.80, 18000000.00, 'ANN-23-0203', 'Port of Annaba'),
(1, 'Cap Bejaia',      'motorboat',  80.00, 2022, 'inflatable', 1.200,  5.50, 2.10,  3200000.00, 'BEJ-06-0088', 'Port of Bejaia');
