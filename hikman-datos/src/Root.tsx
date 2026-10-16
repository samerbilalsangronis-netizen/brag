import { CalculateMetadataFunction, Composition, staticFile } from "remotion";
import { Cifras } from "./Cifras";
import { Edicion } from "./kit";
import { Probabilidad } from "./Probabilidad";

type Props = { edicion: Edicion | null };

// La duracion de cada pieza sale de edicion.json (inicio/fin en segundos del video final)
const meta = (clave: "cifras" | "probabilidad"): CalculateMetadataFunction<Props> => async () => {
  const edicion: Edicion = await (await fetch(staticFile("edicion.json"))).json();
  const s = edicion[clave];
  return { props: { edicion }, durationInFrames: Math.round((s.fin - s.inicio) * 30) };
};

const CifrasComp: React.FC<Props> = ({ edicion }) => (edicion ? <Cifras edicion={edicion} /> : null);
const ProbComp: React.FC<Props> = ({ edicion }) => (edicion ? <Probabilidad edicion={edicion} /> : null);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Cifras" component={CifrasComp} durationInFrames={300} fps={30} width={1080} height={1920} defaultProps={{ edicion: null }} calculateMetadata={meta("cifras")} />
    <Composition id="Probabilidad" component={ProbComp} durationInFrames={200} fps={30} width={1080} height={1920} defaultProps={{ edicion: null }} calculateMetadata={meta("probabilidad")} />
  </>
);
