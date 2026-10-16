import React from "react";
import { spring } from "remotion";
import { C, Edicion, ESTANDAR, Pagina, PESADO, SECO, useLocal } from "./kit";

// Medidor de probabilidad de subida: la aguja va al dato "antes" y salta al "despues"
export const Probabilidad: React.FC<{ edicion: Edicion }> = ({ edicion }) => {
  const d = edicion.probabilidad;
  const { fps, at } = useLocal(d.inicio);
  const sA = spring({ frame: at(d.tAntes), fps, config: PESADO });
  const sD = spring({ frame: at(d.tDespues), fps, config: { damping: 9, stiffness: 120, mass: 1 } });
  const tit = spring({ frame: at(d.inicio + 0.15), fps, config: SECO });
  const chip = spring({ frame: at(d.chip.t), fps, config: SECO });
  const bA = spring({ frame: at(d.tAntes + 0.2), fps, config: ESTANDAR });
  const bD = spring({ frame: at(d.tDespues + 0.15), fps, config: SECO });
  const v = d.antes * sA + (d.despues - d.antes) * sD;
  const cx = 442, cy = 430, r = 290;
  const punto = (p: number, rr: number) => {
    const a = Math.PI * (1 - p / 100);
    return [cx + rr * Math.cos(a), cy - rr * Math.sin(a)];
  };
  const arco = (p0: number, p1: number) => {
    const [x0, y0] = punto(p0, r), [x1, y1] = punto(Math.max(p0 + 0.01, p1), r);
    return `M${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1}`;
  };
  const [nx, ny] = punto(v, r - 40);
  const lectura = sD > 0.5 ? d.despuesTexto : sA > 0.5 ? d.antesTexto : "";
  return (
    <Pagina edicion={edicion} inicio={d.inicio} pagina={d.pagina} seccion={d.seccion} pie={d.pie} frases={d.frases}>
      <div style={{ position: "absolute", left: 40, top: 34, font: "600 28px/1 Oswald", letterSpacing: ".1em", color: C.navy, textTransform: "uppercase", opacity: tit }}>{d.titulo}</div>
      <svg width={884} height={628} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d={arco(0, 100)} fill="none" stroke="#d6cbb0" strokeWidth={46} />
        {v > 0.2 && <path d={arco(0, v)} fill="none" stroke={C.rojo} strokeWidth={46} />}
        {[0, 25, 50, 75, 100].map((p) => {
          const [x, y] = punto(p, r + 50);
          const [x1, y1] = punto(p, r - 26), [x2, y2] = punto(p, r + 26);
          return (
            <g key={p}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.tinta} strokeWidth={3} />
              <text x={x} y={y + 8} textAnchor="middle" style={{ font: "500 24px Oswald", fill: C.gris }}>{p}%</text>
            </g>
          );
        })}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={C.navy} strokeWidth={9} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={20} fill={C.navy} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 462, textAlign: "center", font: "900 84px/1 Playfair", color: sD > 0.5 ? C.rojo : C.navy }}>{lectura}</div>
      <div style={{ position: "absolute", left: 40, top: 540, opacity: bA, translate: `${-40 * (1 - bA)}px 0`, font: "600 22px/1.25 Oswald", letterSpacing: ".1em", color: C.gris, textTransform: "uppercase" }}>
        {d.antesEtiqueta}<br /><span style={{ font: "900 40px/1.1 Playfair", color: C.navy, letterSpacing: 0 }}>{d.antesTexto}</span>
      </div>
      <div style={{ position: "absolute", right: 40, top: 540, textAlign: "right", opacity: bD, translate: `${40 * (1 - bD)}px 0`, font: "600 22px/1.25 Oswald", letterSpacing: ".1em", color: C.rojo, textTransform: "uppercase" }}>
        {d.despuesEtiqueta}<br /><span style={{ font: "900 40px/1.1 Playfair", color: C.rojo, letterSpacing: 0 }}>{d.despuesTexto}</span>
      </div>
      <div style={{ position: "absolute", right: 40, top: 90, padding: "8px 16px", background: C.navy, color: "#f3ead6", font: "600 24px/1 Oswald", letterSpacing: ".1em", textTransform: "uppercase", opacity: chip, scale: String(0.6 + 0.4 * chip) }}>
        {d.chip.texto}
      </div>
    </Pagina>
  );
};
