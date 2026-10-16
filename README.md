# Price Manager

Aplicación para gestionar precios de proveedores, con historial, cálculo de costos/márgenes, comparación de precios y mapa de ubicaciones.

**Stack:** React + TypeScript (Vite) · Firebase Firestore · GitHub Pages · Leaflet/OpenStreetMap.

## Funcionalidades
- **Proveedores**: nombre y ubicación (clic en el mapa o lat/lng), distancia entre proveedores y sus productos.
- **Productos de proveedor**: nombre, tipo, precio del paquete y cantidad (ej. 50 hojas por $3.500 → $70 c/u). Historial de precios con fecha; actualización manual.
- **Categorías y divisores**: "Hojas" (unidades por hoja, ej. 20 stickers) u "Objetos" (unidad completa). Se asignan a cada producto de proveedor.
- **Mis productos**: combina componentes; costo = suma, ganancia = costo × margen %, precio = costo + ganancia.
  - Taza $1.000 + DTF $2.000, margen 150% → costo $3.000, ganancia $4.500, precio $7.500.
  - Sticker: $70 ÷ 20 = $3,5 c/u.
- **Comparar**: mismo nombre de producto entre proveedores, ordenado por precio unitario.
- **Scraping (futuro)**: interfaz en `src/services/scraper.ts`; correría en una Cloud Function y llamaría a `updatePrice`.

## Desarrollo
```bash
npm install
cp .env.example .env   # completar con la config web de Firebase
npm run dev
npm test
npm run build
```
Sin variables de Firebase la app guarda los datos en `localStorage`.

## Configuración de Firebase
1. Crea un proyecto en https://console.firebase.google.com y una app web; copia la config a `.env`.
2. Activa Firestore y publica `firestore.rules`. **Atención:** las reglas incluidas son abiertas (app personal sin login); restringe el acceso (p. ej. con Firebase Auth) antes de compartir la URL.
3. Cloud Functions requiere plan Blaze; el uso actual funciona completamente en el plan gratuito sin ellas.

## Despliegue en GitHub Pages
En *Settings → Pages* elige "GitHub Actions" y en *Settings → Secrets* agrega las variables `VITE_FIREBASE_*`. El workflow `.github/workflows/deploy.yml` construye y publica en cada push a `main`. Se usa `HashRouter`, por lo que no necesita configuración extra de rutas.
