"""Frutas ilustradas para el comercial de Tierra Santa (SVG 600x600, fondo transparente).

Uso: python3 tools/ilustrar_frutas.py   ->  assets/frutas/<fruta>.svg

Estilo: vector plano y mate con grano (nada de brillo plastico): cada fruta
entera mas una mitad abierta que muestra la pulpa, y una hoja cuando aplica.
Ids utiles para animar: #entera, #mitad, #hoja.
Todo el azar va con semilla fija: el archivo sale identico cada vez.
"""
import math
import random
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "assets/frutas"

DEFS = """<defs>
  <filter id="grano" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="5" result="n"/>
    <feColorMatrix in="n" type="saturate" values="0" result="g"/>
    <feComponentTransfer in="g" result="t">
      <feFuncR type="linear" slope=".38" intercept=".7"/><feFuncG type="linear" slope=".38" intercept=".7"/>
      <feFuncB type="linear" slope=".38" intercept=".7"/><feFuncA type="linear" slope="0" intercept="1"/>
    </feComponentTransfer>
    <feComposite in="t" in2="SourceGraphic" operator="in" result="m"/>
    <feBlend in="SourceGraphic" in2="m" mode="multiply"/>
  </filter>
  {extra}
</defs>"""


def rg(id_, c0, c1, cx="38%", cy="32%", r="75%"):
    return (f'<radialGradient id="{id_}" cx="{cx}" cy="{cy}" r="{r}">'
            f'<stop offset="0" stop-color="{c0}"/><stop offset="1" stop-color="{c1}"/></radialGradient>')


def hoja(x, y, ang, largo=150, color="#4f8a35", vena="#3a6b26"):
    return (f'<g id="hoja" transform="translate({x} {y}) rotate({ang})">'
            f'<path d="M0 0 C{largo*0.3} {-largo*0.28} {largo*0.75} {-largo*0.25} {largo} 0 C{largo*0.75} {largo*0.25} {largo*0.3} {largo*0.28} 0 0Z" fill="{color}"/>'
            f'<path d="M6 0 L{largo-12} 0" stroke="{vena}" stroke-width="5" stroke-linecap="round"/></g>')


def svg(nombre, extra, cuerpo):
    s = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">'
         f'{DEFS.format(extra=extra)}<g filter="url(#grano)">{cuerpo}</g></svg>\n')
    (OUT / f"{nombre}.svg").write_text(s)


def puntos(r, n, cx, cy, rx, ry, rad, color, op=1.0):
    out = ""
    for _ in range(n):
        a, d = r.random() * math.tau, math.sqrt(r.random())
        out += f'<circle cx="{cx + math.cos(a)*rx*d:.1f}" cy="{cy + math.sin(a)*ry*d:.1f}" r="{rad}" fill="{color}" opacity="{op}"/>'
    return out


def mango():
    ex = rg("mg", "#f7c33c", "#e2632c", "30%", "30%") + rg("mgc", "#ffc84a", "#f29a12")
    cubos = ""
    for i in range(4):
        for j in range(3):
            x, y = 330 + i * 46 - j * 8, 300 + j * 50 + i * 6
            cubos += f'<rect x="{x}" y="{y}" width="40" height="44" rx="9" fill="#f7a81e"/><rect x="{x+4}" y="{y+3}" width="32" height="14" rx="6" fill="#ffd36b" opacity=".8"/>'
    cuerpo = (
        hoja(170, 150, -150, 160) +
        '<g id="entera"><path d="M120 300 C110 190 230 140 300 190 C370 240 360 380 280 430 C200 470 128 400 120 300Z" fill="url(#mg)"/>'
        '<path d="M160 230 C190 200 230 196 250 206" stroke="#fff3c9" stroke-width="10" stroke-linecap="round" opacity=".35" fill="none"/>'
        '<path d="M232 178 C236 160 244 150 256 144" stroke="#5a3a1a" stroke-width="9" stroke-linecap="round" fill="none"/></g>'
        f'<g id="mitad"><path d="M310 290 C320 250 470 250 500 300 C520 350 480 470 410 470 C340 470 300 360 310 290Z" fill="#e8742a"/>'
        f'<path d="M322 296 C334 266 462 266 488 306 C504 350 470 456 410 456 C350 456 314 356 322 296Z" fill="url(#mgc)"/>{cubos}</g>'
    )
    svg("mango", ex, cuerpo)


def parchita():
    r = random.Random(2)
    ex = rg("pa", "#ffe36b", "#d99a12")
    semillas = ""
    for _ in range(46):
        a, d = r.random() * math.tau, math.sqrt(r.random()) * 92
        x, y = 390 + math.cos(a) * d, 350 + math.sin(a) * d * 0.95
        semillas += f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="13" ry="10" fill="#f2a516" opacity=".9"/><circle cx="{x:.1f}" cy="{y:.1f}" r="5" fill="#2a1a0c"/>'
    cuerpo = (
        hoja(60, 210, -20, 140) +
        f'<g id="entera"><circle cx="200" cy="270" r="130" fill="url(#pa)"/>{puntos(r, 40, 200, 270, 115, 115, 3, "#c98a10", .6)}'
        '<path d="M200 140 C204 120 214 108 228 102" stroke="#6b5a2a" stroke-width="8" fill="none" stroke-linecap="round"/></g>'
        f'<g id="mitad"><circle cx="390" cy="350" r="140" fill="#e3b630"/><circle cx="390" cy="350" r="122" fill="#f7ebc0"/>'
        f'<circle cx="390" cy="350" r="106" fill="#f0a21c"/>{semillas}</g>'
    )
    svg("parchita", ex, cuerpo)


def lulo():
    r = random.Random(3)
    ex = rg("lu", "#ffb847", "#d86a0e")
    gajos = "".join(
        f'<path d="M390 350 L{390 + math.cos(a)*100:.1f} {350 + math.sin(a)*100:.1f}" stroke="#7fa832" stroke-width="5" opacity=".7"/>'
        for a in [k * math.tau / 4 + 0.4 for k in range(4)])
    semillas = puntos(r, 60, 390, 350, 80, 80, 4, "#e8f0b0", .9)
    cuerpo = (
        f'<g id="entera"><circle cx="200" cy="270" r="128" fill="url(#lu)"/>{puntos(r, 160, 200, 270, 122, 122, 1.6, "#fff0c4", .55)}'
        '<path d="M200 150 l-30 -20 l24 0 l6 -26 l6 26 l24 0 Z" fill="#5f7d2a"/></g>'
        f'<g id="mitad"><circle cx="390" cy="350" r="138" fill="#e47a14"/><circle cx="390" cy="350" r="118" fill="#b5cf52"/>'
        f'<circle cx="390" cy="350" r="40" fill="#d7e48a"/>{gajos}{semillas}</g>'
    )
    svg("lulo", ex, cuerpo)


def pina():
    ex = rg("pi", "#f2b938", "#b5741a", "40%", "30%")
    celdas = ""
    for i in range(-5, 6):
        celdas += f'<path d="M{110 + i*34} 160 L{290 + i*34} 470" stroke="#8a5512" stroke-width="5" opacity=".55"/>'
        celdas += f'<path d="M{290 + i*34} 160 L{110 + i*34} 470" stroke="#8a5512" stroke-width="5" opacity=".55"/>'
    hojas = "".join(
        f'<path d="M200 190 C{200 + dx*0.4} {150 - h*0.5} {200 + dx} {150 - h} {200 + dx*1.1} {150 - h}  C{200 + dx*0.6} {170 - h*0.4} 210 190 200 190Z" fill="{c}"/>'
        for dx, h, c in [(-90, 90, "#4d8a3a"), (-50, 140, "#5f9c45"), (0, 170, "#4d8a3a"), (50, 140, "#6aa64e"), (90, 100, "#4d8a3a")])
    cuerpo = (
        f'<g id="entera">{hojas}<clipPath id="pic"><ellipse cx="200" cy="330" rx="112" ry="150"/></clipPath>'
        f'<ellipse cx="200" cy="330" rx="112" ry="150" fill="url(#pi)"/><g clip-path="url(#pic)">{celdas}</g></g>'
        '<g id="mitad"><circle cx="420" cy="400" r="130" fill="#c58a26"/><circle cx="420" cy="400" r="116" fill="#f8d548"/>'
        '<circle cx="420" cy="400" r="34" fill="#fbe8a0"/>'
        + "".join(f'<path d="M420 400 L{420 + math.cos(a)*112:.1f} {400 + math.sin(a)*112:.1f}" stroke="#eabf35" stroke-width="5"/>' for a in [k * math.tau / 12 for k in range(12)])
        + '</g>'
    )
    svg("pina", ex, cuerpo)


def durazno():
    ex = rg("du", "#ffc067", "#e0532f", "35%", "30%")
    cuerpo = (
        hoja(230, 140, -40, 150) +
        '<g id="entera"><circle cx="210" cy="290" r="135" fill="url(#du)"/>'
        '<path d="M206 160 C176 230 180 340 214 420" stroke="#c4452a" stroke-width="7" fill="none" opacity=".55"/></g>'
        '<g id="mitad"><circle cx="400" cy="370" r="132" fill="#e86a34"/><circle cx="400" cy="370" r="118" fill="#fbb648"/>'
        '<circle cx="400" cy="370" r="90" fill="#fdc566" opacity=".7"/>'
        '<ellipse cx="400" cy="370" rx="44" ry="54" fill="#8a3d1c"/><path d="M380 340 q20 10 2 30 q-16 18 6 36" stroke="#5e260f" stroke-width="5" fill="none"/></g>'
    )
    svg("durazno", ex, cuerpo)


def guayaba():
    r = random.Random(6)
    ex = rg("gu", "#e3e98a", "#93ab3c", "35%", "30%")
    cuerpo = (
        hoja(60, 300, -60, 150) +
        f'<g id="entera"><circle cx="210" cy="280" r="128" fill="url(#gu)"/>{puntos(r, 30, 210, 280, 110, 110, 3, "#7d9233", .5)}</g>'
        f'<g id="mitad"><circle cx="400" cy="370" r="134" fill="#b9c55a"/><circle cx="400" cy="370" r="120" fill="#f47d74"/>'
        f'<circle cx="400" cy="370" r="66" fill="#f9a8a0"/>{puntos(r, 50, 400, 370, 58, 58, 5, "#fde0c8", .95)}</g>'
    )
    svg("guayaba", ex, cuerpo)


def tomate_de_arbol():
    r = random.Random(7)
    ex = rg("ta", "#d2453f", "#6e1426", "35%", "30%")
    semillas = ""
    for k in range(18):
        a = k * math.tau / 18
        x, y = 400 + math.cos(a) * 54, 370 + math.sin(a) * 64
        semillas += f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="9" ry="7" fill="#3c0d1b"/>'
    cuerpo = (
        '<g id="entera"><path d="M210 140 C300 140 330 300 290 380 C260 440 160 440 130 380 C90 300 120 140 210 140Z" fill="url(#ta)"/>'
        '<path d="M210 140 C214 112 226 96 244 88" stroke="#4d5a26" stroke-width="9" fill="none" stroke-linecap="round"/></g>'
        f'<g id="mitad"><ellipse cx="400" cy="370" rx="118" ry="140" fill="#9c2032"/><ellipse cx="400" cy="370" rx="104" ry="126" fill="#f28a2e"/>'
        f'<ellipse cx="400" cy="370" rx="70" ry="84" fill="#7a1a2c"/><ellipse cx="400" cy="370" rx="40" ry="50" fill="#e9772a"/>{semillas}</g>'
    )
    svg("tomate-de-arbol", ex, cuerpo)


def fresa():
    r = random.Random(8)
    ex = rg("fr", "#f0485a", "#a8122a", "35%", "30%")
    semillas = ""
    for _ in range(40):
        x, y = 210 + r.uniform(-95, 95), 300 + r.uniform(-60, 120)
        if ((x - 210) / 110) ** 2 + ((y - 300) / 150) ** 2 < 0.8 and y < 420 - abs(x - 210) * 0.8:
            semillas += f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="4" ry="6" fill="#f7d36a"/>'
    cuerpo = (
        '<g id="entera"><path d="M210 180 C300 170 340 240 320 310 C300 380 240 440 210 460 C180 440 120 380 100 310 C80 240 120 170 210 180Z" fill="url(#fr)"/>'
        f'{semillas}<path d="M210 186 l-62 -14 l40 -10 l-20 -34 l40 22 l2 -40 l20 40 l40 -22 l-20 34 l40 10 Z" fill="#4f8a35"/></g>'
        '<g id="mitad"><path d="M410 240 C480 234 510 290 494 340 C478 392 430 440 410 452 C390 440 342 392 326 340 C310 290 340 234 410 240Z" fill="#d8233c"/>'
        '<path d="M410 262 C462 258 482 300 470 338 C458 376 424 412 410 420 C396 412 362 376 350 338 C338 300 358 258 410 262Z" fill="#f47a84"/>'
        '<path d="M410 270 C420 320 418 370 410 410" stroke="#fbd0cf" stroke-width="16" stroke-linecap="round" fill="none"/></g>'
    )
    svg("fresa", ex, cuerpo)


def mora():
    r = random.Random(9)
    ex = rg("mo", "#7a2c5a", "#2a0c22", "35%", "30%")

    def baya(cx, cy, s, gid=""):
        g = f'<g {gid}>'
        for k in range(26):
            a, d = r.random() * math.tau, math.sqrt(r.random())
            x, y = cx + math.cos(a) * 60 * s * d, cy + math.sin(a) * 76 * s * d
            g += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{22*s:.1f}" fill="url(#mo)"/><circle cx="{x-6*s:.1f}" cy="{y-7*s:.1f}" r="{5*s:.1f}" fill="#c26a9a" opacity=".55"/>'
        return g + "</g>"

    cuerpo = hoja(330, 140, 200, 150) + baya(220, 300, 1.15, 'id="entera"') + baya(410, 380, 0.95, 'id="mitad"')
    svg("mora", ex, cuerpo)


def tamarindo():
    ex = rg("tm", "#c9995d", "#8a5a2c", "35%", "30%")
    cuerpo = (
        '<g id="entera"><path d="M90 260 C120 200 180 230 210 210 C250 186 300 220 340 200 C380 182 430 210 440 250 C450 300 400 300 360 310 C320 320 270 300 230 320 C180 344 110 330 90 260Z" fill="url(#tm)"/>'
        '<path d="M210 214 C214 260 220 300 228 320 M340 204 C346 246 352 286 360 310" stroke="#7a4a1e" stroke-width="5" fill="none" opacity=".6"/></g>'
        '<g id="mitad"><path d="M200 400 C250 350 330 360 400 380 C450 394 480 430 450 460 C420 490 330 480 280 470 C230 460 170 440 200 400Z" fill="#c9995d"/>'
        '<path d="M222 410 C268 376 330 384 392 398 C430 408 452 432 432 452 C408 470 336 462 292 456 C244 448 200 432 222 410Z" fill="#6b3417"/>'
        '<path d="M250 420 C300 400 360 410 410 430" stroke="#a5582a" stroke-width="8" fill="none" opacity=".7"/></g>'
    )
    svg("tamarindo", ex, cuerpo)


def guanabana():
    r = random.Random(10)
    ex = rg("ga", "#93bf55", "#4a7a2a", "35%", "30%")
    espinas = ""
    for _ in range(60):
        a, d = r.random() * math.tau, math.sqrt(r.random())
        x, y = 200 + math.cos(a) * 100 * d, 290 + math.sin(a) * 140 * d
        espinas += f'<path d="M{x:.1f} {y:.1f} l-7 10 l14 0 Z" fill="#3d6a22" opacity=".8"/>'
    cuerpo = (
        f'<g id="entera"><ellipse cx="200" cy="290" rx="118" ry="160" fill="url(#ga)"/>{espinas}</g>'
        f'<g id="mitad"><ellipse cx="410" cy="380" rx="122" ry="138" fill="#5d8f2e"/><ellipse cx="410" cy="380" rx="108" ry="124" fill="#f8f4e6"/>'
        f'{puntos(r, 11, 410, 380, 80, 92, 0, "#000")}'
        + "".join(f'<ellipse cx="{410 + math.cos(k*0.9)*60:.1f}" cy="{380 + math.sin(k*0.9)*74:.1f}" rx="9" ry="14" fill="#2a1a12" transform="rotate({k*30} {410 + math.cos(k*0.9)*60:.1f} {380 + math.sin(k*0.9)*74:.1f})"/>' for k in range(7))
        + '</g>'
    )
    svg("guanabana", ex, cuerpo)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for f in (mango, parchita, lulo, pina, durazno, guayaba, tomate_de_arbol, fresa, mora, tamarindo, guanabana):
        f()
    print("ok")
