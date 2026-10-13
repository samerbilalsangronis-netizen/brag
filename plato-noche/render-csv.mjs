// Renderiza un video "Plato de la noche" por cada fila de datos.csv.
// Uso: node render-csv.mjs [carpeta-salida]   (por defecto ../out/plato-noche)
import { execFileSync } from "node:child_process";
import { readFileSync, mkdirSync } from "node:fs";

const out = process.argv[2] || "../out/plato-noche";
mkdirSync(out, { recursive: true });
const [cab, ...filas] = readFileSync("datos.csv", "utf8").trim().split(/\r?\n/);
const campos = cab.split(",");
for (const fila of filas) {
  const v = fila.split(",");
  const props = Object.fromEntries(campos.map((c, i) => [c, /^\d+$/.test(v[i]) ? Number(v[i]) : v[i]]));
  const archivo = `${out}/plato-noche-${props.ilustracion}.mp4`;
  const t0 = Date.now();
  execFileSync("npx", ["remotion", "render", "PlatoNoche", archivo, `--props=${JSON.stringify(props)}`, "--log=error"], { stdio: "inherit" });
  console.log(`${archivo}  ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}
