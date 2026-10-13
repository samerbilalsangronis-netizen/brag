"""Arma una pieza de Tierra Santa en 9:16 y en 1:1 a partir de una fuente con {{W}} {{H}} {{S}} {{SX}} {{SY}}.

Uso: python3 tools/build_ts.py <fuente.src.html> <carpeta-base>
  -> <carpeta-base>-9x16/ y <carpeta-base>-1x1/ (proyectos Hyperframes listos para check/render)

El 1:1 se reencuadra: el escenario de diseño de 1080x1920 se escala a 0,75 y se centra,
de modo que la franja importante (y 240-1680) llena el cuadro. No se recorta.
"""
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FORMATOS = {
    "9x16": dict(W=1080, H=1920, S=1, SX=0, SY=0),
    "1x1": dict(W=1080, H=1080, S=0.75, SX=135, SY=-180),
}

src, base = Path(sys.argv[1]), sys.argv[2]
texto = src.read_text()
for nombre, f in FORMATOS.items():
    comp = Path(f"{base}-{nombre}")
    if not (comp / "hyperframes.json").exists():
        subprocess.run(["npx", "--yes", "hyperframes", "init", str(comp), "--non-interactive", "--example=blank"], check=True, capture_output=True)
    t = texto
    for k, v in f.items():
        t = t.replace("{{%s}}" % k, str(v))
    tmp = ROOT / "work" / f"{src.stem}-{nombre}.html"
    tmp.parent.mkdir(exist_ok=True)
    tmp.write_text(t)
    subprocess.run(["python3", str(ROOT / "tools/build_comp.py"), str(tmp), str(comp)], check=True)
