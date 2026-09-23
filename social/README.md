# Paquete social — Distribuidora De Michele

Propuesta gráfica y editorial no oficial, producida únicamente con activos y hechos documentados dentro de este proyecto.

## Contenido

- `bio.md`
- `avatar.png` (1080×1080)
- `posts/01-*.png` a `posts/06-*.png` (1080×1080)
- `captions.md`
- `profile-grid mockup.png` (1400×1380)
- `comparison/before-after.png` (1600×1000)
- `sources/*.svg` y `sources/generate.mjs`
- `AUDIT.md`

## Reproducción

Desde la raíz del proyecto:

```bash
node social/sources/generate.mjs
node social/sources/audit.mjs
```

Requiere Node.js e ImageMagick (`magick`). El script no usa red ni dependencias npm.
