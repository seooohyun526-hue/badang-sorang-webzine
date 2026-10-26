import { readdir, stat, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { basePath, gameDir, externalGameUrl } from '../configuration.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = [];
async function scan(folder, prefix = '') {
  for (const item of await readdir(folder, { withFileTypes: true })) {
    const name = prefix + item.name;
    if (item.isSymbolicLink()) throw Error('Unexpected symlink: ' + name);
    if (item.isDirectory()) { if (['node_modules', '.git', 'Library', '.vercel'].includes(item.name)) throw Error('Private/cache folder in package: ' + name);await scan(folder + item.name + '/', name + '/'); }
    else {
      if (/^\.env/i.test(item.name) || /\.(?:pem|pfx|key)$/i.test(item.name)) throw Error('Private file in package: ' + name);
      if (['MANIFEST.json', 'verification.txt'].includes(name) || item.name.endsWith('.log')) continue;
      const bytes = await readFile(folder + item.name);
      if (/\.(?:js|mjs|json|md|html|txt|cs|asset|example)$/.test(name) && /(?:postgres(?:ql)?:\/\/[^\s"']+:[^\s"']+@|napi_[a-zA-Z0-9]{20,}|vercel_[a-zA-Z0-9]{20,})/.test(bytes.toString())) throw Error('Possible credential in: ' + name);
      manifest.push({ path: name, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
    }
  }
}
await scan(root);
const publicRoot = gameDir;
for (const name of ['Web.data.unityweb', 'Web.wasm.unityweb', 'Web.framework.js.unityweb', 'Web.loader.js']) if ((await stat(publicRoot + 'Build/' + name)).size < 1000) throw Error('Missing Unity build: ' + name);
for (const name of ['online.js', 'event.js']) { const text = await readFile(publicRoot + name, 'utf8'); if (text.includes("fetch('/api/")) throw Error('Root API path remains: ' + name); if (!externalGameUrl && !text.includes('window.OceanIntegration.fetchApi(path,')) throw Error('Direct API transport missing: ' + name); }
const html = await readFile(publicRoot + 'index.html', 'utf8');
if (externalGameUrl) { if (!html.includes('location.replace(' + JSON.stringify(externalGameUrl) + ')')) throw Error('Missing forward to ' + externalGameUrl); }
else if (!html.includes('<base href="' + basePath + '">')) throw Error('Missing base href');
if (/G-QS2FVTG7C1|GTM-MHKZ67TD|vercel-analytics|google-analytics\.js/.test(html)) throw Error('Old analytics was not removed');
await writeFile(root + 'MANIFEST.json', JSON.stringify({ format: 1, createdAt: new Date().toISOString(), files: manifest }, null, 2));
console.log('PASS: nested game path, 4 Unity build files, no root API calls, no old analytics injection, no private/cache files. ' + manifest.length + ' files.');
