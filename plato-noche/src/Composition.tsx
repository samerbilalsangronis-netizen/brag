import { loadFont } from "@remotion/fonts";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

loadFont({ family: "Reem Kufi", url: staticFile("fonts/ReemKufi.woff2"), weight: "400 700" });
loadFont({ family: "Cairo", url: staticFile("fonts/Cairo.woff2"), weight: "200 1000" });

// Paleta real de habibis-chi.vercel.app
const C = {
  ink: "#14201a",
  ink9: "#1c2b23",
  ink7: "#324a3c",
  sand: "#f5ecdc",
  sand4: "#bab29c",
  gold: "#e1b35c",
  gold3: "#f0c879",
};

export type PlatoNocheProps = {
  readonly plato: string;
  readonly ilustracion: string; // nombre del archivo en public/platos (sin .png)
  readonly precioCOP: number;
  readonly tasaCOP: number; // COP por 1 USDT
  readonly tasaBs: number; // Bs por 1 USDT
};

// Formatos identicos a la web
const miles = (s: string) => s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
export const fmtCOP = (v: number) => `${miles(String(Math.round(v)))} COP`;
export const fmtUSDT = (cop: number, tasaCOP: number) => `${(cop / tasaCOP).toFixed(2).replace(".", ",")} USDT`;
export const fmtBs = (cop: number, tasaCOP: number, tasaBs: number) => {
  const [e, d] = ((cop * tasaBs) / tasaCOP).toFixed(2).split(".");
  return `Bs. ${miles(e)},${d}`;
};

// Donde sale el vapor en cada ilustracion (coordenadas de 1080x1080)
const VAPOR: Record<string, { xs: number[]; y0: number }> = {
  "shawarma-de-pollo": { xs: [480, 560, 640], y0: 300 },
  "plato-de-shawarma": { xs: [500, 600, 700], y0: 380 },
  falafel: { xs: [450, 540, 630], y0: 400 },
  "combo-habibi": { xs: [360, 430], y0: 330 },
  knafeh: { xs: [470, 610], y0: 420 },
};

// Resortes: seco para chips, estandar para bloques, pesado para titulares
const SECO = { damping: 18, stiffness: 260, mass: 0.6 };
const ESTANDAR = { damping: 14, stiffness: 140, mass: 0.9 };
const PESADO = { damping: 16, stiffness: 90, mass: 1.6 };

const useSpring = (atSec: number, config: typeof SECO) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - Math.round(atSec * fps), fps, config });
};

const Vapor: React.FC<{ ilustracion: string; size: number }> = ({ ilustracion, size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const v = VAPOR[ilustracion];
  if (!v) return null;
  const ciclo = 1.6 * fps;
  return (
    <svg viewBox="0 0 1080 1080" style={{ position: "absolute", inset: 0, width: size, height: size }}>
      {v.xs.map((x, i) => {
        const t = ((frame + (i * ciclo) / v.xs.length) % ciclo) / ciclo;
        const y = interpolate(t, [0, 1], [20, -60]);
        const o = interpolate(t, [0, 0.4, 1], [0, 0.32, 0]);
        return (
          <path
            key={x}
            d={`M${x} ${v.y0} c-26 -32 26 -64 0 -96 s26 -64 0 -96`}
            fill="none"
            stroke={C.sand}
            strokeWidth={20}
            strokeLinecap="round"
            style={{ translate: `0 ${y}px`, opacity: o, filter: "blur(3px)" }}
          />
        );
      })}
    </svg>
  );
};

export const PlatoNoche: React.FC<PlatoNocheProps> = ({ plato, ilustracion, precioCOP, tasaCOP, tasaBs }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const sTop = useSpring(0, SECO);
  const sKick = useSpring(0, ESTANDAR);
  const sDish = useSpring(0.05, ESTANDAR);
  const sName = useSpring(1.3, PESADO);
  const sCOP = useSpring(2.2, PESADO);
  const sUSDT = useSpring(3.3, SECO);
  const sBs = useSpring(4.1, SECO);
  const sFoot = useSpring(5.0, ESTANDAR);
  const sFoot2 = useSpring(6.2, ESTANDAR);
  const halo = interpolate(Math.sin((frame / fps) * 1.6), [-1, 1], [0.9, 1.06]);
  const push = interpolate(frame, [0, durationInFrames], [1, 1.12]);
  const flotaY = Math.sin((frame / fps) * 1.4) * 14;
  const flotaR = Math.sin((frame / fps) * 0.9) * 1.5;

  return (
    <AbsoluteFill style={{ background: C.ink, color: C.sand, fontFamily: "Cairo" }}>
      {/* Halo calido detras del plato */}
      <div
        style={{
          position: "absolute",
          left: 40,
          top: 260,
          width: 1000,
          height: 1000,
          borderRadius: "50%",
          scale: String(halo * sDish),
          background: "radial-gradient(circle, rgba(225,179,92,.28) 0%, rgba(225,179,92,.06) 45%, rgba(225,179,92,0) 70%)",
        }}
      />

      {/* Marca */}
      <div style={{ position: "absolute", left: 90, top: 110, display: "flex", alignItems: "center", gap: 22, opacity: sTop, translate: `${interpolate(sTop, [0, 1], [-40, 0])}px 0` }}>
        <Img src={staticFile("logo.svg")} style={{ width: 96, height: 96 }} />
        <div style={{ fontFamily: "Reem Kufi", fontWeight: 700, fontSize: 64, color: C.gold3 }}>Habibis</div>
      </div>
      <div style={{ position: "absolute", left: 90, top: 250, fontWeight: 800, fontSize: 40, letterSpacing: "0.3em", color: C.gold, opacity: sKick, translate: `${interpolate(sKick, [0, 1], [60, 0])}px 0` }}>
        PLATO DE LA NOCHE
      </div>

      {/* Ilustracion con vapor animado */}
      <div
        style={{
          position: "absolute",
          left: 160,
          top: 330,
          width: 760,
          height: 760,
          borderRadius: 56,
          overflow: "hidden",
          border: `4px solid ${C.ink7}`,
          opacity: sDish,
          scale: String(interpolate(sDish, [0, 1], [0.7, 1]) * push),
          translate: `0 ${interpolate(sDish, [0, 1], [160, 0]) + flotaY}px`,
          rotate: `${flotaR}deg`,
        }}
      >
        <Img src={staticFile(`platos/${ilustracion}.png`)} style={{ width: 760, height: 760 }} />
        <Vapor ilustracion={ilustracion} size={760} />
      </div>

      {/* Nombre y precios: en columna para que un nombre largo empuje los precios */}
      <div style={{ position: "absolute", left: 90, right: 90, top: 1170, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ fontFamily: "Reem Kufi", fontWeight: 700, fontSize: 96, lineHeight: 1.02, opacity: sName, translate: `0 ${interpolate(sName, [0, 1], [70, 0])}px` }}>
          {plato}
        </div>
        <div style={{ fontWeight: 800, fontSize: 96, lineHeight: 1.1, color: C.gold3, opacity: sCOP, translate: `0 ${interpolate(sCOP, [0, 1], [60, 0])}px` }}>
          {fmtCOP(precioCOP)}
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {[
            { s: sUSDT, txt: fmtUSDT(precioCOP, tasaCOP) },
            { s: sBs, txt: fmtBs(precioCOP, tasaCOP, tasaBs) },
          ].map(({ s, txt }) => (
            <div
              key={txt}
              style={{ padding: "0 34px", height: 96, borderRadius: 999, background: C.ink9, border: `3px solid ${C.ink7}`, fontWeight: 800, fontSize: 50, lineHeight: "90px", opacity: s, scale: String(interpolate(s, [0, 1], [0.7, 1])) }}
            >
              {txt}
            </div>
          ))}
        </div>
      </div>

      {/* Cierre */}
      <div style={{ position: "absolute", left: 90, right: 90, bottom: 100, opacity: sFoot, translate: `0 ${interpolate(sFoot, [0, 1], [40, 0])}px` }}>
        <div style={{ fontWeight: 700, fontSize: 48 }}>Pide en línea · @habibis_arabicfood</div>
        <div style={{ fontWeight: 600, fontSize: 44, color: C.sand4, marginTop: 6, opacity: sFoot2, translate: `${interpolate(sFoot2, [0, 1], [-50, 0])}px 0` }}>Abrimos a las 5:00 p. m. · Delivery y retiro</div>
      </div>

      {/* Sonido: musica de Brag + efectos suaves por debajo */}
      <Audio
        src={staticFile("audio/musica.mp3")}
        volume={(f) => interpolate(f, [0, 0.3 * fps, durationInFrames - fps, durationInFrames], [0, 0.8, 0.8, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
      <Sequence from={Math.round(0.4 * fps)} durationInFrames={Math.round(3 * fps)} premountFor={fps}>
        <Audio src={staticFile("audio/plancha.wav")} volume={0.2} />
      </Sequence>
      <Sequence from={Math.round(0.15 * fps)} durationInFrames={Math.round(0.3 * fps)} premountFor={fps}>
        <Audio src={staticFile("audio/pop.wav")} volume={0.4} />
      </Sequence>
      <Sequence from={Math.round(3.3 * fps)} durationInFrames={Math.round(0.3 * fps)} premountFor={fps}>
        <Audio src={staticFile("audio/pop.wav")} volume={0.35} />
      </Sequence>
      <Sequence from={Math.round(4.1 * fps)} durationInFrames={Math.round(0.3 * fps)} premountFor={fps}>
        <Audio src={staticFile("audio/pop.wav")} volume={0.35} />
      </Sequence>
    </AbsoluteFill>
  );
};
