# Snake PWA (Futurista)

Repositorio con PWA del juego Snake con estilo futurista. Preparado para desplegar en Render usando Dockerfile y para empaquetar en una APK usando WebView.

## Estructura
Ver README para detalles.

## Ejecutar localmente
1. `npm install`
2. `npm start`
3. Abrir http://localhost:3000

## Despliegue en Render
Se incluye `Dockerfile` listo para construir la imagen.

## Empaquetado Android
Copiar `public/` a tu proyecto Android y cargar `offline.html` o `index.html` en un WebView. Se incluyen `AndroidManifest.xml` y `MainActivity.java` de ejemplo.