// Graba el recorrido completo de un pedido de PRUEBA en la web de Habibis.
// Uso: node grabar.mjs <carpeta_salida> <enviar:si|no>
import { chromium } from '/home/user/brag/node_modules/playwright/index.mjs';
const out = process.argv[2]; const enviar = process.argv[3] === 'si';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
import fs from 'fs';
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
  geolocation: { latitude: 8.1335, longitude: -71.9837 }, permissions: ['geolocation'] });
fs.mkdirSync(out + '/cuadros', { recursive: true });
const lista = [];
// marca de toque: circulo dorado donde se toca (solo para la grabacion)
await ctx.addInitScript(() => {
  addEventListener('pointerdown', (e) => {
    const d = document.createElement('div');
    d.style.cssText = `position:fixed;left:${e.clientX - 22}px;top:${e.clientY - 22}px;width:44px;height:44px;border-radius:50%;background:rgba(255,201,74,.45);border:3px solid #ffc94a;z-index:2147483647;pointer-events:none;transition:transform .45s ease-out,opacity .45s ease-out`;
    document.documentElement.appendChild(d);
    requestAnimationFrame(() => { d.style.transform = 'scale(1.8)'; d.style.opacity = '0'; });
    setTimeout(() => d.remove(), 600);
  }, true);
});
const p = await ctx.newPage();
// captura cuadro a cuadro (screencast de Chrome) a resolucion completa
const cdp = await ctx.newCDPSession(p);
let n = 0;
cdp.on('Page.screencastFrame', async (f) => {
  const nombre = `c${String(n++).padStart(5, '0')}.jpg`;
  fs.writeFileSync(out + '/cuadros/' + nombre, Buffer.from(f.data, 'base64'));
  lista.push([nombre, f.metadata.timestamp]);
  try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }); } catch {}
});
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 780, maxHeight: 1688, everyNthFrame: 1 });
p.on('request', (r) => { if (r.method() !== 'GET') console.log('PETICION', r.method(), r.url().slice(0, 120)); });
const t0 = Date.now(); const marcas = [];
const marca = (n) => { marcas.push([n, (Date.now() - t0) / 1000]); console.log('MARCA', n, ((Date.now() - t0) / 1000).toFixed(2)); };
const pausa = (ms) => p.waitForTimeout(ms);
// toque visible: centra el elemento (lejos de la barra fija de abajo), espera a que quieto y toca su centro
const toque = async (loc, fija = false) => {
  if (fija) { const b0 = await loc.boundingBox(); await p.touchscreen.tap(b0.x + b0.width / 2, b0.y + b0.height / 2); return; }
  await loc.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'smooth' })); await pausa(650);
  const bb = await loc.boundingBox();
  if (!bb || bb.y + bb.height / 2 > 844 - 110) throw new Error('el toque caeria sobre la barra fija');
  await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2);
};
const escribir = async (loc, texto, delay) => { await toque(loc); await pausa(200); await loc.focus(); if ((await loc.inputValue()) === '') await loc.pressSequentially(texto, { delay }); console.log('valor', JSON.stringify(await loc.inputValue())); };
const deslizar = async (dy, pasos = 12) => { for (let i = 0; i < pasos; i++) { await p.mouse.wheel(0, dy / pasos); await pausa(35); } };

await p.goto('https://habibis-chi.vercel.app/', { waitUntil: 'networkidle' });
marca('inicio'); await pausa(1800);
await deslizar(520, 16); await pausa(900);
marca('categoria'); await toque(p.getByRole('link', { name: 'Shawarmas' }).first()); await pausa(1300);
marca('producto'); await toque(p.getByRole('button', { name: /Shawarma mixto Pollo y carne/ })); await pausa(1600);
marca('adicional'); await toque(p.getByText('Adicional de Falafel')); await pausa(900);
  await toque(p.getByText('Tomate', { exact: true })); await pausa(700);

marca('cantidad'); await toque(p.getByRole('button', { name: /^Más$|^\+$/ }).last(), true); await pausa(900);
marca('agregar'); await toque(p.getByRole('button', { name: /^Agregar/ }), true); await pausa(1300);
marca('ver-pedido'); await toque(p.getByRole('button', { name: /Ver pedido/ }), true); await pausa(1800);
marca('continuar'); await toque(p.getByRole('link', { name: 'Continuar' }), true); await p.waitForLoadState('networkidle'); await pausa(1300);
marca('datos');
await escribir(p.getByPlaceholder('¿A nombre de quién?'), 'María', 90); await pausa(300);
await escribir(p.getByPlaceholder(/0412 123 4567/), '0412 602 4425', 60); await pausa(700);
marca('entrega'); await toque(p.locator('label', { hasText: 'Agregar delivery' })); await pausa(1100);
await escribir(p.getByPlaceholder(/Urbanización/), 'Calle 5, casa 12', 55); await pausa(300);
await escribir(p.getByPlaceholder(/frente a la panadería/), 'Portón negro', 55); await pausa(500);
marca('mapa'); await toque(p.getByRole('button', { name: /Usar mi ubicación actual/ })); await pausa(2200);
marca('cuando'); await toque(p.getByRole('button', { name: /Lo antes posible/ })); await pausa(900);
marca('pago'); const ef = p.getByRole('button', { name: /Efectivo/ }); await toque(ef); await pausa(600);
  const antes = await ef.getAttribute('class'); await pausa(300);
  if ((await ef.getAttribute('class')) === antes && antes.includes('border-ink-600')) await ef.click();
  console.log('efectivo', await ef.getAttribute('class'));
  await escribir(p.getByPlaceholder('50.000'), '70.000', 70); await pausa(700);
  await pausa(500);
console.log('textareas', await p.evaluate(() => [...document.querySelectorAll('textarea,input')].map(e => e.tagName + ':' + e.placeholder + '=' + e.value).join(' | ')));
{ const ta = p.locator('textarea').last(); await toque(ta); await pausa(200); await ta.click(); await p.keyboard.type('Con bastante salsa de ajo, por favor', { delay: 40 });
  console.log('comentario', await p.evaluate(() => [...document.querySelectorAll('textarea')].pop().value)); } await pausa(900);
marca('confirmar');
const boton = p.getByRole('button', { name: /Confirmar pedido/ });
await boton.scrollIntoViewIfNeeded(); await pausa(900);
await p.screenshot({ path: out + '/antes-de-confirmar.png' });
if (enviar) {
  const bb = await boton.boundingBox(); await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2);
  await pausa(3000);
  if ((await p.evaluate(() => document.body.innerText)).includes('tasa del día se actualizó')) {
    console.log('AVISO tasa: se confirma de nuevo'); marca('reconfirmar'); await pausa(1500);
    const b2 = await boton.boundingBox(); await p.touchscreen.tap(b2.x + b2.width / 2, b2.y + b2.height / 2); await pausa(3000);
  }
  await pausa(1500); marca('resultado');
  // seguimiento en vivo: se queda en la pagina del pedido y anota cada cambio de estado
  const num = (await p.evaluate(() => document.body.innerText)).match(/HB-\d+/)?.[0] || '?';
  const log = (t) => { console.log(t); fs.appendFileSync(out + '/estado.log', t + '\n'); };
  log('PEDIDO ' + num + ' URL ' + p.url());
  const estado = async () => (await p.evaluate(() => document.body.innerText)).match(/Estado\n+([^\n]+)/)?.[1] || '';
  let ult = await estado(); log('ESTADO ' + ult + ' ' + ((Date.now() - t0) / 1000).toFixed(1));
  const limite = Date.now() + 10 * 60 * 1000;
  while (Date.now() < limite) {
    await pausa(1000);
    const e = await estado();
    if (e && e !== ult) { ult = e; marca('estado:' + e); log('ESTADO ' + e + ' ' + ((Date.now() - t0) / 1000).toFixed(1)); await p.screenshot({ path: out + '/estado-' + marcas.length + '.png' }); }
    if (/entregado/i.test(e)) { await pausa(3000); break; }
  }
  console.log('URL final', p.url());
  console.log((await p.evaluate(() => document.body.innerText)).slice(0, 1500));
  await p.screenshot({ path: out + '/resultado.png' });
  
} else { console.log('ENSAYO: no se envio'); await pausa(1200); }
marca('fin');
await cdp.send('Page.stopScreencast');
fs.writeFileSync(out + '/cuadros.json', JSON.stringify({ lista, marcas, t0: t0 / 1000 }));
await ctx.close(); await b.close();
console.log('MARCAS', JSON.stringify(marcas));
