# 🔧 Guía Rápida: Sistema de Caché con Redis

## 🚀 Inicio Rápido

### 1. Levantar servicios
```bash
# Desde el directorio raíz del proyecto
docker-compose up -d

# Verificar que Redis esté corriendo
docker exec terruno-redis redis-cli ping
# Debe responder: PONG
```

### 2. Probar el sistema
```bash
# Primera consulta (genera caché)
curl http://localhost:3000/api/articles?page=1&limit=10

# Segunda consulta (usa caché) - más rápida ⚡
curl http://localhost:3000/api/articles?page=1&limit=10

# Ver claves en Redis
docker exec terruno-redis redis-cli KEYS "articles:*"
```

---

## 📖 Ejemplos de Uso

### Ejemplo 1: Listar noticias
```javascript
// Primera llamada - consulta MongoDB y guarda en caché
GET /api/articles?page=1&limit=20
// Tiempo: ~100ms
// Clave: articles:list:p1:l20:call:eall

// Segunda llamada - lee desde Redis
GET /api/articles?page=1&limit=20
// Tiempo: ~10ms ⚡ (10x más rápido)
```

### Ejemplo 2: Listar con filtros
```javascript
// Filtrar por categoría
GET /api/articles?page=1&limit=20&categoria=Ciencia
// Clave: articles:list:p1:l20:cCiencia:eall

// Filtrar por categoría y etiqueta
GET /api/articles?page=1&limit=20&categoria=Tecnología&etiqueta=IA
// Clave: articles:list:p1:l20:cTecnología:eIA
```

### Ejemplo 3: Obtener noticia específica
```javascript
// Obtener por ID
GET /api/articles/507f1f77bcf86cd799439011
// Clave: articles:id:507f1f77bcf86cd799439011
```

### Ejemplo 4: Noticias recientes
```javascript
// Obtener 10 noticias más recientes
GET /api/articles/recent?limit=10
// Clave: articles:recent:10
```

### Ejemplo 5: Búsqueda
```javascript
// Buscar noticias
GET /api/articles/search?q=tecnología&page=1&limit=20
// Clave: articles:search:tecnología:p1:l20
```

---

## 🔄 Flujo de Caché

### Lectura (GET)
```
Cliente → ArticleService → Cache.get(key)
                              ├─ Cache HIT → Retornar datos ⚡
                              └─ Cache MISS → MongoDB → Cache.set(key) → Retornar datos
```

### Escritura (POST/PUT/DELETE)
```
Cliente → ArticleService → MongoDB → Cache.clearArticles() → Retornar resultado
```

---

## 🛠️ Comandos Redis Útiles

### Monitoreo
```bash
# Ver todas las claves de artículos
docker exec terruno-redis redis-cli KEYS "articles:*"

# Ver valor de una clave
docker exec terruno-redis redis-cli GET "articles:list:p1:l20:call:eall"

# Ver TTL de una clave (tiempo restante en segundos)
docker exec terruno-redis redis-cli TTL "articles:list:p1:l20:call:eall"

# Ver estadísticas de Redis
docker exec terruno-redis redis-cli INFO stats

# Monitorear comandos en tiempo real
docker exec terruno-redis redis-cli MONITOR
```

### Mantenimiento
```bash
# Limpiar todo el caché de artículos
docker exec terruno-redis redis-cli DEL $(docker exec terruno-redis redis-cli KEYS "articles:*")

# Ver tamaño de la base de datos
docker exec terruno-redis redis-cli DBSIZE

# Ver memoria usada
docker exec terruno-redis redis-cli INFO memory

# Flush completo (¡CUIDADO! Borra TODO incluyendo sesiones)
# docker exec terruno-redis redis-cli FLUSHDB  # ⚠️ NO USAR EN PRODUCCIÓN
```

---

## 📊 Debugging

### Ver qué se está cacheando
```bash
# Ver claves y sus TTL
docker exec terruno-redis redis-cli --scan --pattern "articles:*" | while read key; do
    echo "$key: $(docker exec terruno-redis redis-cli TTL $key)s"
done
```

### Verificar hit rate
```bash
# Ver estadísticas de hits/misses
docker exec terruno-redis redis-cli INFO stats | grep keyspace
```

### Probar rendimiento
```bash
# Herramienta de benchmark
time curl http://localhost:3000/api/articles?page=1&limit=10

# O usar Apache Bench
ab -n 100 -c 10 http://localhost:3000/api/articles?page=1&limit=10
```

---

## 🐛 Troubleshooting

### Problema: Redis no responde
```bash
# Verificar que Redis esté corriendo
docker ps | grep redis

# Ver logs de Redis
docker logs terruno-redis

# Reiniciar Redis
docker-compose restart redis
```

### Problema: Caché no se actualiza
```bash
# Limpiar caché manualmente
docker exec terruno-redis redis-cli DEL $(docker exec terruno-redis redis-cli KEYS "articles:*")

# Verificar conexión del backend a Redis
docker logs api | grep -i redis
```

### Problema: Datos desactualizados
```bash
# El TTL es de 5 minutos por defecto
# Para forzar actualización, crear/editar/eliminar una noticia
# O limpiar caché manualmente (ver arriba)

# Cambiar TTL por defecto en: backend/src/utils/cache.js
const DEFAULT_TTL = 300; // Modificar según necesidad
```

---

## 📈 Optimización

### Ajustar TTL según tipo de consulta
```javascript
// En backend/src/services/articleService.js

// TTL corto para datos que cambian frecuentemente
await Cache.set(cacheKey, result, 60); // 1 minuto

// TTL largo para datos más estáticos
await Cache.set(cacheKey, result, 3600); // 1 hora
```

### Invalidación selectiva
```javascript
// En lugar de limpiar todo, eliminar claves específicas
await Cache.delete(`articles:id:${id}`);
await Cache.deletePattern(`articles:list:*`);
```

---

## 💡 Tips

1. **Monitoreo en producción:** Usa `redis-cli INFO stats` para ver hit rate
2. **TTL adecuado:** Ajusta según la frecuencia de cambios en tus noticias
3. **Espacio en Redis:** Monitorea con `INFO memory` para evitar quedarte sin espacio
4. **Logs:** Revisa los logs del backend para errores de Redis
5. **Backup:** Redis persiste datos en disco, pero considera backups regulares

---

## 🔒 Seguridad

- ✅ Redis en red privada (Docker)
- ✅ No expuesto públicamente
- ✅ Datos serializados en JSON
- ✅ Manejo de errores para evitar fallos en cascada

---

## 📚 Referencias

- [Redis Documentation](https://redis.io/docs/)
- [Node Redis Client](https://github.com/redis/node-redis)
- [Caching Best Practices](https://redis.io/docs/manual/patterns/caching/)

---

## ✅ Checklist de Verificación

Después de implementar, verifica:

- [ ] Redis está corriendo (`docker ps`)
- [ ] Backend se conecta sin errores (`docker logs api`)
- [ ] Primera consulta es más lenta que la segunda
- [ ] Claves aparecen en Redis (`KEYS articles:*`)
- [ ] TTL está configurado correctamente
- [ ] Caché se limpia al crear/actualizar/eliminar
- [ ] No hay errores en logs

---

**¿Preguntas?** Revisa `CACHE_IMPLEMENTATION.md` para documentación completa.
