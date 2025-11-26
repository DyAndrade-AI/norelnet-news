import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

const CATEGORIES = ["Ciencia", "Tecnología", "Deportes", "Cultura", "Política", "Economía"];

export default function Menu() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/api/articles", { params: { page: 1, limit: 24 } });
        const arr = Array.isArray(data?.items) ? data.items : [];
        setArticles(arr);
      } catch (e) {
        setErr(e?.response?.data?.error || e.message || "Error cargando artículos");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const grouped = useMemo(() => {
    const byCat = Object.fromEntries(CATEGORIES.map(c => [c, []]));
    for (const art of articles) {
      const cat = art.categoria || "General";
      if (!byCat[cat]) byCat[cat] = [];
      byCat[cat].push(art);
    }
    return byCat;
  }, [articles]);

  if (loading) return <div className="page" style={{ padding: 16 }}>Cargando…</div>;
  if (err) return <div className="page" style={{ padding: 16, color: "crimson" }}>{err}</div>;

  return (
    <main className="menu-page">
      <section className="menu-hero">
        <div className="menu-hero-inner">
          <p className="eyebrow">Secciones</p>
          <h1>Archivo y categorías</h1>
          <p>Explora la cobertura de NorelNet News por temas y consulta el archivo reciente.</p>
        </div>
      </section>

      <section className="menu-body">
        {CATEGORIES.map((cat) => {
          const list = grouped[cat] || [];
          return (
            <section key={cat} className="menu-section" id={cat.toLowerCase()}>
              <div className="menu-section-head">
                <h2>{cat}</h2>
                <span className="meta">{list.length ? `${list.length} notas recientes` : "En preparación"}</span>
              </div>

              {list.length ? (
                <ul className="news-list">
                  {list.slice(0, 6).map((it) => (
                    <li key={it._id} className="news-list-item">
                      <div>
                        <p className="eyebrow">{it.categoria || "General"}</p>
                        <h3>{it.titulo}</h3>
                        {it.contenido && (
                          <p className="subtle">{snippet(it.contenido)}</p>
                        )}
                        {Array.isArray(it.etiquetas) && it.etiquetas.length > 0 && (
                          <div className="tag-row">
                            {it.etiquetas.slice(0, 4).map((tag) => (
                              <span key={tag} className="chip">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="meta">{formatDate(it.fecha_publicacion || it.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="menu-empty small">Aún no hay notas en esta sección.</div>
              )}
            </section>
          );
        })}
      </section>
    </main>
  );
}

function snippet(text, max = 160) {
  const t = String(text || "").replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

function formatDate(iso) {
  if (!iso) return "Actualizado";
  try {
    return new Date(iso).toLocaleDateString("es-MX", { month: "short", day: "2-digit" });
  } catch {
    return "Actualizado";
  }
}
