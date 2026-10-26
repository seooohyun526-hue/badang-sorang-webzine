<?php
declare(strict_types=1);

// Same-origin adapter for Apache + PHP 7.4+ with cURL.
// No DB credential is needed: existing Vercel functions retain the DB connection.
// Only trusted server environment variables can override these values for tests.
function ocean_proxy_config(): array {
    return [
        'site' => rtrim(getenv('OCEAN_SITE_ORIGIN') ?: 'https://lxwebzine.hankyung.com', '/'),
        'upstream' => rtrim(getenv('OCEAN_API_ORIGIN') ?: 'https://haenyeo-ocean-online.vercel.app', '/'),
        'path' => '/2026-1/team6/game/'
    ];
}

function ocean_proxy_json(int $status, string $message, string $code): array {
    return ['status' => $status, 'headers' => [
        'Content-Type: application/json; charset=utf-8',
        'Cache-Control: no-store', 'X-Content-Type-Options: nosniff'
    ], 'body' => json_encode(['error' => $message, 'code' => $code], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)];
}

function ocean_proxy_curl(array $request): array {
    if (!function_exists('curl_init')) throw new RuntimeException('CURL_REQUIRED');
    $handle = curl_init($request['url']);
    if ($handle === false) throw new RuntimeException('UPSTREAM_UNAVAILABLE');
    $cookies = [];
    $options = [
        CURLOPT_CUSTOMREQUEST => $request['method'],
        CURLOPT_HTTPHEADER => $request['headers'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 12,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_HEADERFUNCTION => static function ($curl, string $line) use (&$cookies): int {
            if (stripos($line, 'Set-Cookie:') === 0) $cookies[] = trim(substr($line, 11));
            return strlen($line);
        }
    ];
    if ($request['method'] === 'POST') $options[CURLOPT_POSTFIELDS] = $request['body'];
    curl_setopt_array($handle, $options);
    $body = curl_exec($handle);
    $status = (int) curl_getinfo($handle, CURLINFO_HTTP_CODE);
    $type = (string) curl_getinfo($handle, CURLINFO_CONTENT_TYPE);
    if (PHP_VERSION_ID < 80000) curl_close($handle);
    if ($body === false || $status < 100) throw new RuntimeException('UPSTREAM_UNAVAILABLE');
    return ['status' => $status, 'type' => $type, 'cookies' => $cookies, 'body' => $body];
}

function ocean_proxy_handle(array $server, array $query, string $body, ?callable $transport = null): array {
    $config = ocean_proxy_config();
    $routes = ['profile' => ['GET', 'POST'], 'session' => ['POST'], 'submit' => ['POST'],
        'leaderboard' => ['GET'], 'event-status' => ['GET'], 'event-entry' => ['POST']];
    $endpoint = $query['endpoint'] ?? '';
    if (!is_string($endpoint) || !array_key_exists($endpoint, $routes)) return ocean_proxy_json(404, '요청 경로를 확인해 주세요.', 'UNKNOWN_ENDPOINT');
    $method = $server['REQUEST_METHOD'] ?? 'GET';
    if (!in_array($method, $routes[$endpoint], true)) {
        $result = ocean_proxy_json(405, '지원하지 않는 요청입니다.', 'METHOD_NOT_ALLOWED');
        $result['headers'][] = 'Allow: ' . implode(', ', $routes[$endpoint]);
        return $result;
    }
    $origin = $server['HTTP_ORIGIN'] ?? '';
    if (($origin !== '' && $origin !== $config['site']) || ($server['HTTP_SEC_FETCH_SITE'] ?? '') === 'cross-site'
        || ($method === 'POST' && $origin !== $config['site'])) return ocean_proxy_json(403, '접근할 수 없습니다.', 'ORIGIN_REJECTED');
    if ($method === 'POST') {
        if (!preg_match('/^application\/json(?:\s*;|$)/i', $server['CONTENT_TYPE'] ?? '')) return ocean_proxy_json(415, '잘못된 요청입니다.', 'JSON_REQUIRED');
        if (strlen($body) > 2048 || (int) ($server['CONTENT_LENGTH'] ?? 0) > 2048) return ocean_proxy_json(413, '요청이 너무 큽니다.', 'BODY_TOO_LARGE');
        json_decode($body, true);
        if (json_last_error() !== JSON_ERROR_NONE) return ocean_proxy_json(400, '잘못된 요청입니다.', 'INVALID_JSON');
    }
    $headers = ['Accept: application/json'];
    foreach (explode(';', $server['HTTP_COOKIE'] ?? '') as $part) {
        $part = trim($part);
        if (preg_match('/^ocean_player=[0-9a-f-]{36}\.[0-9a-f]{64}$/D', $part)) { $headers[] = 'Cookie: ' . $part; break; }
    }
    // First validate the browser origin above, then adapt the server-to-server POST.
    if ($method === 'POST') {
        $headers[] = 'Content-Type: application/json';
        $headers[] = 'Origin: ' . $config['upstream'];
    }
    $parameters = [];
    $keys = $endpoint === 'leaderboard' ? ['metric', 'period'] : ($endpoint === 'event-status' ? ['runId'] : []);
    foreach ($keys as $key) {
        if (isset($query[$key])) {
            if (!is_string($query[$key])) return ocean_proxy_json(400, '잘못된 요청입니다.', 'INVALID_PARAMETER');
            $parameters[$key] = $query[$key];
        }
    }
    $url = $config['upstream'] . '/api/' . $endpoint . ($parameters ? '?' . http_build_query($parameters) : '');
    try {
        $send = $transport ?? 'ocean_proxy_curl';
        $upstream = $send(['url' => $url, 'method' => $method, 'headers' => $headers, 'body' => $body]);
        if (stripos($upstream['type'], 'application/json') === false) throw new RuntimeException('UPSTREAM_NOT_JSON');
        json_decode($upstream['body'], true);
        if (json_last_error() !== JSON_ERROR_NONE) throw new RuntimeException('UPSTREAM_NOT_JSON');
        $result = ['status' => (int) $upstream['status'], 'headers' => [
            'Content-Type: application/json; charset=utf-8', 'Cache-Control: no-store', 'X-Content-Type-Options: nosniff'
        ], 'body' => $upstream['body']];
        foreach ($upstream['cookies'] ?? [] as $cookie) {
            if (!preg_match('/^(ocean_player=[0-9a-f-]{36}\.[0-9a-f]{64});/i', $cookie, $match)) continue;
            $age = preg_match('/(?:^|;)\s*Max-Age=(\d+)/i', $cookie, $ageMatch) ? min(31536000, (int) $ageMatch[1]) : 31536000;
            $result['headers'][] = 'Set-Cookie: ' . $match[1] . '; Path=' . $config['path'] . '; Max-Age=' . $age . '; HttpOnly; Secure; SameSite=Strict';
        }
        return $result;
    } catch (Throwable $error) {
        $code = $error->getMessage() === 'CURL_REQUIRED' ? 'CURL_REQUIRED' : 'UPSTREAM_UNAVAILABLE';
        return ocean_proxy_json($code === 'CURL_REQUIRED' ? 503 : 502, '랭킹 서버 연결 설정을 확인해 주세요. 잠시 후 다시 시도해 주세요.', $code);
    }
}

function ocean_proxy_main(): void {
    ini_set('display_errors', '0');
    $raw = ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST' ? file_get_contents('php://input', false, null, 0, 2049) : '';
    $result = ocean_proxy_handle($_SERVER, $_GET, is_string($raw) ? $raw : '');
    http_response_code($result['status']);
    foreach ($result['headers'] as $header) header($header, stripos($header, 'Set-Cookie:') !== 0);
    echo $result['body'];
}

// Include from CLI tests without making external requests.
if (PHP_SAPI !== 'cli') ocean_proxy_main();
