"""Vectoriza el logo de Tierra Santa (refs/logo-tierra-santa.jpg) a assets/tierra-santa/logo.svg.
El SVG usa fill="currentColor" para poder pintarlo de cualquier color en el video."""
import numpy as np
import potrace  # pip install potracer
from PIL import Image

im = Image.open("refs/logo-tierra-santa.jpg").convert("L")
im = im.crop((8, 8, im.width - 8, im.height - 8)).resize(((im.width - 16) * 4, (im.height - 16) * 4), Image.LANCZOS)
a = np.array(im) < 128
ys, xs = np.where(a)
a = a[ys.min() - 4 : ys.max() + 5, xs.min() - 4 : xs.max() + 5]
H, W = a.shape
# potracer traza las celdas en False, por eso se invierte
plist = potrace.Bitmap(~a).trace(turdsize=8, alphamax=1.0, opticurve=True, opttolerance=0.2)
parts = []
for c in plist:
    s = c.start_point
    d = [f"M{s.x:.1f} {s.y:.1f}"]
    for seg in c.segments:
        if seg.is_corner:
            d.append(f"L{seg.c.x:.1f} {seg.c.y:.1f} L{seg.end_point.x:.1f} {seg.end_point.y:.1f}")
        else:
            d.append(f"C{seg.c1.x:.1f} {seg.c1.y:.1f} {seg.c2.x:.1f} {seg.c2.y:.1f} {seg.end_point.x:.1f} {seg.end_point.y:.1f}")
    parts.append("".join(d) + "Z")
open("assets/tierra-santa/logo.svg", "w").write(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}"><path fill="currentColor" fill-rule="evenodd" d="{" ".join(parts)}"/></svg>'
)
print("ok", W, H)
