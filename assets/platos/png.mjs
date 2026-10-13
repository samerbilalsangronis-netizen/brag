// Convierte cada SVG de esta carpeta en PNG 1080x1080 y arma la hoja de contacto.
// Uso: node assets/platos/png.mjs   (necesita playwright)
import { chromium } from 'playwright';
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const nombres = readdirSync(dir).filter((f) => f.endsWith('.svg')).sort();
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 1080, height: 1080 } });
for (const n of nombres) {
  // Pausa las animaciones en un fotograma bonito (vapor visible).
  const svg = readFileSync(join(dir, n), 'utf8');
  await p.setContent(`<style>html,body{margin:0;background:#14201a}*{animation-play-state:paused!important;animation-delay:-1.4s!important}</style>${svg}`);
  await p.screenshot({ path: join(dir, n.replace('.svg', '.png')) });
}
const labels = { 'shawarma-de-pollo': 'Shawarma de pollo · 22.000 COP', 'plato-de-shawarma': 'Plato de shawarma · 32.000 COP', 'hummus': 'Hummus · 14.000 COP', 'falafel': 'Falafel (6 und.) · 16.000 COP', 'combo-habibi': 'Combo Habibi · 30.000 COP', 'knafeh': 'Knafeh · 14.000 COP' };
const orden = Object.keys(labels);
const cards = orden.map((k) => `<figure><img src="data:image/png;base64,${readFileSync(join(dir, k + '.png')).toString('base64')}"><figcaption>${labels[k]}</figcaption></figure>`).join('');
await p.setViewportSize({ width: 1800, height: 1300 });
await p.goto('about:blank');
await p.setContent(`<style>body{margin:0;background:#0d1511;font:600 26px system-ui;color:#f5ecdc;padding:40px;display:grid;grid-template-columns:repeat(3,1fr);gap:30px}figure{margin:0}img{width:100%;border-radius:20px;display:block}figcaption{margin-top:12px;color:#f0c879}</style>${cards}`);
await p.waitForTimeout(500);
await p.screenshot({ path: join(dir, '..', 'hoja-platos.png'), fullPage: true });
await b.close();
console.log('ok', nombres.length);
