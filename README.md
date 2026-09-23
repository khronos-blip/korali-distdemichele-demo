# Distribuidora De Michele — storefront demo

Demo local, no oficial y sin conexión, orientado a solicitar cotizaciones de materiales de construcción, ferretería y granito. No crea pedidos, no envía mensajes, no procesa pagos y no consulta servicios externos.

## Ejecutar localmente

```bash
python3 -m http.server 4173
```

Abrir `http://localhost:4173/`. Para probar el prefijo de producción, el script de QA monta también `/demos/de-michele/`.

## QA

```bash
npm run qa
```

Los controles incluyen:

- sintaxis JavaScript de la tienda y el Worker;
- estructura HTML, 6 productos, cobertura de assets y ausencia de precios numéricos/dependencias externas;
- ruta con prefijo `/demos/de-michele/`;
- búsqueda, categorías, detalle, dos productos, cantidades, persistencia con `localStorage`, selección de sucursal y confirmación local;
- cero `fetch`/XHR, solicitudes externas, errores de consola o assets fallidos;
- vista móvil de 390 px sin desbordamiento horizontal;
- capturas en `qa/screenshots/` e informe en `qa/report.json`.

Requiere Node.js y una instalación local de Google Chrome. Usa `playwright-core` del workspace; no instala paquetes ni realiza llamadas de red.

## Fuentes y límites

### Material suministrado y hechos verificados para esta demo

- Imágenes oficiales locales: `assets/images/product-01.jpg` a `product-06.jpg`.
- Oferta: materiales de construcción, ferretería y granito.
- Catálogo mostrado: varillero; acero/cemento y cuidado de almacenamiento; pintura PintaKreto; encimeras de granito; herramientas para hogar/construcción; Sikadur-32 Primer L.
- Sucursales: Valencia y Maracay.
- Horario: lunes a viernes 7:00–16:00; sábados 7:00–14:00.
- Valencia: Sector San Blas, Av. Padre Alexandre, Local 101-68.
- WhatsApp Valencia 1: +58 414-8730910; Valencia 2: +58 412-8887851; Maracay: +58 414-4194351.
- Flujo informado: cotización por WhatsApp, pago en línea y retiro en tienda.
- Servicios promovidos: venta al mayor, amplia selección de granito y estacionamiento.
- Cashea se menciona solo como servicio promocionado; disponibilidad, cupo y condiciones no están verificados.

No se muestran precios numéricos, stock, entrega ni dirección exacta de Maracay. Toda disponibilidad, presentación, monto y condición debe confirmarse con el negocio. Los números aparecen como información, pero la demo no genera enlaces de WhatsApp ni transmite datos.

## Arquitectura y prefijo

Todos los assets del HTML usan rutas relativas, por lo que la interfaz funciona bajo `/demos/de-michele/`. `worker.js` retira ese prefijo antes de servir el asset estático y redirige la variante sin barra final.

`wrangler.toml` deja preparadas —sin desplegar— estas rutas:

- `koralidigital.com/demos/de-michele/*`
- `www.koralidigital.com/demos/de-michele/*`

El directorio contiene configuración de despliegue únicamente como artefacto solicitado. No se creó repositorio, no se hizo push y no se desplegó nada.

## Demo pública

- [https://koralidigital.com/demos/de-michele/](https://koralidigital.com/demos/de-michele/)
- Demo conceptual no oficial; no procesa compras, pagos ni formularios reales.
