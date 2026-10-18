import { CalculateMetadataFunction, Composition, staticFile, Still } from "remotion";
import { Cifras } from "./Cifras";
import { Edicion } from "./kit";
import { Probabilidad } from "./Probabilidad";
import { Bonos } from "./Bonos";
import { Portada } from "./Portada";
import { Bienvenida, metaBienvenida } from "./Bienvenida";
import { Semana } from "./kit2";
import { Probabilidad2 } from "./Probabilidad2";
import { Tablero } from "./Tablero";

type Props = { edicion: Edicion | null };

// La duracion de cada pieza sale de edicion.json (inicio/fin en segundos del video final)
const meta = (clave: "cifras" | "probabilidad"): CalculateMetadataFunction<Props> => async () => {
  const edicion: Edicion = await (await fetch(staticFile("edicion.json"))).json();
  const s = edicion[clave];
  return { props: { edicion }, durationInFrames: Math.round((s.fin - s.inicio) * 30) };
};

const CifrasComp: React.FC<Props> = ({ edicion }) => (edicion ? <Cifras edicion={edicion} /> : null);
const ProbComp: React.FC<Props> = ({ edicion }) => (edicion ? <Probabilidad edicion={edicion} /> : null);

type P2 = { s: Semana | null };
// Informe semanal "Toro vs. Oso": duraciones desde semana.json
const meta2 = (clave: "tablero" | "probabilidad" | "bonos"): CalculateMetadataFunction<P2> => async () => {
  const s: Semana = await (await fetch(staticFile("semana.json"))).json();
  return { props: { s }, durationInFrames: Math.round((s[clave].fin - s[clave].inicio) * 30) };
};
const TableroComp: React.FC<P2> = ({ s }) => (s ? <Tablero s={s} /> : null);
const Prob2Comp: React.FC<P2> = ({ s }) => (s ? <Probabilidad2 s={s} /> : null);
const BonosComp: React.FC<P2> = ({ s }) => (s ? <Bonos s={s} /> : null);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Cifras" component={CifrasComp} durationInFrames={300} fps={30} width={1080} height={1920} defaultProps={{ edicion: null }} calculateMetadata={meta("cifras")} />
    <Composition id="Probabilidad" component={ProbComp} durationInFrames={200} fps={30} width={1080} height={1920} defaultProps={{ edicion: null }} calculateMetadata={meta("probabilidad")} />
    <Composition id="Tablero" component={TableroComp} durationInFrames={200} fps={30} width={1080} height={1920} defaultProps={{ s: null }} calculateMetadata={meta2("tablero")} />
    <Composition id="Probabilidad2" component={Prob2Comp} durationInFrames={120} fps={30} width={1080} height={1920} defaultProps={{ s: null }} calculateMetadata={meta2("probabilidad")} />
    <Composition id="Bonos" component={BonosComp} durationInFrames={260} fps={30} width={1080} height={1920} defaultProps={{ s: null }} calculateMetadata={meta2("bonos")} />
    <Composition id="Bienvenida" component={Bienvenida} durationInFrames={750} fps={30} width={1080} height={1920} defaultProps={{ b: null }} calculateMetadata={metaBienvenida} />
    <Still id="Portada" component={Portada} width={1080} height={1920} />
  </>
);
