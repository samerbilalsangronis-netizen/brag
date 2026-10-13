// PNG 1080x1080 de cada plato sin vapor (el vapor se anima en el video).
// Uso: node tools/png-sin-vapor.mjs <carpeta-salida>
import { chromium } from 'playwright';
import { readdirSync, readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
const src = 'assets/platos', out = process.argv[2];
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 1080, height: 1080 } });
for (const n of readdirSync(src).filter((f) => f.endsWith('.svg'))) {
  await p.setContent(`<style>html,body{margin:0}.vapor{display:none}*{animation:none!important}</style>${readFileSync(join(src, n), 'utf8')}`);
  await p.screenshot({ path: join(out, n.replace('.svg', '.png')) });
}
await b.close();
console.log('ok');
