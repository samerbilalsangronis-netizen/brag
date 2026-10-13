# Estudio de motion graphics

Videos hechos con tres herramientas: **Brag**, **Hyperframes** y **Remotion**. Las reglas del estudio están en `CLAUDE.md`.

## Comercial · Procesadora de Alimentos Tierra Santa (30 s)

Un solo comercial, vertical 1080×1920 y también 1:1 (1080×1080). Escenas, tiempos y herramienta de cada una: `docs/shotlist.md`.

| Tramo | Herramienta | Fuente | Salida |
|---|---|---|---|
| 0,00–2,11 gancho · 24,72–30,00 cierre | Brag (`/brag --full`) | `fuentes/ts-brag.src.html` | `out/tierra-santa/brag/brag-<formato>.mp4` |
| 2,11–16,32 historia del producto | Hyperframes (GSAP + resortes) | `fuentes/ts-historia.src.html` | `out/tierra-santa/hf-historia-<formato>.mp4` |
| 16,32–24,72 catálogo | Remotion (lee `sabores.csv`) | `ts-catalogo/` | `out/tierra-santa/remotion-catalogo-<formato>.mp4` |

### Qué hay en el repo

- `docs/catalogo.md`: los 12 sabores leídos de las fotos de `refs/pulpas/`. Lo que no se lee está como "pendiente".
- `docs/shotlist.md`: el plan aprobado en la puerta.
- `docs/beats.json`: la cuadrícula de beats de la música.
- `docs/sincronia.json`: la medición de la sincronía.
- `sabores.csv`: los datos del catálogo (sabor, color, empaque, fruta, beats).
- `assets/empaques/`: los empaques reales recortados.
- `assets/frutas/`: las frutas ilustradas.
- `assets/tierra-santa/logo.svg`: el logo oficial vectorizado.
- `tools/`: scripts de recorte, ilustración, armado, mezcla y ensamble.

Los videos **no** van al repo; se regeneran con los pasos de abajo.

### Requisitos

Node 22+, ffmpeg y Python 3 con `pillow`, `numpy`, `librosa` y `potracer`. Después instala las dependencias de Node y prepara Chrome:

```bash
npm i                                   # playwright (raíz)
(cd ts-catalogo && npm i)               # Remotion
npx hyperframes browser ensure          # Chrome para el render de Hyperframes
pip install pillow numpy librosa potracer
```

### Regenerar todo

```bash
# 1. Material base (solo si cambian las fotos o el logo)
python3 tools/recortar_empaques.py        # refs/pulpas -> assets/empaques
python3 tools/vectorizar_logo.py          # refs/logo-tierra-santa.jpg -> assets/tierra-santa/logo.svg
python3 tools/ilustrar_frutas.py          # assets/frutas/*.svg

# 2. Hyperframes: historia (escenas 2-5), 9:16 y 1:1
python3 tools/build_ts.py fuentes/ts-historia.src.html out/tierra-santa/hf-historia
for f in 9x16 1x1; do (cd out/tierra-santa/hf-historia-$f && npx hyperframes check && npx hyperframes render -o ../hf-historia-$f.mp4); done

# 3. Brag: gancho y cierre (escenas 1 y 7), 9:16 y 1:1
python3 tools/build_ts.py fuentes/ts-brag.src.html out/tierra-santa/brag/composition
for f in 9x16 1x1; do (cd out/tierra-santa/brag/composition-$f && npx hyperframes check && npx hyperframes render -o ../brag-$f.mp4); done

# 4. Remotion: catálogo desde sabores.csv
cp sabores.csv ts-catalogo/public/sabores.csv
(cd ts-catalogo && npx remotion render Catalogo ../out/tierra-santa/remotion-catalogo-9x16.mp4 \
                && npx remotion render Catalogo1x1 ../out/tierra-santa/remotion-catalogo-1x1.mp4)

# 5. Audio: música de Brag continua + efectos por debajo, a -14 LUFS
python3 tools/mezcla_ts.py work/ts-mezcla.wav

# 6. Ensamble final (transiciones de salpicadura, sin cortes secos)
python3 tools/ensamblar_ts.py 9x16 work/ts-mezcla.wav out/tierra-santa/tierra-santa-comercial.mp4
python3 tools/ensamblar_ts.py 1x1  work/ts-mezcla.wav out/tierra-santa/tierra-santa-comercial-1x1.mp4
```

### Agregar o quitar un sabor

1. Pon la foto del empaque en `refs/pulpas/` y agrega su contorno en `tools/recortar_empaques.py`.
2. Si la fruta es nueva, dibújala en `tools/ilustrar_frutas.py`.
3. Agrega una fila a `sabores.csv`. Usa 1 beat si el nombre tiene una o dos palabras y 2 beats si tiene tres o más.
4. El catálogo debe sumar 16 beats contando los 2 del título. Si cambias el total, ajusta los tiempos en `docs/shotlist.md` y en el Root de Remotion.

## Piezas anteriores

- **Habibis:** `out/brag/`, `out/menu-animado.mp4`, `out/plato-noche/`.
- **Prueba del estudio:** `videos/prueba-estudio/`.
