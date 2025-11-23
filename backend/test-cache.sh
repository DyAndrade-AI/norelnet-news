#!/bin/bash

# Script de prueba para verificar el sistema de caché de noticias con Redis

echo "==================================="
echo "🧪 Prueba de Caché de Noticias"
echo "==================================="
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que Redis esté corriendo
echo -e "${BLUE}1. Verificando conexión a Redis...${NC}"
if docker exec terruno-redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Redis está activo${NC}"
else
    echo -e "${YELLOW}⚠ Redis no está corriendo. Iniciando...${NC}"
    docker-compose up -d redis
    sleep 2
fi
echo ""

# Limpiar caché anterior
echo -e "${BLUE}2. Limpiando caché anterior...${NC}"
docker exec terruno-redis redis-cli DEL $(docker exec terruno-redis redis-cli KEYS "articles:*" 2>/dev/null) > /dev/null 2>&1
echo -e "${GREEN}✓ Caché limpiado${NC}"
echo ""

# Primera consulta (sin caché)
echo -e "${BLUE}3. Primera consulta (SIN caché - más lenta)...${NC}"
START_TIME1=$(date +%s%N)
curl -s http://localhost:3000/api/articles?page=1&limit=10 > /dev/null
END_TIME1=$(date +%s%N)
DURATION1=$((($END_TIME1 - $START_TIME1) / 1000000))
echo -e "${GREEN}✓ Tiempo: ${DURATION1}ms${NC}"
echo ""

# Verificar que se guardó en caché
echo -e "${BLUE}4. Verificando que se guardó en caché...${NC}"
CACHE_KEYS=$(docker exec terruno-redis redis-cli KEYS "articles:*" 2>/dev/null | wc -l)
echo -e "${GREEN}✓ Claves en caché: ${CACHE_KEYS}${NC}"
echo ""

# Segunda consulta (con caché)
echo -e "${BLUE}5. Segunda consulta (CON caché - más rápida)...${NC}"
START_TIME2=$(date +%s%N)
curl -s http://localhost:3000/api/articles?page=1&limit=10 > /dev/null
END_TIME2=$(date +%s%N)
DURATION2=$((($END_TIME2 - $START_TIME2) / 1000000))
echo -e "${GREEN}✓ Tiempo: ${DURATION2}ms${NC}"
echo ""

# Calcular mejora
if [ $DURATION2 -lt $DURATION1 ]; then
    IMPROVEMENT=$((($DURATION1 - $DURATION2) * 100 / $DURATION1))
    echo -e "${GREEN}🚀 Mejora de rendimiento: ${IMPROVEMENT}% más rápido con caché${NC}"
else
    echo -e "${YELLOW}⚠ El caché no mostró mejora significativa (puede ser que MongoDB ya tenía los datos en memoria)${NC}"
fi
echo ""

# Mostrar claves en caché
echo -e "${BLUE}6. Claves almacenadas en Redis:${NC}"
docker exec terruno-redis redis-cli KEYS "articles:*" 2>/dev/null | head -5
echo ""

# Mostrar TTL de una clave
FIRST_KEY=$(docker exec terruno-redis redis-cli KEYS "articles:*" 2>/dev/null | head -1)
if [ ! -z "$FIRST_KEY" ]; then
    TTL=$(docker exec terruno-redis redis-cli TTL "$FIRST_KEY" 2>/dev/null)
    echo -e "${BLUE}7. TTL de la primera clave:${NC}"
    echo -e "${GREEN}${FIRST_KEY}: ${TTL} segundos (${TTL} / 60 = $((TTL / 60)) minutos)${NC}"
fi

echo ""
echo "==================================="
echo -e "${GREEN}✅ Prueba completada${NC}"
echo "==================================="
