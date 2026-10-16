import React from "react";
import { spring } from "remotion";
import { color, K, Pagina2, Rodar, SECO, Semana, useLocal } from "./kit2";

// Tablero de cotizaciones del IPC: cada fila "cambia de numero" cuando la voz la dice
export const Tablero: React.FC<{ s: Semana }> = ({ s }) => {
  const d = s.tablero;
  const { fps, at } = useLocal(d.inicio);
  const cab = spring({ frame: at(d.inicio + 0.2), fps, config: SECO });
  const col = { dato: 70, real: 520, esp: 760, delta: 1010 };
  return (
    <Pagina2 s={s} inicio={d.inicio} frases={d.frases} velaInicio="oso">
      <div style={{ position: "absolute", left: 70, top: 290, font: "600 24px/1.25 Mono", letterSpacing: ".14em", color: K.gris, textTransform: "uppercase", opacity: cab }}>{d.titulo}</div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 350, height: 50, borderBottom: `2px solid ${K.linea}`, font: "600 22px/1 Mono", letterSpacing: ".16em", color: K.gris, opacity: cab }}>
        <span style={{ position: "absolute", left: 0 }}>DATO</span>
        <span style={{ position: "absolute", left: col.real - 70 }}>REAL</span>
        <span style={{ position: "absolute", left: col.esp - 70 }}>ESP.</span>
        <span style={{ position: "absolute", right: 0 }}>Δ</span>
      </div>
      {d.filas.map((f, i) => {
        const fr = at(f.t);
        const sp = spring({ frame: fr, fps, config: SECO });
        const y = 420 + i * 165;
        return (
          <div key={f.dato} style={{ position: "absolute", left: 70, right: 70, top: y, height: 150, borderBottom: `2px solid ${K.linea}`, opacity: fr < 0 ? 0.18 : 1 }}>
            <div style={{ position: "absolute", left: 0, top: 46, font: "800 58px/1 Barlow", textTransform: "uppercase", translate: `${-30 * (1 - sp)}px 0` }}>{f.dato}</div>
            <div style={{ position: "absolute", left: col.real - 70, top: 30, font: "800 88px/1 Mono", color: color(f.tono) }}><Rodar valor={f.real} f={fr} semilla={f.dato} /></div>
            <div style={{ position: "absolute", left: col.esp - 70, top: 56, font: "600 40px/1 Mono", color: K.gris }}>{fr >= 0 ? f.esp : ""}</div>
            <div style={{ position: "absolute", right: 0, top: 44, padding: "10px 14px", font: "800 34px/1 Mono", color: f.tono === "oso" ? K.carbon : K.hueso, background: f.tono === "oso" ? K.oso : "transparent", border: f.tono === "oso" ? "none" : `3px solid ${K.gris}`, opacity: sp, scale: String(0.6 + 0.4 * sp) }}>
              {f.delta}
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 70, top: 1100, font: "600 22px/1 Mono", letterSpacing: ".14em", color: K.gris, textTransform: "uppercase", opacity: cab }}>{d.nota}</div>
    </Pagina2>
  );
};
