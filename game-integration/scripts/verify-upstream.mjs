// Read-only verification. Does not create players, sessions, scores or entries.
import { handleGameApi } from '../server/game-api-proxy.mjs';
import { siteOrigin, basePath } from '../configuration.mjs';
const response = await handleGameApi(new Request(siteOrigin + basePath + 'api/leaderboard?metric=score&period=all'));
const data = await response.json();
if (!response.ok || !Array.isArray(data.entries)) throw Error('Upstream leaderboard connection failed: ' + response.status);
console.log('PASS: existing Vercel ranking API via game proxy; HTTP ' + response.status + ', entries=' + data.entries.length + '. No writes.');
