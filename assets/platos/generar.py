"""Genera las 6 ilustraciones de platos de Habibis (SVG 1080x1080).

Uso: python3 assets/platos/generar.py
Los PNG se sacan despues con assets/platos/png.mjs.
"""
import math
import random
from pathlib import Path

OUT = Path(__file__).parent

# Paleta real de habibis-chi.vercel.app
INK = "#14201a"
INK2 = "#1c2b23"
GOLD = "#e1b35c"
GOLD_L = "#f0c879"
GOLD_D = "#b08030"
TERRA = "#c8553d"
TERRA_D = "#a8402c"
TERRA_L = "#dd6e54"
SAND = "#f5ecdc"
SAND2 = "#e8dac4"

# Comida
BREAD = "#dcae6e"
BREAD_L = "#ecc893"
BREAD_D = "#b8803f"
CHICKEN = "#c4743a"
CHICKEN_D = "#9a4f22"
FRY = "#f2c14e"
FRY_D = "#d89a2b"
PICKLE = "#7da246"
PICKLE_L = "#bcd47c"
TOUM = "#fbf4e6"
GREEN = "#6f9a3e"
GREEN_D = "#4f7a2a"
TOMATO = "#d9432f"


def defs():
    return f"""
  <defs>
    <radialGradient id="halo" cx="50%" cy="56%" r="52%">
      <stop offset="0" stop-color="{GOLD}" stop-opacity=".30"/>
      <stop offset=".55" stop-color="{GOLD}" stop-opacity=".08"/>
      <stop offset="1" stop-color="{GOLD}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="ball" cx="38%" cy="32%" r="70%">
      <stop offset="0" stop-color="#d48b45"/>
      <stop offset=".6" stop-color="#a65d26"/>
      <stop offset="1" stop-color="#6e3a14"/>
    </radialGradient>
    <linearGradient id="goldline" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="{GOLD_L}"/>
      <stop offset="1" stop-color="#b9822f"/>
    </linearGradient>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="11" result="n"/>
      <feColorMatrix in="n" type="saturate" values="0" result="g"/>
      <feComponentTransfer in="g" result="t">
        <feFuncR type="linear" slope=".35" intercept=".72"/>
        <feFuncG type="linear" slope=".35" intercept=".72"/>
        <feFuncB type="linear" slope=".35" intercept=".72"/>
        <feFuncA type="linear" slope="0" intercept="1"/>
      </feComponentTransfer>
      <feComposite in="t" in2="SourceGraphic" operator="in" result="m"/>
      <feBlend in="SourceGraphic" in2="m" mode="multiply"/>
    </filter>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="14"/>
    </filter>
  </defs>
  <style>
    .vapor path {{ fill: none; stroke: {SAND}; stroke-width: 20; stroke-linecap: round; opacity: .22; filter: blur(3px); }}
    .vapor path {{ animation: subir 3.2s ease-in-out infinite; }}
    .vapor path:nth-child(2) {{ animation-delay: -1.1s; }}
    .vapor path:nth-child(3) {{ animation-delay: -2.2s; }}
    .brillo {{ animation: brillar 2.4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }}
    .brillo:nth-of-type(2n) {{ animation-delay: -1.2s; }}
    @keyframes subir {{
      0% {{ transform: translateY(20px); opacity: 0; }}
      35% {{ opacity: .3; }}
      100% {{ transform: translateY(-50px); opacity: 0; }}
    }}
    @keyframes brillar {{
      0%, 100% {{ opacity: .35; transform: scale(.8); }}
      50% {{ opacity: 1; transform: scale(1.1); }}
    }}
  </style>"""


def star(cx, cy, r, op):
    s = r * 2
    return (
        f'<g transform="translate({cx} {cy})" fill="none" stroke="url(#goldline)" stroke-width="6" opacity="{op}">'
        f'<rect x="{-r}" y="{-r}" width="{s}" height="{s}" rx="6"/>'
        f'<rect x="{-r}" y="{-r}" width="{s}" height="{s}" rx="6" transform="rotate(45)"/></g>'
    )


def fondo(sombra_y=860, sombra_rx=380):
    return f"""
  <g id="fondo">
    <rect width="1080" height="1080" fill="{INK}"/>
    <rect width="1080" height="1080" fill="url(#halo)"/>
    {star(120, 120, 60, .10)}{star(960, 140, 44, .08)}{star(110, 960, 44, .08)}{star(970, 950, 60, .10)}
    <path d="M150 1080 V430 a390 390 0 0 1 780 0 V1080" fill="none" stroke="{GOLD}" stroke-width="4" opacity=".16"/>
  </g>
  <ellipse id="sombra" cx="540" cy="{sombra_y}" rx="{sombra_rx}" ry="46" fill="#000" opacity=".45" filter="url(#soft)"/>"""


def vapor(xs, y0):
    paths = "".join(
        f'<path d="M{x} {y0} c-26 -32 26 -64 0 -96 s26 -64 0 -96"/>' for x in xs
    )
    return f'<g class="vapor" id="vapor">{paths}</g>'


def brillos(pts):
    return "".join(
        f'<ellipse class="brillo" cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="#fff" opacity=".85"/>'
        for x, y, rx, ry in pts
    )


def svg(body, nombre):
    s = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">{defs()}{body}\n</svg>\n'
    (OUT / f"{nombre}.svg").write_text(s)


def shawarma(cx=540, cy=600, rot=-16, escala=1.0, gid="shawarma"):
    """Wrap de shawarma con capas separadas (ids) para animarlo capa por capa."""
    r = random.Random(3)
    pollo = []
    for i, (dx, dy, w, h, a) in enumerate([(-115, -18, 74, 48, -24), (-55, -46, 80, 52, 10), (10, -58, 84, 54, -8), (75, -40, 78, 50, 18), (128, -12, 64, 44, 30), (-20, -10, 90, 50, 4), (55, -4, 80, 46, -14)]):
        x, y = cx + dx, cy - 240 + dy
        pollo.append(
            f'<g transform="rotate({a} {x} {y})"><rect x="{x - w/2}" y="{y - h/2}" width="{w}" height="{h}" rx="16" fill="{CHICKEN}"/>'
            f'<rect x="{x - w/2}" y="{y - h/2}" width="{w}" height="{h*0.4}" rx="12" fill="#d98b4c"/>'
            f'<path d="M{x - w/2 + 12} {y + 2} l{w*0.3} -10 M{x} {y + 10} l{w*0.3} -10" stroke="{CHICKEN_D}" stroke-width="6" stroke-linecap="round"/></g>'
        )
    papas = []
    for i in range(5):
        x = cx - 80 + i * 40 + r.randint(-6, 6)
        a = r.randint(-22, 22)
        h = r.randint(90, 120)
        papas.append(
            f'<g transform="rotate({a} {x} {cy - 300})"><rect x="{x - 13}" y="{cy - 300 - h}" width="26" height="{h}" rx="7" fill="{FRY}"/>'
            f'<rect x="{x + 3}" y="{cy - 300 - h + 6}" width="6" height="{h - 14}" rx="3" fill="{FRY_D}" opacity=".6"/></g>'
        )
    pepinillos = []
    for x, y, a in [(cx - 100, cy - 290, -20), (cx + 40, cy - 312, 15), (cx + 125, cy - 268, 30)]:
        pepinillos.append(
            f'<g transform="rotate({a} {x} {y})"><ellipse cx="{x}" cy="{y}" rx="34" ry="22" fill="{PICKLE}"/>'
            f'<ellipse cx="{x}" cy="{y}" rx="34" ry="22" fill="none" stroke="{GREEN_D}" stroke-width="4" stroke-dasharray="7 5"/>'
            f'<ellipse cx="{x}" cy="{y}" rx="24" ry="14" fill="{PICKLE_L}" opacity=".8"/></g>'
        )
    t = cy - 240  # boca del pan
    return f"""
  <g id="{gid}" transform="rotate({rot} {cx} {cy}) translate({cx} {cy}) scale({escala}) translate({-cx} {-cy})">
    <g id="pan" filter="url(#grain)">
      <ellipse cx="{cx}" cy="{t}" rx="170" ry="52" fill="{BREAD_L}"/>
      <path d="M{cx - 170} {t} L{cx - 130} {cy + 250} Q{cx} {cy + 290} {cx + 130} {cy + 250} L{cx + 170} {t} Z" fill="{BREAD}"/>
      <ellipse cx="{cx - 60}" cy="{cy - 80}" rx="22" ry="12" fill="{BREAD_D}" opacity=".5"/>
      <ellipse cx="{cx + 70}" cy="{cy - 20}" rx="16" ry="9" fill="{BREAD_D}" opacity=".5"/>
      <ellipse cx="{cx + 10}" cy="{cy - 140}" rx="12" ry="7" fill="{BREAD_D}" opacity=".45"/>
      <path d="M{cx - 160} {cy - 150} Q{cx} {cy - 60} {cx + 160} {cy - 200} M{cx - 150} {cy - 40} Q{cx} {cy + 40} {cx + 152} {cy - 90}" stroke="{BREAD_D}" stroke-width="7" fill="none" opacity=".55" stroke-linecap="round"/>
      <path d="M{cx - 170} {t} Q{cx} {t + 62} {cx + 170} {t} L{cx + 168} {t + 34} Q{cx} {t + 96} {cx - 168} {t + 34} Z" fill="{BREAD_D}" opacity=".55"/>
      <g id="papel">
        <path d="M{cx - 150} {cy + 20} Q{cx} {cy + 70} {cx + 150} {cy + 20} L{cx + 130} {cy + 250} Q{cx} {cy + 290} {cx - 130} {cy + 250} Z" fill="{TERRA}"/>
        <path d="M{cx - 146} {cy + 60} Q{cx} {cy + 110} {cx + 146} {cy + 60}" fill="none" stroke="{GOLD}" stroke-width="8"/>
        <path d="M{cx - 140} {cy + 100} Q{cx} {cy + 150} {cx + 140} {cy + 100}" fill="none" stroke="{GOLD}" stroke-width="4" opacity=".7"/>
        <path d="M{cx + 150} {cy + 20} L{cx + 60} {cy + 160} L{cx + 140} {cy + 130} Z" fill="{TERRA_D}"/>
        {star(cx - 40, cy + 185, 26, .9)}
      </g>
    </g>
    <g id="pollo" filter="url(#grain)">{''.join(pollo)}</g>
    <g id="toum">
      <path d="M{cx - 150} {t - 30} q30 -40 60 -10 q30 30 60 -16 q30 -44 60 -6 q30 34 60 -14 q24 -30 50 6" stroke="{TOUM}" stroke-width="20" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M{cx - 60} {t - 30} q4 40 0 52 q-8 10 -12 0 q-2 -26 2 -50 Z M{cx + 60} {t - 34} q4 30 0 42 q-8 10 -12 0 q-2 -20 2 -40 Z" fill="{TOUM}"/>
      {brillos([(cx - 85, t - 48, 10, 5), (cx + 40, t - 50, 9, 4), (cx - 20, t - 70, 8, 4)])}
    </g>
    <g id="papas" filter="url(#grain)">{''.join(papas)}</g>
    <g id="pepinillos">{''.join(pepinillos)}</g>
  </g>"""


def plato_ceramica(cx=540, cy=650, rx=410, ry=250):
    return f"""
    <ellipse cx="{cx}" cy="{cy + 18}" rx="{rx}" ry="{ry}" fill="{SAND2}"/>
    <ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{SAND}"/>
    <ellipse cx="{cx}" cy="{cy}" rx="{rx - 40}" ry="{ry - 30}" fill="none" stroke="{TERRA}" stroke-width="6" stroke-dasharray="4 18" stroke-linecap="round"/>
    <ellipse cx="{cx}" cy="{cy + 6}" rx="{rx - 70}" ry="{ry - 52}" fill="#efe3cc"/>"""


def p_shawarma():
    body = fondo(860, 300) + vapor([480, 560, 640], 300) + shawarma()
    svg(body, "shawarma-de-pollo")


def p_plato():
    r = random.Random(5)
    granos = "".join(
        f'<ellipse cx="{430 + r.randint(-120, 120)}" cy="{640 + r.randint(-60, 60)}" rx="9" ry="4" transform="rotate({r.randint(0, 180)} 0 0)" fill="#e6d8b8"/>'
        for _ in range(0)
    )
    # Granos de arroz sin rotacion global (rotate respecto al propio grano)
    granos = ""
    for _ in range(70):
        x, y = 430 + r.randint(-125, 125), 650 + r.randint(-62, 56)
        if ((x - 430) / 140) ** 2 + ((y - 650) / 80) ** 2 > 1:
            continue
        granos += f'<ellipse cx="{x}" cy="{y}" rx="9" ry="4" transform="rotate({r.randint(0, 180)} {x} {y})" fill="#e3d3b0"/>'
    azafran = "".join(
        f'<path d="M{380 + i * 30} {620 + (i % 2) * 30} q12 -8 24 0" stroke="#e9b949" stroke-width="6" fill="none" stroke-linecap="round"/>'
        for i in range(5)
    )
    tajadas = ""
    for i, (x, y, a) in enumerate([(560, 600, -30), (615, 585, -12), (670, 585, 6), (720, 600, 24), (600, 640, -20), (665, 640, 10)]):
        tajadas += (
            f'<g transform="rotate({a} {x} {y})"><path d="M{x - 26} {y + 40} q-6 -60 26 -84 q32 24 26 84 q-26 10 -52 0 Z" fill="{CHICKEN}"/>'
            f'<path d="M{x - 10} {y + 30} q-2 -40 12 -62" stroke="#d98b4c" stroke-width="8" fill="none" stroke-linecap="round"/>'
            f'<path d="M{x + 12} {y + 30} q2 -36 -4 -56" stroke="{CHICKEN_D}" stroke-width="5" fill="none" stroke-linecap="round"/></g>'
        )
    body = fondo(880, 420) + vapor([500, 600, 700], 380) + f"""
  <g id="plato" filter="url(#grain)">
    {plato_ceramica()}
    <path d="M760 470 L900 560 L740 610 Z" fill="{BREAD}"/><path d="M760 470 L900 560 L820 560 Z" fill="{BREAD_D}" opacity=".5"/>
    <ellipse cx="430" cy="650" rx="140" ry="80" fill="#f8f1e2"/>
    {granos}{azafran}
    {tajadas}
    <g>
      <path d="M560 760 q60 -60 130 -20 q40 30 0 60 q-70 30 -130 -40 Z" fill="{GREEN}"/>
      <path d="M600 760 q40 -30 80 0" stroke="{GREEN_D}" stroke-width="5" fill="none"/>
      <circle cx="700" cy="720" r="36" fill="{TOMATO}"/><circle cx="700" cy="720" r="24" fill="#ef6a52"/>
      <circle cx="640" cy="790" r="30" fill="{TOMATO}"/><circle cx="640" cy="790" r="19" fill="#ef6a52"/>
    </g>
    <ellipse cx="330" cy="750" rx="80" ry="44" fill="#e2c79a"/>
    <path d="M300 748 q30 -18 60 0 q-30 16 -50 2" stroke="#cfae78" stroke-width="7" fill="none"/>
    <ellipse cx="335" cy="748" rx="22" ry="10" fill="{GOLD}"/>
    <circle cx="300" cy="770" r="4" fill="#b5321c"/><circle cx="365" cy="735" r="4" fill="#b5321c"/>
  </g>
  {brillos([(600, 548, 14, 5), (690, 580, 10, 4), (690, 708, 8, 4), (330, 744, 10, 3)])}"""
    svg(body, "plato-de-shawarma")


def p_hummus():
    r = random.Random(8)
    garbanzos = ""
    for x, y in [(470, 560), (610, 590), (560, 640), (420, 630), (660, 540), (500, 520)]:
        garbanzos += f'<circle cx="{x}" cy="{y}" r="17" fill="#e9c97f"/><circle cx="{x - 5}" cy="{y - 5}" r="5" fill="#fff3d6"/>'
    perejil = "".join(
        f'<path d="M{x} {y} l9 -7 l3 10 Z" fill="{GREEN}"/>'
        for x, y in [(r.randint(380, 700), r.randint(520, 660)) for _ in range(14)]
    )
    paprika = "".join(
        f'<circle cx="{r.randint(390, 690)}" cy="{r.randint(510, 660)}" r="{r.choice([3, 4, 5])}" fill="#b5321c"/>'
        for _ in range(26)
    )
    body = fondo(860, 400) + f"""
  <g id="pan-lado" filter="url(#grain)">
    <path d="M150 640 L330 520 L340 700 Z" fill="{BREAD}"/><path d="M150 640 L330 520 L300 600 Z" fill="{BREAD_D}" opacity=".45"/>
    <path d="M930 640 L750 520 L740 700 Z" fill="{BREAD}"/><path d="M930 640 L750 520 L790 610 Z" fill="{BREAD_D}" opacity=".45"/>
  </g>
  <g id="bowl" filter="url(#grain)">
    <path d="M200 590 Q200 820 540 830 Q880 820 880 590 Z" fill="{TERRA}"/>
    <path d="M225 680 Q540 760 855 680" stroke="{GOLD}" stroke-width="8" fill="none"/>
    <path d="M250 720 Q540 790 830 720" stroke="{GOLD}" stroke-width="4" fill="none" opacity=".7"/>
    <ellipse cx="540" cy="590" rx="340" ry="150" fill="{TERRA_D}"/>
    <ellipse cx="540" cy="592" rx="306" ry="128" fill="#e8cf9e"/>
    <path d="M540 592 m-240 0 a240 96 0 1 0 480 0 a200 78 0 1 0 -400 0 a160 60 0 1 0 320 0 a110 40 0 1 0 -220 0" fill="none" stroke="#d2b07a" stroke-width="14" stroke-linecap="round"/>
    <ellipse cx="540" cy="590" rx="96" ry="38" fill="{GOLD}" opacity=".9"/>
    <ellipse cx="540" cy="588" rx="60" ry="20" fill="{GOLD_L}" opacity=".8"/>
    {garbanzos}{paprika}{perejil}
  </g>
  {brillos([(520, 580, 20, 6), (580, 596, 10, 4), (300, 560, 16, 5)])}"""
    svg(body, "hummus")


def p_falafel():
    r = random.Random(13)
    bolas = ""
    pos = [(400, 610), (540, 590), (680, 610), (460, 700), (620, 700), (540, 520)]
    for i, (x, y) in enumerate(pos):
        crust = "".join(
            f'<circle cx="{x + r.randint(-48, 48)}" cy="{y + r.randint(-48, 48)}" r="{r.choice([3, 4, 5])}" fill="#5a2e0e" opacity=".7"/>'
            for _ in range(16)
        )
        bolas += f'<circle cx="{x}" cy="{y}" r="68" fill="url(#ball)"/>{crust}'
        if i == 4:
            bolas += f'<ellipse cx="{x}" cy="{y + 4}" rx="50" ry="46" fill="#7aa043"/><ellipse cx="{x}" cy="{y + 4}" rx="34" ry="30" fill="#98bd5a"/>'
    body = fondo(880, 400) + vapor([450, 540, 630], 400) + f"""
  <g id="plato" filter="url(#grain)">
    {plato_ceramica()}
    {bolas}
    <path d="M330 560 q40 40 80 0 q40 -40 80 0 q40 40 80 0 q40 -40 80 0 q40 40 80 0" stroke="{TOUM}" stroke-width="12" fill="none" stroke-linecap="round" opacity=".95"/>
    <path d="M360 680 q40 30 80 0 q40 -30 80 0 q40 30 80 0" stroke="{TOUM}" stroke-width="10" fill="none" stroke-linecap="round" opacity=".9"/>
    <path d="M760 740 a70 70 0 0 1 120 -60 Z" fill="#f4d34a"/><path d="M770 732 a58 58 0 0 1 100 -50" stroke="#fff3a6" stroke-width="8" fill="none"/>
    <path d="M250 720 q30 -40 70 -20 q-20 40 -70 20 Z" fill="{GREEN}"/><path d="M270 760 q30 -40 70 -20 q-20 40 -70 20 Z" fill="{GREEN_D}"/>
  </g>
  {brillos([(510, 552, 14, 5), (650, 578, 10, 4), (380, 580, 10, 4), (450, 668, 12, 4)])}"""
    svg(body, "falafel")


def p_combo():
    r = random.Random(21)
    papas = ""
    for i in range(9):
        x = 600 + i * 26 + r.randint(-5, 5)
        a = r.randint(-16, 16)
        h = r.randint(120, 170)
        papas += f'<g transform="rotate({a} {x} 650)"><rect x="{x - 12}" y="{650 - h}" width="24" height="{h}" rx="6" fill="{FRY}"/><rect x="{x + 2}" y="{650 - h + 6}" width="6" height="{h - 12}" rx="3" fill="{FRY_D}" opacity=".6"/></g>'
    body = fondo(880, 430) + vapor([360, 430], 330) + f"""
  <g id="bebida" filter="url(#grain)">
    <path d="M690 300 L720 120" stroke="{TERRA}" stroke-width="16" stroke-linecap="round"/>
    <path d="M610 310 L850 310 L820 640 L640 640 Z" fill="{SAND}"/>
    <path d="M618 400 L842 400 L834 480 L626 480 Z" fill="{TERRA}"/>
    {star(730, 440, 22, .95)}
    <rect x="598" y="290" width="264" height="34" rx="12" fill="{SAND2}"/>
    <ellipse cx="760" cy="350" rx="16" ry="40" fill="#fff" opacity=".35"/>
  </g>
  <g id="caja-papas" filter="url(#grain)">
    {papas}
    <path d="M570 620 L860 620 L830 860 L600 860 Z" fill="{TERRA}"/>
    <path d="M570 620 Q715 680 860 620 L855 660 Q715 720 575 660 Z" fill="{TERRA_D}"/>
    <path d="M590 760 Q715 800 840 760" stroke="{GOLD}" stroke-width="8" fill="none"/>
  </g>
  {shawarma(400, 620, -24, .82, "wrap")}
  {brillos([(780, 360, 10, 26), (640, 520, 10, 4), (700, 500, 8, 4)])}"""
    svg(body, "combo-habibi")


def p_knafeh():
    r = random.Random(34)
    hebras = ""
    for _ in range(160):
        x, y = 540 + r.randint(-300, 300), 600 + r.randint(-130, 130)
        if ((x - 540) / 300) ** 2 + ((y - 600) / 130) ** 2 > 0.92:
            continue
        hebras += f'<path d="M{x} {y} q12 -8 26 -2" stroke="{r.choice(["#f2a54a", "#c45f1c", "#e88a32"])}" stroke-width="5" fill="none" stroke-linecap="round"/>'
    pist = "".join(
        f'<rect x="{540 + r.randint(-110, 110)}" y="{590 + r.randint(-40, 40)}" width="12" height="9" rx="2" transform="rotate({r.randint(0, 90)} 540 600)" fill="{r.choice(["#8fb34a", "#6f9a3e", "#b3cf6a"])}"/>'
        for _ in range(40)
    )
    body = fondo(870, 420) + vapor([470, 610], 420) + f"""
  <g id="bandeja" filter="url(#grain)">
    <ellipse cx="540" cy="640" rx="380" ry="190" fill="{GOLD_D}"/>
    <ellipse cx="540" cy="620" rx="380" ry="190" fill="{GOLD}"/>
    <ellipse cx="540" cy="620" rx="350" ry="168" fill="#9c6a22"/>
    <path d="M190 600 L190 640 Q540 790 890 640 L890 600 Z" fill="#c45f1c"/>
    <ellipse cx="540" cy="600" rx="340" ry="150" fill="#e07a2a"/>
    {hebras}
    {pist}
    <ellipse cx="540" cy="600" rx="240" ry="90" fill="#fff" opacity=".10"/>
  </g>
  <g id="porcion" filter="url(#grain)">
    <path d="M600 830 L780 790 L760 900 Z" fill="#e07a2a"/>
    <path d="M630 830 q20 -6 40 0 M690 820 q16 -6 34 0 M700 860 q14 -6 30 0" stroke="#c45f1c" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M600 830 L760 900 L760 914 L600 844 Z" fill="#c45f1c"/>
    <path d="M600 844 L760 914 L760 934 L600 864 Z" fill="#fbf4e6"/>
    <path d="M600 864 L760 934 L760 948 L600 878 Z" fill="#c45f1c"/>
    <path d="M620 826 q-20 -40 -10 -86 M650 822 q-6 -40 4 -78" stroke="#fbf4e6" stroke-width="8" fill="none" stroke-linecap="round"/>
    <rect x="690" y="826" width="10" height="8" rx="2" fill="#8fb34a"/><rect x="720" y="840" width="10" height="8" rx="2" fill="#6f9a3e"/>
  </g>
  {brillos([(470, 560, 26, 7), (640, 620, 18, 5), (600, 756, 14, 4)])}"""
    svg(body, "knafeh")


if __name__ == "__main__":
    for f in (p_shawarma, p_plato, p_hummus, p_falafel, p_combo, p_knafeh):
        f()
    print("ok")
