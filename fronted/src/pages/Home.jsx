import Carousel from "../components/Carousel";
import ReelCard from "../components/ReelCard";
import ReelPlayer from "../components/ReelPlayer";
import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Home() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar configuración del home desde la API
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const { data } = await api.get("/api/home/config");
        setConfig(data);
      } catch (err) {
        console.error("Error cargando configuración del home:", err);
        // Usar datos por defecto si hay error
        setConfig({
          portada: [],
          analisis: [],
          visuales: [],
          newsletter: null,
        });
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  if (loading) {
    return <main className="page news-page"><div className="container">Cargando...</div></main>;
  }

  // Datos por defecto si el home no está configurado
  const portadaArticles = (config?.portada || []).slice(0, 6);
  const analysisArticles = (config?.analisis || []).slice(0, 3);
  const videosArticles = (config?.visuales || []).slice(0, 4);
  const newsletterArticle = config?.newsletter;

  // Artículos de la portada transformados al formato esperado
  const topStories = portadaArticles.length > 0
    ? portadaArticles.map((art) => ({
        title: art.titulo,
        summary: art.contenido?.substring(0, 100) || "",
        category: art.categoria,
        time: new Date(art.fecha_publicacion).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
      }))
    : [
        {
          title: "Suprema Corte discute alcance de la nueva reforma judicial",
          summary: "Ministros escuchan a especialistas y asociaciones civiles sobre independencia judicial.",
          category: "Política",
          time: "10:24"
        },
        {
          title: "La IA mexicana que predice demanda eléctrica en ciudades",
          summary: "Startups locales combinan datos de clima y movilidad para optimizar consumo energético.",
          category: "Tecnología",
          time: "09:58"
        },
      ];

  // Análisis transformado
  const analysis = analysisArticles.length > 0
    ? analysisArticles.map((art) => ({
        title: art.titulo,
        author: art.autor?.nombre || "Redacción NorelNet",
        tag: art.categoria,
        summary: art.contenido?.substring(0, 100) || "",
      }))
    : [
        {
          title: "Por qué el litio sigue siendo estratégico para la región",
          author: "Redacción NorelNet",
          tag: "Análisis",
          summary: "Inversión, soberanía y transición energética: las piezas que definen la carrera por el mineral."
        },
      ];

  // Artículo destacado (hero)
  const leadStory = portadaArticles[0]
    ? {
        title: portadaArticles[0].titulo,
        summary: portadaArticles[0].contenido?.substring(0, 150) || "",
        category: portadaArticles[0].categoria,
        updated: "hace poco",
        tag: "Cobertura especial",
      }
    : {
        title: "NorelNet News abre cobertura nacional con periodismo de datos",
        summary: "Investigaciones, contexto y reportajes visuales para entender la conversación pública en México.",
        category: "Portada",
        updated: "hace 12 min",
        tag: "Cobertura especial"
      };

  const liveUpdates = [
    { time: "10:32", title: "Sesionan diputados sobre paquete económico", detail: "Discuten reservas en gasto de educación y ciencia.", type: "Alerta" },
    { time: "10:05", title: "Conferencia de prensa federal", detail: "Secretaría de Salud presenta nuevo esquema de vacunación invernal.", type: "Cobertura" },
    { time: "09:48", title: "Mercados", detail: "Peso opera estable tras anuncio de tasas; analistas ven calma en corto plazo.", type: "Mercados" },
  ];

  const trendingTopics = [
    "IA generativa",
    "Medio ambiente",
    "Seguridad digital",
    "Educación pública",
    "Energía",
    "México 2025"
  ];

  // Videos transformados
  const videoReports = videosArticles.length > 0
    ? videosArticles.map((art, idx) => ({
        id: `v${idx}`,
        src: art.imagen_url || "/reels/default.mp4",
        title: art.titulo,
      }))
    : [
        { id: "r1", src: "/reels/lasanta.mp4", title: "Crónica: noche electoral en CDMX" },
        { id: "r2", src: "/reels/doggies.mp4", title: "El mapa del calor en transporte público" },
        { id: "r3", src: "/reels/mxburguer.mp4", title: "Cómo se rastrea la desinformación" },
        { id: "r4", src: "/reels/sonaria.mp4", title: "Visual story: la frontera en datos" },
      ];

  return (
    <main className="page news-page">
      <section className="news-hero bleed" id="portada">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="pill">Última hora</div>
            <h1>
              NorelNet News
              <span className="hero-sub">Cobertura inteligente, verificada y en tiempo real.</span>
            </h1>
            <p className="lead">
              Historias que importan en política, tecnología y sociedad. Datos, contexto y reportajes visuales para tomar mejores decisiones.
            </p>
            <div className="hero-meta">
              <span className="badge">Investigación</span>
              <span className="meta">Actualizado {leadStory.updated}</span>
              <span className="meta">Ciudad de México</span>
            </div>
            <div className="hero-actions">
              <button className="btn primary">Ver cobertura</button>
              <button className="btn ghost">Suscribirme al boletín</button>
            </div>
          </div>

          <article className="news-card hero-card">
            <div className="news-visual" aria-hidden="true" />
            <div className="news-card-body">
              <p className="eyebrow">{leadStory.category}</p>
              <h3>{leadStory.title}</h3>
              <p className="subtle">{leadStory.summary}</p>
              <div className="meta-row">
                <span className="chip">{leadStory.tag}</span>
                <span className="meta">{leadStory.updated}</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="section container news-grid" id="ultimas">
        <div className="news-main">
          <div className="section-head">
            <h2>Portada</h2>
            <p className="subtle">Historias verificadas y ordenadas por relevancia editorial.</p>
          </div>
          <div className="headline-grid">
            {topStories.map((item, i) => (
              <article key={i} className="headline-card">
                <div className="headline-top">
                  <span className="chip">{item.category}</span>
                  <span className="meta">{item.time}</span>
                </div>
                <h3>{item.title}</h3>
                <p className="subtle">{item.summary}</p>
              </article>
            ))}
          </div>

          <div className="section-head" id="analisis" style={{ marginTop: 24 }}>
            <h2>Análisis y contexto</h2>
            <p className="subtle">Explicadores y reportajes de la mesa de datos.</p>
          </div>
          <div className="analysis-grid">
            {analysis.map((item, i) => (
              <article key={i} className="analysis-card">
                <span className="chip muted">{item.tag}</span>
                <h3>{item.title}</h3>
                <p className="subtle">{item.summary}</p>
                <div className="meta-row">
                  <span className="meta">{item.author}</span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="news-sidebar">
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Tendencias</h3>
            <ul className="trend-list">
              {trendingTopics.map((t, i) => (
                <li key={t}>
                  <span className="trend-rank">{i + 1}</span>
                  <div>
                    <p className="trend-title">{t}</p>
                    <p className="trend-meta">Cobertura en desarrollo</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="card live-card" id="en-vivo">
            <div className="section-head" style={{ marginBottom: 8 }}>
              <h3 style={{ margin: 0 }}>En vivo</h3>
              <p className="subtle" style={{ margin: 0 }}>Actualizaciones minuto a minuto.</p>
            </div>
            <div className="live-list">
              {liveUpdates.map((u, i) => (
                <div key={i} className="live-item">
                  <span className="pill tiny">{u.type}</span>
                  <div>
                    <p className="live-title">{u.title}</p>
                    <p className="trend-meta">{u.detail}</p>
                  </div>
                  <span className="meta">{u.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card newsletter-card" id="boletin">
            <p className="eyebrow">Boletín</p>
            <h3 style={{ marginTop: 4 }}>Resumen diario de NorelNet News</h3>
            <p className="subtle">Lo esencial en tu correo, con enlaces a los datos y visualizaciones.</p>
            <button className="btn primary" style={{ width: "100%" }}>Suscribirme</button>
          </div>
        </aside>
      </section>

      <section className="section bleed" id="visuales">
        <div className="container-fluid" style={{ marginBottom: 12 }}>
          <div className="section-head">
            <h2 style={{ margin: 0 }}>Reportajes visuales</h2>
            <p className="subtle">Video breve y datos animados para entender en segundos.</p>
          </div>
        </div>

        <Carousel neighbors={2} gap={16} peek={40} minSlidePx={480} maxSlidePx={820} scaleInactive={0.94}>
          {videoReports.map((r) => (
            <ReelCard key={r.id} title={r.title}>
              <ReelPlayer src={r.src} autoPlay={true} />
            </ReelCard>
          ))}
        </Carousel>
      </section>
    </main>
  );
}
