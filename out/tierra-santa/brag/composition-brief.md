# Hyperframes Composition Brief: Tierra Santa · gancho + cierre

## Objective
Producir los 7,39 s que le tocan a Brag dentro del comercial de 30 s: el gancho (2,11 s) y el cierre (5,28 s), en un solo clip que el ensamble separa.

## Output
- `composition-9x16/` (1080×1920) y `composition-1x1/` (1080×1080, reencuadre a escala 0,75 del escenario; no se recorta).
- 30 fps. Sin audio: la mezcla continua la hace el ensamble.

## Source Material
- `assets/empaques/*.png`: los 12 empaques reales recortados.
- `assets/tierra-santa/logo.svg`: logo oficial vectorizado.
- Copy que debe salir tal cual: "¿Antojo de algo natural?", "100% Natural", "Lista para tu batido", "0424-7017223 · 0424-7284475".

## Creative Direction
Bebida tropical, fresca y alegre. El producto es el protagonista: no hay personas. Las salpicaduras son orgánicas, con gotas satélite. Los textos se alinean a la izquierda y van sobre color sólido, nunca sobre un degradado genérico.

## Visual Identity
- **Fondo:** verde profundo `#0a2b28`.
- **Frutas:** mango `#f2a20c`, fresa `#d6263f` y guayaba `#ee6e68`.
- **Crema:** `#fff6e3`.
- **Tipografías:** Archivo Black para los titulares y Montserrat para la lectura.

## Storyboard
1. Gancho, 2,11 s: salpicadura → pregunta en 2 líneas → cubre en mango.
2. Cierre, 5,28 s: abanico de los 12 empaques → logo → textos → contacto.

## Audio
Ninguno en el clip. Los golpes del abanico y del logo se mezclan en el ensamble, sobre los beats.

## Hyperframes Instructions
- Un timeline pausado y resortes (`tools/hf-helpers.js`) en las entradas.
- Todo es determinista: el azar va con semilla.
- `npx hyperframes check` sin errores.
- Lo importante vive en la franja y 240–1680 del escenario de 1080×1920.
