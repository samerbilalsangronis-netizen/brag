import React from "react";
import { AbsoluteFill, CalculateMetadataFunction, Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ESTANDAR, Frase, K, Rodar, SECO, color } from "./kit2";

// Resumen PMI "Toro vs. Oso" con graficas animadas. Todo sale de public/pmi.json (tiempos globales en segundos).
type Barra = { nombre: string; oct: number; sep: number; esp?: number; t: number; tValor: number };
type Barras = { t0: number; t1: number; titulo: string; filas: Barra[]; marca?: { i: number; texto: string; t: number }; aviso?: { texto: string; t: number } };
type Record_ = { nombre: string; desde: number; texto: string; mas?: boolean; tono: string; t: number };
type Sello = { texto: string; sub: string; t: number; tono: string; t0?: number };
type Punto = { nombre: string; sep?: number; oct: number; nota?: string; t: number; tMove: number };
type Pais = {
  codigo: string; nombre: string; inicio: number; fin: number; barras: Barras;
  records?: { t0: number; t1: number; titulo: string; filas: Record_[] }; sello?: Sello;
  puntos?: { t0: number; t1: number; titulo: string; filas: Punto[] };
  margen?: { t0: number; t1: number; tCoste: number; tPrecio: number; tAprieta: number; sello: Sello };
  racha?: { t0: number; t1: number; titulo: string; inicio: string; fin: string; meses: number; t: number; tFin: number };
  medidor?: { t0: number; t1: number; titulo: string; valor: number; meta: number; max: number; t: number };
  lista?: { t0: number; t1: number; titulo: string; filas: { texto: string; tono: string; t: number }[]; chip: { texto: string; sub: string; t: number } };
};
export type PmiDatos = {
  publicacion: string; fecha: string; fuente: string; duracion: number; escala: [number, number];
  temas: { n: number; nombre: string; inicio: number }[]; velas: { t: number; color: string }[]; balanza: [number, number][];
  frases: Frase[]; gancho: { valor: string; pais: string; v: number; t: number; fin: number }[];
  gancho_puntos: { t0: number; t1: number; filas: Punto[] };
  paises: Record<string, Pais>;
  cierre: { inicio: number; fin: number; t1: number; titulo: string; filas: { nombre: string; v: number; t: number }[]; tLogo: number };
};
type Props = { d: PmiDatos | null };

export const metaPmi: CalculateMetadataFunction<Props> = async () => {
  const d: PmiDatos = await (await fetch(staticFile("pmi.json"))).json();
  return { props: { d }, durationInFrames: Math.round(d.duracion * 30) };
};

const COND = "Barlow", MONO = "Mono";
const coma = (v: number, dec = 1) => v.toFixed(dec).replace(".", ",");
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease3 = (x: number) => 1 - Math.pow(1 - x, 3);
const easeIn3 = (x: number) => x * x * x;

// reloj compartido por todas las piezas
const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const at = (s: number) => frame - Math.round(s * fps);
  const sp = (s: number, config = SECO) => spring({ frame: at(s), fps, config });
  // entra con resorte en t0 y sale en t1 (0,25 s)
  const ventana = (t0: number, t1: number) => sp(t0, ESTANDAR) * (1 - clamp((t - (t1 - 0.25)) / 0.25));
  return { frame, fps, t, at, sp, ventana };
};

const balanzaP = (k: [number, number][], t: number) => {
  let v = k[0][1];
  for (let i = 1; i < k.length; i++) {
    if (t <= k[i][0]) break;
    const a = Math.min(1, (t - k[i][0]) / 0.7);
    const e = a < 0.5 ? 4 * a * a * a : 1 - Math.pow(-2 * a + 2, 3) / 2;
    v = v + (k[i][1] - v) * e;
  }
  return v;
};

const Titulo: React.FC<{ texto: string; top?: number }> = ({ texto, top = 440 }) => (
  <div style={{ position: "absolute", left: 70, top, font: `700 26px/1 ${MONO}`, letterSpacing: ".14em", color: K.hueso, textTransform: "uppercase" }}>
    <span style={{ color: K.gris }}>▸ </span>{texto}
  </div>
);

const SelloC: React.FC<{ s: Sello; top: number }> = ({ s, top }) => {
  const { sp, at } = useT();
  const e = sp(s.t, { damping: 11, stiffness: 260, mass: 0.6 });
  if (at(s.t) < 0) return null;
  const c = color(s.tono);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", opacity: clamp(e * 2) }}>
      <div style={{ display: "inline-block", border: `8px solid ${c}`, padding: "18px 44px 12px", rotate: "-4deg", scale: String(1.6 - 0.6 * e) }}>
        <div style={{ font: `800 130px/0.9 ${COND}`, color: c, textTransform: "uppercase" }}>{s.texto}</div>
        <div style={{ font: `700 26px/1 ${MONO}`, letterSpacing: ".14em", color: c, textTransform: "uppercase", marginTop: 10 }}>{s.sub}</div>
      </div>
    </div>
  );
};

// ---------- 1. Barras que nacen de la linea del 50 ----------
const GTOP = 540, GH = 520, GL = 150, GR = 1010;
const BarrasC: React.FC<{ b: Barras; escala: [number, number] }> = ({ b, escala }) => {
  const { t, at, sp, ventana } = useT();
  const vis = ventana(b.t0, b.t1);
  if (vis <= 0.001 && t > b.t0) return null;
  const [lo, hi] = escala;
  const y = (v: number) => GTOP + ((hi - v) / (hi - lo)) * GH;
  const n = b.filas.length;
  const paso = (GR - GL) / n;
  const ancho = Math.min(150, paso * 0.56);
  const eje = sp(b.t0 + 0.05, ESTANDAR);
  return (
    <div style={{ opacity: vis, translate: `0 ${30 * (1 - vis)}px` }}>
      <Titulo texto={b.titulo} />
      {/* rejilla de valores */}
      {[46, 48, 52, 54, 56, 58].map((v) => (
        <React.Fragment key={v}>
          <div style={{ position: "absolute", left: GL, width: (GR - GL) * eje, top: y(v), height: 1, background: "rgba(242,239,233,.08)" }} />
          <div style={{ position: "absolute", left: 66, top: y(v) - 12, font: `600 22px/1 ${MONO}`, color: K.gris, opacity: eje }}>{v}</div>
        </React.Fragment>
      ))}
      {/* zonas */}
      <div style={{ position: "absolute", right: 70, top: GTOP - 40, font: `700 20px/1 ${MONO}`, letterSpacing: ".1em", color: K.gris, opacity: eje, display: "flex", gap: 26, alignItems: "center" }}>
        <span><span style={{ display: "inline-block", width: 26, height: 18, background: K.toro, verticalAlign: "-3px", marginRight: 8 }} />OCT</span>
        <span><span style={{ display: "inline-block", width: 26, height: 18, border: "3px dashed rgba(242,239,233,.45)", verticalAlign: "-3px", marginRight: 8 }} />SEP</span>
        <span><span style={{ display: "inline-block", width: 26, height: 4, background: K.hueso, verticalAlign: "4px", marginRight: 8 }} />ESPERADO</span>
      </div>
      <div style={{ position: "absolute", right: 70, top: y(lo) - 26, font: `700 20px/1 ${MONO}`, letterSpacing: ".18em", color: K.oso, opacity: eje * 0.9 }}>▼ SE CONTRAE</div>
      {b.filas.map((f, i) => {
        const cx = GL + paso * (i + 0.5);
        const e = sp(f.t, { damping: 15, stiffness: 140, mass: 0.9 });
        const g = sp(f.t - 0.15, SECO);
        const v = 50 + (f.oct - 50) * e;
        const top = Math.min(y(v), y(50)), h = Math.abs(y(v) - y(50));
        const sube = f.oct >= 50;
        const fv = at(f.tValor);
        const ys = y(f.sep);
        const marcada = b.marca && b.marca.i === i && at(b.marca.t) >= 0;
        return (
          <React.Fragment key={f.nombre}>
            {/* septiembre: fantasma punteado */}
            <div style={{ position: "absolute", left: cx - ancho / 2 - 10, width: ancho + 20, top: Math.min(ys, y(50)), height: Math.abs(ys - y(50)), border: `3px dashed rgba(242,239,233,.32)`, opacity: g }} />
            {/* octubre */}
            <div style={{ position: "absolute", left: cx - ancho / 2, width: ancho, top, height: h, background: sube ? K.toro : K.oso, boxShadow: marcada ? `0 0 0 6px ${K.carbon}, 0 0 0 10px ${K.hueso}` : "none" }} />
            {/* esperado */}
            {f.esp != null && (
              <>
                <div style={{ position: "absolute", left: cx - ancho / 2 - 18, width: ancho + 36, top: y(f.esp) - 2, height: 4, background: K.hueso, opacity: g, scale: `${g} 1` }} />
              </>
            )}
            {/* valor */}
            <div style={{ position: "absolute", left: cx - 120, width: 240, textAlign: "center", top: (sube ? y(f.oct) : Math.min(y(50), y(f.sep))) - 88, font: `800 72px/1 ${MONO}`, color: sube ? K.toro : K.oso, letterSpacing: "-0.03em" }}>
              {fv >= 0 ? <Rodar valor={coma(f.oct)} f={fv} semilla={f.nombre} /> : null}
            </div>
            {/* nombre */}
            <div style={{ position: "absolute", left: cx - paso / 2, width: paso, textAlign: "center", top: GTOP + GH + 22, font: `800 34px/1 ${COND}`, textTransform: "uppercase", opacity: g }}>{f.nombre}<div style={{ font: `600 20px/1 ${MONO}`, color: K.gris, marginTop: 8, letterSpacing: ".06em" }}>SEP {coma(f.sep)}{f.esp != null && <><br />ESP {coma(f.esp)}</>}</div></div>
            {marcada && b.marca && (
              <div style={{ position: "absolute", left: 70, right: 70, top: GTOP + GH + 118, textAlign: "center", font: `800 40px/1 ${COND}`, color: K.hueso, textTransform: "uppercase", opacity: sp(b.marca.t) }}>
                <span style={{ color: K.gris }}>{f.nombre} · </span>{b.marca.texto}
              </div>
            )}
          </React.Fragment>
        );
      })}
      {/* linea del 50 */}
      <div style={{ position: "absolute", left: GL - 20, width: (GR - GL + 20) * eje, top: y(50) - 3, height: 6, background: K.hueso }} />
      <div style={{ position: "absolute", left: 60, top: y(50) - 16, font: `800 30px/1 ${MONO}`, color: K.hueso, opacity: eje }}>50</div>
      {b.aviso && at(b.aviso.t) >= 0 && (
        <div style={{ position: "absolute", left: 70, right: 70, top: GTOP + GH + 118, textAlign: "center", font: `800 40px/1 ${COND}`, color: K.oso, textTransform: "uppercase", opacity: sp(b.aviso.t), background: K.carbon }}>
          ▼ {b.aviso.texto}
        </div>
      )}
    </div>
  );
};

// ---------- 2. Records: barras de tiempo "desde cuando" ----------
const RecordsC: React.FC<{ r: NonNullable<Pais["records"]> }> = ({ r }) => {
  const { t, sp, ventana } = useT();
  const vis = ventana(r.t0, r.t1);
  if (vis <= 0.001 && t > r.t0) return null;
  const A = 2012, B = 2027, XL = 110, XR = 970;
  const x = (a: number) => XL + ((a - A) / (B - A)) * (XR - XL);
  const hoy = 2026.8;
  const eje = sp(r.t0 + 0.05, ESTANDAR);
  return (
    <div style={{ opacity: vis, translate: `0 ${30 * (1 - vis)}px` }}>
      <Titulo texto={r.titulo} />
      {[2012, 2014, 2016, 2018, 2020, 2022, 2024, 2026].map((a) => (
        <React.Fragment key={a}>
          <div style={{ position: "absolute", left: x(a), top: 510, width: 1, height: 640, background: "rgba(242,239,233,.08)", opacity: eje }} />
          <div style={{ position: "absolute", left: x(a) - 40, width: 80, textAlign: "center", top: 1160, font: `600 22px/1 ${MONO}`, color: K.gris, opacity: eje }}>{a}</div>
        </React.Fragment>
      ))}
      <div style={{ position: "absolute", left: x(hoy) - 2, top: 500, width: 4, height: 660, background: K.hueso, opacity: eje }} />
      <div style={{ position: "absolute", left: x(hoy) - 60, width: 120, textAlign: "center", top: 1190, font: `800 22px/1 ${MONO}`, color: K.hueso, opacity: eje }}>OCT 26</div>
      {r.filas.map((f, i) => {
        const e = sp(f.t, { damping: 18, stiffness: 90, mass: 1 });
        const a = sp(f.t - 0.1);
        const izq = hoy - (hoy - f.desde) * ease3(e);
        const top = 520 + i * 126;
        const c = color(f.tono);
        return (
          <div key={f.nombre} style={{ opacity: a }}>
            <div style={{ position: "absolute", left: x(izq), width: x(hoy) - x(izq), top: top + 46, height: 44, background: c }} />
            {f.mas && <div style={{ position: "absolute", left: x(izq) - 44, top: top + 40, font: `800 50px/1 ${COND}`, color: c, opacity: e }}>◂</div>}
            <div style={{ position: "absolute", left: 70, top, font: `800 40px/1 ${COND}`, textTransform: "uppercase" }}>{f.nombre}</div>
            <div style={{ position: "absolute", right: 1080 - x(hoy) + 16, top: top + 4, font: `700 24px/1 ${MONO}`, letterSpacing: ".06em", color: c, textTransform: "uppercase", opacity: e }}>{f.texto}</div>
          </div>
        );
      })}
    </div>
  );
};

// ---------- 3. Puntos sobre la linea del 50 (horizontal) ----------
const PuntosC: React.FC<{ p: { t0: number; t1: number; titulo?: string; filas: Punto[] }; top?: number; desde50?: boolean }> = ({ p, top = 560, desde50 }) => {
  const { t, at, sp, ventana } = useT();
  const vis = ventana(p.t0, p.t1);
  if (vis <= 0.001 && t > p.t0) return null;
  const lo = 46, hi = 59, XL = 120, XR = 960;
  const x = (v: number) => XL + ((v - lo) / (hi - lo)) * (XR - XL);
  const alto = 150 * p.filas.length + 40;
  const eje = sp(p.t0 + 0.05, ESTANDAR);
  return (
    <div style={{ opacity: vis, translate: `0 ${30 * (1 - vis)}px` }}>
      {p.titulo && <Titulo texto={p.titulo} />}
      <div style={{ position: "absolute", left: XL, width: x(50) - XL, top, height: alto * eje, background: "rgba(229,72,77,.08)" }} />
      <div style={{ position: "absolute", left: x(50), width: XR - x(50), top, height: alto * eje, background: "rgba(47,191,113,.07)" }} />
      <div style={{ position: "absolute", left: x(50) - 3, top: top - 20, width: 6, height: (alto + 40) * eje, background: K.hueso }} />
      <div style={{ position: "absolute", left: x(50) - 60, width: 120, textAlign: "center", top: top + alto + 34, font: `800 34px/1 ${MONO}`, opacity: eje }}>50</div>
      <div style={{ position: "absolute", left: XL, top: top + alto + 40, font: `700 22px/1 ${MONO}`, letterSpacing: ".16em", color: K.oso, opacity: eje }}>◂ SE CONTRAE</div>
      <div style={{ position: "absolute", right: 1080 - XR, top: top + alto + 40, font: `700 22px/1 ${MONO}`, letterSpacing: ".16em", color: K.toro, opacity: eje }}>CRECE ▸</div>
      {[48, 52, 54, 56, 58].map((v) => (
        <div key={v} style={{ position: "absolute", left: x(v) - 30, width: 60, textAlign: "center", top: top + alto + 6, font: `600 20px/1 ${MONO}`, color: K.gris, opacity: eje }}>{v}</div>
      ))}
      {p.filas.map((f, i) => {
        const a = sp(f.t);
        const m = sp(f.tMove, { damping: 14, stiffness: 120, mass: 0.9 });
        const ini = desde50 ? 50 : f.sep ?? 50;
        const v = ini + (f.oct - ini) * m;
        const cy = top + 40 + i * 150 + 60;
        const movido = at(f.tMove) >= 0;
        const c = movido ? (f.oct >= 50 ? K.toro : K.oso) : K.gris;
        return (
          <div key={f.nombre} style={{ opacity: a }}>
            <div style={{ position: "absolute", left: x(Math.min(ini, v)), width: Math.abs(x(v) - x(ini)), top: cy - 3, height: 6, background: "rgba(242,239,233,.25)" }} />
            {f.sep != null && !desde50 && <div style={{ position: "absolute", left: x(f.sep) - 16, top: cy - 16, width: 32, height: 32, borderRadius: 16, border: `4px solid ${K.gris}` }} />}
            <div style={{ position: "absolute", left: x(v) - 26, top: cy - 26, width: 52, height: 52, borderRadius: 26, background: c, boxShadow: `0 0 0 6px ${K.carbon}` }} />
            <div style={{ position: "absolute", left: 70, top: cy - 78, font: `800 40px/1 ${COND}`, textTransform: "uppercase" }}>
              {f.nombre}
              {f.nota && movido && <span style={{ font: `700 22px/1 ${MONO}`, letterSpacing: ".08em", color: K.gris, marginLeft: 18, opacity: m }}>{f.nota.toUpperCase()}</span>}
            </div>
            <div style={{ position: "absolute", right: 70, width: 200, textAlign: "right", top: cy - 84, font: `800 56px/1 ${MONO}`, color: c, letterSpacing: "-0.03em" }}>
              {movido ? <Rodar valor={coma(f.oct)} f={at(f.tMove)} semilla={f.nombre} /> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---------- 4. Margen: esquema coste vs. precio ----------
const MargenC: React.FC<{ m: NonNullable<Pais["margen"]> }> = ({ m }) => {
  const { t, sp, ventana } = useT();
  const vis = ventana(m.t0, m.t1);
  if (vis <= 0.001 && t > m.t0) return null;
  const L = 70, W = 940, top = 560;
  const coste = 0.52 + 0.3 * sp(m.tAprieta, { damping: 16, stiffness: 70, mass: 1 }) + 0.06 * sp(m.tCoste, ESTANDAR);
  const precio = sp(m.tPrecio);
  const e0 = sp(m.t0 + 0.1, ESTANDAR);
  return (
    <div style={{ opacity: vis, translate: `0 ${30 * (1 - vis)}px` }}>
      <Titulo texto="Por qué se aprietan los márgenes" />
      <div style={{ position: "absolute", left: L, top: 500, font: `600 20px/1 ${MONO}`, letterSpacing: ".14em", color: K.gris }}>ESQUEMA · NO ES UNA CIFRA</div>
      {/* precio de venta = ancho total */}
      <div style={{ position: "absolute", left: L, width: W * e0, top, height: 150, border: `4px solid ${K.hueso}` }} />
      <div style={{ position: "absolute", left: L, top: top + 168, font: `800 34px/1 ${COND}`, textTransform: "uppercase", opacity: e0 }}>Precio de venta <span style={{ color: K.gris, font: `700 22px/1 ${MONO}`, letterSpacing: ".08em", opacity: precio }}>· SE MODERA EN ALEMANIA Y FRANCIA</span></div>
      {/* coste que crece */}
      <div style={{ position: "absolute", left: L + 4, width: (W - 8) * coste * e0, top: top + 4, height: 142, background: K.oso }} />
      <div style={{ position: "absolute", left: L + 24, top: top + 50, font: `800 50px/1 ${COND}`, color: K.carbon, textTransform: "uppercase", opacity: e0 }}>Coste ▲</div>
      <div style={{ position: "absolute", left: L + (W - 8) * coste + 4, width: (W - 8) * (1 - coste), top: top + 4, height: 142, backgroundImage: `repeating-linear-gradient(45deg, rgba(47,191,113,.55) 0 10px, transparent 10px 20px)` }} />
      <div style={{ position: "absolute", left: L + (W - 8) * coste + 4, width: (W - 8) * (1 - coste), textAlign: "center", top: top - 44, font: `800 30px/1 ${COND}`, color: K.toro, textTransform: "uppercase", opacity: e0 }}>Margen</div>
      <div style={{ position: "absolute", left: L, top: top + 240, font: `700 26px/1.5 ${MONO}`, letterSpacing: ".04em", color: K.hueso, opacity: sp(m.tCoste) }}>
        <span style={{ color: K.oso }}>▲</span> COSTES DE FÁBRICA: MAYOR ALZA DESDE MAYO<br />
        <span style={{ color: K.gris }}>&nbsp;&nbsp;POR LA ENERGÍA</span>
      </div>
      <SelloC s={m.sello} top={880} />
    </div>
  );
};

// ---------- 5. Racha de empleo (Reino Unido) ----------
const RachaC: React.FC<{ r: NonNullable<Pais["racha"]> }> = ({ r }) => {
  const { t, at, sp, ventana } = useT();
  const vis = ventana(r.t0, r.t1);
  if (vis <= 0.001 && t > r.t0) return null;
  const n = r.meses + 2; // mes con subida + meses sin subida + octubre
  const col = 13, lado = 58, gap = 10, L = (1080 - (col * lado + (col - 1) * gap)) / 2, top = 600;
  return (
    <div style={{ opacity: vis, translate: `0 ${30 * (1 - vis)}px` }}>
      <Titulo texto={r.titulo} />
      {Array.from({ length: n }).map((_, i) => {
        const tc = r.t + i * 0.07;
        const e = sp(tc);
        const ultimo = i === n - 1, primero = i === 0;
        const tFin = ultimo ? sp(r.tFin, { damping: 10, stiffness: 220, mass: 0.6 }) : 1;
        const fondo = primero ? K.toro : ultimo ? (at(r.tFin) >= 0 ? K.toro : "#2a2d33") : "#2a2d33";
        return (
          <div key={i} style={{ position: "absolute", left: L + (i % col) * (lado + gap), top: top + Math.floor(i / col) * (lado + gap), width: lado, height: lado, background: fondo, opacity: e, scale: String((0.6 + 0.4 * e) * (ultimo && at(r.tFin) >= 0 ? 1 + 0.25 * (1 - tFin) : 1)) }} />
        );
      })}
      <div style={{ position: "absolute", left: L, top: top + 2 * (lado + gap) + 14, font: `700 22px/1 ${MONO}`, color: K.toro, letterSpacing: ".08em", opacity: sp(r.t) }}>▲ {r.inicio.toUpperCase()}</div>
      <div style={{ position: "absolute", right: L, top: top + 2 * (lado + gap) + 14, font: `700 22px/1 ${MONO}`, color: K.toro, letterSpacing: ".08em", opacity: sp(r.tFin) }}>{r.fin.toUpperCase()} ▲</div>
      <div style={{ position: "absolute", left: 70, right: 70, top: top + 2 * (lado + gap) + 80, textAlign: "center", font: `700 24px/1.4 ${MONO}`, color: K.gris, letterSpacing: ".06em", opacity: sp(r.t + 0.8) }}>
        <span style={{ display: "inline-block", width: 22, height: 22, background: "#2a2d33", verticalAlign: "-3px", marginRight: 10 }} />{r.meses} MESES SIN SUBIDAS
        <span style={{ display: "inline-block", width: 22, height: 22, background: K.toro, verticalAlign: "-3px", margin: "0 10px 0 36px" }} />SUBE
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 960, textAlign: "center", font: `800 70px/1 ${COND}`, textTransform: "uppercase", opacity: sp(r.tFin + 0.2) }}>
        Primera subida en <span style={{ color: K.toro }}>2 años</span>
      </div>
    </div>
  );
};

// ---------- 6. Medidor de inflacion (Japon) ----------
const MedidorC: React.FC<{ m: NonNullable<Pais["medidor"]> }> = ({ m }) => {
  const { t, at, sp, ventana } = useT();
  const vis = ventana(m.t0, m.t1);
  if (vis <= 0.001 && t > m.t0) return null;
  const L = 70, W = 940, top = 640;
  const e = sp(m.t, { damping: 16, stiffness: 90, mass: 1 });
  const x = (v: number) => L + (v / m.max) * W;
  return (
    <div style={{ opacity: vis, translate: `0 ${30 * (1 - vis)}px` }}>
      <Titulo texto={m.titulo} />
      <div style={{ position: "absolute", left: L, width: W, top, height: 110, background: "#1d1f24" }} />
      <div style={{ position: "absolute", left: L, width: x(m.valor * e) - L, top, height: 110, background: K.toro }} />
      <div style={{ position: "absolute", left: x(m.meta) - 3, top: top - 40, width: 6, height: 190, background: K.hueso }} />
      <div style={{ position: "absolute", left: x(m.meta) - 200, width: 400, textAlign: "center", top: top + 166, font: `700 24px/1 ${MONO}`, letterSpacing: ".1em" }}>META BOJ {coma(m.meta, 0)}%</div>
      <div style={{ position: "absolute", left: L, top: top - 150, font: `800 120px/1 ${MONO}`, color: K.toro, letterSpacing: "-0.03em" }}>
        <Rodar valor={coma(m.valor) + "%"} f={at(m.t + 0.3)} semilla="cc" />
      </div>
      {[0, 1, 2, 3].map((v) => (
        <div key={v} style={{ position: "absolute", left: x(v) - 30, width: 60, textAlign: "center", top: top + 120, font: `600 20px/1 ${MONO}`, color: K.gris }}>{v}%</div>
      ))}
      <div style={{ position: "absolute", left: 70, right: 70, top: top + 240, textAlign: "center", font: `800 54px/1 ${COND}`, textTransform: "uppercase", opacity: sp(m.t + 1) }}>
        Inflación <span style={{ color: K.toro }}>persistente</span>
      </div>
    </div>
  );
};

// ---------- 7. Lista + fecha clave (Australia) ----------
const ListaC: React.FC<{ l: NonNullable<Pais["lista"]> }> = ({ l }) => {
  const { t, sp, at, ventana } = useT();
  const vis = ventana(l.t0, l.t1);
  if (vis <= 0.001 && t > l.t0) return null;
  const c = sp(l.chip.t, { damping: 11, stiffness: 240, mass: 0.6 });
  return (
    <div style={{ opacity: vis, translate: `0 ${30 * (1 - vis)}px` }}>
      <Titulo texto={l.titulo} />
      {l.filas.map((f, i) => {
        const e = sp(f.t);
        return (
          <div key={f.texto} style={{ position: "absolute", left: 70, right: 70, top: 520 + i * 130, height: 110, borderBottom: `2px solid ${K.linea}`, opacity: e, translate: `${-60 * (1 - e)}px 0`, display: "flex", alignItems: "center", gap: 26 }}>
            <div style={{ font: `800 80px/1 ${MONO}`, color: color(f.tono) }}>▲</div>
            <div style={{ font: `800 50px/1 ${COND}`, textTransform: "uppercase" }}>{f.texto}</div>
          </div>
        );
      })}
      {at(l.chip.t) >= 0 && (
        <div style={{ position: "absolute", left: 140, right: 140, top: 860, height: 260, border: `5px solid ${K.hueso}`, textAlign: "center", opacity: clamp(c * 2), scale: String(1.3 - 0.3 * c) }}>
          <div style={{ font: `700 24px/1 ${MONO}`, letterSpacing: ".16em", color: K.gris, marginTop: 34 }}>{l.chip.sub.toUpperCase()}</div>
          <div style={{ font: `800 130px/1 ${COND}`, marginTop: 16 }}>28.10</div>
          <div style={{ font: `800 36px/1 ${COND}`, textTransform: "uppercase", color: K.hueso }}>IPC de Australia</div>
        </div>
      )}
    </div>
  );
};

// ---------- Cierre: ranking divergente desde el 50 ----------
const RankingC: React.FC<{ c: PmiDatos["cierre"] }> = ({ c }) => {
  const { t, at, sp, ventana } = useT();
  const vis = ventana(c.inicio + 0.2, c.t1);
  if (vis <= 0.001 && t > c.inicio) return null;
  const lo = 46, hi = 59, XL = 260, XR = 930;
  const x = (v: number) => XL + ((v - lo) / (hi - lo)) * (XR - XL);
  const eje = sp(c.inicio + 0.25, ESTANDAR);
  return (
    <div style={{ opacity: vis, translate: `0 ${30 * (1 - vis)}px` }}>
      <Titulo texto={c.titulo} />
      <div style={{ position: "absolute", left: x(50) - 3, top: 500, width: 6, height: 700 * eje, background: K.hueso }} />
      <div style={{ position: "absolute", left: x(50) - 50, width: 100, textAlign: "center", top: 1210, font: `800 30px/1 ${MONO}`, opacity: eje }}>50</div>
      {c.filas.map((f, i) => {
        const e = sp(f.t, { damping: 15, stiffness: 130, mass: 0.9 });
        const v = 50 + (f.v - 50) * e;
        const top = 530 + i * 132;
        const sube = f.v >= 50;
        return (
          <div key={f.nombre} style={{ opacity: sp(f.t - 0.1) }}>
            <div style={{ position: "absolute", left: 70, top: top + 22, font: `800 64px/1 ${COND}` }}>{f.nombre}</div>
            <div style={{ position: "absolute", left: Math.min(x(v), x(50)), width: Math.abs(x(v) - x(50)), top: top + 14, height: 80, background: sube ? K.toro : K.oso }} />
            <div style={{ position: "absolute", left: sube ? x(f.v) + 16 : x(50) + 16, width: 160, textAlign: "left", top: top + 26, font: `800 54px/1 ${MONO}`, color: sube ? K.toro : K.oso, letterSpacing: "-0.03em" }}>
              <Rodar valor={coma(f.v)} f={at(f.t + 0.3)} semilla={f.nombre} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---------- Gancho ----------
const Gancho: React.FC<{ d: PmiDatos }> = ({ d }) => {
  const { t, at, sp } = useT();
  return (
    <>
      {d.gancho.map((g) => {
        if (t < g.t - 0.05 || t > g.fin + 0.1) return null;
        const e = spring({ frame: at(g.t), fps: 30, config: { damping: 14, stiffness: 320, mass: 0.6 } });
        const fuera = clamp((t - g.fin) / 0.08);
        const c = g.v >= 50 ? K.toro : K.oso;
        return (
          <div key={g.valor} style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", opacity: clamp(e * 2) * (1 - fuera), scale: String((1.35 - 0.35 * e) * (1 - 0.08 * fuera)) }}>
            <div style={{ font: `800 300px/1 ${MONO}`, color: c, letterSpacing: "-0.05em" }}>{g.valor}</div>
            <div style={{ font: `700 34px/1.2 ${MONO}`, letterSpacing: ".16em", color: K.gris, textTransform: "uppercase", marginTop: 20 }}>{g.pais}</div>
            <div style={{ font: `800 46px/1 ${COND}`, color: c, textTransform: "uppercase", marginTop: 26 }}>{g.v >= 50 ? "▲ sobre 50: crece" : "▼ bajo 50: se contrae"}</div>
          </div>
        );
      })}
      {/* destello en cada golpe */}
      {d.gancho.map((g) => {
        const k = at(g.t);
        return k >= -1 && k < 5 ? <AbsoluteFill key={"b" + g.t} style={{ background: K.hueso, opacity: 0.16 * (1 - Math.max(0, k) / 5) }} /> : null;
      })}
      <PuntosC p={d.gancho_puntos} top={560} desde50 />
      {t >= 9.2 && t < 10.4 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1110, textAlign: "center", font: `800 70px/1 ${COND}`, textTransform: "uppercase", opacity: sp(9.3) * (1 - clamp((t - 10.15) / 0.2)) }}>
          Una <span style={{ color: K.toro }}>hierve</span>. Otras se <span style={{ color: K.oso }}>contraen</span>.
        </div>
      )}
    </>
  );
};

// ---------- Apertura ----------
const Apertura: React.FC = () => {
  const { t, sp, ventana } = useT();
  const vis = ventana(10.5, 19.8);
  if (t < 10.3 || t > 19.9) return null;
  const agenda = ["USD", "EUR", "GBP", "JPY", "AUD"];
  const regla = sp(14.6, ESTANDAR);
  const zonas = sp(16.9);
  const abajo = sp(17.7);
  return (
    <div style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", font: `600 28px/1 ${MONO}`, letterSpacing: ".24em", color: K.gris, opacity: sp(12.6) }}>PMI FLASH · OCTUBRE 2026</div>
      {agenda.map((a, i) => (
        <div key={a} style={{ position: "absolute", top: 360, left: 120 + i * 176, width: 140, height: 90, border: `3px solid ${K.gris}`, textAlign: "center", font: `800 54px/84px ${COND}`, opacity: sp(12.9 + i * 0.14), translate: `0 ${30 * (1 - sp(12.9 + i * 0.14))}px` }}>{a}</div>
      ))}
      {/* la regla del 50 */}
      <div style={{ position: "absolute", left: 140, right: 140, top: 560, height: 260 * zonas, background: "rgba(47,191,113,.16)", borderTop: `4px solid ${K.toro}` , opacity: zonas > 0.01 ? 1 : 0 }} />
      <div style={{ position: "absolute", left: 140, right: 140, top: 820, height: 260 * abajo, background: "rgba(229,72,77,.16)", borderBottom: `4px solid ${K.oso}` , opacity: abajo > 0.01 ? 1 : 0 }} />
      <div style={{ position: "absolute", left: 100, right: 100, top: 816, height: 8, background: K.hueso, scale: `${regla} 1` }} />
      <div style={{ position: "absolute", left: 440, width: 200, top: 766, height: 108, background: K.carbon, border: `4px solid ${K.hueso}`, textAlign: "center", font: `800 90px/100px ${MONO}`, opacity: regla, scale: String(0.7 + 0.3 * regla) }}>50</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", font: `800 76px/1 ${COND}`, color: K.toro, textTransform: "uppercase", opacity: zonas }}>▲ Crece</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 920, textAlign: "center", font: `800 76px/1 ${COND}`, color: K.oso, textTransform: "uppercase", opacity: abajo }}>▼ Se contrae</div>
    </div>
  );
};

// ---------- Cabecera de pais ----------
const Ficha: React.FC<{ p: Pais }> = ({ p }) => {
  const { t, sp } = useT();
  if (t < p.inicio || t >= p.fin) return null;
  const e = sp(p.inicio + 0.25, ESTANDAR);
  return (
    <div style={{ position: "absolute", left: 70, top: 262, opacity: e, translate: `${-60 * (1 - e)}px 0` }}>
      <div style={{ font: `800 130px/0.9 ${COND}` }}>{p.codigo}</div>
      <div style={{ font: `600 24px/1 ${MONO}`, letterSpacing: ".14em", color: K.gris, textTransform: "uppercase", marginTop: 12 }}>{p.nombre}</div>
    </div>
  );
};

export const Pmi: React.FC<Props> = ({ d }) => {
  const { t, at, sp, fps } = useT();
  if (!d) return null;
  const tema = d.temas.filter((m) => t >= m.inicio && t < d.cierre.inicio).pop();
  const p = balanzaP(d.balanza, t);
  const actual = d.frases.filter((f) => t >= f.t).pop();
  const siguiente = d.frases.find((f) => f.t > t);
  const vela = d.velas.find((v) => t >= v.t - 0.4 && t < v.t + 0.45);
  const logo = sp(d.cierre.tLogo, { damping: 14, stiffness: 120, mass: 1 });
  const finFrases = clamp((t - (d.cierre.tLogo - 0.2)) / 0.25);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 110% 70% at 50% 40%, #16181c 0%, #0c0d0f 70%)", color: K.hueso }}>
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(242,239,233,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(242,239,233,.045) 1px, transparent 1px)", backgroundSize: "72px 72px" }} />
      <div style={{ position: "absolute", left: 56, right: 56, top: 78, height: 72, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Img src={staticFile("hikman/logo-blanco.png")} style={{ height: 70 }} />
        <div style={{ textAlign: "right", font: `600 22px/1.3 ${MONO}`, letterSpacing: ".14em", color: K.gris, textTransform: "uppercase" }}>
          <b style={{ color: K.hueso, fontWeight: 700 }}>{d.publicacion}</b><br />{d.fecha}
        </div>
      </div>
      <div style={{ position: "absolute", left: 56, right: 56, top: 168, height: 2, background: K.linea }} />
      {tema && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 196, textAlign: "center", font: `600 26px/1 ${MONO}`, letterSpacing: ".16em", color: K.gris, textTransform: "uppercase" }}>
          Tema <b style={{ color: K.hueso }}>{tema.n}/{d.temas.length}</b> · {tema.nombre}
        </div>
      )}

      <div style={{ opacity: 1 - finFrases }}>
        {t < 10.5 && <Gancho d={d} />}
        <Apertura />
        {Object.values(d.paises).map((pa) => (
          <React.Fragment key={pa.codigo}>
            <Ficha p={pa} />
            {t >= pa.inicio - 0.1 && t < pa.fin + 0.1 && (
              <>
                <BarrasC b={pa.barras} escala={d.escala} />
                {pa.records && <RecordsC r={pa.records} />}
                {pa.sello && t >= (pa.sello.t0 ?? pa.sello.t) && (
                  <div style={{ opacity: sp(pa.sello.t0 ?? pa.sello.t, ESTANDAR) * (1 - clamp((t - (pa.fin - 0.3)) / 0.25)) }}>
                    <Titulo texto="Lectura Hikman" />
                    <div style={{ position: "absolute", left: 70, right: 70, top: 540, textAlign: "center", font: `800 92px/0.98 ${COND}`, textTransform: "uppercase" }}>
                      La economía <span style={{ color: K.toro }}>no frena</span><br />y los precios <span style={{ color: K.oso }}>aceleran</span>
                    </div>
                    <SelloC s={pa.sello} top={830} />
                  </div>
                )}
                {pa.puntos && <PuntosC p={pa.puntos} top={600} />}
                {pa.margen && <MargenC m={pa.margen} />}
                {pa.racha && <RachaC r={pa.racha} />}
                {pa.medidor && <MedidorC m={pa.medidor} />}
                {pa.lista && <ListaC l={pa.lista} />}
              </>
            )}
          </React.Fragment>
        ))}
        {t >= d.cierre.inicio && <RankingC c={d.cierre} />}
      </div>

      {/* frase de la voz */}
      {actual && t >= 10.5 && (() => {
        const si = sp(actual.t, ESTANDAR);
        const fuera = siguiente ? clamp((t - (siguiente.t - 0.16)) / 0.16) : 0;
        const enLogo = actual.t >= d.cierre.inicio + 4;
        return (
          <div key={actual.t} style={{ position: "absolute", left: 60, right: 60, top: enLogo ? 420 : 1290, textAlign: "center", font: `800 ${enLogo ? 96 : 80}px/0.98 ${COND}`, textTransform: "uppercase", opacity: si * (1 - fuera), translate: `0 ${50 * (1 - si) - 40 * fuera}px` }}>
            <span className={`fr-${actual.tono}`} dangerouslySetInnerHTML={{ __html: actual.html }} />
          </div>
        );
      })()}
      <style>{`.fr-oso em{font-style:normal;color:${K.oso}}.fr-toro em{font-style:normal;color:${K.toro}}.fr-neutro em{font-style:normal}`}</style>

      {/* logo final */}
      {at(d.cierre.tLogo) >= 0 && (
        <>
          <Img src={staticFile("hikman/logo-blanco.png")} style={{ position: "absolute", left: 230, top: 720, width: 620, opacity: logo, scale: String(0.75 + 0.25 * logo) }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 1410, textAlign: "center", font: `600 22px/1 ${MONO}`, letterSpacing: ".14em", color: K.gris, opacity: sp(d.cierre.tLogo + 0.5) }}>CONTENIDO EDUCATIVO · NO ES ASESORÍA FINANCIERA</div>
        </>
      )}

      {/* fuente */}
      {t >= 19.8 && at(d.cierre.tLogo) < 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1488, textAlign: "center", font: `600 18px/1 ${MONO}`, letterSpacing: ".12em", color: K.gris, textTransform: "uppercase", opacity: 0.8 }}>{d.fuente}</div>
      )}

      {/* Balanza Hikman */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1540, height: 170 }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, textAlign: "center", font: `600 20px/1 ${MONO}`, letterSpacing: ".3em", color: K.gris }}>BALANZA HIKMAN</div>
        <Img src={staticFile("hikman/toro.png")} style={{ position: "absolute", top: 34, height: 104, left: 70 }} />
        <Img src={staticFile("hikman/oso.png")} style={{ position: "absolute", top: 34, height: 104, right: 70 }} />
        <div style={{ position: "absolute", left: 200, width: 680, top: 78, height: 14, borderRadius: 7, background: `linear-gradient(90deg, ${K.toro} 0%, #3a3d43 50%, ${K.oso} 100%)` }} />
        <div style={{ position: "absolute", left: 534 + p * 340, top: 48, width: 12, height: 74, borderRadius: 6, background: K.hueso, boxShadow: "0 0 0 4px #0c0d0f" }} />
        <div style={{ position: "absolute", top: 112, left: 200, font: `600 20px/1 ${MONO}`, letterSpacing: ".2em", color: K.toro }}>TORO</div>
        <div style={{ position: "absolute", top: 112, right: 200, font: `600 20px/1 ${MONO}`, letterSpacing: ".2em", color: K.oso }}>OSO</div>
      </div>

      {/* vela: cubre antes del corte y descubre despues */}
      {vela && (() => {
        const c = vela.color === "toro" ? K.toro : K.oso;
        const antes = t < vela.t;
        const k = antes ? easeIn3(clamp((t - (vela.t - 0.32)) / 0.32)) : 1 - ease3(clamp(at(vela.t) / (0.34 * fps)));
        const mecha = antes ? easeIn3(clamp((t - (vela.t - 0.4)) / 0.2)) : 1 - ease3(clamp(at(vela.t) / (0.42 * fps)));
        return (
          <AbsoluteFill>
            <div style={{ position: "absolute", left: 536, width: 8, top: -200, bottom: -200, background: c, scale: `1 ${mecha}`, transformOrigin: antes ? "50% 100%" : "50% 0%" }} />
            <div style={{ position: "absolute", inset: 0, background: c, scale: `1 ${k}`, transformOrigin: antes ? "50% 100%" : "50% 0%" }} />
          </AbsoluteFill>
        );
      })()}
    </AbsoluteFill>
  );
};
