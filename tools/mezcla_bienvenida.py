"""Sonido del video de bienvenida H.I.K.M.A.N.: voz (frases colocadas segun
datos/hikman/bienvenida.json) + efectos sintetizados aqui, suaves y graves:
ruido del mercado que se corta en seco, golpes graves en las letras y un dron de fondo.
Uso: python3 tools/mezcla_bienvenida.py <carpeta_frases> <salida.wav>"""
import json, subprocess, sys
from pathlib import Path
import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
B = json.loads((ROOT / "datos/hikman/bienvenida.json").read_text())
SR = 48000
N = int(B["duracion"] * SR)
rng = np.random.default_rng(11)  # semilla: siempre el mismo sonido
t = np.arange(N) / SR

def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.zeros_like(x); acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc; y[i] = acc
    return y

# voz
voz = np.zeros(N)
for nombre, t0 in B["voz"]:
    y, sr = sf.read(Path(sys.argv[1]) / f"{nombre}.wav")
    if y.ndim > 1: y = y.mean(axis=1)
    if sr != SR: y = np.interp(np.arange(int(len(y) * SR / sr)) / SR, np.arange(len(y)) / sr, y)
    i = int(t0 * SR); voz[i:i + len(y)] += y[: N - i]

sfx = np.zeros(N)
# ruido del mercado 0 - 3,65 s: grave, sube y se corta en seco (10 ms)
fin = int(3.65 * SR)
ruido = lowpass(rng.standard_normal(fin), 1800) * np.linspace(0.15, 1.0, fin) * (0.75 + 0.25 * np.sin(2 * np.pi * 7 * t[:fin]))
ruido[-480:] *= np.linspace(1, 0, 480)
sfx[:fin] += ruido * 0.9

def golpe(t0, f0=58, dur=0.45, amp=1.0):
    n = int(dur * SR); tt = np.arange(n) / SR
    f = f0 * (1 + 0.5 * np.exp(-tt * 18))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9) * amp
    s[:96] *= np.linspace(0, 1, 96)
    i = int(t0 * SR); sfx[i:i + n] += s[: N - i]

for k in range(6): golpe(5.7 + k * 0.16 + 0.12, f0=70, dur=0.3, amp=0.55)   # caen las letras
for l in B["letras"]: golpe(l["inicio"] + 0.05, amp=0.8)                       # cada letra
golpe(32.96, f0=48, dur=0.8, amp=1.3)                                          # choque toro-oso

# dron grave de fondo desde el silencio hasta el final
d0 = int(3.75 * SR)
tt = t[d0:]
dron = (np.sin(2 * np.pi * 55 * tt) + 0.6 * np.sin(2 * np.pi * 82.5 * tt) + 0.3 * np.sin(2 * np.pi * 110 * tt)) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.15 * tt))
env = np.minimum(1, (tt - tt[0]) / 1.5) * np.minimum(1, (B["duracion"] - tt) / 1.5)
sfx[d0:] += dron * env * 0.25

voz /= np.max(np.abs(voz)) + 1e-9
sfx /= np.max(np.abs(sfx)) + 1e-9
mezcla = voz * 0.9 + sfx * 0.22   # efectos muy por debajo de la voz
tmp = Path(sys.argv[2]).with_suffix(".crudo.wav")
sf.write(tmp, mezcla.astype(np.float32), SR)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(tmp), "-af", "loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", str(SR), sys.argv[2]], check=True)
tmp.unlink()
print("ok", sys.argv[2])
