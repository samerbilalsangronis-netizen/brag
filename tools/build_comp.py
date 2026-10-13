"""Arma el index.html de una composicion Hyperframes a partir de src.html.

Uso: python3 tools/build_comp.py <fuente.src.html> <carpeta-composicion>

Marcadores que reemplaza en la fuente:
  <!--svg:NOMBRE-->        ilustracion de assets/platos/NOMBRE.svg completa
  <!--svg:NOMBRE:nobg-->   la misma sin el fondo (para que flote sobre la escena)
  <!--svg:logo-->          logo real de Habibis (assets/habibis/logo.svg)
  <!--js:helpers-->        resortes y vapor (tools/hf-helpers.js)

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

    out = re.sub(r"<!--svg:([a-z0-9-]+)(?::([a-z=0-9-]+))?-->", rep, src)
    out = out.replace("<!--js:helpers-->", "<script>\n" + (ROOT / "tools/hf-helpers.js").read_text() + "\n</script>")
    (comp / "index.html").write_text(out)
    a = comp / "assets"
    a.mkdir(exist_ok=True)
    for f in (ROOT / "assets/fonts").glob("*.woff2"):
        shutil.copy(f, a / f.name)
    for f in (ROOT / "assets/audio").glob("*"):
        shutil.copy(f, a / f.name)
    print("ok", comp / "index.html")


if __name__ == "__main__":
    build(sys.argv[1], sys.argv[2])
