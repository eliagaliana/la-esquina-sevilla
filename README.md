# La Esquina · Triana

Web de una sola página para un bar de tapas **ficticio** de Sevilla, con estética de videojuego de mundo abierto. Pieza de portfolio de [Weliab](https://weliab.com).

HTML, CSS y JavaScript sin frameworks ni librerías. Pensada primero para el móvil.

## Estructura

```
index.html          la página
css/styles.css      estilos y animaciones
js/main.js          carga, scroll, menú de pausa, estrellas, carrusel, reserva
img/                fotos (ver img/LEEME.md)
PROMPTS-GEMINI.md   prompts para generar las fotos
```

## Verla en tu ordenador

Abre `index.html` con doble clic, o mejor con un servidor local:

```bash
npx http-server . -p 3040
```

## Datos de ejemplo que cambiar

- WhatsApp: busca `wa.me/34600000000` en `index.html`.
- Google Maps: busca `google.com/maps` en `index.html`.

## Publicar gratis

### Opción A · GitHub Pages (ya tienes el repositorio)

1. Entra en el repositorio en GitHub → **Settings** → **Pages**.
2. En **Source**, elige **Deploy from a branch**.
3. En **Branch**, elige `main` y la carpeta `/ (root)`. Pulsa **Save**.
4. Espera 1-2 minutos y recarga: arriba saldrá la dirección, del tipo `https://eliagaliana.github.io/la-esquina-sevilla/`.
5. Cada vez que subas cambios (`git push`), la web se actualiza sola.

### Opción B · Netlify (arrastrar y soltar)

1. Entra en [app.netlify.com/drop](https://app.netlify.com/drop) (crea cuenta gratis si no tienes).
2. Arrastra la carpeta `la-esquina-sevilla` entera a la página.
3. En unos segundos te da una dirección pública. En **Site settings** puedes cambiarle el nombre (por ejemplo `la-esquina-triana.netlify.app`).
4. Si prefieres que se actualice sola: **Add new site → Import an existing project → GitHub** y eliges este repositorio (sin comando de build, carpeta de publicación `/`).
