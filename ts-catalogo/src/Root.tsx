import { Composition } from "remotion";
import { Catalogo, calcularMetadatos } from "./Composition";

// Beats medidos con librosa (docs/beats.json, indices 30..46), relativos al inicio del catalogo (16,32 s)
const BEATS = [0, 0.53, 1.04, 1.58, 2.11, 2.62, 3.16, 3.69, 4.2, 4.74, 5.27, 5.78, 6.32, 6.85, 7.36, 7.89, 8.4];

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Catalogo"
        component={Catalogo}
        durationInFrames={252}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ sabores: [], beats: BEATS, titulo: "Escoge tu sabor", tituloBeats: 2 }}
        calculateMetadata={calcularMetadatos}
      />
      <Composition
        id="Catalogo1x1"
        component={Catalogo}
        durationInFrames={252}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{ sabores: [], beats: BEATS, titulo: "Escoge tu sabor", tituloBeats: 2 }}
        calculateMetadata={calcularMetadatos}
      />
    </>
  );
};
