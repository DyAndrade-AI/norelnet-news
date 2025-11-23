import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function NewsList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const res = await api.get('/api/articles?limit=20');
        setArticles(res.data.items || []);
      } catch (err) {
        setError('Error al cargar las noticias');
      } finally {
        setLoading(false);
      }
    };
    
    loadArticles();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <main className="page">
        <div className="container-fluid" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p>Cargando noticias...</p>
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
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="container-fluid" style={{ maxWidth: '900px', padding: '20px' }}>
        <h1 style={{ marginBottom: '30px' }}>Noticias</h1>

        {articles.length === 0 ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
            <p>No hay noticias disponibles</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {articles.map((article) => (
              <Link 
                key={article._id} 
                to={`/article/${article._id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <article 
                  className="card" 
                  style={{ 
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s',
                    display: 'flex',
                    gap: '20px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = ''}
                >
                  {/* Imagen miniatura si existe */}
                  {article.imagen_url && (
                    <div style={{ 
                      flexShrink: 0,
                      width: '150px',
                      height: '100px',
                      overflow: 'hidden',
                      borderRadius: '8px',
                      background: '#f0f0f0'
                    }}>
                      <img 
                        src={article.imagen_url} 
                        alt=""
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover' 
                        }}
                      />
                    </div>
                  )}

                  {/* Contenido */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Categoría */}
                    <div style={{ marginBottom: '8px' }}>
                      <span 
                        style={{ 
                          display: 'inline-block',
                          padding: '3px 10px',
                          background: '#f0f0f0',
                          borderRadius: '10px',
                          fontSize: '12px',
                          color: '#666'
                        }}
                      >
                        {article.categoria}
                      </span>
                    </div>

                    {/* Título */}
                    <h3 style={{ 
                      margin: '0 0 8px 0', 
                      fontSize: '20px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {article.titulo}
                    </h3>

                    {/* Extracto del contenido */}
                    <p style={{ 
                      margin: '0 0 10px 0',
                      color: '#666',
                      fontSize: '14px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {article.contenido}
                    </p>

                    {/* Metadata */}
                    <div style={{ fontSize: '13px', color: '#999' }}>
                      <span>{article.autor.nombre}</span>
                      <span style={{ margin: '0 6px' }}>•</span>
                      <span>{formatDate(article.fecha_publicacion)}</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
