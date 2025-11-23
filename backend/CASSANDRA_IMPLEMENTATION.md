# 🚀 Implementación de Interacciones de Usuario con Cassandra

> **Proyecto:** NorelNet News - Backend  
> **Fecha:** Noviembre 2025  
> **Issue:** #3 - Implementar interacciones de usuario con Cassandra

---

## 📋 Resumen

Se ha implementado un sistema de registro de interacciones de usuarios con noticias usando **Apache Cassandra** para almacenar series temporales. Esto permite tracking de vistas, likes, shares y análisis de tendencias.

---

## 🎯 ¿Qué se implementó?

### 1. Infraestructura

✅ **Cassandra en Docker Compose**
- Servicio Cassandra 4.1
- Puerto 9042 expuesto
- Volume persistente para datos
- Healthcheck configurado

### 2. Conexión y Schema

✅ **database-cassandra.js**
- Cliente de Cassandra configurado
- Creación automática de keyspace `norelnet_news`
- 2 tablas principales:
  - `user_interactions` - Historial de interacciones por usuario
  - `article_views_by_day` - Contador de vistas diarias

### 3. Servicio de Negocio

✅ **interactionService.js**
- `recordInteraction()` - Registrar vista, like, share, etc.
- `getUserHistory()` - Obtener historial de un usuario
- `getMostViewedToday()` - Top artículos más vistos del día
- `getArticleStats()` - Estadísticas de un artículo por días

### 4. Endpoints REST

✅ **interactionController.js + routes/interactions.js**
- POST `/api/interactions/view/:articleId` - Registrar vista
- POST `/api/interactions/like/:articleId` - Registrar like (requiere auth)
- POST `/api/interactions/share/:articleId` - Registrar share
- GET `/api/interactions/my-history` - Historial del usuario (requiere auth)
- GET `/api/interactions/trending` - Artículos trending
- GET `/api/interactions/stats/:articleId` - Estadísticas de artículo

---

## 🗄️ Modelo de Datos

### Tabla: `user_interactions`

```cql
CREATE TABLE user_interactions (
  user_id TEXT,
  article_id TEXT,
  interaction_type TEXT,
  timestamp TIMESTAMP,
  metadata TEXT,
  PRIMARY KEY (user_id, timestamp, article_id)
) WITH CLUSTERING ORDER BY (timestamp DESC);
```

**Partition Key:** `user_id` - Permite consultas rápidas por usuario  
**Clustering Keys:** `timestamp, article_id` - Ordena por fecha descendente  

**Tipos de interacción:**
- `view` - Vista de artículo
- `like` - Me gusta
- `share` - Compartir
- `comment` - Comentario (futuro)

### Tabla: `article_views_by_day`

```cql
CREATE TABLE article_views_by_day (
  date TEXT,
  article_id TEXT,
  view_count COUNTER,
  PRIMARY KEY (date, article_id)
);
```

**Partition Key:** `date` (YYYY-MM-DD) - Agrupa por día  
**Clustering Key:** `article_id` - Identifica artículo  
**Counter:** `view_count` - Incrementa automáticamente

---

## 🔧 Configuración

### Variables de Entorno

Agregar a `backend/.env`:

```env
# Cassandra Configuration
CASSANDRA_CONTACT_POINTS=cassandra
CASSANDRA_DC=datacenter1
```

En producción:
```env
CASSANDRA_CONTACT_POINTS=node1.cassandra.com,node2.cassandra.com,node3.cassandra.com
CASSANDRA_DC=us-east-1
```

### Docker Compose

Ya configurado en `docker-compose.yml`:

```yaml
cassandra:
  image: cassandra:4.1
  ports:
    - "9042:9042"
  volumes:
    - cassandra_data:/var/lib/cassandra
```

---

## 📖 Ejemplos de Uso

### 1. Registrar una Vista (Anónimo)

```bash
curl -X POST http://localhost:3000/api/interactions/view/507f1f77bcf86cd799439011
```

**Respuesta:**
```json
{
  "success": true,
  "userId": "anonymous",
  "articleId": "507f1f77bcf86cd799439011",
  "type": "view"
}
```

### 2. Registrar un Like (Autenticado)

```bash
curl -X POST http://localhost:3000/api/interactions/like/507f1f77bcf86cd799439011 \
  -H "Cookie: session_id=..."
```

### 3. Obtener Artículos Trending

```bash
curl http://localhost:3000/api/interactions/trending?limit=10
```

**Respuesta:**
```json
{
  "date": "2025-11-23",
  "trending": [
    {
      "articleId": "507f1f77bcf86cd799439011",
      "viewCount": 1250
    },
    {
      "articleId": "507f1f77bcf86cd799439012",
      "viewCount": 980
    }
  ]
}
```

### 4. Obtener Mi Historial

```bash
curl http://localhost:3000/api/interactions/my-history?limit=20 \
  -H "Cookie: session_id=..."
```

**Respuesta:**
```json
{
  "userId": "673c1234567890abcdef1234",
  "total": 20,
  "items": [
    {
      "userId": "673c1234567890abcdef1234",
      "articleId": "507f1f77bcf86cd799439011",
      "type": "view",
      "timestamp": "2025-11-23T10:30:00.000Z",
      "metadata": {}
    }
  ]
}
```

### 5. Estadísticas de un Artículo

```bash
curl http://localhost:3000/api/interactions/stats/507f1f77bcf86cd799439011?days=7
```

**Respuesta:**
```json
{
  "articleId": "507f1f77bcf86cd799439011",
  "totalViews": 3450,
  "viewsByDay": [
    { "date": "2025-11-23", "views": 520 },
    { "date": "2025-11-22", "views": 485 },
    { "date": "2025-11-21", "views": 510 }
  ]
}
```

---

## 🧪 Cómo Probar

### 1. Levantar servicios

```bash
cd /home/andresuki/norelnet-news/norelnet-news
docker-compose up -d
```

### 2. Verificar Cassandra

```bash
# Ver que Cassandra está corriendo
docker ps | grep cassandra

# Conectar a Cassandra
docker exec -it cassandra cqlsh

# Ver keyspace y tablas
cqlsh> DESCRIBE KEYSPACE norelnet_news;
cqlsh> SELECT * FROM norelnet_news.user_interactions LIMIT 5;
cqlsh> SELECT * FROM norelnet_news.article_views_by_day;
```

### 3. Probar Endpoints

```bash
# Simular varias vistas
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/interactions/view/test-article-123
  sleep 1
done

# Ver trending
curl http://localhost:3000/api/interactions/trending

# Ver estadísticas
curl http://localhost:3000/api/interactions/stats/test-article-123
```

---

## 📊 Ventajas de Cassandra

### ✅ Por qué Cassandra para Interacciones

1. **Escrituras rápidas:** Optimizado para alta frecuencia de escrituras
2. **Series temporales:** Perfecto para datos ordenados por tiempo
3. **Escalabilidad horizontal:** Añadir nodos sin downtime
4. **Alta disponibilidad:** Sin single point of failure
5. **Queries por partition key:** Muy eficientes por usuario o fecha

### 📈 Casos de Uso Ideales

- ✅ Tracking de vistas de millones de usuarios
- ✅ Contadores en tiempo real
- ✅ Historial de actividad ordenado por tiempo
- ✅ Analytics de tendencias por día/semana/mes
- ✅ Logs de eventos distribuidos

---

## ⚙️ Modelo de Particiones

### user_interactions

```
Partition: user_id = "user123"
  ├─ 2025-11-23 10:30:00 | article-001 | view
  ├─ 2025-11-23 10:25:00 | article-002 | like
  ├─ 2025-11-23 10:20:00 | article-001 | view
  └─ 2025-11-22 15:10:00 | article-003 | share
```

**Consulta eficiente:** "Dame las últimas 50 interacciones del usuario X"

### article_views_by_day

```
Partition: date = "2025-11-23"
  ├─ article-001 | count: 1250
  ├─ article-002 | count: 980
  └─ article-003 | count: 750
```

**Consulta eficiente:** "Dame los artículos más vistos de hoy"

---

## 🔍 Queries CQL Directas

### Ver interacciones de un usuario

```cql
SELECT * FROM norelnet_news.user_interactions
WHERE user_id = '673c1234567890abcdef1234'
LIMIT 50;
```

### Ver vistas del día

```cql
SELECT * FROM norelnet_news.article_views_by_day
WHERE date = '2025-11-23';
```

### Incrementar contador manualmente

```cql
UPDATE norelnet_news.article_views_by_day
SET view_count = view_count + 1
WHERE date = '2025-11-23' AND article_id = 'test-article-123';
```

---

## 🚀 Optimizaciones Futuras

1. **TTL en interacciones:** Auto-eliminar datos antiguos
   ```cql
   ALTER TABLE user_interactions WITH default_time_to_live = 7776000; -- 90 días
   ```

2. **Materialized Views:** Para queries adicionales
   ```cql
   CREATE MATERIALIZED VIEW interactions_by_article AS
   SELECT * FROM user_interactions
   WHERE article_id IS NOT NULL
   PRIMARY KEY (article_id, timestamp, user_id);
   ```

3. **Batch writes:** Agrupar múltiples inserts

4. **Compression:** Reducir tamaño en disco
   ```cql
   ALTER TABLE user_interactions WITH compression = {'class': 'LZ4Compressor'};
   ```

---

## 📝 Notas Importantes

### ⚠️ Limitaciones de Cassandra

- ❌ No soporta JOINs - diseña tablas por query
- ❌ No permite ORDER BY arbitrario - solo clustering keys
- ❌ No tiene transactions ACID completas - solo operaciones atómicas
- ❌ Counters no son 100% precisos bajo alta carga

### ✅ Mejores Prácticas

- ✓ Diseña modelo de datos basado en queries, no en entidades
- ✓ Usa partition keys que distribuyan datos uniformemente
- ✓ Limita el tamaño de particiones (<100MB)
- ✓ Usa prepared statements para queries repetidas
- ✓ Monitorea latencias de lectura/escritura

---

## 🔗 Integración con Otros Módulos

### Con Articles (MongoDB + Redis)

```javascript
// En ArticleController.getById()
// Después de servir el artículo, registrar vista
await InteractionService.recordInteraction({
  userId: req.user?._id || 'anonymous',
  articleId: req.params.id,
  type: 'view'
});
```

### Con Frontend

```javascript
// En el frontend, al abrir un artículo
fetch(`/api/interactions/view/${articleId}`, { method: 'POST' });

// Al dar like
fetch(`/api/interactions/like/${articleId}`, { 
  method: 'POST',
  credentials: 'include' // Incluir cookies de sesión
});

// Mostrar trending en homepage
const trending = await fetch('/api/interactions/trending?limit=5');
```

---

## ✅ Issue Completado

Esta implementación completa el issue: **"Implementar interacciones de usuario con Cassandra"**

**Archivos creados/modificados:**
1. `docker-compose.yml` (modificado)
2. `backend/package.json` (modificado)
3. `backend/src/database-cassandra.js` (nuevo)
4. `backend/src/services/interactionService.js` (nuevo)
5. `backend/src/controllers/interactionController.js` (nuevo)
6. `backend/src/routes/interactions.js` (nuevo)
7. `backend/src/index.js` (modificado - 3 líneas)
8. `backend/CASSANDRA_IMPLEMENTATION.md` (este archivo)

El sistema está listo para producción y permite tracking escalable de interacciones de usuarios. 🎉
