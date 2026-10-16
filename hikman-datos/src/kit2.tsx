import { loadFont } from "@remotion/fonts";
import React from "react";
import { AbsoluteFill, Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// Hikman Capital · "Toro vs. Oso" en Remotion. Mismas medidas que tools/hikman2-kit.css (Hyperframes).
loadFont({ family: "Barlow", url: staticFile("fonts/BarlowCondensed-800.woff2"), weight: "800" });
loadFont({ family: "Barlow", url: staticFile("fonts/BarlowCondensed-600.woff2"), weight: "600" });
loadFont({ family: "Mono", url: staticFile("fonts/JetBrainsMono.woff2"), weight: "400 800" });

export const K = { carbon: "#0c0d0f", hueso: "#f2efe9", gris: "#8b9098", toro: "#2fbf71", oso: "#e5484d", linea: "rgba(242,239,233,.14)" };
export const SECO = { damping: 16, stiffness: 300, mass: 0.6 };
export const ESTANDAR = { damping: 13, stiffness: 160, mass: 0.8 };
export const color = (tono: string) => (tono === "oso" ? K.oso : tono === "toro" ? K.toro : K.hueso);

export type Frase = { t: number; html: string; tono: string };
export type Semana = {
  publicacion: string; fecha: string;
  temas: { n: number; nombre: string; inicio: number }[];
  velas: { t: number; color: string }[];
  balanza: [number, number][];
  tablero: { inicio: number; fin: number; titulo: string; nota: string; frases: Frase[]; filas: { dato: string; real: string; esp: string; delta: string; tono: string; t: number }[] };
  probabilidad: { inicio: number; fin: number; titulo: string; nota: string; frases: Frase[]; antes: number; antesTexto: string; tAntes: number; despues: number; despuesTexto: string; tDespues: number };
  bonos: { inicio: number; fin: number; nota: string; frases: Frase[]; filas: { sim: string; nombre: string; valor: string; num: number; dec: number; suf: string; flecha: string; tono: string; detalle: string; t: number; tValor: number; tDetalle: number }[] };
};

// misma formula que K.balanzaP en tools/hikman2-kit.js
export const balanzaP = (s: Semana, t: number) => {
  const k = s.balanza;
  let v = k[0][1];
  for (let i = 1; i < k.length; i++) {
    if (t <= k[i][0]) break;
    const a = Math.min(1, (t - k[i][0]) / 0.7);
    const e = a < 0.5 ? 4 * a * a * a : 1 - Math.pow(-2 * a + 2, 3) / 2;
    v = v + (k[i][1] - v) * e;
  }
  return v;
};

export const useLocal = (inicio: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = (tGlobal: number) => frame - Math.round((tGlobal - inicio) * fps);
  return { frame, fps, at, tGlobal: inicio + frame / fps };
};

// cifra "de terminal": se escribe caracter a caracter con un cursor (nunca muestra cifras falsas)
export const Rodar: React.FC<{ valor: string; f: number; semilla: string }> = ({ valor, f }) => {
  if (f < 0) return null;
  const n = Math.min(valor.length, Math.floor(f / 1.5) + 1);
  return (
    <>
      {valor.slice(0, n)}
      {n < valor.length && <span style={{ opacity: 0.85 }}>▌</span>}
    </>
  );
};

export const Pagina2: React.FC<{ s: Semana; inicio: number; frases: Frase[]; velaInicio?: string; children: React.ReactNode }> = ({ s, inicio, frases, velaInicio, children }) => {
  const { fps, at, tGlobal } = useLocal(inicio);
  const tema = s.temas.filter((m) => tGlobal >= m.inicio).pop();
  const p = balanzaP(s, tGlobal);
  const actual = frases.filter((f) => tGlobal >= f.t).pop();
  const siguiente = frases.find((f) => f.t > tGlobal);
  // vela que descubre la pantalla al inicio del tramo
  const dv = velaInicio ? Math.min(1, Math.max(0, at(inicio) / (0.34 * fps))) : 1;
  const ease = (x: number) => 1 - Math.pow(1 - x, 3);
  const cv = velaInicio === "toro" ? K.toro : K.oso;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 110% 70% at 50% 40%, #16181c 0%, #0c0d0f 70%)", color: K.hueso }}>
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(242,239,233,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(242,239,233,.045) 1px, transparent 1px)", backgroundSize: "72px 72px" }} />
      <div style={{ position: "absolute", left: 56, right: 56, top: 78, height: 72, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Img src={staticFile("hikman/logo-blanco.png")} style={{ height: 70 }} />
        <div style={{ textAlign: "right", font: "600 22px/1.3 Mono", letterSpacing: ".14em", color: K.gris, textTransform: "uppercase" }}>
          <b style={{ color: K.hueso, fontWeight: 700 }}>{s.publicacion}</b><br />Semana al {s.fecha}
        </div>
      </div>
      <div style={{ position: "absolute", left: 56, right: 56, top: 168, height: 2, background: K.linea }} />
      {tema && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 196, textAlign: "center", font: "600 26px/1 Mono", letterSpacing: ".16em", color: K.gris, textTransform: "uppercase" }}>
          Tema <b style={{ color: K.hueso }}>{tema.n}/3</b> · {tema.nombre}
        </div>
      )}
      {children}
      {actual && (() => {
        const sIn = spring({ frame: at(actual.t), fps, config: ESTANDAR });
        const fuera = siguiente ? Math.min(1, Math.max(0, (tGlobal - (siguiente.t - 0.16)) / 0.16)) : 0;
        return (
          <div key={actual.t} style={{ position: "absolute", left: 60, right: 60, top: 1290, textAlign: "center", font: "800 86px/0.98 Barlow", textTransform: "uppercase", letterSpacing: ".005em", opacity: sIn * (1 - fuera), translate: `0 ${50 * (1 - sIn) - 40 * fuera}px` }}>
            <span className={`fr-${actual.tono}`} dangerouslySetInnerHTML={{ __html: actual.html }} />
          </div>
        );
      })()}
      <style>{`.fr-oso em{font-style:normal;color:${K.oso}}.fr-toro em{font-style:normal;color:${K.toro}}.fr-neutro em{font-style:normal}`}</style>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1540, height: 170 }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, textAlign: "center", font: "600 20px/1 Mono", letterSpacing: ".3em", color: K.gris }}>BALANZA HIKMAN</div>
        <Img src={staticFile("hikman/toro.png")} style={{ position: "absolute", top: 34, height: 104, left: 70 }} />
        <Img src={staticFile("hikman/oso.png")} style={{ position: "absolute", top: 34, height: 104, right: 70 }} />
        <div style={{ position: "absolute", left: 200, width: 680, top: 78, height: 14, borderRadius: 7, background: `linear-gradient(90deg, ${K.toro} 0%, #3a3d43 50%, ${K.oso} 100%)` }} />
        <div style={{ position: "absolute", left: 534 + p * 340, top: 48, width: 12, height: 74, borderRadius: 6, background: K.hueso, boxShadow: "0 0 0 4px #0c0d0f" }} />
        <div style={{ position: "absolute", top: 112, left: 200, font: "600 20px/1 Mono", letterSpacing: ".2em", color: K.toro }}>TORO</div>
        <div style={{ position: "absolute", top: 112, right: 200, font: "600 20px/1 Mono", letterSpacing: ".2em", color: K.oso }}>OSO</div>
      </div>
      {velaInicio && dv < 1 && (
        <AbsoluteFill>
          <div style={{ position: "absolute", left: 536, width: 8, top: -200, bottom: -200, background: cv, scale: `1 ${1 - ease(Math.min(1, at(inicio) / (0.42 * fps)))}`, transformOrigin: "50% 0%" }} />
          <div style={{ position: "absolute", inset: 0, background: cv, scale: `1 ${1 - ease(dv)}`, transformOrigin: "50% 0%" }} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
