import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import HomeEditorModal from "./HomeEditorModal";

const CATEGORIES = ["Ciencia", "Tecnología", "Deportes", "Cultura", "Política", "Economía"];

// Panel lateral para que los editores gestionen artículos sin salir de la página.
export default function ArticleEditor({ onClose }) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [editing, setEditing] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [openHomeEditor, setOpenHomeEditor] = useState(false);

  const term = q.trim();

  const fetchList = async () => {
    setLoading(true);
    setErr("");
    try {
      let url = `/api/articles?page=${page}&limit=12`;
      let data;
      if (term) {
        const { data: searchData } = await api.get(`/api/articles/search?q=${encodeURIComponent(term)}&page=${page}&limit=12`);
        data = searchData;
      } else {
        const res = await api.get(url);
        data = res.data;
      }
      const arr = Array.isArray(data?.items) ? data.items : [];
      setItems(arr);
      setMeta({ total: data?.total ?? arr.length, pages: data?.pages ?? 1 });
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "Error cargando artículos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); /* eslint-disable-next-line */ }, [page]);
  useEffect(() => {
    const id = setTimeout(() => { setPage(1); fetchList(); }, 220);
    return () => clearTimeout(id);
    // eslint-disable-next-line
  }, [term]);

  const resetForm = () => setEditing(null);

  const startNew = () => {
    setEditing({
      _id: null,
      titulo: "",
      contenido: "",
      categoria: CATEGORIES[0],
      etiquetas: "",
      imagen_url: "",
    });
  };

  const startEdit = (a) => {
    setEditing({
      _id: a._id,
      titulo: a.titulo ?? "",
      contenido: a.contenido ?? "",
      categoria: a.categoria || CATEGORIES[0],
      etiquetas: Array.isArray(a.etiquetas) ? a.etiquetas.join(", ") : "",
      imagen_url: a.imagen_url || "",
    });
  };

  const save = async () => {
    try {
      setErr("");
      const payload = {
        titulo: editing.titulo,
        contenido: editing.contenido,
        categoria: editing.categoria,
        etiquetas: parseTags(editing.etiquetas),
        imagen_url: editing.imagen_url || null,
      };
      const url = editing._id ? `/api/articles/${editing._id}` : `/api/articles`;
      if (editing._id) {
        await api.put(url, payload);
      } else {
        await api.post(url, payload);
      }
      await fetchList();
      resetForm();
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "No se pudo guardar el artículo");
    }
  };

  const del = async (id) => {
    try {
      setErr("");
      await api.delete(`/api/articles/${id}`);
      setConfirmDel(null);
      await fetchList();
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "No se pudo eliminar");
    }
  };

  const canSave = useMemo(() => {
    if (!editing) return false;
    const titleOk = String(editing.titulo).trim().length >= 6;
    const bodyOk = String(editing.contenido).trim().length >= 20;
    return titleOk && bodyOk;
  }, [editing]);

  return (
    <div className="editor-wrap">
      <div className="editor-panel">
        <div className="editor-head">
          <h3 style={{ margin: 0 }}>Modo editor</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" onClick={startNew}>+ Nuevo artículo</button>
            <button className="btn" onClick={() => setOpenHomeEditor(true)}>📰 Home</button>
            <button className="btn" onClick={onClose}>Cerrar</button>
          </div>
        </div>

        <div className="editor-toolbar">
          <input
            className="inp"
            placeholder="Buscar por titular o etiquetas…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {loading && <span className="muted">Cargando…</span>}
          {err && <span className="err">{err}</span>}
        </div>

        <div className="editor-list">
          {items.map((it) => (
            <div key={it._id} className="row">
              <div className="col-main">
                <div className="title">{safeTitle(it.titulo)}</div>
                <div className="desc muted">{snippet(it.contenido)}</div>
                <div className="muted" style={{ marginTop: 4 }}>
                  {it.categoria || "General"} · {formatDate(it.fecha_publicacion || it.createdAt)}
                </div>
                {Array.isArray(it.etiquetas) && it.etiquetas.length > 0 && (
                  <div className="tag-row" style={{ marginTop: 6 }}>
                    {it.etiquetas.slice(0, 4).map((tag) => <span key={tag} className="chip">{tag}</span>)}
                  </div>
                )}
              </div>
              <div className="col-side">
                <div className="actions">
                  <button className="btn sm" onClick={() => startEdit(it)}>Editar</button>
                  <button className="btn sm danger" onClick={() => setConfirmDel(it)}>Eliminar</button>
                </div>
              </div>
            </div>
          ))}
          {!items.length && !loading && <div className="muted">Sin resultados</div>}
        </div>

        {meta.pages > 1 && (
          <div className="editor-pager">
            <button className="btn sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Anterior</button>
            <span className="muted">Página {page} de {meta.pages}</span>
            <button className="btn sm" disabled={page >= meta.pages} onClick={() => setPage(p => p + 1)}>Siguiente</button>
          </div>
        )}

        {editing && (
          <div className="editor-form">
            <h4 style={{ marginTop: 0 }}>{editing._id ? "Editar artículo" : "Nuevo artículo"}</h4>

            <label className="field">
              <span>Título</span>
              <input
                className="inp"
                value={editing.titulo}
                onChange={(e) => setEditing(s => ({ ...s, titulo: e.target.value }))}
                required
              />
            </label>

            <label className="field">
              <span>Categoría</span>
              <select
                className="inp"
                value={editing.categoria}
                onChange={(e) => setEditing(s => ({ ...s, categoria: e.target.value }))}
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>

            <label className="field">
              <span>Etiquetas (separadas por coma)</span>
              <input
                className="inp"
                value={editing.etiquetas}
                onChange={(e) => setEditing(s => ({ ...s, etiquetas: e.target.value }))}
              />
            </label>

            <label className="field">
              <span>Imagen (URL opcional)</span>
              <input
                className="inp"
                value={editing.imagen_url}
                onChange={(e) => setEditing(s => ({ ...s, imagen_url: e.target.value }))}
              />
            </label>

            <label className="field">
              <span>Contenido</span>
              <textarea
                className="inp" rows={6}
                value={editing.contenido}
                onChange={(e) => setEditing(s => ({ ...s, contenido: e.target.value }))}
              />
            </label>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn primary" disabled={!canSave} onClick={save}>
                {editing._id ? "Guardar cambios" : "Crear artículo"}
              </button>
              <button className="btn" onClick={resetForm}>Cancelar</button>
            </div>
          </div>
        )}
      </div>

      {confirmDel && (
        <div className="editor-confirm" onClick={() => setConfirmDel(null)}>
          <div className="editor-confirm-panel" onClick={(e) => e.stopPropagation()}>
            <h4 style={{ marginTop: 0 }}>Eliminar artículo</h4>
            <p>¿Seguro que quieres eliminar <b>{safeTitle(confirmDel.titulo)}</b>?</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn danger" onClick={() => del(confirmDel._id)}>Eliminar</button>
              <button className="btn" onClick={() => setConfirmDel(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <HomeEditorModal open={openHomeEditor} onClose={() => setOpenHomeEditor(false)} />
    </div>
  );
}

function safeTitle(n) {
  const t = String(n || "").trim();
  return t || "Artículo";
}

function snippet(text, max = 120) {
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

function parseTags(str) {
  return String(str || "")
    .split(",")
    .map(t => t.trim())
    .filter(Boolean)
    .slice(0, 12);
}
