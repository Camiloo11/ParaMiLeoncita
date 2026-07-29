# Para Cata 💗

Una pequeña experiencia: una portada, la fotografía, una carta
que se abre como popup, un jardín que responde al tacto y una cancioncita
que ella misma reproduce.

Sin frameworks. Solo HTML, CSS y JavaScript. Todo cabe en una sola pantalla —
sin scroll eterno.

## Estructura

```
index.html            La experiencia completa
styles/main.css       Todo el diseño: paleta, tipografía, animaciones
scripts/main.js       Pétalos, reproductor, popups e interacciones
assets/images/        La fotografía (cata.jpg)
assets/music/         La canción (build-my-life.mp3)
assets/icons/         Favicon
```

## 🌐 Sitio publicado

El sitio se despliega automáticamente con GitHub Actions en cada push:

**https://camiloo11.github.io/ParaMiLeoncita/**

## Cómo funciona

- **Portada** → "Abre 💗" inicia la experiencia con bloom de luz y pétalos.
- **Cancionsita para empezar tu día** → reproductor propio; ella misma le da play.
- **Una carta para ti 💌** → la carta se abre como popup elegante.
- Al cerrarla → final con cambio de luz, flores en los bordes y
  "Gracias por permitirme caminar a tu lado. 💗"

## Detalles escondidos

- 🌻 Tocar el girasol → una frase bonita
- 🌷 Tocar el tulipán → corazones
- 🤍 Tocar el lirio → una pequeña oración
- 📷 Triple toque sobre la fotografía → lluvia de pétalos

## ▶️ Verla en local

```bash
python3 -m http.server 8000
# → http://localhost:8000
```
