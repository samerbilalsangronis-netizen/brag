"""Tutorial de Habibis: grabacion real de la web + pasos animados (Hyperframes).
Uso: python3 tools/habibis_tutorial.py <carpeta_grabacion> <carpeta_composicion>
1. Une los cuadros del screencast (cuadros.json, con su hora real) en un mp4 a 30 fps, acelerado VEL veces.
2. Escribe fuentes/habibis-tutorial.src.html con los pasos en los tiempos de las marcas y lo arma con build_comp.py."""
import json, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GRAB, COMP = Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve()
VEL = 1.2           # aceleracion de la grabacion
T_GRAB = 3.0        # la grabacion entra despues del gancho
CIERRE = 5.0        # segundos de cierre

d = json.loads((GRAB / "cuadros.json").read_text())
lista, marcas, t0 = d["lista"], dict(d["marcas"]), d["t0"]
# 1 · concat con la duracion real de cada cuadro. Se quita lo que la web tarda en cargar (pantalla en blanco):
# la grabacion empieza 0,5 s antes de la marca "inicio".
CORTE = t0 + max(0.0, marcas["inicio"] - 0.5)
# tramos que se conservan (hora real). En el seguimiento en vivo solo se dejan unos segundos alrededor de cada
# cambio de estado: la espera entre uno y otro se quita.
estados = [v for k, v in marcas.items() if k.startswith("estado:")]
tramos = [(CORTE, t0 + (marcas.get("resultado", marcas["fin"]) + 2.5 if estados else marcas["fin"] + 1))]
for e in estados:
    tramos.append((t0 + e - 0.6, t0 + e + 2.8))
def en_tramo(ts):
    return any(a <= ts < b for a, b in tramos)
def a_video(ts):  # hora real -> segundos dentro de la grabacion recortada (antes de acelerar)
    acc = 0.0
    for a, b in tramos:
        if ts >= b: acc += b - a
        elif ts >= a: return acc + ts - a
        else: return acc
    return acc
lista = [c for c in lista if c[1] >= CORTE]
conc = []
for i, (f, ts) in enumerate(lista):
    sig = lista[i + 1][1] if i + 1 < len(lista) else ts + 1.0
    if not en_tramo(ts):
        continue
    fin_tramo = min(b for a, b in tramos if a <= ts < b)
    # si el cuadro sigue en pantalla al empezar el siguiente tramo, se repite alli
    dur = min(sig, fin_tramo) - ts
    conc.append(f"file '{(GRAB / 'cuadros' / f).as_posix()}'\nduration {max(0.001, dur):.4f}")
    for a, b in tramos:
        if ts < a < sig:
            conc.append(f"file '{(GRAB / 'cuadros' / f).as_posix()}'\nduration {max(0.001, min(sig, b) - a):.4f}")
conc.append(f"file '{(GRAB / 'cuadros' / lista[-1][0]).as_posix()}'")
(GRAB / "concat.txt").write_text("\n".join(conc) + "\n")
(COMP / "assets").mkdir(parents=True, exist_ok=True)
subprocess.run(["ffmpeg", "-nostdin", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(GRAB / "concat.txt"),
                "-vf", f"setpts=PTS/{VEL},fps=30,scale=780:1688,format=yuv420p", "-c:v", "libx264", "-crf", "16", "-preset", "medium",
                "-an", str(COMP / "assets" / "grabacion.mp4")], check=True)
dur_grab = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(COMP / "assets" / "grabacion.mp4")]))
# hora de cada marca dentro del video final
T = {k: round(T_GRAB + a_video(t0 + v) / VEL, 2) for k, v in marcas.items()}
# la pantalla de pedido recibido aparece unos 1,5 s despues del toque final
T["listo"] = round(T.get("resultado", T["confirmar"] + 3) - 3.0 / VEL, 2)
for k in list(T):
    if k.startswith("estado:"): T[k] = round(T[k] - 0.2, 2)
dur_total = round(T_GRAB + dur_grab + CIERRE, 2)

PASOS = [  # (marca de inicio, numero, titulo, detalle)
    ("inicio", 1, "Entra a la web", "Mira el menú y los favoritos"),
    ("categoria", 2, "Elige tu plato", "Toca la categoría y el plato"),
    ("adicional", 3, "Personaliza y agrega", "Adicionales, cantidad y «Agregar»"),
    ("ver-pedido", 4, "Revisa tu pedido", "Toca «Ver pedido» y «Continuar»"),
    ("datos", 5, "Tus datos", "Nombre y WhatsApp"),
    ("entrega", 6, "Delivery o retiro", "Dirección y ubicación en el mapa"),
    ("cuando", 7, "Hora y forma de pago", "Binance, bolívares o efectivo"),
    ("confirmar", 8, "Confirma", "Toca «Confirmar pedido»"),
    ("listo", 9, "¡Pedido recibido!", "Síguelo en vivo, sin recargar"),
]
for k in marcas:
    if k.startswith("estado:"):
        txt = k.split(":", 1)[1]
        n = PASOS[-1][1] + 1
        if "prepar" in txt.lower(): PASOS.append((k, n, "Lo están preparando", "Cada paso se marca solo"))
        elif "sale" in txt.lower() or "camino" in txt.lower(): PASOS.append((k, n, "¡Va en camino!", "Lo ves en tiempo real"))
        elif "entreg" in txt.lower(): PASOS.append((k, n, "¡Entregado!", "Buen provecho"))
pasos = []
for i, (m, n, tit, det) in enumerate(PASOS):
    t1 = T[PASOS[i + 1][0]] if i + 1 < len(PASOS) else T_GRAB + dur_grab
    pasos.append({"n": n, "tit": tit, "det": det, "t0": T[m], "t1": round(t1, 2)})
fin_grab = round(T_GRAB + dur_grab - 0.45, 2)  # el cierre tapa el ultimo cuadro
info = {"T": T, "dur_grab": dur_grab, "dur_total": dur_total, "pasos": pasos}
(GRAB / "tiempos.json").write_text(json.dumps(info, ensure_ascii=False, indent=1))
print(json.dumps(info, ensure_ascii=False))

src = (ROOT / "fuentes/habibis-tutorial.plantilla.html").read_text()
src = src.replace("__DUR__", str(dur_total)).replace("__TGRAB__", str(T_GRAB)).replace("__DURGRAB__", f"{dur_grab:.2f}") \
         .replace("__FINGRAB__", str(fin_grab)).replace("__PASOS__", json.dumps(pasos, ensure_ascii=False)) \
         .replace("__TRESULTADO__", str(T.get("resultado", fin_grab)))
(ROOT / "fuentes/habibis-tutorial.src.html").write_text(src)
subprocess.run(["python3", str(ROOT / "tools/build_comp.py"), str(ROOT / "fuentes/habibis-tutorial.src.html"), str(COMP)], check=True)
import shutil
shutil.copy(ROOT / "assets/habibis/logo-habibis.png", COMP / "assets" / "logo-habibis.png")
