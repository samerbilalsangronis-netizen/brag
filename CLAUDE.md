# Reglas del estudio de motion graphics

## Qué herramienta uso
- Video de lanzamiento de un proyecto o un sitio, de 15 a 25 segundos: /brag.
- Video a mi medida, con mi propio guion de tomas: /hyperframes.
- Series, plantillas o videos con datos: Remotion (/remotion-create).
- Si dudo, empiezo con /brag y paso a otra solo si se queda corto.

## Contrato de render
- Todo frame es una función pura del tiempo. Nada de setTimeout, nada de transiciones que corran
  solas, nada de estado que pase de un frame al siguiente.
- Ruido solo con semilla, nunca Math.random: el render tiene que salir idéntico cada vez.
- Se espera a que carguen las tipografías y las imágenes antes de capturar cada frame.
- Cada corrida escribe en su propia carpeta de salida. Nunca se pisa lo anterior.

## Look
- Defaults prohibidos: título centrado sobre degradado, todo entrando con fade, etiquetas en las
  esquinas y marcos alrededor del frame, brillos en la interfaz, explosiones genéricas de partículas.
- Una tipografía de display y una de lectura. Un solo color de acento, salvo que el brief diga otra cosa.
- Cada 2 a 4 segundos tiene que pasar algo nuevo en pantalla.
- Se usa lo real: la interfaz, el logo, los colores y el texto del proyecto. Nunca se inventan
  pantallas, cifras ni testimonios.

## Sonido
- La música y los efectos se escriben o se eligen como una sola pieza: efectos suaves por debajo de la
  música, nada agudo ni filoso.
- Si hay una pista mía, se mide su ritmo con un detector real. Si no se puede medir, se dice; no se
  inventa una sincronía.

## Bucle antes de enseñarme nada
1. Pasar la compuerta de la herramienta (npx hyperframes check, o un frame con npx remotion still) y
   generar una hoja de contacto del video. MIRARLA.
2. Calificar del 1 al 10: gancho en los primeros 2 s, lectura en pantalla de teléfono, calidad del
   movimiento, variedad, fidelidad a la marca, sincronía con el sonido.
3. Arreglar los 3 peores problemas. Repetir hasta que todas las notas sean 8 o más.
4. Solo entonces hacer el render final.

## Plan antes del render
- Antes de construir, escribir el plan (ángulo, gancho, escenas con duración) y esperar mi visto bueno.

## Llaves
- Las llaves de cualquier servicio viven en .env. Nunca se escriben en un prompt, en un archivo que se
  suba ni en un mensaje.
