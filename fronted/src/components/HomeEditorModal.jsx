import { useState, useCallback, useEffect } from "react";
import { api } from "../lib/api";

/**
 * Modal para editar las secciones del home
 * Permite seleccionar qué artículos aparecen en:
 * - Portada (top stories)
 * - Análisis (análisis y contexto)
 * - Visuales (reportajes en video)
 * - Newsletter (destacado)
 */
export default function HomeEditorModal({ open, onClose }) {
  const [secciones, setSecciones] = useState({
    portada: [],
    analisis: [],
    visuales: [],
    newsletter: null,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");
  const [articles, setArticles] = useState([]);
  const [currentSection, setCurrentSection] = useState("portada");

  // Cargar configuración actual
  useEffect(() => {
    if (!open) return;
    
    const loadConfig = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/api/home/config");
        setSecciones({
          portada: data.portada || [],
          analisis: data.analisis || [],
          visuales: data.visuales || [],
          newsletter: data.newsletter || null,
        });
      } catch (err) {
        setMsg("Error al cargar configuración");
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, [open]);

  // Buscar artículos
  const searchArticles = useCallback(async () => {
    if (!search.trim()) {
      setArticles([]);
      return;
    }

    try {
      const { data } = await api.get("/api/home/search", {
        params: { q: search, limit: 20 },
      });
      setArticles(data || []);
    } catch (err) {
      setMsg("Error al buscar artículos");
    }
  }, [search]);

  // Agregar artículo a la sección actual
  const addArticle = useCallback((article) => {
    setSecciones((prev) => {
      const newSecciones = { ...prev };
      
      if (currentSection === "newsletter") {
        // Newsletter es un solo artículo
        newSecciones.newsletter = article._id;
      } else {
        // Portada, análisis y visuales son arrays
        const sectionArray = newSecciones[currentSection] || [];
        if (!sectionArray.find((a) => a._id === article._id)) {
          newSecciones[currentSection] = [...sectionArray, article];
        }
      }
      
      return newSecciones;
    });
    setArticles([]);
    setSearch("");
  }, [currentSection]);

  // Remover artículo de la sección
  const removeArticle = useCallback((articleId) => {
    setSecciones((prev) => {
      const newSecciones = { ...prev };
      
      if (currentSection === "newsletter") {
        if (newSecciones.newsletter?._id === articleId) {
          newSecciones.newsletter = null;
        }
      } else {
        newSecciones[currentSection] = (newSecciones[currentSection] || []).filter(
          (a) => a._id !== articleId
        );
      }
      
      return newSecciones;
    });
  }, [currentSection]);

  // Guardar cambios
  const saveChanges = useCallback(async () => {
    setSaving(true);
    setMsg("");
    
    try {
      // Guardar cada sección
      for (const [seccion, ids] of Object.entries(secciones)) {
        const articleIds = seccion === "newsletter" 
          ? (ids ? [ids._id || ids] : [])
          : (ids || []).map((a) => a._id || a);

        if (articleIds.length > 0 || ids) {
          await api.put(`/api/home/${seccion}`, { articleIds });
        }
      }
      
      setMsg("¡Cambios guardados!");
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setMsg("Error al guardar cambios");
    } finally {
      setSaving(false);
    }
  }, [secciones, onClose]);

  if (!open) return null;

  const sectionLabels = {
    portada: "Portada",
    analisis: "Análisis y contexto",
    visuales: "Reportajes visuales",
    newsletter: "Newsletter (destacado)",
  };

  const currentArticles = currentSection === "newsletter"
    ? (secciones.newsletter ? [secciones.newsletter] : [])
    : secciones[currentSection];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: "800px", maxHeight: "90vh", overflow: "auto" }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
        <h3 style={{ marginTop: 0 }}>Editar home</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", minHeight: "500px" }}>
          {/* Panel de secciones */}
          <div style={{ borderRight: "1px solid #ddd", paddingRight: "16px" }}>
            <h4>Secciones</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {Object.entries(sectionLabels).map(([key, label]) => (
                <button
                  key={key}
                  className={`btn sm ${currentSection === key ? "primary" : "ghost"}`}
                  onClick={() => setCurrentSection(key)}
                  style={{ textAlign: "left" }}
                >
                  {label}
                  <span style={{ float: "right", fontSize: "12px" }}>
                    {key === "newsletter"
                      ? secciones[key] ? "✓" : "-"
                      : secciones[key]?.length || 0}
                  </span>
                </button>
              ))}
            </div>

            <h4 style={{ marginTop: "24px" }}>Artículos en {sectionLabels[currentSection]}</h4>
            <div style={{ maxHeight: "300px", overflow: "auto", border: "1px solid #ddd", borderRadius: "4px", padding: "8px" }}>
              {currentArticles.length === 0 ? (
                <p style={{ color: "#999", textAlign: "center", padding: "16px 0" }}>
                  Sin artículos
                </p>
              ) : (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {currentArticles.map((article) => (
                    <li key={article._id} style={{ padding: "8px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, wordBreak: "break-word" }}>
                          {article.titulo}
                        </p>
                        <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#666" }}>
                          {article.categoria}
                        </p>
                      </div>
                      <button
                        className="btn sm ghost"
                        onClick={() => removeArticle(article._id)}
                        style={{ marginLeft: "8px", minWidth: "auto" }}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Panel de búsqueda */}
          <div style={{ paddingLeft: "16px" }}>
            <h4>Buscar artículos</h4>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <input
                type="text"
                className="inp"
                placeholder="Título, autor, categoría..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") searchArticles();
                }}
                style={{ flex: 1 }}
              />
              <button className="btn" onClick={searchArticles}>
                🔍
              </button>
            </div>

            <div style={{ maxHeight: "350px", overflow: "auto", border: "1px solid #ddd", borderRadius: "4px" }}>
              {articles.length === 0 && search ? (
                <p style={{ color: "#999", textAlign: "center", padding: "16px" }}>
                  Sin resultados
                </p>
              ) : (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {articles.map((article) => (
                    <li key={article._id} style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "8px" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, wordBreak: "break-word" }}>
                            {article.titulo}
                          </p>
                          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#666" }}>
                            {article.categoria}
                          </p>
                        </div>
                        <button
                          className="btn sm primary"
                          onClick={() => addArticle(article)}
                          style={{ minWidth: "auto" }}
                        >
                          +
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {msg && (
          <p style={{ marginTop: "16px", color: msg.includes("Error") ? "#ef4444" : "#a3e635" }}>
            {msg}
          </p>
        )}

        <div style={{ marginTop: "24px", display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button className="btn ghost" onClick={onClose}>
            Cancelar
          </button>
          <button 
            className="btn primary" 
            onClick={saveChanges}
            disabled={saving || loading}
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
