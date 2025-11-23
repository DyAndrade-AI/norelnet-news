import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        setLoading(true);
        
        // Obtener la noticia
        const res = await api.get(`/api/articles/${id}`);
        setArticle(res.data);
        
        // Registrar vista automáticamente (sin bloquear la UI)
        api.post(`/api/interactions/view/${id}`).catch(() => {
          // Silenciar error si falla el registro
        });
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Noticia no encontrada');
        } else {
          setError('Error al cargar la noticia');
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadArticle();
  }, [id]);

  if (loading) {
    return (
      <main className="page">
        <div className="container-fluid" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p>Cargando noticia...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page">
        <div className="container-fluid" style={{ padding: '40px 20px' }}>
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <h2>❌ {error}</h2>
            <button onClick={() => navigate('/')} style={{ marginTop: '20px' }}>
              Volver al inicio
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!article) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <main className="page">
      <div className="container-fluid" style={{ maxWidth: '800px', padding: '20px' }}>
        {/* Botón volver */}
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            marginBottom: '20px',
            padding: '8px 16px',
            cursor: 'pointer',
            border: '1px solid #ddd',
            background: 'white',
            borderRadius: '4px'
          }}
        >
          ← Volver
        </button>

        {/* Contenido del artículo */}
        <article className="card" style={{ padding: '30px' }}>
          {/* Categoría */}
          <div style={{ marginBottom: '10px' }}>
            <span 
              style={{ 
                display: 'inline-block',
                padding: '4px 12px',
                background: '#f0f0f0',
                borderRadius: '12px',
                fontSize: '14px',
                color: '#666'
              }}
            >
              {article.categoria}
            </span>
          </div>

          {/* Título */}
          <h1 style={{ marginTop: 0, marginBottom: '15px', fontSize: '32px', lineHeight: '1.3' }}>
            {article.titulo}
          </h1>

          {/* Metadata */}
          <div style={{ 
            marginBottom: '25px', 
            paddingBottom: '15px', 
            borderBottom: '1px solid #eee',
            color: '#666',
            fontSize: '14px'
          }}>
            <span>Por <strong>{article.autor.nombre}</strong></span>
            <span style={{ margin: '0 8px' }}>•</span>
            <span>{formatDate(article.fecha_publicacion)}</span>
          </div>

          {/* Imagen destacada */}
          {article.imagen_url && (
            <div style={{ marginBottom: '25px' }}>
              <img 
                src={article.imagen_url} 
                alt={article.titulo}
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  borderRadius: '8px',
                  display: 'block'
                }}
              />
            </div>
          )}

          {/* Contenido */}
          <div style={{ 
            fontSize: '18px', 
            lineHeight: '1.8', 
            marginBottom: '25px',
            whiteSpace: 'pre-wrap'
          }}>
            {article.contenido}
          </div>

          {/* Etiquetas */}
          {article.etiquetas && article.etiquetas.length > 0 && (
            <div style={{ 
              paddingTop: '20px', 
              borderTop: '1px solid #eee',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              {article.etiquetas.map((tag) => (
                <span 
                  key={tag}
                  style={{ 
                    display: 'inline-block',
                    padding: '4px 10px',
                    background: '#e3f2fd',
                    color: '#1976d2',
                    borderRadius: '4px',
                    fontSize: '13px'
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </article>
      </div>
    </main>
  );
}
