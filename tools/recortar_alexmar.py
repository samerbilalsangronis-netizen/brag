"""Recorta los productos de Alexmar del cesped verde (refs/alexmar -> assets/alexmar).
Cada pieza se busca dentro de un rectangulo: se quita lo verde, se rellenan huecos
(los lentes transparentes dejan ver el cesped) y se queda la mancha mas grande."""
from PIL import Image, ImageFilter
import numpy as np
from scipy import ndimage

PIEZAS = {
    "cruce-caribe": [(22, 158, 188, 458), (372, 158, 572, 458)],
    "stop-fiesta-max": [(70, 68, 224, 552), (373, 68, 535, 552)],
    "tapa-stop-chevy500": [(90, 112, 265, 334), (308, 112, 475, 334)],
    "cruce-npr": [(96, 144, 245, 358), (280, 144, 430, 358)],
}

# restos del texto de la publicacion encima del producto
BORRAR = {"stop-fiesta-max": [(208, 470, 224, 515), (373, 470, 392, 515)]}

def pieza(a, x0, y0, x1, y1):
    c = a[y0:y1, x0:x1].astype(int)
    r, g, b = c[..., 0], c[..., 1], c[..., 2]
    cesped = (g > r + 12) & (g > b + 4)
    m = ndimage.binary_opening(~cesped, iterations=2)
    lab, n = ndimage.label(m)
    if n == 0:
        return np.zeros(c.shape[:2], bool)
    tam = ndimage.sum(m, lab, range(1, n + 1))
    m = lab == (np.argmax(tam) + 1)
    m = ndimage.binary_closing(m, iterations=4)
    return ndimage.binary_fill_holes(m)

for nombre, rects in PIEZAS.items():
    im = Image.open(f"refs/alexmar/{nombre}.png").convert("RGB")
    a = np.array(im)
    mask = np.zeros(a.shape[:2], bool)
    for x0, y0, x1, y1 in rects:
        mask[y0:y1, x0:x1] |= pieza(a, x0, y0, x1, y1)
    for x0, y0, x1, y1 in BORRAR.get(nombre, []):
        mask[y0:y1, x0:x1] = False
    al = Image.fromarray(mask.astype(np.uint8) * 255).filter(ImageFilter.GaussianBlur(1))
    out = im.convert("RGBA"); out.putalpha(al)
    out = out.crop(out.getbbox())
    out = out.resize((out.width * 2, out.height * 2), Image.LANCZOS)
    out.save(f"assets/alexmar/{nombre}.png")
    print(nombre, out.size)
