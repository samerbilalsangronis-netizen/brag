# Hikman Capital · Morning Digest · IPC de septiembre (plan, pendiente de visto bueno)

## Referencia analizada (refs/WhatsApp Video 2026-10-15 at 9.31.12 PM.mp4)
- 9:16, 2 min 45 s, narrado con voz masculina, tono cercano ("Buenos días, socio").
- Look de periódico antiguo: papel crema con viñeta, serif de titular (tipo Playfair/Abril),
  condensada para etiquetas, azul marino + rojo + verde.
- Estructura fija: cabecera de página (marca · MORNING DIGEST · fecha · PÁGINA A2),
  sección en rojo ("— POR QUÉ NO FUE LA INFLACIÓN —"), una lámina ilustrada enmarcada con pie
  de foto "Según la carta…", y debajo una frase grande que sigue a la voz (azul, rojo si es malo,
  verde si es bueno).
- Cinta "EN VIVO" con cifras corriendo abajo todo el video.
- Ilustraciones editoriales planas que se construyen por partes: termómetro, cadenas, sellos
  ("SE ALQUILA", "CARA"), flechas, línea de tiempo, gráficos de barras.
- Cambio de tema con una página de periódico que se pasa (page curl).
- Portada tipo cabecera de diario + índice "En la edición de hoy"; cierre con CTA y logo.

## Ángulo
"El IPC no fue solo gasolina": la sorpresa está en la subyacente y eso cambia el cálculo de la Fed,
aunque Bowman y Daly enfrían la idea de subir ya en octubre.

## Guion de voz (~180 palabras, ~80 s)
1. Gancho: "La inflación en Estados Unidos volvió a sorprender. Y esta vez no fue solo la gasolina."
2. Portada: "Buenos días. Hoy, dos temas: el IPC de septiembre y lo que significa para la Fed."
3. Cifras: "El IPC general subió 0,6% en el mes, como se esperaba. Pero en el año llegó a 3,7%,
   por encima del 3,6% previsto. Y la subyacente también superó: 0,3% mensual y 2,6% anual."
4. Gasolina: "La gasolina subió 9,1% en septiembre y explica más de la mitad del alza del mes."
5. Contagio: "Pero la sorpresa estuvo en la subyacente: vivienda, transporte y otros servicios
   también se encarecieron. La energía empieza a pasar al resto de la economía."
6. Fed: "Para la Fed ya no es solo un shock petrolero. Si la subyacente persiste, la política
   restrictiva dura más."
7. Mercado: "El mercado reaccionó rápido: la probabilidad de una subida en octubre pasó de cerca
   del 20% a casi el 50%."
8. Bowman y Daly: "Pero Michelle Bowman dijo que la Fed tiene margen para esperar. Y Mary Daly
   ve probables nuevas subidas, pero sin urgencia en octubre."
9. Lectura: "El IPC abre la puerta a más subidas, pero no garantiza octubre. Diciembre sigue sobre la mesa."
10. Cierre: "Ese es el resumen de hoy. Hikman Capital."

## Escenas y herramienta
| # | Tiempo aprox. | Escena | Herramienta |
|---|---|---|---|
| 1 | 0–6 s | Gancho: termómetro que sube y sello "+0,1 sobre lo esperado" | Brag |
| 2 | 6–12 s | Portada HIKMAN · MORNING DIGEST + índice de 2 temas | Brag |
| 3 | 12–30 s | Tabla "real vs. esperado" (4 cifras) que se llena con barras | Remotion (datos en CSV) |
| 4 | 30–38 s | Surtidor de gasolina +9,1% que llena la mitad de la barra del mes | Hyperframes |
| 5 | 38–48 s | La energía "se derrama" a casa, auto y carrito (vivienda, transporte, servicios) | Hyperframes |
| 6 | 48–55 s | Edificio de la Fed con candado "restrictiva más tiempo" | Hyperframes |
| 7 | 55–63 s | Medidor de probabilidad de octubre: 20-22% → ~50% | Remotion (datos) |
| 8 | 63–75 s | Dos fichas de cita: Bowman "margen para esperar" / Daly "sin urgencia" (sin fotos) | Hyperframes |
| 9 | 75–83 s | Calendario: octubre tachado a medias, diciembre en rojo | Hyperframes |
| 10 | 83–90 s | Cierre: "Ese es el resumen de hoy" + logo Hikman Capital | Brag |

- Cinta "EN VIVO" abajo con solo nuestras cifras (IPC +3,7% a/a, subyacente +2,6% a/a,
  gasolina +9,1%, prob. octubre ~50%).
- Cambio de página (page curl) entre portada y cuerpo, y antes del cierre.
- Remotion lee un CSV/JSON con las cifras del día: la plantilla se reutiliza cada día/semana.

## Pendiente de confirmar
- Fecha de la edición.
- Logo y colores de Hikman Capital (si no hay, wordmark en texto con la paleta de la referencia).
- Voz (Higgsfield, voz de catálogo en español, o la propia si se vuelve a crear).
