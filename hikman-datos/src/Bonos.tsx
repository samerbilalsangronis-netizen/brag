import React from "react";
import { spring } from "remotion";
import { color, K, Pagina2, Rodar, SECO, Semana, useLocal } from "./kit2";

// Bonos y dolar: tres tickers de terminal
export const Bonos: React.FC<{ s: Semana }> = ({ s }) => {
  const d = s.bonos;
  const { fps, at } = useLocal(d.inicio);
  return (
    <Pagina2 s={s} inicio={d.inicio} frases={d.frases}>
      {d.filas.map((f, i) => {
        const e = spring({ frame: at(f.t), fps, config: SECO });
        const fv = at(f.tValor);
        const det = spring({ frame: at(f.tDetalle), fps, config: SECO });
        const y = 300 + i * 270;
        return (
          <div key={f.sim} style={{ position: "absolute", left: 70, right: 70, top: y, height: 250, borderBottom: `2px solid ${K.linea}`, opacity: e, translate: `${-60 * (1 - e)}px 0` }}>
            <div style={{ position: "absolute", left: 0, top: 22, font: "700 32px/1 Mono", letterSpacing: ".1em", color: K.gris }}>{f.sim}</div>
            <div style={{ position: "absolute", left: 200, top: 18, font: "800 42px/1 Barlow", textTransform: "uppercase" }}>{f.nombre}</div>
            <div style={{ position: "absolute", left: 0, top: 78, font: "800 120px/1 Mono", color: fv >= 0 ? color(f.tono) : K.gris }}>
              {fv >= 0 ? <Rodar valor={f.valor} f={fv} semilla={f.sim} /> : "—"}
              {fv >= 8 && <span style={{ fontSize: 80, marginLeft: 24 }}>{f.flecha}</span>}
            </div>
            <div style={{ position: "absolute", left: 0, top: 210, font: "600 24px/1 Mono", letterSpacing: ".12em", color: color(f.tono), textTransform: "uppercase", opacity: det }}>{f.detalle}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 70, top: 1130, font: "600 22px/1 Mono", letterSpacing: ".14em", color: K.gris, textTransform: "uppercase" }}>{d.nota}</div>
    </Pagina2>
  );
};
