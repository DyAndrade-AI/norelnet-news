import cassandra from 'cassandra-driver';

/**
 * Cliente de Cassandra para registrar interacciones de usuarios con noticias
 * Usado para almacenar series temporales de vistas, likes, etc.
 */

const contactPoints = process.env.CASSANDRA_CONTACT_POINTS?.split(',') || ['cassandra'];
const localDataCenter = process.env.CASSANDRA_DC || 'datacenter1';
const keyspace = 'norelnet_news';

export const cassandraClient = new cassandra.Client({
  contactPoints,
  localDataCenter,
  keyspace // Se conectará al keyspace después de crearlo
});

/**
 * Conectar a Cassandra y crear schema si no existe
 */
export async function connectCassandra() {
  try {
    // Primero conectar sin keyspace para crearlo
    const tempClient = new cassandra.Client({
      contactPoints,
      localDataCenter
    });
    
    await tempClient.connect();
    console.log('Cassandra conectado - iniciando setup...');
    
    // Crear keyspace si no existe
    await tempClient.execute(`
      CREATE KEYSPACE IF NOT EXISTS ${keyspace}
      WITH replication = {
        'class': 'SimpleStrategy',
        'replication_factor': 1
      }
    `);
    
    await tempClient.shutdown();
    
    // Ahora conectar al keyspace
    await cassandraClient.connect();
    
    // Crear tabla de interacciones de usuarios
    // Particionada por user_id para consultas rápidas por usuario
    // Ordenada por timestamp DESC para obtener historial reciente
    await cassandraClient.execute(`
      CREATE TABLE IF NOT EXISTS user_interactions (
        user_id TEXT,
        article_id TEXT,
        interaction_type TEXT,
        timestamp TIMESTAMP,
        metadata TEXT,
        PRIMARY KEY (user_id, timestamp, article_id)
      ) WITH CLUSTERING ORDER BY (timestamp DESC)
    `);
    
    // Tabla para análisis de artículos más vistos
    // Particionada por fecha (día) para queries eficientes
    await cassandraClient.execute(`
      CREATE TABLE IF NOT EXISTS article_views_by_day (
        date TEXT,
        article_id TEXT,
        view_count COUNTER,
        PRIMARY KEY (date, article_id)
      )
    `);
    
    console.log('✓ Cassandra schema creado correctamente');
    
  } catch (err) {
    console.error('Error conectando a Cassandra:', err.message);
    // No lanzar error para que la app pueda arrancar sin Cassandra
    // Las funciones de interacciones fallarán gracefully
  }
}

/**
 * Cerrar conexión a Cassandra
 */
export async function disconnectCassandra() {
  if (cassandraClient) {
    await cassandraClient.shutdown();
    console.log('Cassandra desconectado');
  }
}
