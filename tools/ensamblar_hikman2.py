"""Ensambla el Informe semanal "Toro vs. Oso" de Hikman Capital (9:16, 30 fps).
Brag, Hyperframes y Remotion dibujan el mismo fondo, barra, tema y Balanza (calculada con el
tiempo global), y las velas de cambio de tema terminan/empiezan justo en el corte.

Uso: python3 tools/ensamblar_hikman2.py <voz.wav> <salida.mp4>"""
import json, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
O = ROOT / "out/hikman2"
S = json.loads((ROOT / "datos/hikman/semana.json").read_text())
FPS = 30
CUERPO0 = 15.55  # inicio global de fuentes/hk2-cuerpo.src.html
tb, pr, bo = S["tablero"], S["probabilidad"], S["bonos"]
fin = S["duracion"]

# (archivo, desde global, hasta global, inicio global del archivo)
tramos = [
    ("hk2-brag.mp4", 0, tb["inicio"], 0),
    ("hk2-tablero.mp4", tb["inicio"], tb["fin"], tb["inicio"]),
    ("hk2-cuerpo.mp4", tb["fin"], pr["inicio"], CUERPO0),
    ("hk2-prob.mp4", pr["inicio"], pr["fin"], pr["inicio"]),
    ("hk2-cuerpo.mp4", pr["fin"], bo["inicio"], CUERPO0),
    ("hk2-bonos.mp4", bo["inicio"], bo["fin"], bo["inicio"]),
    ("hk2-cuerpo.mp4", bo["fin"], 62.0, CUERPO0),
    ("hk2-brag.mp4", 62.0, fin, 0),
]
voz, salida = sys.argv[1], sys.argv[2]
ins, filt = [], []
for k, (f, a, b, base) in enumerate(tramos):
    ins += ["-i", str(O / f)]
    fa, fb = round((a - base) * FPS), round((b - base) * FPS)
    filt.append(f"[{k}:v]trim=start_frame={fa}:end_frame={fb},setpts=PTS-STARTPTS,fps={FPS},format=yuv420p[v{k}]")
n = len(tramos)
filt.append("".join(f"[v{k}]" for k in range(n)) + f"concat=n={n}:v=1:a=0[v]")
r = int(S["vozInicio"] * 1000)
filt.append(f"[{n}:a]adelay={r}|{r},loudnorm=I=-14:TP=-1.5:LRA=7,apad=whole_dur={fin}[a]")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *ins, "-i", voz, "-filter_complex", ";".join(filt),
                "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-c:a", "aac", "-b:a", "192k",
                "-t", str(fin), "-movflags", "+faststart", salida], check=True)
print("ok", salida)
