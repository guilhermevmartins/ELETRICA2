CREATE TABLE IF NOT EXISTS lab_config (
    setting_key VARCHAR(100) NOT NULL PRIMARY KEY,
    setting_value VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO lab_config (setting_key, setting_value) VALUES
    ('brand_caption', 'SENAI SÃO PAULO · ELÉTRICA E AUTOMAÇÃO'),
    ('board_topline', 'SENAI SÃO PAULO / LOUSA DIGITAL')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);
