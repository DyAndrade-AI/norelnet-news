import { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";

/**
 * Admin de categorías:
 *  - Lista + búsqueda
 *  - Crear
 *  - Editar nombre/slug
 *  - Eliminar
 *
 * Endpoints:
 *  GET    /api/categories?search=
 *  POST   /api/categories           body: {name, slug}
 *  PUT    /api/categories/:id       body: {name, slug}
 *  DELETE /api/categories/:id
 */
export default function CategoryManager({ open, onClose }) {
  const [q, setQ] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [edit, setEdit] = useState(null); // {_id,name,slug} o null
  const [creating, setCreating] = useState({ name: "", slug: "" });

  const fetchCats = async () => {
    setLoading(true);
    setErr("");
    try {
      const url = q.trim() ? `/api/categories?search=${encodeURIComponent(q.trim())}` : `/api/categories`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("No se pudieron cargar categorías");
      const data = await res.json();
      const arr = Array.isArray(data) ? data : (data.items || []);
      setList(arr);
    } catch (e) {
      setErr(e.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (open) fetchCats(); }, [open]);
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => fetchCats(), 200);
    return () => clearTimeout(id);
    // eslint-disable-next-line
  }, [q]);

  const saveNew = async () => {
    try {
      setErr("");
      const name = creating.name.trim();
      let slug = creating.slug.trim() || slugify(name);
      if (!name) throw new Error("Nombre requerido");
      if (!slug) throw new Error("Slug requerido");

      const res = await fetch(`/api/categories`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });
      if (!res.ok) throw new Error("No se pudo crear");
      setCreating({ name: "", slug: "" });
      await fetchCats();
    } catch (e) {
      setErr(e.message || "Error creando");
    }
  };

  const saveEdit = async () => {
    try {
      const name = String(edit.name || "").trim();
      const slug = String(edit.slug || "").trim();
      if (!name || !slug) throw new Error("Nombre y slug requeridos");
      const res = await fetch(`/api/categories/${edit._id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });
      if (!res.ok) throw new Error("No se pudo guardar cambios");
      setEdit(null);
      await fetchCats();
    } catch (e) {
      setErr(e.message || "Error guardando");
    }
  };

  const del = async (id) => {
    if (!confirm("¿Eliminar esta categoría?")) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar");
      await fetchCats();
    } catch (e) {
      setErr(e.message || "Error eliminando");
    }
  };

  const canCreate = useMemo(() => creating.name.trim().length > 0, [creating.name]);

  return (
    <Modal open={open} onClose={onClose} ariaLabel="Categorías">
      <div className="catmgr">
        <div className="catmgr-head">
          <h3 style={{ margin: 0 }}>Categorías</h3>
        </div>

        <div className="catmgr-toolbar">
          <input
            className="inp"
            placeholder="Buscar categoría por nombre o slug…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {loading && <span className="muted">Cargando…</span>}
          {err && <span className="err">{err}</span>}
        </div>

        {/* Crear nueva */}
        <div className="grid-2" style={{ marginBottom: 12 }}>
          <input
            className="inp"
            placeholder="Nombre (ej: Fuertes & Grill)"
            value={creating.name}
            onChange={(e) => setCreating(s => ({ ...s, name: e.target.value }))}
          />
          <input
            className="inp"
            placeholder="Slug (ej: fuertes-grill)"
            value={creating.slug}
            onChange={(e) => setCreating(s => ({ ...s, slug: e.target.value }))}
            onBlur={() => !creating.slug && setCreating(s => ({ ...s, slug: slugify(s.name) }))}
          />
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button className="btn primary" disabled={!canCreate} onClick={saveNew}>Crear nueva</button>
        </div>

        {/* Lista */}
        <div className="catmgr-list">
          {list.map((c) => (
            <div key={c._id} className="row">
              {edit?._id === c._id ? (
                <>
                  <input
                    className="inp"
                    value={edit.name}
                    onChange={(e) => setEdit(s => ({ ...s, name: e.target.value }))}
                  />
                  <input
                    className="inp"
                    value={edit.slug}
                    onChange={(e) => setEdit(s => ({ ...s, slug: e.target.value }))}
                  />
                  <div className="actions">
                    <button className="btn sm primary" onClick={saveEdit}>Guardar</button>
                    <button className="btn sm" onClick={() => setEdit(null)}>Cancelar</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="title">{c.name}</div>
                  <div className="muted">{c.slug}</div>
                  <div className="actions">
                    <button className="btn sm" onClick={() => setEdit(c)}>Editar</button>
                    <button className="btn sm danger" onClick={() => del(c._id)}>Eliminar</button>
                  </div>
                </>
              )}
            </div>
          ))}
          {!list.length && !loading && <div className="muted">Sin categorías</div>}
        </div>
      </div>
    </Modal>
  );
}

function slugify(s) {
  return String(s || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
