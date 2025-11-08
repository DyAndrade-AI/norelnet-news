import { useEffect, useMemo, useState, useCallback } from "react";
import ComboBox from "./ComboBox";
import CategoryManager from "./CategoryManager";
import { api } from "../lib/api";

// Panel lateral para que los editores gestionen productos sin salir de la página.
export default function ProductEditor({ onClose }) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [editing, setEditing] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  // manager de categorías
  const [catManagerOpen, setCatManagerOpen] = useState(false);

  // ------- Productos: listado -------
  const term = q.trim();

  // Carga paginada de productos mostrados en el panel izquierdo
  const fetchList = async () => {
    setLoading(true);
    setErr("");
    try {
      const url = `/api/products?search=${encodeURIComponent(term)}&page=${page}`;
      const { data } = await api.get(url);
      const arr = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : []);
      setItems(arr);
      setMeta({ total: data.total ?? arr.length, pages: data.pages ?? 1 });
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "Error cargando productos");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => { fetchList(); /* eslint-disable-next-line */ }, [page]);
  useEffect(() => {
    const id = setTimeout(() => { setPage(1); fetchList(); }, 200);
    return () => clearTimeout(id);
    // eslint-disable-next-line
  }, [term]);

  const resetForm = () => setEditing(null);

  const startNew = () => {
    setEditing({
      _id: null,
      product_name: "",
      description: "",
      price: "",
      category: null, // { _id, name, slug } | null
    });
  };

  const startEdit = (p) => {
    const cat =
      typeof p.categoryId === "object" && p.categoryId
        ? { _id: p.categoryId._id, name: p.categoryId.name, slug: p.categoryId.slug }
        : (p.categoryId ? { _id: p.categoryId, name: "", slug: "" } : null);

    setEditing({
      _id: p._id,
      product_name: p.product_name ?? "",
      description: p.description ?? "",
      price: p.price ?? "",
      category: cat,
    });
  };

  // ------- Guardar / Eliminar -------
  // Alta/edición en la misma función para evitar duplicar lógica de validación
  const save = async () => {
    try {
      setErr("");
      const body = {
        product_name: editing.product_name,
        description: editing.description,
        price: Number(editing.price),
        categoryId: editing.category?._id ?? null,
      };
      const url = editing._id ? `/api/products/${editing._id}` : `/api/products`;
      if (editing._id) {
        await api.put(url, body);
      } else {
        await api.post(url, body);
      }
      await fetchList();
      resetForm();
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "No se pudo guardar el producto");
    }
  };

  const del = async (id) => {
    try {
      setErr("");
      await api.delete(`/api/products/${id}`);
      setConfirmDel(null);
      await fetchList();
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "No se pudo eliminar");
    }
  };


  const canSave = useMemo(() => {
    if (!editing) return false;
    const nameOk = String(editing.product_name).trim().length >= 2;
    const priceOk = editing.price !== "" && !Number.isNaN(Number(editing.price));
    return nameOk && priceOk;
  }, [editing]);

  // ------- ComboBox de categorías -------
  // Fuente remota para el ComboBox de categorías
  const fetchCats = useCallback(async (term, signal) => {
    try {
      const url = term ? `/api/categories?search=${encodeURIComponent(term)}` : `/api/categories`;
      const { data } = await api.get(url, { signal });
      const arr = Array.isArray(data) ? data : (data.items || []);
      return arr.map(c => ({ _id: c._id, name: c.name, slug: c.slug }));
    } catch {
      return [];
    }
  }, []);

  const createCat = useCallback(async (term) => {
    const name = term.trim();
    if (!name) return null;
    const slug = slugify(name);
    const { data: cat } = await api.post(`/api/categories`, { name, slug });
    return cat; // {_id,name,slug}
  }, []);


  return (
    <div className="editor-wrap">
      <div className="editor-panel">
        <div className="editor-head">
          <h3 style={{ margin: 0 }}>Modo editor</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" onClick={startNew}>+ Nuevo</button>
            <button className="btn" onClick={() => setCatManagerOpen(true)}>Administrar categorías</button>
            <button className="btn" onClick={onClose}>Cerrar</button>
          </div>
        </div>

        {/* Buscador y estado */}
        <div className="editor-toolbar">
          <input
            className="inp"
            placeholder="Buscar por nombre o descripción…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {loading && <span className="muted">Cargando…</span>}
          {err && <span className="err">{err}</span>}
        </div>

        {/* Lista */}
        <div className="editor-list">
          {items.map((it) => (
            <div key={it._id} className="row">
              <div className="col-main">
                <div className="title">{safeName(it.product_name)}</div>
                <div className="desc muted">{it.description}</div>
                <div className="muted" style={{ marginTop: 4 }}>
                  {renderCategory(it)}
                </div>
              </div>
              <div className="col-side">
                {typeof it.price === "number" && <div className="price">${it.price.toFixed(2)}</div>}
                <div className="actions">
                  <button className="btn sm" onClick={() => startEdit(it)}>Editar</button>
                  <button className="btn sm danger" onClick={() => setConfirmDel(it)}>Eliminar</button>
                </div>
              </div>
            </div>
          ))}
          {!items.length && !loading && <div className="muted">Sin resultados</div>}
        </div>

        {/* Paginación */}
        {meta.pages > 1 && (
          <div className="editor-pager">
            <button className="btn sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Anterior</button>
            <span className="muted">Página {page} de {meta.pages}</span>
            <button className="btn sm" disabled={page >= meta.pages} onClick={() => setPage(p => p + 1)}>Siguiente</button>
          </div>
        )}

        {/* Formulario */}
        {editing && (
          <div className="editor-form">
            <h4 style={{ marginTop: 0 }}>{editing._id ? "Editar platillo" : "Nuevo platillo"}</h4>

            <div className="grid-2">
              <label className="field">
                <span>Nombre</span>
                <input
                  className="inp"
                  value={editing.product_name}
                  onChange={(e) => setEditing(s => ({ ...s, product_name: e.target.value }))}
                  required
                />
              </label>
              <label className="field">
                <span>Precio</span>
                <input
                  className="inp"
                  type="number" step="0.01" inputMode="decimal"
                  value={editing.price}
                  onChange={(e) => setEditing(s => ({ ...s, price: e.target.value }))}
                  required
                />
              </label>
            </div>

            <label className="field">
              <span>Categoría</span>
              <ComboBox
                value={editing.category}
                onChange={(cat) => setEditing(s => ({ ...s, category: cat }))}
                fetcher={fetchCats}
                placeholder="Selecciona o crea una categoría…"
                allowCreate={true}
                onCreate={async (term) => {
                  const cat = await createCat(term);
                  return cat; // {_id,name,slug}
                }}
                display={(it) => `${it.name}${it.slug ? ` · ${it.slug}` : ""}`}
              />
            </label>

            <label className="field">
              <span>Descripción</span>
              <textarea
                className="inp" rows={3}
                value={editing.description}
                onChange={(e) => setEditing(s => ({ ...s, description: e.target.value }))}
              />
            </label>

            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn primary" disabled={!canSave} onClick={save}>
                {editing._id ? "Guardar cambios" : "Crear platillo"}
              </button>
              <button className="btn" onClick={resetForm}>Cancelar</button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmación de borrado */}
      {confirmDel && (
        <div className="editor-confirm" onClick={() => setConfirmDel(null)}>
          <div className="editor-confirm-panel" onClick={(e) => e.stopPropagation()}>
            <h4 style={{ marginTop: 0 }}>Eliminar platillo</h4>
            <p>¿Seguro que quieres eliminar <b>{safeName(confirmDel.product_name)}</b>?</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn danger" onClick={() => del(confirmDel._id)}>Eliminar</button>
              <button className="btn" onClick={() => setConfirmDel(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Admin de categorías */}
      <CategoryManager open={catManagerOpen} onClose={() => setCatManagerOpen(false)} />
    </div>
  );
}

function safeName(n) {
  const t = String(n || "").trim();
  return t && !/^[a-f0-9]{24}$/i.test(t) ? t : "Platillo";
}
function slugify(s) {
  return String(s || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
function renderCategory(it) {
  if (!it?.categoryId) return "Sin categoría";
  if (typeof it.categoryId === "object") {
    const name = it.categoryId.name || "Categoría";
    const slug = it.categoryId.slug || "";
    return `Categoría: ${name}${slug ? " · " + slug : ""}`;
  }
  return `Categoría: ${it.categoryId}`;
}
