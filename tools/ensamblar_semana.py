"""Ensambla un Informe semanal Hikman "Toro vs. Oso" por divisas.
Uso: python3 tools/ensamblar_semana.py <datos.json> <carpeta_frases> <carpeta_videos> <salida.mp4>
Los tramos se cortan por tiempo global; la voz se arma con las frases colocadas segun "voz" del JSON."""
import json, subprocess, sys
from pathlib import Path

S = json.loads(Path(sys.argv[1]).read_text())
FR, V, OUT = Path(sys.argv[2]), Path(sys.argv[3]), sys.argv[4]
FPS = 30
d = S["divisas"]
tramos = [  # (archivo, inicio global del tramo, fin global)
    ("brag.mp4", 0.0, d["usd"]["inicio"]),
    ("usd.mp4", d["usd"]["inicio"], d["usd"]["fin"]),
    ("eur.mp4", d["eur"]["inicio"], d["eur"]["fin"]),
    ("gbp.mp4", d["gbp"]["inicio"], d["gbp"]["fin"]),
    ("oce.mp4", d["oce"]["inicio"], d["oce"]["fin"]),
    ("cuerpo.mp4", S["jpy"]["inicio"], S["wti"]["fin"]),
    ("cierre.mp4", S["wti"]["fin"], S["duracion"]),
]
ins, filt = [], []
for k, (f, a, b) in enumerate(tramos):
    ins += ["-i", str(V / f)]
    n = round((b - a) * FPS)
    filt.append(f"[{k}:v]trim=start_frame=0:end_frame={n},setpts=PTS-STARTPTS,fps={FPS},format=yuv420p[v{k}]")
filt.append("".join(f"[v{k}]" for k in range(len(tramos))) + f"concat=n={len(tramos)}:v=1:a=0[v]")
base = len(tramos)
for j, (nombre, t) in enumerate(S["voz"]):
    ins += ["-i", str(FR / f"{nombre}.wav")]
    ms = int(t * 1000)
    filt.append(f"[{base + j}:a]adelay={ms}|{ms}[a{j}]")
filt.append("".join(f"[a{j}]" for j in range(len(S["voz"]))) + f"amix=inputs={len(S['voz'])}:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=9,apad=whole_dur={S['duracion']}[a]")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *ins, "-filter_complex", ";".join(filt), "-map", "[v]", "-map", "[a]",
                "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-c:a", "aac", "-b:a", "192k", "-t", str(S["duracion"]),
                "-movflags", "+faststart", OUT], check=True)
print("ok", OUT)
