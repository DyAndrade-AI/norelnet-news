# Sistema de Edición del Home

Este documento explica cómo funciona el nuevo sistema de edición del home de NorelNet News.

## Descripción General

El sistema permite que los administradores editen las secciones principales del home de forma visual, seleccionando qué artículos aparecen en cada sección:

- **Portada**: Los 6 principales artículos de la página principal
- **Análisis y contexto**: 3 artículos de análisis y reportajes
- **Reportajes visuales**: 4 videos o contenido visual
- **Newsletter**: 1 artículo destacado para el boletín

## Cómo usar

### Para el administrador:

1. **Abrir el editor**
   - Inicia sesión como administrador (rol: `admin`)
   - Haz clic en el botón "Editar" en la navegación
   - En el panel del editor, haz clic en el botón "📰 Home"

2. **Editar secciones**
   - Selecciona una sección en el panel izquierdo
   - Busca artículos por título, autor o categoría
   - Haz clic en `+` para agregar un artículo
   - Haz clic en `✕` para remover un artículo
   - El orden importa: el primer artículo será el destacado

3. **Guardar cambios**
   - Haz clic en "Guardar cambios"
   - Los cambios se aplicarán inmediatamente

### Para los usuarios:

El home se actualiza automáticamente con los artículos configurados por el administrador. Si no hay artículos configurados, se muestran artículos por defecto.

## Estructura Técnica

### Backend

#### Modelo: `HomeSections`
```
{
  portada: [ObjectId],           // Array de IDs de artículos
  analisis: [ObjectId],          // Array de IDs de artículos
  visuales: [ObjectId],          // Array de IDs de artículos
  newsletter: ObjectId,          // Un solo ID de artículo
  ultima_actualizacion: Date,
  actualizado_por: ObjectId,     // Ref a User
  timestamps: true
}
```

#### Endpoints API

```
GET  /api/home/config                  # Obtener configuración (público)
GET  /api/home/search?q=...&limit=20   # Buscar artículos (admin)
PUT  /api/home/:seccion                # Actualizar sección (admin)
```

Body para PUT:
```json
{
  "articleIds": ["id1", "id2", "id3"]  // Array de IDs
}
```

### Frontend

#### Componentes

- **HomeEditorModal.jsx**: Modal de edición del home
  - Búsqueda de artículos
  - Gestión de secciones
  - Guardado de cambios

- **ProductEditor.jsx**: Panel lateral de editor
  - Botón "📰 Home" que abre HomeEditorModal
  - Mantiene la gestión de artículos existente

- **Home.jsx**: Página principal
  - Carga la configuración del home desde `/api/home/config`
  - Usa artículos por defecto si no hay configuración

## Permisos

- ✅ Admin: Puede ver y editar todas las secciones
- ❌ Editor: Puede crear/editar artículos pero NO el home
- ❌ Lector: No tiene acceso al editor

## Inicialización

Al iniciar el contenedor, se ejecuta automáticamente `init-home-config.sh` para crear el documento inicial de configuración si no existe.

Puedes ejecutarlo manualmente:
```bash
./backend/init-home-config.sh
```

## Flujo de datos

```
1. Admin abre HomeEditorModal
2. Se carga /api/home/config
3. Admin busca artículos con /api/home/search
4. Admin selecciona artículos y hace PUT a /api/home/:seccion
5. El documento HomeSections se actualiza
6. En el home: GET /api/home/config carga la configuración
7. Se renderizan los artículos en cada sección
```

## Notas

- Los artículos se obtienen poblados (populate) con todos los datos necesarios
- El orden de los artículos en el array determina su posición
- El newsletter solo puede ser UN artículo
- Las búsquedas buscan en título, contenido, autor y categoría
- Los cambios son inmediatos y se guardan en MongoDB
