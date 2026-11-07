<?php
declare(strict_types=1);

// Counts loads of the portal only. No visitor identifier, IP or cookie is stored.
function portalAccessCount(string $directory, bool $increment): ?int
{
    $prefix = "<?php exit; ?>\n";
    $file = $directory . '/access-count.php';
    $lock = @fopen($directory . '/access-count.lock', 'c+');
    if (!$lock) return null;
    try {
        if (!flock($lock, LOCK_EX)) return null;
        $total = 0;
        if (is_file($file)) {
            $raw = @file_get_contents($file);
            if ($raw === false || !str_starts_with($raw, $prefix)) return null;
            $value = json_decode(substr($raw, strlen($prefix)), true);
            if (!is_array($value) || !is_int($value['total'] ?? null) || $value['total'] < 0) return null;
            $total = $value['total'];
        }
        if (!$increment) return $total;
        if ($total === PHP_INT_MAX) return $total;
        $total++;
        $encoded = $prefix . json_encode(['total' => $total]);
        $temp = @tempnam($directory, 'access-count-');
        if (!$temp) return null;
        if (@file_put_contents($temp, $encoded) !== strlen($encoded) || !@rename($temp, $file)) {
            @unlink($temp);
            return null;
        }
        return $total;
    } finally {
        flock($lock, LOCK_UN);
        fclose($lock);
    }
}
