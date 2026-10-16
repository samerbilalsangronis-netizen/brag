"""Ensambla el Informe de mercados de Hikman Capital (9:16, 30 fps).
Cada herramienta dibuja el mismo papel, cabecera y cinta EN VIVO (la cinta usa el tiempo global),
asi que los tramos se empalman por corte sin costura.

Uso: python3 tools/ensamblar_hikman.py <narracion.wav> <salida.mp4>
Tramos (segundos globales), leidos de datos/hikman/edicion.json:
  Brag 0 -> cifras.inicio | Remotion Cifras | Hyperframes cuerpo (gasolina) | Remotion Probabilidad
  | Hyperframes cuerpo (Fed) | Brag cierre hasta duracion."""
import json, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
O = ROOT / "out/hikman"
E = json.loads((ROOT / "datos/hikman/edicion.json").read_text())
FPS = 30
CUERPO0 = 19.8  # inicio global de fuentes/hk-cuerpo.src.html
ci, cf = E["cifras"]["inicio"], E["cifras"]["fin"]
pi, pf = E["probabilidad"]["inicio"], E["probabilidad"]["fin"]
FED = (31.9, 35.5)
fin = E["duracion"]

# (archivo, desde local, hasta local) en segundos
tramos = [
    ("hk-brag.mp4", 0, ci),
    ("hk-cifras.mp4", 0, cf - ci),
    ("hk-cuerpo.mp4", cf - CUERPO0, pi - CUERPO0),
    ("hk-prob.mp4", 0, pf - pi),
    ("hk-cuerpo.mp4", FED[0] - CUERPO0, FED[1] - CUERPO0),
    ("hk-brag.mp4", FED[1], fin),
]
voz, salida = sys.argv[1], sys.argv[2]
ins, filt = [], []
for k, (f, a, b) in enumerate(tramos):
    ins += ["-i", str(O / f)]
    fa, fb = round(a * FPS), round(b * FPS)
    filt.append(f"[{k}:v]trim=start_frame={fa}:end_frame={fb},setpts=PTS-STARTPTS,fps={FPS},format=yuv420p[v{k}]")
n = len(tramos)
filt.append("".join(f"[v{k}]" for k in range(n)) + f"concat=n={n}:v=1:a=0[v]")
retraso = int(E["vozInicio"] * 1000)
filt.append(f"[{n}:a]adelay={retraso}|{retraso},loudnorm=I=-14:TP=-1.5:LRA=7,apad=whole_dur={fin}[a]")
cmd = ["ffmpeg", "-y", "-loglevel", "error", *ins, "-i", voz, "-filter_complex", ";".join(filt),
       "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-c:a", "aac", "-b:a", "192k",
       "-t", str(fin), "-movflags", "+faststart", salida]
subprocess.run(cmd, check=True)
print("ok", salida)
