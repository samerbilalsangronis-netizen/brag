"""Ensambla el comercial de Tierra Santa (30 s) a partir de las piezas de las tres herramientas.

Uso: python3 tools/ensamblar_ts.py <formato: 9x16|1x1> <audio.wav> <salida.mp4>

Linea de tiempo (cuadros a 30 fps, cortes sobre beats):
  Brag gancho      0 -  63   (brag-<f>.mp4, cuadros 0-62)
  Hyperframes     63 - 490   (hf-historia-<f>.mp4)
  Remotion       490 - 742   (remotion-catalogo-<f>.mp4)
  Brag cierre    742 - 900   (brag-<f>.mp4, desde el cuadro 63)
Cada union ocurre bajo una salpicadura que cubre la pantalla; ademas se funden 5 cuadros
(xfade) para que no haya ningun corte seco. El audio es una sola pieza continua.
"""
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
O = ROOT / "out/tierra-santa"
fmt, audio, salida = sys.argv[1], sys.argv[2], sys.argv[3]
FUNDIDO = 5  # cuadros
# (archivo, cuadro de inicio dentro del archivo, cuadros que ocupa en el comercial)
PIEZAS = [
    (O / f"brag/brag-{fmt}.mp4", 0, 63),
    (O / f"hf-historia-{fmt}.mp4", 0, 427),
    (O / f"remotion-catalogo-{fmt}.mp4", 0, 252),
    (O / f"brag/brag-{fmt}.mp4", 63, 158),
]
ins, f = [], []
for k, (arch, ini, n) in enumerate(PIEZAS):
    ins += ["-i", str(arch)]
    extra = FUNDIDO if k < len(PIEZAS) - 1 else 0
    # recorta por cuadros; si a la pieza le faltan cuadros, repite el ultimo (tpad)
    f.append(f"[{k}:v]fps=30,trim=start_frame={ini},setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop=12,"
             f"trim=end_frame={n + extra},setpts=PTS-STARTPTS,format=yuv420p[v{k}]")
acum, prev = 0, "v0"
for k in range(1, len(PIEZAS)):
    acum += PIEZAS[k - 1][2]
    f.append(f"[{prev}][v{k}]xfade=transition=fade:duration={FUNDIDO/30:.4f}:offset={acum/30:.4f}[x{k}]")
    prev = f"x{k}"
ins += ["-i", audio]
subprocess.run(["ffmpeg", "-v", "error", "-y", *ins, "-filter_complex", ";".join(f),
                "-map", f"[{prev}]", "-map", f"{len(PIEZAS)}:a", "-c:v", "libx264", "-crf", "18", "-preset", "medium",
                "-pix_fmt", "yuv420p", "-r", "30", "-c:a", "aac", "-b:a", "192k", "-t", "30", "-movflags", "+faststart", salida], check=True)
print("ok", salida)
