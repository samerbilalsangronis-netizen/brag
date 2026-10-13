"""Arma el index.html de una composicion Hyperframes a partir de src.html.

Uso: python3 tools/build_comp.py <fuente.src.html> <carpeta-composicion>

Marcadores que reemplaza en la fuente:
  <!--svg:NOMBRE-->        ilustracion de assets/platos/NOMBRE.svg completa
  <!--svg:NOMBRE:nobg-->   la misma sin el fondo (para que flote sobre la escena)
  <!--svg:logo-->          logo real de Habibis (assets/habibis/logo.svg)
  <!--js:helpers-->        resortes y vapor (tools/hf-helpers.js)
  <!--css:platos-->         estilo estatico del vapor y los brillos

Escenas (opcional): cada bloque
  <scene id="sA" start="0" dur="3.1" track="1"> marcado + <script> </scene>
se convierte en compositions/sA.html (sub-composicion con <template>) y en
el host queda su ranura. El <style id="shared"> se copia a cada escena.
El script de la escena se escribe con tiempos absolutos del video; al final
se corre tl.shiftChildren(-T0) para pasarlos a tiempo local.

Las animaciones CSS de los SVG se quitan: en video las mueve el timeline,
para que cada frame dependa solo del tiempo.
Tambien copia tipografias y audio a <carpeta>/assets/.
"""
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def inline_svg(name, nobg=False, prefix=None):
    path = ROOT / ("assets/habibis/logo.svg" if name == "logo" else f"assets/platos/{name}.svg")
    s = path.read_text()
    s = re.sub(r"<style>.*?</style>", "", s, flags=re.S)
    if nobg:
        s = re.sub(r'<g id="fondo">.*?<!--/fondo-->', "", s, count=1, flags=re.S)
    p = prefix or name
    ids = set(re.findall(r'id="([^"]+)"', s))
    for i in sorted(ids, key=len, reverse=True):
        s = s.replace(f'id="{i}"', f'id="{p}-{i}"').replace(f"url(#{i})", f"url(#{p}-{i})")
    s = s.replace('class="vapor"', f'class="vapor vapor-{p}"').replace('class="brillo"', f'class="brillo brillo-{p}"')
    s = re.sub(r'\swidth="1080" height="1080"', "", s, count=1)
    s = s.replace("<svg ", f'<svg class="plato-svg" data-plato="{p}" ', 1)
    return s


PLATOS_CSS = (
    ".vapor path { fill: none; stroke: #f5ecdc; stroke-width: 20; stroke-linecap: round; opacity: 0; filter: blur(3px); }\n"
    "      .brillo { opacity: .85; }"
)


def split_scenes(html, comp):
    m = re.search(r'<style id="shared">(.*?)</style>', html, flags=re.S)
    shared = m.group(1) if m else ""
    helpers = (ROOT / "tools/hf-helpers.js").read_text()
    (comp / "compositions").mkdir(exist_ok=True)

    def rep(m):
        sid, start, dur, track, body = m.group(1), m.group(2), m.group(3), m.group(4), m.group(5)
        sm = re.search(r"<script>(.*?)</script>", body, flags=re.S)
        js = sm.group(1) if sm else ""
        markup = body.replace(sm.group(0), "") if sm else body
        f = f"""<!doctype html>
<html lang="es">
  <head><meta charset="UTF-8" /></head>
  <body>
    <template>
      <style>{shared}
      #{sid} {{ position: absolute; inset: 0; }}
      </style>
      <div id="{sid}" data-composition-id="{sid}" data-width="1080" data-height="1920">{markup}</div>
      <script>
        (() => {{
{helpers}
          const T0 = {start};
          const tl = gsap.timeline({{ paused: true }});
{js}
          tl.shiftChildren(-T0, true);
          window.__timelines["{sid}"] = tl;
        }})();
      </script>
    </template>
  </body>
</html>
"""
        (comp / "compositions" / f"{sid}.html").write_text(f)
        return (f'<div id="host-{sid}" data-composition-id="{sid}" data-composition-src="compositions/{sid}.html" '
                f'data-start="{start}" data-duration="{dur}" data-track-index="{track}" data-width="1080" data-height="1920"></div>')

    return re.sub(r'<scene id="([a-zA-Z0-9-]+)" start="([0-9.]+)" dur="([0-9.]+)" track="([0-9]+)">(.*?)</scene>', rep, html, flags=re.S)


def build(src_path, comp):
    comp = Path(comp)
    src = Path(src_path).read_text()
    counts = {}

    def rep(m):
        name, opt = m.group(1), m.group(2)
        n = counts.get(name, 0)
        counts[name] = n + 1
        prefix = name if n == 0 else f"{name}{n + 1}"
        if opt and opt.startswith("as="):
            prefix = opt[3:]
            opt = None
        return inline_svg(name, nobg=(opt == "nobg"), prefix=prefix)

    out = re.sub(r"<!--svg:([a-z0-9-]+)(?::([a-zA-Z=0-9-]+))?-->", rep, src)
    out = out.replace("<!--css:platos-->", PLATOS_CSS)
    out = split_scenes(out, comp)
    out = out.replace("<!--js:helpers-->", "<script>\n" + (ROOT / "tools/hf-helpers.js").read_text() + "\n</script>")
    (comp / "index.html").write_text(out)
    a = comp / "assets"
    a.mkdir(exist_ok=True)
    for f in (ROOT / "assets/fonts").glob("*.woff2"):
        shutil.copy(f, a / f.name)
    for f in (ROOT / "assets/audio").glob("*"):
        shutil.copy(f, a / f.name)
    (a / "platos").mkdir(exist_ok=True)
    for f in (ROOT / "assets/platos").glob("*.png"):
        shutil.copy(f, a / "platos" / f.name)
    print("ok", comp / "index.html")


if __name__ == "__main__":
    build(sys.argv[1], sys.argv[2])
