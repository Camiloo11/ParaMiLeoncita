# Para Cata 💗

Una pequeña experiencia hecha con calma: una portada, una fotografía, una carta,
un jardín que responde al tacto y una canción de fondo.

Sin frameworks. Solo HTML, CSS y JavaScript.

## Estructura

```
index.html            La experiencia completa (escenas 1–4 + final)
styles/main.css       Todo el diseño: paleta, tipografía, animaciones
scripts/main.js       Pétalos, reproductor, contador e interacciones
assets/images/        📷 La fotografía va aquí (ver abajo)
assets/music/         La canción (build-my-life.mp3)
assets/icons/         Favicon
```

## ⚠️ Antes de compartirla: agrega la fotografía

La página espera la foto en:

```
assets/images/cata.jpg
```

Copia la fotografía de ustedes dos a esa ruta con ese nombre exacto.
Mientras no exista, la experiencia muestra un marco elegante de respaldo,
pero la foto es el corazón de todo — no la olvides.

## ✏️ Editar la fecha del contador

En `scripts/main.js`, al inicio del archivo:

```js
const CONFIG = {
  startDate: new Date(2005, 1, 14), // año, mes (1–12), día
};
```

Cambia la fecha por la que quieras celebrar (su cumpleaños, el día en que se
conocieron…). Ojo: el mes se escribe del 1 al 12 tal como se lee.

## ▶️ Cómo verla

Abre `index.html` en el navegador, o mejor, sírvela localmente:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

En el celular se ve mejor aún: súbela a GitHub Pages, Netlify o Vercel
(es un sitio estático, no necesita nada más).

## Detalles escondidos

- 🌻 Tocar el girasol → una frase bonita
- 🌷 Tocar el tulipán → corazones
- 🤍 Tocar el lirio → una pequeña oración
- 📷 Triple toque sobre la fotografía → lluvia de pétalos
- La música solo comienza cuando ella pulsa «Ábrelo con calma»
