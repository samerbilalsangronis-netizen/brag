import React from "react";
import { AbsoluteFill, CalculateMetadataFunction, Img, spring, staticFile } from "remotion";
import { balanzaP, color, ESTANDAR, Frase, K, Rodar, SECO, Semana, useLocal } from "./kit2";

// Informe semanal por divisa (estilo "Toro vs. Oso"). Una composicion por divisa, todo sale de public/semana2.json.
type Fila = { sim: string; nombre: string; valor: string; flecha: string; tono: string; detalle: string; t: number; tValor: number; tDetalle: number; valor2?: string; t2?: number };
type Seccion = { titulo: string; t0: number; t1: number; filas: Fila[] };
type Div = { inicio: number; fin: number; codigo: string; nombre: string; secciones: Seccion[]; frases: Frase[] };
export type Semana2 = { publicacion: string; fecha: string; temas: { n: number; nombre: string; inicio: number }[]; totalTemas: number; velas: { t: number; color: string }[]; balanza: [number, number][]; divisas: Record<string, Div> };
type Props = { s: Semana2 | null; clave: string };

export const metaDivisa = (clave: string): CalculateMetadataFunction<Props> => async () => {
  const s: Semana2 = await (await fetch(staticFile("semana2.json"))).json();
  const d = s.divisas[clave];
  return { props: { s, clave }, durationInFrames: Math.round((d.fin - d.inicio) * 30) };
};

const ease3 = (x: number) => 1 - Math.pow(1 - x, 3);
const easeIn3 = (x: number) => x * x * x;

export const Divisa: React.FC<Props> = ({ s, clave }) => {
  const d = s ? s.divisas[clave] : null;
  const inicio = d ? d.inicio : 0;
  const { fps, at, tGlobal } = useLocal(inicio);
  if (!s || !d) return null;
  const tema = s.temas.filter((m) => tGlobal >= m.inicio).pop();
  const p = balanzaP(s as unknown as Semana, tGlobal);
  const velaIni = s.velas.find((v) => Math.abs(v.t - d.inicio) < 0.01);
  const velaFin = s.velas.find((v) => Math.abs(v.t - d.fin) < 0.01);
  const cab = spring({ frame: at(d.inicio + 0.25), fps, config: ESTANDAR });
  const actual = d.frases.filter((f) => tGlobal >= f.t).pop();
  const siguiente = d.frases.find((f) => f.t > tGlobal);
  const sec = d.secciones.filter((x) => tGlobal >= x.t0).pop() ?? d.secciones[0];
  const sIn = spring({ frame: at(sec.t0 + 0.05), fps, config: ESTANDAR });
  const sOut = Math.min(1, Math.max(0, (tGlobal - (sec.t1 - 0.25)) / 0.25));
  // velas: descubre al inicio, cubre al final
  const dv = velaIni ? Math.min(1, Math.max(0, at(d.inicio) / (0.34 * fps))) : 1;
  const cv = velaFin ? Math.min(1, Math.max(0, (tGlobal - (d.fin - 0.32)) / 0.32)) : 0;
  const cVela = (c?: string) => (c === "toro" ? K.toro : K.oso);
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
          Tema <b style={{ color: K.hueso }}>{tema.n}/{s.totalTemas}</b> · {tema.nombre}
        </div>
      )}
      {/* ficha de la divisa */}
      <div style={{ position: "absolute", left: 70, top: 262, opacity: cab, translate: `${-60 * (1 - cab)}px 0` }}>
        <div style={{ font: "800 150px/0.9 Barlow", letterSpacing: ".01em" }}>{d.codigo}</div>
        <div style={{ font: "600 24px/1 Mono", letterSpacing: ".14em", color: K.gris, textTransform: "uppercase", marginTop: 12 }}>{d.nombre}</div>
      </div>
      {/* seccion actual */}
      <div style={{ opacity: sIn * (1 - sOut), translate: `0 ${30 * (1 - sIn) - 40 * sOut}px` }}>
        <div style={{ position: "absolute", left: 70, top: 470, font: "700 26px/1 Mono", letterSpacing: ".14em", color: K.hueso, textTransform: "uppercase" }}>
          <span style={{ color: K.gris }}>▸ </span>{sec.titulo}
        </div>
        {sec.filas.map((f, i) => {
          const e = spring({ frame: at(f.t), fps, config: SECO });
          const fv = at(f.tValor);
          const det = spring({ frame: at(f.tDetalle), fps, config: SECO });
          const f2 = f.t2 != null ? at(f.t2) : -1;
          const y = 520 + i * 225;
          return (
            <div key={f.sim} style={{ position: "absolute", left: 70, right: 70, top: y, height: 210, borderBottom: `2px solid ${K.linea}`, opacity: e, translate: `${-60 * (1 - e)}px 0` }}>
              <div style={{ position: "absolute", left: 0, top: 20, font: "700 28px/1 Mono", letterSpacing: ".1em", color: K.gris }}>{f.sim}</div>
              <div style={{ position: "absolute", right: 0, top: 18, font: "800 36px/1 Barlow", textTransform: "uppercase", textAlign: "right", maxWidth: 560 }}>{f.nombre}</div>
              <div style={{ position: "absolute", left: 0, top: 66, font: "800 104px/1 Mono", color: fv >= 0 ? color(f.tono) : K.gris, whiteSpace: "nowrap" }}>
                {fv >= 0 ? <Rodar valor={f.valor} f={fv} semilla={f.sim} /> : "—"}
                {f.valor2 && f2 >= 0 && (
                  <>
                    <span style={{ fontSize: 70, margin: "0 22px", color: K.gris }}>→</span>
                    <Rodar valor={f.valor2} f={f2} semilla={f.sim + "2"} />
                  </>
                )}
                {!f.valor2 && fv >= 8 && <span style={{ fontSize: 72, marginLeft: 22 }}>{f.flecha}</span>}
              </div>
              <div style={{ position: "absolute", left: 0, top: 178, font: "600 22px/1 Mono", letterSpacing: ".1em", color: color(f.tono), textTransform: "uppercase", opacity: det }}>{f.detalle}</div>
            </div>
          );
        })}
      </div>
      {/* frase de la voz */}
      {actual && (() => {
        const si = spring({ frame: at(actual.t), fps, config: ESTANDAR });
        const fuera = siguiente ? Math.min(1, Math.max(0, (tGlobal - (siguiente.t - 0.16)) / 0.16)) : 0;
        return (
          <div key={actual.t} style={{ position: "absolute", left: 60, right: 60, top: 1290, textAlign: "center", font: "800 86px/0.98 Barlow", textTransform: "uppercase", opacity: si * (1 - fuera), translate: `0 ${50 * (1 - si) - 40 * fuera}px` }}>
            <span className={`fr-${actual.tono}`} dangerouslySetInnerHTML={{ __html: actual.html }} />
          </div>
        );
      })()}
      <style>{`.fr-oso em{font-style:normal;color:${K.oso}}.fr-toro em{font-style:normal;color:${K.toro}}.fr-neutro em{font-style:normal}`}</style>
      {/* Balanza Hikman */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1540, height: 170 }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, textAlign: "center", font: "600 20px/1 Mono", letterSpacing: ".3em", color: K.gris }}>BALANZA HIKMAN</div>
        <Img src={staticFile("hikman/toro.png")} style={{ position: "absolute", top: 34, height: 104, left: 70 }} />
        <Img src={staticFile("hikman/oso.png")} style={{ position: "absolute", top: 34, height: 104, right: 70 }} />
        <div style={{ position: "absolute", left: 200, width: 680, top: 78, height: 14, borderRadius: 7, background: `linear-gradient(90deg, ${K.toro} 0%, #3a3d43 50%, ${K.oso} 100%)` }} />
        <div style={{ position: "absolute", left: 534 + p * 340, top: 48, width: 12, height: 74, borderRadius: 6, background: K.hueso, boxShadow: "0 0 0 4px #0c0d0f" }} />
        <div style={{ position: "absolute", top: 112, left: 200, font: "600 20px/1 Mono", letterSpacing: ".2em", color: K.toro }}>TORO</div>
        <div style={{ position: "absolute", top: 112, right: 200, font: "600 20px/1 Mono", letterSpacing: ".2em", color: K.oso }}>OSO</div>
      </div>
      {/* velas de cambio de tema */}
      {velaIni && dv < 1 && (
        <AbsoluteFill>
          <div style={{ position: "absolute", left: 536, width: 8, top: -200, bottom: -200, background: cVela(velaIni.color), scale: `1 ${1 - ease3(Math.min(1, at(d.inicio) / (0.42 * fps)))}`, transformOrigin: "50% 0%" }} />
          <div style={{ position: "absolute", inset: 0, background: cVela(velaIni.color), scale: `1 ${1 - ease3(dv)}`, transformOrigin: "50% 0%" }} />
        </AbsoluteFill>
      )}
      {velaFin && cv > 0 && (
        <AbsoluteFill>
          <div style={{ position: "absolute", left: 536, width: 8, top: -200, bottom: -200, background: cVela(velaFin.color), scale: `1 ${Math.min(1, easeIn3(Math.min(1, (tGlobal - (d.fin - 0.4)) / 0.2)))}`, transformOrigin: "50% 100%" }} />
          <div style={{ position: "absolute", inset: 0, background: cVela(velaFin.color), scale: `1 ${easeIn3(cv)}`, transformOrigin: "50% 100%" }} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
