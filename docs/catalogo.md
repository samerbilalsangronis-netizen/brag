# Catálogo · Procesadora de Alimentos Tierra Santa C.A.

Fuente: las 12 fotos de `refs/pulpas/`. Solo se anota lo que se lee en ellas; lo que no se lee está como **pendiente**.

## Aviso sobre las fotos

- Varias fotos parecen **generadas con IA** (dos se llaman `Gemini_Generated_Image_…` y casi todas tienen la estrellita de marca de agua de Gemini abajo a la derecha).
- La letra pequeña de las etiquetas (domicilio fiscal, RIF y teléfonos) sale **deformada y distinta en cada foto**. Por eso el video no usa teléfonos, RIF ni direcciones sacados de las etiquetas.
- El logo cambia un poco de una foto a otra. **Pendiente:** el archivo oficial del logo.
- Ninguna foto muestra precios. **Precios: pendientes para todos los sabores.**

## Empaque (común a todos)

- **Forma:** bolsa plástica transparente, rectangular tipo almohada, sellada arriba, con el contenido congelado a la vista y escarcha en la superficie.
- **Etiqueta:** franja horizontal pegada en la parte de arriba, de borde a borde. Lleva:
  - arriba, "PROCESADORA DE ALIMENTOS" en mayúsculas negras;
  - en el centro, "Tierra Santa C.A" en letra caligráfica blanca con contorno oscuro;
  - a la izquierda, el emblema circular con el monograma "TS", hojas a los lados, una figura magenta arriba y el texto curvo "Procesadora de alimentos";
  - el nombre del sabor en letra gruesa de color;
  - "100% Natural" y "Peso neto";
  - fotos de la fruta a la derecha y una línea de domicilio fiscal y teléfonos abajo.
- **El color de fondo de la etiqueta cambia según el sabor.**

## Sabores

| # | Sabor (como dice la etiqueta) | Forma del producto | Peso neto | Color dominante de la pulpa | Colores de la etiqueta | Archivo |
|---|---|---|---|---|---|---|
| 1 | Durazno - Melocotón | mitades de durazno congeladas | 800 grs. | `#d8a264` durazno | naranja y amarillo | `durazno.jpeg` |
| 2 | Fresa …en grano… | fresas enteras congeladas | 800 grs. | `#61292e` rojo fresa | negro y rojo | `fresa.png` |
| 3 | Guanábana con fresa | pulpa blanca con trozos de fresa | 800 grs. | `#c5958b` rosado claro | blanco, verde y rojo | `guanabana-fresa.png` |
| 4 | Guanábana en pulpa | pulpa blanca con semillas | **pendiente** (se lee "600 g s", borroso) | `#d2bea7` blanco crema | verde | `Gemini_…mdlcn3….png` |
| 5 | Guayaba | pulpa rosada | 800 grs. | `#bf5f47` rosado salmón | rosado y salmón | `guayaba.png` |
| 6 | Lulo …procesado… | pulpa amarilla | 800 (unidad ilegible) | `#e09b04` amarillo naranja | naranja y marrón | `lulo.png` |
| 7 | Mango | pulpa amarilla | 800 grs. | `#e29905` amarillo mango | amarillo y naranja | `mango.png` |
| 8 | Mora …en grano… | moras enteras congeladas | **pendiente** (no aparece) | `#623638` morado | morado vino | `mora.png` |
| 9 | Parchita | pulpa amarilla con semillas | **pendiente** (no aparece) | `#c78420` amarillo parchita | amarillo y verde | `Gemini_…k5ss24….png` |
| 10 | Piña | trozos de piña congelados | 800 grs. | `#ecbf6f` amarillo piña | verde oscuro y amarillo | `pina.png` |
| 11 | Tamarindo | pulpa marrón | 800 (se lee "ars") | `#6c381b` marrón | marrón y naranja | `tamarindo.png` |
| 12 | Tomate de Árbol | pulpa roja | 800 grs. | `#973828` rojo vino | vino y rojo naranja | `tomatedearbol.png` |

## Textos que sí se pueden usar (se leen en las etiquetas)

- "Procesadora de Alimentos Tierra Santa C.A."
- El nombre de cada sabor.
- "100% Natural". Está impreso en las etiquetas, pero en la de parchita se lee "100% Naturol".
- "Peso neto 800 grs." solo en los sabores donde se lee.
- "La Grita · Estado Táchira" (domicilio fiscal; aparece en casi todas, aunque deformado en algunas).

## Recortes

`assets/empaques/<sabor>.png`: el empaque real recortado de cada foto con `tools/recortar_empaques.py`.

- El contorno de cada bolsa está trazado a mano.
- La parte de abajo se desvanece donde la tapan frutas, vasos o pajillas de la foto original.
- La etiqueta queda completa y sin retoques.
