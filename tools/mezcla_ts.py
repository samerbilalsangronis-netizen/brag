"""Mezcla de audio del comercial de Tierra Santa (30 s): musica de Brag continua + efectos por debajo.

Uso: python3 tools/mezcla_ts.py <salida.wav>

- Musica: Brag vol-11 desde su segundo 3,72 (asi el drop cae en 13,16 s, la explosion).
- Efectos: de la libreria de Brag (Kenney, CC0) y sintetizados con ffmpeg cuando la libreria
  no trae el sonido (hielo, pulpa, licuadora, liquido). Todos suaves, filtrados, por debajo.
- Normaliza a -14 LUFS (loudnorm en dos pasadas).
"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BRAG = ROOT / ".claude/skills/brag/assets"
W = ROOT / "work/sfx-ts"
W.mkdir(parents=True, exist_ok=True)
MUSICA = BRAG / "music/happy-beats-business-moves-vol-11-by-ende-dot-app.mp3"
INICIO_PISTA, DURACION = 3.72, 30.0


def ff(*args):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *args], check=True)


def sintetizar():
    """Efectos que la libreria de Brag no trae, hechos con ffmpeg (deterministas: ruido con semilla)."""
    s = {}
    # salpicadura: rafaga de ruido grave que se apaga rapido
    s["salpica"] = W / "salpica.wav"
    ff("-f", "lavfi", "-i", "anoisesrc=c=pink:seed=3:r=48000:d=0.7", "-af",
       "lowpass=f=1800,highpass=f=120,afade=t=in:d=0.02,afade=t=out:st=0.08:d=0.6,volume=1.4", str(s["salpica"]))
    # escarcha / hielo: destellos suaves (sin agudos filosos) + crujido corto
    s["escarcha"] = W / "escarcha.wav"
    ff("-f", "lavfi", "-i", "aevalsrc='0.25*sin(2*PI*1320*t)*exp(-t*9)+0.2*sin(2*PI*1760*t)*exp(-(t-0.12)*9)*gte(t,0.12)+0.18*sin(2*PI*1480*t)*exp(-(t-0.27)*9)*gte(t,0.27)':s=48000:d=1.1",
       "-f", "lavfi", "-i", "anoisesrc=c=white:seed=8:r=48000:d=1.1",
       "-filter_complex", "[1]highpass=f=2500,lowpass=f=6000,afade=t=out:st=0.05:d=0.6,volume=0.25[n];[0][n]amix=inputs=2:normalize=0,lowpass=f=4000,afade=t=out:st=0.7:d=0.4", str(s["escarcha"]))
    # pulpa cayendo: "glup" grave y lento
    s["pulpa"] = W / "pulpa.wav"
    ff("-f", "lavfi", "-i", "anoisesrc=c=brown:seed=5:r=48000:d=2.2", "-af",
       "lowpass=f=600,tremolo=f=5:d=0.6,afade=t=in:d=0.2,afade=t=out:st=1.6:d=0.6,volume=2.2", str(s["pulpa"]))
    # licuadora: motor que acelera (80 -> 190 Hz) con crescendo; se corta justo antes del drop
    s["licuadora"] = W / "licuadora.wav"
    ff("-f", "lavfi", "-i", "aevalsrc='0.5*sin(2*PI*(80*t+15*t*t))+0.25*sin(4*PI*(80*t+15*t*t))':s=48000:d=3.63",
       "-f", "lavfi", "-i", "anoisesrc=c=pink:seed=9:r=48000:d=3.63",
       "-filter_complex", "[1]bandpass=f=900:w=700,volume=0.5[n];[0][n]amix=inputs=2:normalize=0,lowpass=f=2200,volume='0.15+0.85*t/3.63':eval=frame,afade=t=in:d=0.15,afade=t=out:st=3.55:d=0.08", str(s["licuadora"]))
    # liquido en el vaso: chorro filtrado que baja de tono
    s["liquido"] = W / "liquido.wav"
    ff("-f", "lavfi", "-i", "anoisesrc=c=pink:seed=12:r=48000:d=1.4", "-af",
       "bandpass=f=700:w=500,tremolo=f=11:d=0.4,afade=t=in:d=0.1,afade=t=out:st=0.9:d=0.5,volume=1.6", str(s["liquido"]))
    s["pop"] = ROOT / "assets/audio/pop.wav"
    return s


def main(salida):
    s = sintetizar()
    lib = lambda p: BRAG / "sfx" / p
    # (archivo, segundo del comercial, volumen)
    golpes = [17.36, 17.90, 18.43, 18.94, 19.48, 20.01, 20.52, 21.59, 22.10, 22.64, 23.17, 23.68]
    eventos = [
        (s["salpica"], 0.0, 0.55),
        (s["salpica"], 1.72, 0.35),
        (s["escarcha"], 2.2, 0.5),
        (s["pop"], 5.27, 0.55),
        (s["pulpa"], 5.8, 0.45),
        (lib("impact/impactGlass_light_001.ogg"), 6.84, 0.3),
        (lib("impact/impactGlass_light_002.ogg"), 7.38, 0.3),
        (lib("impact/impactGlass_light_003.ogg"), 7.89, 0.3),
        (s["licuadora"], 9.47, 0.42),
        (lib("impact/impactSoft_heavy_000.ogg"), 13.16, 0.7),
        (s["salpica"], 13.16, 0.6),
        (s["liquido"], 13.7, 0.45),
        (s["pop"], 15.27, 0.3),
        (lib("impact/impactGlass_light_001.ogg"), 15.79, 0.25),
        (s["salpica"], 16.2, 0.35),
        *[(lib(f"impact/impactSoft_medium_00{i % 5}.ogg"), t, 0.4) for i, t in enumerate(golpes)],
        (s["salpica"], 24.6, 0.35),
        (lib("impact/impactSoft_medium_001.ogg"), 24.72, 0.4),
        (lib("impact/impactSoft_heavy_002.ogg"), 25.79, 0.45),
        (s["pop"], 27.37, 0.3),
    ]
    ins, filt = ["-ss", str(INICIO_PISTA), "-t", str(DURACION), "-i", str(MUSICA)], []
    filt.append(f"[0]aresample=48000,aformat=channel_layouts=stereo,afade=t=in:d=0.08,afade=t=out:st={DURACION-1.0}:d=1.0[m]")
    for k, (f, t, v) in enumerate(eventos, start=1):
        ins += ["-i", str(f)]
        ms = int(t * 1000)
        filt.append(f"[{k}]aresample=48000,aformat=channel_layouts=stereo,volume={v},adelay={ms}|{ms}[e{k}]")
    efectos = "".join(f"[e{k}]" for k in range(1, len(eventos) + 1))
    filt.append(f"{efectos}amix=inputs={len(eventos)}:normalize=0,volume=0.8[fx]")
    filt.append(f"[m][fx]amix=inputs=2:normalize=0:duration=first,atrim=0:{DURACION}[mix]")
    crudo = W / "mezcla-cruda.wav"
    ff(*ins, "-filter_complex", ";".join(filt), "-map", "[mix]", "-ar", "48000", str(crudo))
    # loudnorm en dos pasadas a -14 LUFS
    r = subprocess.run(["ffmpeg", "-i", str(crudo), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
    m = json.loads(r[r.rindex("{"):r.rindex("}") + 1])
    ff("-i", str(crudo), "-af",
       f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true",
       "-ar", "48000", salida)
    print("ok", salida)


if __name__ == "__main__":
    main(sys.argv[1])
