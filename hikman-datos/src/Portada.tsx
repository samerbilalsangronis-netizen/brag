import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { K } from "./kit2";

// Portada del video de bienvenida: todo dentro de la franja 3:4 (y 240-1680) que muestra la cuadricula de Instagram
const PALABRAS = [["H", "Hermetismo"], ["I", "Integridad macro"], ["K", "Knowledge"], ["M", "Mentalidad estoica"], ["A", "Análisis fundamental"], ["N", "Navegación estratégica"]];
export const Portada: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse 110% 70% at 50% 40%, #16181c 0%, #0c0d0f 70%)", color: K.hueso }}>
    <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(242,239,233,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(242,239,233,.045) 1px, transparent 1px)", backgroundSize: "72px 72px" }} />
    <Img src={staticFile("hikman/logo-blanco.png")} style={{ position: "absolute", left: 300, top: 300, width: 480 }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 690, textAlign: "center", font: "800 210px/1 Barlow", letterSpacing: ".06em" }}>
      H<span style={{ color: K.toro }}>·</span>I<span style={{ color: K.oso }}>·</span>K<span style={{ color: K.toro }}>·</span>M<span style={{ color: K.oso }}>·</span>A<span style={{ color: K.toro }}>·</span>N
    </div>
    <div style={{ position: "absolute", left: 130, right: 130, top: 960, display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 26, columnGap: 40 }}>
      {PALABRAS.map(([l, p]) => (
        <div key={l} style={{ font: "600 30px/1.1 Mono", letterSpacing: ".06em", color: K.gris, textTransform: "uppercase" }}>
          <b style={{ color: K.hueso, marginRight: 14 }}>{l}</b>{p}
        </div>
      ))}
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1260, textAlign: "center", font: "800 92px/1 Barlow", textTransform: "uppercase" }}>
      Bienvenido, <span style={{ color: K.toro }}>inversor</span>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1400, textAlign: "center", font: "600 24px/1 Mono", letterSpacing: ".3em", color: K.gris }}>QUIÉNES SOMOS</div>
  </AbsoluteFill>
);
