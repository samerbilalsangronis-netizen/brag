"""Recorta los empaques reales de refs/pulpas/ y les quita el fondo.

Uso: python3 tools/recortar_empaques.py

Las fotos tienen frutas, vasos y pajillas tapando la parte baja de la bolsa,
asi que un modelo automatico de "quitar fondo" se lleva esos objetos o borra
la bolsa. Aqui el contorno de cada bolsa esta trazado a mano (fracciones de la
caja recortada) y la parte baja se desvanece donde empiezan los objetos que la
tapan. La etiqueta y la bolsa quedan tal cual, sin redibujar nada.
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "refs/pulpas"
OUT = ROOT / "assets/empaques"

# sabor: (archivo, ancho de la vista previa, caja en la vista previa de 900 px de alto,
#         contorno en fracciones de la caja, (inicio, fin) del desvanecido inferior)
EMPAQUES = {
    "durazno-melocoton": ("durazno.jpeg", 677, (118, 136, 554, 690),
        [(0.03, 0.0), (0.95, 0.0), (0.94, 0.25), (0.93, 0.55), (0.92, 0.80), (0.06, 0.80), (0.04, 0.25)], (0.62, 0.80)),
    "fresa": ("fresa.png", 677, (168, 200, 508, 705),
        [(0.05, 0.02), (0.95, 0.02), (0.95, 0.24), (0.88, 0.30), (0.87, 0.95), (0.11, 0.95), (0.10, 0.30), (0.05, 0.24)], (0.74, 0.92)),
    "guanabana-con-fresa": ("guanabana-fresa.png", 677, (129, 91, 556, 709),
        [(0.01, 0.01), (0.97, 0.01), (0.97, 0.25), (0.93, 0.40), (0.93, 0.93), (0.04, 0.93), (0.04, 0.30), (0.01, 0.25)], (0.72, 0.92)),
    "guanabana": ("Gemini_Generated_Image_mdlcn3mdlcn3mdlc.png", 677, (168, 246, 504, 734),
        [(0.07, 0.0), (0.94, 0.0), (0.95, 0.21), (0.95, 0.95), (0.06, 0.95), (0.05, 0.21)], (0.80, 0.95)),
    "guayaba": ("guayaba.png", 677, (133, 124, 520, 632),
        [(0.02, 0.03), (0.98, 0.03), (0.97, 0.28), (0.95, 0.55), (0.94, 0.92), (0.06, 0.92), (0.05, 0.30)], (0.70, 0.90)),
    "lulo": ("lulo.png", 506, (83, 186, 426, 676),
        [(0.04, 0.0), (0.96, 0.0), (0.96, 0.28), (0.93, 0.42), (0.93, 0.88), (0.08, 0.88), (0.06, 0.28)], (0.66, 0.86)),
    "mango": ("mango.png", 506, (83, 186, 426, 684),
        [(0.04, 0.0), (0.96, 0.0), (0.96, 0.28), (0.93, 0.42), (0.93, 0.88), (0.08, 0.88), (0.06, 0.28)], (0.66, 0.86)),
    "mora": ("mora.png", 677, (143, 91, 546, 719),
        [(0.03, 0.0), (0.96, 0.0), (0.95, 0.21), (0.92, 0.28), (0.91, 0.96), (0.08, 0.97), (0.06, 0.28), (0.03, 0.21)], (0.70, 0.95)),
    "parchita": ("Gemini_Generated_Image_k5ss24k5ss24k5ss.png", 677, (131, 121, 551, 734),
        [(0.01, 0.0), (0.99, 0.0), (0.98, 0.22), (0.96, 0.62), (0.05, 0.62), (0.03, 0.22)], (0.44, 0.62)),
    "pina": ("pina.png", 677, (151, 176, 522, 672),
        [(0.04, 0.0), (0.96, 0.0), (0.96, 0.27), (0.95, 0.80), (0.06, 0.80), (0.05, 0.27)], (0.62, 0.80)),
    "tamarindo": ("tamarindo.png", 677, (159, 174, 522, 694),
        [(0.02, 0.0), (0.98, 0.0), (0.98, 0.22), (0.97, 0.90), (0.05, 0.90), (0.03, 0.22)], (0.72, 0.90)),
    "tomate-de-arbol": ("tomatedearbol.png", 506, (84, 182, 424, 669),
        [(0.04, 0.0), (0.96, 0.0), (0.96, 0.28), (0.93, 0.45), (0.93, 0.86), (0.08, 0.86), (0.06, 0.28)], (0.64, 0.84)),
}


def recortar(nombre, archivo, ancho_previa, caja, contorno, fade):
    im = Image.open(SRC / archivo).convert("RGB")
    s = im.height / 900
    c = im.crop(tuple(int(v * s) for v in caja))
    w, h = c.size
    mask = Image.new("L", (w * 2, h * 2), 0)  # dibujado al doble para un borde suave
    ImageDraw.Draw(mask).polygon([(x * w * 2, y * h * 2) for x, y in contorno], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(3)).resize((w, h), Image.LANCZOS)
    y0, y1 = int(fade[0] * h), int(fade[1] * h)
    grad = Image.new("L", (1, h), 255)
    for y in range(h):
        if y >= y1:
            v = 0
        elif y > y0:
            t = (y - y0) / (y1 - y0)
            v = int(255 * (1 - t) ** 1.6)
        else:
            v = 255
        grad.putpixel((0, y), v)
    grad = grad.resize((w, h))
    alpha = Image.composite(mask, Image.new("L", (w, h), 0), grad)
    out = c.convert("RGBA")
    out.putalpha(alpha)
    out = out.crop(out.getbbox())
    out.save(OUT / f"{nombre}.png")
    return out.size


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for nombre, datos in EMPAQUES.items():
        print(nombre, recortar(nombre, *datos))
