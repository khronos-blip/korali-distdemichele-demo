# Auditoría del paquete social — Distribuidora De Michele

**Resultado: APROBADO**  
**Fecha:** 2026-09-23  
**Alcance:** archivos dentro de `social/`; sin despliegue, contacto ni publicación.

## Evidencia usada

- Activos visuales locales: `assets/images/product-01.jpg` a `product-06.jpg`.
- Captura local de QA: `qa/screenshots/desktop-home.png`.
- Hechos y límites: `README.md`, `index.html` y `assets/app.js`.
- No se navegó ni se incorporaron fuentes externas nuevas.

## Comprobaciones automáticas

Ejecutadas con:

```bash
node social/sources/audit.mjs
```

- 6/6 posts presentes y en **1080×1080 px**.
- Avatar: **1080×1080 px**.
- Mockup de perfil: **1400×1380 px**.
- Comparación: **1600×1000 px**.
- Cero tokens de placeholder detectados.
- Cero afirmaciones de precio numérico o moneda detectadas.
- Uso de **Cotizar** confirmado.
- Etiquetado conceptual/no oficial confirmado.
- Sintaxis de `generate.mjs` y `audit.mjs`: válida con `node --check`.

## Revisión visual

Se inspeccionaron individualmente los seis posts, avatar, mockup y comparación a resolución final. No se observaron textos cortados, solapamientos de interfaz, elementos sin terminar ni problemas materiales de contraste. El pie del mockup se reposicionó después de la primera revisión para evitar superposición con la cuadrícula.

## Límites editoriales verificados

- Todos los precios son **Cotizar**.
- No se afirma stock, entrega ni precio numérico.
- La dirección exacta de Maracay permanece sin afirmar.
- Disponibilidad, presentación, monto y condiciones quedan sujetos a confirmación.
- La comparación dice “presencia actual · documentada” y “propuesta web · conceptual no oficial”; además aclara que la síntesis actual no es una captura de perfil y que no implica un rediseño oficial.
