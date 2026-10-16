import React from "react";
import { spring } from "remotion";
import { K, Pagina2, SECO, Semana, useLocal } from "./kit2";

// Grafico de terminal: la probabilidad de subida en octubre salta tras el IPC
export const Probabilidad2: React.FC<{ s: Semana }> = ({ s }) => {
  const d = s.probabilidad;
  const { fps, at } = useLocal(d.inicio);
  const cab = spring({ frame: at(d.inicio + 0.2), fps, config: SECO });
  const a = Math.min(1, Math.max(0, at(d.tAntes) / (0.6 * fps)));
  const b = spring({ frame: at(d.tDespues), fps, config: { damping: 11, stiffness: 140, mass: 0.9 } });
  const x0 = 110, x1 = 980, xc = 690;
  const Y = (p: number) => 1080 - (p / 100) * 600;
  const lect = b > 0.05 ? Math.round(d.antes + (d.despues - d.antes) * Math.min(1, b)) : a > 0 ? Math.round(d.antes * a) : null;
  const ya = Y(d.antes), yd = Y(d.antes + (d.despues - d.antes) * b);
  return (
    <Pagina2 s={s} inicio={d.inicio} frases={d.frases} velaInicio="oso">
      <div style={{ position: "absolute", left: 70, top: 290, font: "600 24px/1.25 Mono", letterSpacing: ".14em", color: K.gris, textTransform: "uppercase", opacity: cab }}>{d.titulo}</div>
      <div style={{ position: "absolute", left: 70, top: 340, font: "800 150px/1 Mono", color: b > 0.5 ? K.oso : K.hueso, opacity: lect == null ? 0 : 1 }}>~{lect ?? 0}%</div>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {[0, 25, 50, 75, 100].map((p) => (
          <g key={p} opacity={cab}>
            <line x1={x0} x2={x1} y1={Y(p)} y2={Y(p)} stroke={K.linea} strokeWidth={2} />
            <text x={x1 + 12} y={Y(p) + 8} style={{ font: "600 22px Mono", fill: K.gris }}>{p}%</text>
          </g>
        ))}
        <line x1={xc} x2={xc} y1={Y(100)} y2={Y(0)} stroke={K.gris} strokeWidth={2} strokeDasharray="8 8" opacity={cab} />
        <text x={xc} y={Y(0) + 40} textAnchor="middle" style={{ font: "700 22px Mono", fill: K.gris, letterSpacing: ".1em" }} opacity={cab}>IPC 14.10</text>
        {a > 0 && <line x1={x0} x2={x0 + (xc - x0) * a} y1={ya} y2={ya} stroke={K.hueso} strokeWidth={8} strokeLinecap="round" />}
        {b > 0.01 && (
          <>
            <line x1={xc} x2={xc} y1={ya} y2={yd} stroke={K.oso} strokeWidth={8} strokeLinecap="round" />
            <line x1={xc} x2={xc + (x1 - xc) * Math.min(1, b)} y1={yd} y2={yd} stroke={K.oso} strokeWidth={8} strokeLinecap="round" />
            <circle cx={xc} cy={yd} r={14} fill={K.oso} />
          </>
        )}
        {a >= 1 && <text x={x0} y={ya - 22} style={{ font: "700 26px Mono", fill: K.hueso }}>ANTES · {d.antesTexto}</text>}
        {b > 0.3 && <text x={xc + 24} y={yd - 22} style={{ font: "700 26px Mono", fill: K.oso }}>DESPUÉS · {d.despuesTexto}</text>}
      </svg>
      <div style={{ position: "absolute", left: 70, top: 1160, font: "600 22px/1 Mono", letterSpacing: ".14em", color: K.gris, textTransform: "uppercase", opacity: cab }}>{d.nota}</div>
    </Pagina2>
  );
};
