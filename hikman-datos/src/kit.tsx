import { loadFont } from "@remotion/fonts";
import React from "react";
import { AbsoluteFill, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// Kit Hikman Capital en Remotion: mismas medidas que tools/hikman-kit.css (Hyperframes)
loadFont({ family: "Playfair", url: staticFile("fonts/PlayfairDisplay.woff2"), weight: "400 900" });
loadFont({ family: "Playfair", url: staticFile("fonts/PlayfairDisplay-Italic.woff2"), weight: "400 900", style: "italic" });
loadFont({ family: "Oswald", url: staticFile("fonts/Oswald.woff2"), weight: "400 700" });

export const C = { navy: "#10213f", rojo: "#b3261e", verde: "#2e7d4f", tinta: "#1c1c1c", lamina: "#ede3cb", gris: "#6b5f4b" };
export const SECO = { damping: 16, stiffness: 300, mass: 0.6 };
export const ESTANDAR = { damping: 13, stiffness: 160, mass: 0.8 };
export const PESADO = { damping: 15, stiffness: 100, mass: 1.4 };

export type Frase = { t: number; texto: string; tono: "neutro" | "malo" | "bueno" };
export type Edicion = {
  publicacion: string;
  fechaCorta: string;
  ticker: { texto: string; tono: string }[];
  cifras: Cifras;
  probabilidad: Probabilidad;
};
export type Cifras = {
  inicio: number; fin: number; pagina: string; seccion: string; titulo: string; pie: string;
  grupos: { nombre: string; escala: number }[];
  filas: { etiqueta: string; grupo: string; real: number; esperado: number; t: number }[];
  sello: { texto: string; t: number };
  frases: Frase[];
};
export type Probabilidad = {
  inicio: number; fin: number; pagina: string; seccion: string; titulo: string; pie: string;
  antes: number; antesTexto: string; antesEtiqueta: string; tAntes: number;
  despues: number; despuesTexto: string; despuesEtiqueta: string; tDespues: number;
  chip: { texto: string; t: number };
  frases: Frase[];
};

// segundos globales del video -> frame local del segmento
export const useLocal = (inicio: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = (tGlobal: number) => frame - Math.round((tGlobal - inicio) * fps);
  return { frame, fps, at, tGlobal: inicio + frame / fps };
};

export const coma = (v: number) => v.toFixed(1).replace(".", ",");

const VEL = 110; // px/s, igual que HK.VEL

export const Pagina: React.FC<{
  edicion: Edicion; inicio: number; pagina: string; seccion: string; entrada?: boolean; pie: string; frases: Frase[]; children: React.ReactNode;
}> = ({ edicion, inicio, pagina, seccion, entrada, pie, frases, children }) => {
  const { frame, fps, tGlobal, at } = useLocal(inicio);
  const cab = entrada ? spring({ frame, fps, config: ESTANDAR }) : 1;
  const sec = spring({ frame, fps, config: SECO });
  const lam = spring({ frame: frame - 2, fps, config: ESTANDAR });
  let items: React.ReactNode[] = [];
  for (let k = 0; k < 6; k++)
    items = items.concat(edicion.ticker.map((it, i) => (
      <span key={`${k}-${i}`} style={{ marginRight: 44, color: it.tono === "sube" ? "#f08a78" : it.tono === "baja" ? "#6fd39a" : "#f3ead6" }}>{it.texto}</span>
    )));
  // frase actual: la ultima cuyo tiempo ya paso
  const actual = frases.filter((f) => tGlobal >= f.t).pop();
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 120% 80% at 50% 28%, #efe8d7 0%, #e1d6bf 55%, #cdbf9f 100%)" }}>
      <div style={{ position: "absolute", left: 64, right: 64, top: 112, height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", opacity: cab, translate: `0 ${-30 * (1 - cab)}px` }}>
        <span style={{ font: "900 34px/1 Playfair", color: C.navy }}>Hikman</span>
        <span style={{ font: "500 24px/1 Oswald", letterSpacing: ".3em", color: C.gris, textTransform: "uppercase" }}>{edicion.publicacion}</span>
        <span style={{ font: "500 22px/1 Oswald", letterSpacing: ".08em", color: C.gris }}>
          {edicion.fechaCorta} · <b style={{ color: C.rojo, fontWeight: 600 }}>PÁGINA {pagina}</b>
        </span>
      </div>
      <div style={{ position: "absolute", left: 64, right: 64, top: 162, height: 2, background: C.tinta, scale: `${cab} 1` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 206, textAlign: "center", font: "600 36px/1 Oswald", letterSpacing: ".18em", color: C.rojo, textTransform: "uppercase", opacity: sec, translate: `0 ${-24 * (1 - sec)}px` }}>
        — {seccion} —
      </div>
      <div style={{ position: "absolute", left: 98, top: 318, width: 884, height: 732, background: C.lamina, border: `3px solid ${C.tinta}`, boxShadow: "6px 9px 16px rgba(60,40,10,.28)", overflow: "hidden", opacity: lam, translate: `0 ${80 * (1 - lam)}px`, rotate: `${-2 * (1 - lam)}deg` }}>
        {children}
        <div style={{ position: "absolute", left: 24, right: 24, bottom: 0, height: 104, borderTop: "2px solid rgba(28,28,28,.55)", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", font: "italic 400 25px/1.3 Playfair", color: C.gris }}>{pie}</div>
      </div>
      {actual && (() => {
        const s = spring({ frame: at(actual.t), fps, config: ESTANDAR });
        return (
          <div key={actual.t} style={{ position: "absolute", left: 70, right: 70, top: 1150, textAlign: "center", font: "900 60px/1.02 Playfair", textTransform: "uppercase", letterSpacing: "-0.01em", color: actual.tono === "malo" ? C.rojo : actual.tono === "bueno" ? C.verde : C.navy, opacity: s, translate: `0 ${40 * (1 - s)}px` }}>
            {actual.texto}
          </div>
        );
      })()}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1518, height: 60, background: "#0f1d38", overflow: "hidden", translate: `0 ${entrada ? 90 * (1 - cab) : 0}px` }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 120, background: C.rojo, color: "#fff", font: "600 28px/60px Oswald", textAlign: "center", letterSpacing: ".06em", zIndex: 2 }}>EN VIVO</div>
        <div style={{ position: "absolute", left: 120, right: 0, top: 0, bottom: 0, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, top: 0, height: 60, whiteSpace: "nowrap", font: "500 30px/60px Oswald", letterSpacing: ".02em", translate: `${-tGlobal * VEL}px 0` }}>{items}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
