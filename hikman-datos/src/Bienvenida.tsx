import React from "react";
import { AbsoluteFill, CalculateMetadataFunction, Img, interpolate, random, spring, staticFile } from "remotion";
import { balanzaP, ESTANDAR, K, SECO, Semana, useLocal } from "./kit2";

// Video de bienvenida: las seis letras de H.I.K.M.A.N. (datos en public/bienvenida.json)
type Letra = { l: string; palabra: string; frase: string; visual: string; inicio: number; fin: number };
export type Bienv = { duracion: number; voz: [string, number][]; letras: Letra[]; balanza: [number, number][] };
type Props = { b: Bienv | null };

export const metaBienvenida: CalculateMetadataFunction<Props> = async () => {
  const b: Bienv = await (await fetch(staticFile("bienvenida.json"))).json();
  const ini = b.letras[0].inicio, fin = b.letras[b.letras.length - 1].fin;
  return { props: { b }, durationInFrames: Math.round((fin - ini) * 30) };
};

const MONO = "Mono", COND = "Barlow";

// --- visuales por letra (x 560-1010, y 300-860) ---
const Muro: React.FC<{ f: number; fps: number }> = ({ f, fps }) => {
  const palabras = ["PÁNICO", "EUFORIA", "RUMOR", "▲▼", "¡VENDE!", "¡COMPRA!"];
  const muro = spring({ frame: f, fps, config: SECO });
  return (
    <>
      <div style={{ position: "absolute", left: 600, top: 300, width: 16, height: 560 * muro, background: K.hueso }} />
      {palabras.map((p, i) => {
        const t0 = 8 + i * 9;
        const a = interpolate(f, [t0, t0 + 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const x = 1080 - a * 440;
        const choque = f > t0 + 16;
        return (
          <div key={p} style={{ position: "absolute", left: x, top: 330 + i * 88, font: `800 52px/1 ${COND}`, color: i % 2 ? K.toro : K.oso, opacity: f < t0 ? 0 : choque ? Math.max(0, 1 - (f - t0 - 16) / 6) : 1, scale: choque ? String(1 - Math.min(1, (f - t0 - 16) / 6) * 0.5) : "1", transformOrigin: "0% 50%" }}>
            {p}
          </div>
        );
      })}
    </>
  );
};
const Terminal: React.FC<{ f: number }> = ({ f }) => {
  const lineas = ["INFLACIÓN", "TIPOS DE INTERÉS", "EMPLEO", "CICLOS"];
  return (
    <>
      {lineas.map((l, i) => {
        const t0 = 30 + i * 10;
        const n = Math.max(0, Math.min(l.length, Math.floor((f - t0) / 1.2)));
        return (
          <div key={l} style={{ position: "absolute", left: 590, top: 360 + i * 110, font: `700 40px/1 ${MONO}`, color: K.hueso, opacity: f >= t0 ? 1 : 0 }}>
            <span style={{ color: K.toro }}>▸ </span>{l.slice(0, n)}{n < l.length && f >= t0 ? "▌" : ""}
          </div>
        );
      })}
    </>
  );
};
const Capas: React.FC<{ f: number; fps: number }> = ({ f, fps }) => {
  const capas = [{ t: "PRECIO", c: K.hueso }, { t: "FLUJOS", c: K.gris }, { t: "ESTRUCTURA", c: K.toro }];
  return (
    <>
      {capas.map((c, i) => {
        const s = spring({ frame: f - 28 - i * 12, fps, config: ESTANDAR });
        return (
          <div key={c.t} style={{ position: "absolute", left: 590, width: 420, top: 340 + i * 170, height: 140, border: `4px solid ${c.c}`, background: i === 2 ? "rgba(47,191,113,.12)" : "transparent", opacity: s, translate: `0 ${60 * (1 - s)}px`, display: "flex", alignItems: "center", justifyContent: "center", font: `800 48px/1 ${COND}`, color: c.c, letterSpacing: ".06em" }}>
            {c.t}
          </div>
        );
      })}
    </>
  );
};
const Pulso: React.FC<{ f: number }> = ({ f }) => {
  // linea que tiembla y se aplana: la calma (forma con semilla, no son datos)
  const calma = interpolate(f, [24, 66], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pts = Array.from({ length: 41 }, (_, i) => {
    const x = 580 + i * 11;
    const y = 580 + (random(`pulso-${i}`) - 0.5) * 300 * calma * Math.sin((i + f * 0.6) * 0.9);
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
      <polyline points={pts} fill="none" stroke={calma > 0.15 ? K.oso : K.toro} strokeWidth={8} strokeLinejoin="round" opacity={f > 10 ? 1 : 0} />
    </svg>
  );
};
const Verifica: React.FC<{ f: number; fps: number }> = ({ f, fps }) => {
  const filas = [{ t: "DATO OFICIAL", ok: true }, { t: "FUENTE CITADA", ok: true }, { t: "RUMOR", ok: false }];
  return (
    <>
      {filas.map((r, i) => {
        const s = spring({ frame: f - 30 - i * 12, fps, config: SECO });
        return (
          <div key={r.t} style={{ position: "absolute", left: 590, width: 420, top: 360 + i * 140, height: 110, borderBottom: `2px solid ${K.linea}`, opacity: s, font: `700 38px/110px ${MONO}`, color: r.ok ? K.hueso : K.gris, textDecoration: r.ok ? "none" : "line-through" }}>
            {r.t}
            <span style={{ position: "absolute", right: 0, color: r.ok ? K.toro : K.oso, font: `800 60px/110px ${MONO}`, scale: String(0.5 + 0.5 * s) }}>{r.ok ? "✓" : "✕"}</span>
          </div>
        );
      })}
    </>
  );
};
const Ruta: React.FC<{ f: number }> = ({ f }) => {
  // velas ilustrativas (no son cotizaciones) y una ruta que las atraviesa
  const velas = [[600, 520, 160, 1], [670, 440, 200, 1], [740, 560, 150, 0], [810, 470, 180, 1], [880, 600, 120, 0], [950, 420, 220, 1]];
  const largo = 900;
  const a = interpolate(f, [34, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
      {velas.map(([x, y, h, up], i) => (
        <g key={i} opacity={f > 8 + i * 3 ? 1 : 0}>
          <line x1={x} x2={x} y1={y - 40} y2={y + h + 40} stroke={up ? K.toro : K.oso} strokeWidth={4} />
          <rect x={x - 20} y={y} width={40} height={h} fill={up ? K.toro : K.oso} />
        </g>
      ))}
      <path d="M560 760 C 640 380, 700 760, 780 420 S 900 700, 1010 340" fill="none" stroke={K.hueso} strokeWidth={8} strokeLinecap="round" strokeDasharray={largo} strokeDashoffset={largo * (1 - a)} />
    </svg>
  );
};

export const Bienvenida: React.FC<Props> = ({ b }) => {
  const inicio = b ? b.letras[0].inicio : 0;
  const { frame, fps, tGlobal } = useLocal(inicio);
  if (!b) return null;
  const actual = b.letras.filter((x) => tGlobal >= x.inicio).pop() ?? b.letras[0];
  const idx = b.letras.indexOf(actual);
  const vozT = b.voz[4 + idx][1];
  const fl = frame - Math.round((actual.inicio - inicio) * fps); // frames desde el inicio de la letra
  const fv = (dt: number) => frame - Math.round((vozT + dt - inicio) * fps);
  const sL = spring({ frame: fl, fps, config: { damping: 14, stiffness: 180, mass: 0.9 } });
  const sW = spring({ frame: fv(0.45), fps, config: ESTANDAR });
  const sF = spring({ frame: fv(1.3), fps, config: ESTANDAR });
  const salida = interpolate(tGlobal, [actual.fin - 0.18, actual.fin], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const p = balanzaP(b as unknown as Semana, tGlobal);
  const color = idx % 2 ? K.oso : K.toro;
  const vis = actual.visual;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 110% 70% at 50% 40%, #16181c 0%, #0c0d0f 70%)", color: K.hueso }}>
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(242,239,233,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(242,239,233,.045) 1px, transparent 1px)", backgroundSize: "72px 72px" }} />
      <div style={{ position: "absolute", left: 56, right: 56, top: 78, height: 72, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Img src={staticFile("hikman/logo-blanco.png")} style={{ height: 70 }} />
        <div style={{ textAlign: "right", font: `600 22px/1.3 ${MONO}`, letterSpacing: ".14em", color: K.gris }}>
          <b style={{ color: K.hueso }}>HIKMAN CAPITAL</b><br />QUIÉNES SOMOS
        </div>
      </div>
      <div style={{ position: "absolute", left: 56, right: 56, top: 168, height: 2, background: K.linea }} />
      {/* fila de letras: la actual en blanco */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 196, textAlign: "center", font: `800 40px/1 ${MONO}`, letterSpacing: ".5em" }}>
        {b.letras.map((x, i) => (
          <span key={x.l} style={{ color: i === idx ? K.hueso : i < idx ? K.gris : "rgba(139,144,152,.35)" }}>{x.l}</span>
        ))}
      </div>
      <div style={{ opacity: 1 - salida, translate: `${-60 * salida}px 0` }}>
        <div style={{ position: "absolute", left: 60, top: 260, font: `800 640px/1 ${COND}`, color: K.hueso, clipPath: `inset(${100 * (1 - sL)}% 0 0 0)`, translate: `0 ${80 * (1 - sL)}px` }}>{actual.l}</div>
        <div style={{ position: "absolute", left: 70, top: 925, width: 120 * sL, height: 10, background: color }} />
        <div style={{ position: "absolute", left: 66, right: 60, top: 965, font: `800 118px/0.95 ${COND}`, textTransform: "uppercase", opacity: sW, translate: `0 ${40 * (1 - sW)}px` }}>{actual.palabra}</div>
        <div style={{ position: "absolute", left: 70, right: 60, top: actual.palabra.length > 17 ? 1200 : 1100, font: `600 64px/1.05 ${COND}`, textTransform: "uppercase", color: K.gris, opacity: sF, translate: `0 ${30 * (1 - sF)}px` }}>{actual.frase}</div>
        {vis === "muro" && <Muro f={fl} fps={fps} />}
        {vis === "terminal" && <Terminal f={fl} />}
        {vis === "capas" && <Capas f={fl} fps={fps} />}
        {vis === "pulso" && <Pulso f={fl} />}
        {vis === "verifica" && <Verifica f={fl} fps={fps} />}
        {vis === "ruta" && <Ruta f={fl} />}
      </div>
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
    </AbsoluteFill>
  );
};
