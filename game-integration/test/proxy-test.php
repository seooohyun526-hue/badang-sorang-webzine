<?php
declare(strict_types=1);
require __DIR__ . '/../integration/api-proxy.php';

$cookie = 'ocean_player=12345678-1234-1234-1234-123456789abc.' . str_repeat('a', 64);
$site = 'https://lxwebzine.hankyung.com';
$upstream = 'https://haenyeo-ocean-online.vercel.app';
function check(bool $value, string $message): void { if (!$value) throw new RuntimeException($message); }
function fixture(array $overrides = []): array { return array_merge(['status' => 200, 'type' => 'application/json; charset=utf-8', 'cookies' => [], 'body' => '{"entries":[],"me":null}'], $overrides); }
function postServer(array $overrides = []): array { return array_merge(['REQUEST_METHOD' => 'POST', 'HTTP_ORIGIN' => 'https://lxwebzine.hankyung.com', 'CONTENT_TYPE' => 'application/json'], $overrides); }
$tests = [];
$tests['GET forwards filters and only the game cookie'] = function () use ($cookie, $upstream): void {
    $observed = null;
    $result = ocean_proxy_handle(['REQUEST_METHOD' => 'GET', 'HTTP_COOKIE' => 'webzine_login=PRIVATE; _ga=PRIVATE; ' . $cookie], ['endpoint' => 'leaderboard', 'metric' => 'score', 'period' => 'all'], '', function ($request) use (&$observed) { $observed = $request;return fixture(); });
    check($result['status'] === 200, 'GET status');
    check($observed['url'] === $upstream . '/api/leaderboard?metric=score&period=all', 'query URL');
    check(in_array('Cookie: ' . $cookie, $observed['headers'], true), 'game cookie');
    check(strpos(implode('\n', $observed['headers']), 'PRIVATE') === false, 'unrelated cookie leak');
};
$tests['POST origin and signed cookie are adapted without changing identity'] = function () use ($cookie, $upstream): void {
    $observed = null;
    $result = ocean_proxy_handle(postServer(), ['endpoint' => 'profile'], '{"nickname":"테스트해녀"}', function ($request) use (&$observed, $cookie) { $observed = $request;return fixture(['body' => '{"nickname":"테스트해녀"}', 'cookies' => [$cookie . '; Domain=vercel.app; Path=/; Max-Age=31536000']]); });
    check($result['status'] === 200, 'POST status');
    check(in_array('Origin: ' . $upstream, $observed['headers'], true), 'upstream origin');
    $header = implode('\n', $result['headers']);
    check(strpos($header, $cookie) !== false, 'cookie identity');
    check(strpos($header, 'Path=/2026-1/team6/game/;') !== false, 'scoped cookie');
    check(strpos($header, 'Domain=') === false && strpos($header, 'HttpOnly; Secure; SameSite=Strict') !== false, 'cookie attributes');
};
$tests['foreign or absent POST origins and cross-site GET are rejected'] = function (): void {
    $never = function () { throw new RuntimeException('MUST_NOT_FORWARD'); };
    foreach (['https://evil.example', 'null', ''] as $origin) check(ocean_proxy_handle(postServer(['HTTP_ORIGIN' => $origin]), ['endpoint' => 'submit'], '{}', $never)['status'] === 403, 'origin accepted');
    check(ocean_proxy_handle(['REQUEST_METHOD' => 'GET', 'HTTP_SEC_FETCH_SITE' => 'cross-site'], ['endpoint' => 'leaderboard'], '', $never)['status'] === 403, 'cross-site accepted');
};
$tests['only the six game endpoints and their supported methods are exposed'] = function (): void {
    $never = function () { throw new RuntimeException('MUST_NOT_FORWARD'); };
    foreach (['event-maintenance', '../profile', 'constructor', 'profile/extra', ['profile']] as $endpoint) check(ocean_proxy_handle(['REQUEST_METHOD' => 'GET'], ['endpoint' => $endpoint], '', $never)['status'] === 404, 'extra endpoint');
    check(ocean_proxy_handle(['REQUEST_METHOD' => 'GET'], ['endpoint' => 'submit'], '', $never)['status'] === 405, 'method');
};
$tests['JSON content and actual UTF-8 body size are validated'] = function (): void {
    $never = function () { throw new RuntimeException('MUST_NOT_FORWARD'); };
    check(ocean_proxy_handle(postServer(), ['endpoint' => 'profile'], '{', $never)['status'] === 400, 'JSON');
    check(ocean_proxy_handle(postServer(), ['endpoint' => 'profile'], json_encode(['name' => str_repeat('해', 800)], JSON_UNESCAPED_UNICODE), $never)['status'] === 413, 'body size');
    check(ocean_proxy_handle(postServer(['CONTENT_TYPE' => 'text/plain']), ['endpoint' => 'profile'], '{}', $never)['status'] === 415, 'content type');
};
$tests['upstream errors, non-JSON and unavailable cURL are distinguishable'] = function (): void {
    $duplicate = ocean_proxy_handle(postServer(), ['endpoint' => 'profile'], '{}', function () { return fixture(['status' => 409, 'body' => '{"error":"duplicate"}']); });
    check($duplicate['status'] === 409, '409 status');
    $html = ocean_proxy_handle(['REQUEST_METHOD' => 'GET'], ['endpoint' => 'leaderboard'], '', function () { return fixture(['type' => 'text/html', 'body' => '<h1>404</h1>']); });
    check($html['status'] === 502, 'HTML response');
    $missing = ocean_proxy_handle(['REQUEST_METHOD' => 'GET'], ['endpoint' => 'leaderboard'], '', function () { throw new RuntimeException('CURL_REQUIRED'); });
    check($missing['status'] === 503 && strpos($missing['body'], 'CURL_REQUIRED') !== false, 'missing cURL');
};
$tests['nickname, session and score submission retain the same cookie'] = function () use ($cookie): void {
    $observed = [];
    $transport = function ($request) use (&$observed) { $observed[] = $request;return fixture(['body' => '{"saved":true}']); };
    foreach (['profile', 'session', 'submit'] as $endpoint) {
        $result = ocean_proxy_handle(postServer(['HTTP_COOKIE' => $cookie]), ['endpoint' => $endpoint], '{}', $transport);
        check($result['status'] === 200, 'round trip failed');
    }
    check(count($observed) === 3, 'round trip size');
    foreach ($observed as $request) check(in_array('Cookie: ' . $cookie, $request['headers'], true), 'identity lost');
};
foreach ($tests as $name => $run) { $run();echo 'PASS: ' . $name . PHP_EOL; }
echo count($tests) . ' PHP tests passed. No external requests or DB writes.' . PHP_EOL;
