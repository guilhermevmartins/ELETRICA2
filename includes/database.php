<?php
declare(strict_types=1);

function appDatabase(): ?PDO
{
    static $connection = false;
    if ($connection !== false) {
        return $connection;
    }

    $config = require __DIR__ . '/../config/database.php';
    $dsn = sprintf('mysql:host=%s;dbname=%s;charset=%s', $config['host'], $config['database'], $config['charset']);
    try {
        $connection = new PDO($dsn, $config['username'], $config['password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (Throwable $error) {
        // O portal permanece acessível caso o banco ainda não tenha sido importado.
        $connection = null;
    }
    return $connection;
}

function appSetting(string $key, string $default): string
{
    static $settings = null;
    if ($settings === null) {
        $settings = [];
        $db = appDatabase();
        if ($db !== null) {
            try {
                foreach ($db->query('SELECT setting_key, setting_value FROM lab_config') as $row) {
                    $settings[$row['setting_key']] = $row['setting_value'];
                }
            } catch (Throwable $error) {
                // Usa os valores padrão quando a tabela ainda não foi criada.
            }
        }
    }
    return isset($settings[$key]) ? (string) $settings[$key] : $default;
}
