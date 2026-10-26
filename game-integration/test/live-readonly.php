<?php
declare(strict_types=1);
require __DIR__ . '/../integration/api-proxy.php';
$result = ocean_proxy_handle(['REQUEST_METHOD' => 'GET'], ['endpoint' => 'leaderboard', 'metric' => 'score', 'period' => 'all'], '');
$data = json_decode($result['body'], true);
if ($result['status'] !== 200 || !isset($data['entries']) || !is_array($data['entries'])) {
    fwrite(STDERR, 'Live GET failed: HTTP ' . $result['status'] . ', code=' . ($data['code'] ?? 'unknown') . PHP_EOL);
    exit(1);
}
echo 'PASS: PHP -> existing Vercel leaderboard, HTTP 200, entries=' . count($data['entries']) . '. Read-only; no DB writes.' . PHP_EOL;
