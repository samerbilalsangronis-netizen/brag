import React from "react";
import { spring } from "remotion";
import { C, coma, Edicion, ESTANDAR, Pagina, SECO, useLocal } from "./kit";

// Tabla "real vs. esperado": cada fila entra cuando la voz dice su cifra (tiempos en edicion.json)
export const Cifras: React.FC<{ edicion: Edicion }> = ({ edicion }) => {
  const d = edicion.cifras;
  const { fps, at } = useLocal(d.inicio);
  const ANCHO = 430;
  const tit = spring({ frame: at(d.inicio + 0.15), fps, config: SECO });
  const sello = spring({ frame: at(d.sello.t), fps, config: SECO });
  let y = 96;
  const bloques: React.ReactNode[] = [];
  d.grupos.forEach((g) => {
    const gs = spring({ frame: at(Math.min(...d.filas.filter((f) => f.grupo === g.nombre).map((f) => f.t)) - 0.3), fps, config: SECO });
    bloques.push(
      <div key={g.nombre} style={{ position: "absolute", left: 40, right: 40, top: y, borderBottom: `2px solid ${C.tinta}`, font: "600 26px/1 Oswald", letterSpacing: ".14em", color: C.gris, textTransform: "uppercase", paddingBottom: 8, opacity: gs }}>
        {g.nombre}
      </div>,
    );
    y += 44;
    d.filas.filter((f) => f.grupo === g.nombre).forEach((f) => {
      const s = spring({ frame: at(f.t), fps, config: ESTANDAR });
      const sube = f.real > f.esperado;
      const color = sube ? C.rojo : C.navy;
      const wEsp = (f.esperado / g.escala) * ANCHO;
      const wReal = (f.real / g.escala) * ANCHO * s;
      bloques.push(
        <div key={g.nombre + f.etiqueta} style={{ position: "absolute", left: 40, right: 40, top: y, height: 84, opacity: Math.min(1, s * 2) }}>
          <div style={{ position: "absolute", left: 0, top: 22, font: "900 36px/1 Playfair", color: C.tinta }}>{f.etiqueta}</div>
          <div style={{ position: "absolute", left: 250, top: 4, width: wEsp, height: 24, border: `3px dashed ${C.navy}`, opacity: 0.75 }} />
          <div style={{ position: "absolute", left: 250, top: 36, width: wReal, height: 36, background: color }} />
          <div style={{ position: "absolute", left: 250 + ANCHO + 24, top: 28, font: "900 46px/1 Playfair", color }}>{coma(f.real * Math.min(1, s))}%</div>
          <div style={{ position: "absolute", left: 250 + wEsp + 12, top: 4, font: "500 22px/24px Oswald", color: C.gris, letterSpacing: ".04em" }}>esp. {coma(f.esperado)}%</div>
        </div>,
      );
      y += 88;
    });
    y += 14;
  });
  return (
    <Pagina edicion={edicion} inicio={d.inicio} pagina={d.pagina} seccion={d.seccion} pie={d.pie} frases={d.frases} entrada>
      <div style={{ position: "absolute", left: 40, top: 34, font: "600 30px/1 Oswald", letterSpacing: ".12em", color: C.navy, textTransform: "uppercase", opacity: tit }}>{d.titulo}</div>
      <div style={{ position: "absolute", right: 40, top: 36, display: "flex", gap: 22, alignItems: "center", font: "500 22px/1 Oswald", color: C.gris, letterSpacing: ".06em", opacity: tit }}>
        <span style={{ width: 26, height: 18, background: C.navy, display: "inline-block" }} /> REAL
        <span style={{ width: 26, height: 14, border: `3px dashed ${C.navy}`, display: "inline-block" }} /> ESPERADO
      </div>
      {bloques}
      <div style={{ position: "absolute", right: 46, top: 556, padding: "8px 20px", border: `5px solid ${C.rojo}`, color: C.rojo, font: "700 32px/1.05 Oswald", letterSpacing: ".06em", textTransform: "uppercase", opacity: sello, scale: String(2.2 - 1.2 * sello), rotate: `${-14 + 8 * sello}deg` }}>
        {d.sello.texto}
      </div>
    </Pagina>
  );
};
