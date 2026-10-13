# Shotlist · Comercial Tierra Santa (30 s, vertical 1080×1920 → luego 1:1)

## Música: una sola pieza para los 30 s

- **Pista:** `happy-beats-business-moves-vol-11` de Brag (la única fuente de música en modo completo; no existe una pista propia).
- **Ritmo:** medido con librosa (`beat_track`), 112,3 BPM, un beat cada 0,534 s. La cuadrícula completa está en `docs/beats.json`.
- **Arranque:** la pista empieza en su segundo 3,72. Así su **drop** (un silencio corto en 12,3–13,0 s y luego el golpe más fuerte) cae en **13,16 s** del comercial, el momento de la explosión de la licuadora.
- **Cierre:** sube durante 0,3 s al inicio, baja en el último segundo y se normaliza a −14 LUFS.
- **Efectos:** suaves, por debajo de la música. Salen de la librería de Brag (Kenney, CC0) o se sintetizan con ffmpeg cuando la librería no los trae, como el hielo, el líquido y la licuadora.
- **Aviso:** las pistas de Brag son "Happy Beats / Business Moves": alegres y con energía, pero no tropicales de estilo. Es la que mejor encaja de las cinco por energía y por el drop.

## Escenas

Los tiempos están en segundos del comercial y caen sobre los beats.

| # | Tiempo | Duración | Herramienta | Qué se ve | Texto en pantalla | Sonido |
|---|---|---|---|---|---|---|
| 1 | 0,00–2,11 | 2,1 s | **Brag** (`/brag --full`) | Una salpicadura de mango y fresa ilustrada estalla y llena la pantalla; las gotas se juntan en el texto. | "¿Antojo de algo natural?" (4 palabras, legible desde 0,8 s) | Música entrando; salpicadura suave en 0,0 |
| — | 2,11 | — | ensamble | Transición: barrido de salpicadura (sin corte seco). | — | Golpe suave |
| 2 | 2,11–5,27 | 3,2 s | **Hyperframes** | Vapor frío. El empaque real de **Mango** aparece girando (giro en Y con resorte pesado), con escarcha que se forma en los bordes y cristales de hielo flotando. | "Pulpa de fruta congelada" (entra en 3,15) | Escarcha y hielo al aparecer (2,2) |
| 3 | 5,27–9,47 | 4,2 s | **Hyperframes** | La bolsa se abre sola por la parte de arriba (corte con brillo). La pulpa de mango cae en cámara lenta a una licuadora ilustrada, junto con cubos de hielo que rebotan. | — | "Pop" al abrirse (5,27); pulpa cayendo (5,8–7,9); hielos (6,84 · 7,38 · 7,89) |
| 4 | 9,47–13,70 | 4,2 s | **Hyperframes** | La licuadora arranca: vórtice amarillo cada vez más rápido y más intenso; la cámara se acerca; vibración leve. **13,16: explota en una salpicadura que llena la pantalla** (el momento más fuerte, sobre el drop). | — | Licuadora con crescendo (9,5–13,1) → silencio del drop → golpe en 13,16 |
| 5 | 13,70–16,32 | 2,6 s | **Hyperframes** | De la salpicadura sale el batido que cae en un vaso con condensación y gotas; entra una pajilla (15,27) y pasa un destello frío por el vidrio (15,79). | — | Líquido en el vaso (13,7–15,0); "tin" del vidrio en 15,79 |
| — | 16,32 | — | ensamble | Transición: el batido salpica y barre hacia el catálogo. | — | — |
| 6 | 16,32–24,72 | 8,4 s | **Remotion** (`sabores.csv`) | **Catálogo:** 16 beats. Primero el título (2 beats); después cada sabor con su **empaque real recortado**, su fruta ilustrada alrededor, el fondo de su color y el nombre en grande. Uno por beat; los nombres de 3 palabras ocupan 2 beats para que se lean. | "Escoge tu sabor" → Mango · Parchita · Lulo · Piña · Durazno · Guayaba · Tomate de árbol (2) · Fresa · Mora · Tamarindo · Guanábana · Guanábana con fresa (2) | Un golpe suave por sabor (14) |
| — | 24,72 | — | ensamble | Transición: salpicadura multicolor. | — | — |
| 7 | 24,72–30,00 | 5,3 s | **Brag** (`/brag --full`) | Los 12 empaques se abren en abanico (24,72), aparece el logo de Tierra Santa (25,79), luego el texto (26,33) y el contacto (27,37). Se sostiene hasta 30,0. | "100% Natural · Lista para tu batido" + "0424-7017223 · 0424-7284475" | Golpe en 24,72; cierre musical |

## Reparto y ensamble

- **Hyperframes:** escenas 2–5 en un solo clip de 2,11 a 16,32 s, con GSAP y resortes (`tools/hf-helpers.js`).
- **Remotion:** escena 6. Plantilla de datos que lee `sabores.csv` (sabor, color, ruta del empaque, fruta) y encadena las 12 tarjetas en un solo clip de 8,4 s.
- **Brag:** escenas 1 y 7, con el modo completo y el tono pedido. También escribe el texto para publicar en español venezolano.
- **Ensamble:** ffmpeg une los cuatro clips sin cortes secos; cada unión lleva una salpicadura animada encima (≈0,45 s) que tapa el cambio. Se agrega la música continua con los efectos mezclados por debajo y se normaliza a −14 LUFS.
- **Versión 1:1 (1080×1080):** se reencuadra; no se recorta el 9:16. Cada herramienta vuelve a renderizar en 1080×1080 con el mismo tiempo y el diseño reacomodado.

## Decisiones de la puerta (aprobadas)

1. Contacto del cierre: **0424-7017223 · 0424-7284475**.
2. Texto del cierre: **"100% Natural · Lista para tu batido"**. Es lo que dice la etiqueta.
3. Logo: el archivo oficial que enviaste (`refs/logo-tierra-santa.jpg`), vectorizado en `assets/tierra-santa/logo.svg` con `tools/vectorizar_logo.py`.
