
# Semillas de artículos (news)

Este directorio contiene datos de ejemplo para poblar la colección `articles` siguiendo el esquema definido en `src/models/article.js`.

## Qué incluye
- `articles.json`: arreglo de documentos de artículos listo para importar, usando Extended JSON de MongoDB para `ObjectId` (`{"$oid": ...}`) y fechas (`{"$date": ...}`).

## Campos y validaciones (según `article.js`)
- `titulo` (String, requerido)
- `contenido` (String, requerido)
- `autor.id` (ObjectId de un `User`, requerido)
- `autor.nombre` (String, requerido)
- `categoria` (String, requerido, uno de: Ciencia | Tecnología | Deportes | Cultura | Política | Economía)
- `etiquetas` (Array de String, por defecto `[]`)
- `fecha_publicacion` (Date, por defecto `now` si se omite)
- `imagen_url` (String o `null`)
- Timestamps: `createdAt` y `updatedAt` los agrega Mongoose cuando insertas a través de la app.

## Cómo usar este seed
1. Crea primero usuarios en tu base `mt` (o la que tengas configurada en `MONGO_URI`) y copia sus `_id` reales en `autor.id` dentro de `articles.json`.
2. Revisa que todas las `categoria` estén en el conjunto permitido por el esquema.
3. Importa `articles.json` en la colección `articles` de tu base. Recuerda que Mongoose pluraliza `Article` → `articles`.
   - Si importas directamente a Mongo, se respetarán los valores tal cual; los timestamps automáticos de Mongoose solo aparecen cuando insertas desde el backend.
   - Si prefieres no usar Extended JSON, puedes convertir `fecha_publicacion` a cadenas ISO (p.ej. `"2025-11-01T10:00:00.000Z"`) e insertar usando el backend (Mongoose las castea a `Date`).

## Notas
- La base de datos por defecto en este proyecto es `mt` (ver `backend/.env` → `MONGO_URI`).
- La colección objetivo es `articles`.
- `imagen_url` puede ser `null` si no hay imagen.

## Imágenes: opciones para `imagen_url`
Tienes varias formas válidas de referenciar imágenes en tus artículos:

1. URL externas (más simple)
   - Usa un enlace público (CDN, servidor propio, etc.), por ejemplo: `https://mi-cdn.com/fotos/nota1.jpg`.
   - Solo pega la URL en `imagen_url`.

2. Carpeta pública del frontend (sirve Nginx en el contenedor `fronted`)
   - Coloca archivos en `fronted/public/images/` (o `fronted/public/static/`).
   - En ejecución, estarán disponibles en `http://localhost:8080/images/archivo.jpg`.
   - En el JSON puedes poner `"/images/archivo.jpg"` o la URL completa.

3. Servir estáticos desde el backend (requiere código adicional)
   - Si agregas algo como `app.use('/uploads', express.static('uploads'))`, podrás subir/guardar en `backend/uploads/` y referenciar `"/uploads/archivo.jpg"`.
   - Actualmente el backend del proyecto no incluye esta ruta; es una mejora opcional.

4. Almacenamiento en la nube (recomendado para producción)
   - S3, Cloud Storage, etc., con URL públicas o firmadas. Guarda la URL final en `imagen_url`.

Sugerencia: usa rutas absolutas cuando los artículos se consuman fuera del mismo dominio (p.ej. `http://localhost:8080/images/archivo.jpg`). Si solo los consume el frontend local, `"/images/archivo.jpg"` funciona bien.
