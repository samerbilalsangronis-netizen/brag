import { Composition } from "remotion";
import { PlatoNoche } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PlatoNoche"
        component={PlatoNoche}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          plato: "Shawarma de pollo",
          ilustracion: "shawarma-de-pollo",
          precioCOP: 22000,
          tasaCOP: 3188,
          tasaBs: 1014,
        }}
      />
    </>
  );
};
