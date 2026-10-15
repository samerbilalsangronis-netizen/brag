# Narración · video de luces DEPO (20 s, 1:1)

Voz: Higgsfield, modelo `seed_audio`, voz de catálogo "Andre". La voz propia
"Voz Llanera Alexmar" falla: su audio de muestra ya no está disponible.

Guion:
> ¿Y a su carro le falta una luz, compadre? Cruce de Caribe, marca DEPO. Stop pa'l Fiesta Max.
> Tapa de stop pa'l Chevy quinientos. Y cruce de NPR. Escudería Alexmar, allá en Tovar.
> Llame al cero cuatro uno seis, seis siete seis, ochenta y tres, noventa y tres.

Montaje: la voz va a 1,03× y entra a 0,1 s, normalizada a -14 LUFS. Los tiempos de cada palabra
están en `narracion-luces.json` (transcripción con Whisper). Cada escena empieza justo
antes de que se nombre su producto:

| Escena | Inicio | Palabra |
|---|---|---|
| Cruce de Caribe | 2,90 | "Cruce" 2,92 |
| Stop Fiesta Max | 5,40 | "Stop" 5,44 |
| Tapa de stop Chevy 500 | 7,90 | "Tapa" 7,96 |
| Cruce de NPR | 10,85 | "Y cruce" 10,88 |
| Cierre | 12,85 | "Escudería" 12,92 |
| Teléfono | 15,55 | "Llame" 15,54 |

Montaje final:
```bash
python3 tools/build_comp.py fuentes/alexmar-luces-voz.src.html out/alexmar/luces-voz
(cd out/alexmar/luces-voz && npx hyperframes render -o ../luces-voz-mudo.mp4)
ffmpeg -i narracion.wav -af "atempo=1.03,adelay=100|100,loudnorm=I=-14:TP=-1.5:LRA=7,apad=whole_dur=20" -ar 48000 voz-lista.wav
ffmpeg -i out/alexmar/luces-voz-mudo.mp4 -i voz-lista.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest out/alexmar/alexmar-luces-narrado.mp4
```
