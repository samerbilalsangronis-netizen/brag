import { loadFont } from "@remotion/fonts";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Img,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

loadFont({ family: "Archivo Black", url: staticFile("fonts/ArchivoBlack.woff2") });
loadFont({ family: "Montserrat", url: staticFile("fonts/Montserrat.woff2"), weight: "100 900" });

export type Sabor = { sabor: string; color: string; empaque: string; fruta: string; beats: number };
export type CatalogoProps = {
  readonly sabores: Sabor[];
  readonly beats: number[]; // tiempos de beat (s) relativos al inicio del clip
  readonly titulo: string;
  readonly tituloBeats: number;
};

// sabores.csv -> lista de sabores (la plantilla se alimenta solo de los datos)
export const leerCSV = (txt: string): Sabor[] => {
  const [cab, ...filas] = txt.trim().split(/\r?\n/);
  const c = cab.split(",");
  return filas.map((f) => {
    const v = f.split(",");
    const o = Object.fromEntries(c.map((k, i) => [k, v[i]]));
    return { sabor: o.sabor, color: o.color, empaque: o.empaque, fruta: o.fruta, beats: Number(o.beats || 1) };
  });
};

export const calcularMetadatos: CalculateMetadataFunction<CatalogoProps> = async ({ props }) => {
  const sabores = leerCSV(await (await fetch(staticFile("sabores.csv"))).text());
  const total = props.tituloBeats + sabores.reduce((a, s) => a + s.beats, 0);
  const fin = props.beats[total];
  return { props: { ...props, sabores }, durationInFrames: Math.round(fin * 30) };
};

const SECO = { damping: 16, stiffness: 300, mass: 0.6 };
const ESTANDAR = { damping: 13, stiffness: 160, mass: 0.8 };
const PESADO = { damping: 15, stiffness: 100, mass: 1.4 };

const luminancia = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
// texto oscuro sobre fondos claros, crema sobre fondos oscuros (contraste AA)
const tinta = (hex: string) => (luminancia(hex) > 0.28 ? "#24130a" : "#fff6e3");
const ruta = (p: string) => staticFile(p.replace(/^assets\//, ""));

// Mancha organica con semilla (deterministica)
const mancha = (seed: string, cx: number, cy: number, r: number) => {
  const n = 18;
  const pts = Array.from({ length: n }, (_, k) => {
    const a = (k / n) * Math.PI * 2;
    const rr = r * (0.9 + random(`${seed}-${k}`) * 0.16) * (k % 4 === 0 ? 1.1 : 1);
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
  });
  let d = `M${(pts[0][0] + pts[n - 1][0]) / 2} ${(pts[0][1] + pts[n - 1][1]) / 2}`;
  pts.forEach((p, k) => {
    const q = pts[(k + 1) % n];
    d += ` Q${p[0]} ${p[1]} ${(p[0] + q[0]) / 2} ${(p[1] + q[1]) / 2}`;
  });
  return d + "Z";
};

const Salpicadura: React.FC<{ colores: string[]; progreso: number; seed: string }> = ({ colores, progreso, seed }) => (
  <svg viewBox="0 0 1080 1920" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
    {Array.from({ length: 14 }, (_, i) => {
      const x = (i % 4) * 360 - 60 + random(`${seed}x${i}`) * 120;
      const y = Math.floor(i / 4) * 560 + random(`${seed}y${i}`) * 200;
      const r = 430 + random(`${seed}r${i}`) * 160;
      const s = Math.max(0, Math.min(1.05, progreso * 1.25 - i * 0.012));
      return (
        <path key={i} d={mancha(`${seed}${i}`, x, y, r)} fill={colores[i % colores.length]} style={{ transformBox: "fill-box", transformOrigin: "center", scale: String(s) }} />
      );
    })}
  </svg>
);

const Tarjeta: React.FC<{ s: Sabor; desde: number; hasta: number; i: number }> = ({ s, desde, hasta, i }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - desde;
  if (frame < desde || frame >= hasta) return null;
  const entra = spring({ frame: f, fps, config: ESTANDAR });
  const nombre = spring({ frame: f, fps, config: SECO });
  const fruta = spring({ frame: f - 1, fps, config: SECO });
  const revela = interpolate(f, [0, 4], [0, 150], { extrapolateRight: "clamp" });
  const lado = i % 2 === 0 ? 1 : -1;
  const ink = tinta(s.color);
  const flota = Math.sin((frame / fps) * 3 + i) * 10;
  return (
    <AbsoluteFill style={{ clipPath: `circle(${revela}% at ${lado > 0 ? 70 : 30}% 45%)`, background: s.color }}>
      {/* luz suave detras del empaque */}
      <div style={{ position: "absolute", left: 90, top: 260, width: 900, height: 900, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,.28), rgba(255,255,255,0) 65%)" }} />
      {/* fruta ilustrada alrededor */}
      <Img src={ruta(s.fruta)} style={{ position: "absolute", width: 520, height: 520, left: lado > 0 ? 560 : 0, top: 230, rotate: `${lado * 14 * (1 - fruta)}deg`, scale: String(fruta * 1.05), translate: `${lado * 140 * (1 - fruta)}px 0` }} />
      <Img
        src={ruta(s.empaque)}
        style={{
          position: "absolute",
          left: 250,
          top: 390,
          width: 580,
          height: 760,
          objectFit: "contain",
          rotate: `${lado * (6 - 6 * entra) + lado * -3}deg`,
          translate: `${lado * 520 * (1 - entra)}px ${flota}px`,
          filter: "drop-shadow(0 40px 50px rgba(0,0,0,.35))",
        }}
      />
      <Img src={ruta(s.fruta)} style={{ position: "absolute", width: 360, height: 360, left: lado > 0 ? 30 : 690, top: 1000, rotate: `${-lado * 20 * (1 - fruta)}deg`, scale: String(fruta), translate: `${-lado * 120 * (1 - fruta)}px 0` }} />
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          top: 1330,
          fontFamily: "Archivo Black",
          fontSize: s.sabor.length > 12 ? 118 : 156,
          lineHeight: 0.98,
          color: ink,
          letterSpacing: "-0.01em",
          opacity: Math.min(1, nombre * 1.6),
          translate: `0 ${50 * (1 - nombre)}px`,
        }}
      >
        {s.sabor}
      </div>
    </AbsoluteFill>
  );
};

export const Catalogo: React.FC<CatalogoProps> = ({ sabores, beats, titulo, tituloBeats }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const F = (t: number) => Math.round(t * fps);
  // 1:1 se reencuadra (escenario 1080x1920 a escala 0,75, centrado); no se recorta
  const esc = width / height > 0.9 ? 0.75 : 1;
  const sx = (width - 1080 * esc) / 2, sy = (height - 1920 * esc) / 2;

  // tramos: titulo + un tramo por sabor, todos sobre la cuadricula de beats
  let b = tituloBeats;
  const tramos = sabores.map((s) => {
    const t = { s, desde: F(beats[b]), hasta: F(beats[b + s.beats]) };
    b += s.beats;
    return t;
  });
  const tituloIn = spring({ frame: frame - 2, fps, config: PESADO });
  const entrada = interpolate(frame, [0, 10], [1, 0], { extrapolateRight: "clamp" });
  const salida = interpolate(frame, [durationInFrames - 11, durationInFrames - 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // el color del sabor actual llena todo el cuadro (en 1:1 tambien los costados)
  const actual = tramos.filter((t) => frame >= t.desde + 4).pop();
  return (
    <AbsoluteFill style={{ background: actual ? actual.s.color : "#f2a20c" }}>
      <div style={{ position: "absolute", left: sx, top: sy, width: 1080, height: 1920, scale: String(esc), transformOrigin: "0 0" }}>
        {/* Titulo del catalogo sobre el color de mango que deja la historia */}
        {frame < F(beats[tituloBeats]) && (
          <AbsoluteFill style={{ background: "#f2a20c" }}>
            <div style={{ position: "absolute", left: 90, right: 90, top: 760, fontFamily: "Archivo Black", fontSize: 168, lineHeight: 0.95, color: "#24130a", opacity: tituloIn, translate: `0 ${90 * (1 - tituloIn)}px` }}>
              {titulo}
            </div>
            <div style={{ position: "absolute", left: 96, top: 1130, fontFamily: "Montserrat", fontWeight: 800, fontSize: 46, color: "#24130a", opacity: tituloIn }}>
              Pulpas de fruta Tierra Santa
            </div>
          </AbsoluteFill>
        )}
        {tramos.map((t, i) => (
          <Tarjeta key={t.s.sabor} s={t.s} desde={t.desde} hasta={t.hasta} i={i} />
        ))}
      </div>
      {/* entrada: la salpicadura de mango se retira; salida: salpicadura multicolor que cubre */}
      {entrada > 0 && <Salpicadura colores={["#f2a20c", "#ffc94a", "#e8740a"]} progreso={entrada} seed="in" />}
      {salida > 0 && <Salpicadura colores={["#d6263f", "#f2a20c", "#7fb04e", "#5e1f4a", "#0a2b28"]} progreso={salida} seed="out" />}
      {salida > 0.85 && <AbsoluteFill style={{ background: "#0a2b28", opacity: interpolate(salida, [0.85, 1], [0, 1]) }} />}
    </AbsoluteFill>
  );
};
