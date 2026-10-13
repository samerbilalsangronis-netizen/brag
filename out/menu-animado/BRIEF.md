---
workflow: general-video
flow: automation
storyboard: no
message: "La carta de Habibis, plato por plato, con precios reales en COP, USDT y Bs"
aspect: 1080x1920
language: es
length: 20s
---

## Intent

Menú animado de Habibis (comida árabe, La Grita). Logo que se arma, shawarma de pollo construido capa por capa, carta con las 6 ilustraciones y su precio en COP, cambio de moneda COP → USDT → Bs y cierre con horario y redes. Movimiento con resortes.

## Assets

- assets/habibis/logo.svg — logo real de la web.
- assets/platos/*.svg — las 6 ilustraciones aprobadas por el usuario.
- assets/audio/musica.mp3 — música de Brag (vol. 9, ~114,8 BPM); no existe audio/track.mp3.
- assets/audio/pop.wav, plancha.wav — efectos suaves.

## Notes

- Precios reales de habibis-chi.vercel.app; tasa 1 USDT = 3.188 COP = Bs. 1.014.
- Revisión: una hoja de contacto a 2 fps, arreglar los 2 peores problemas y un solo re-render.
