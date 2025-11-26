import { useEffect, useMemo, useRef, useState } from "react";
import Modal from "./Modal";

/* Busca noticias y muestra sugerencias + modal de vista rápida */
export default function MenuSearch({ placeholder = "Buscar noticias…" }) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [openList, setOpenList] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [selected, setSelected] = useState(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Llama al backend de artículos
  const fetchArticles = async (term, signal) => {
    const url = `/api/articles/search?q=${encodeURIComponent(term)}&page=1&limit=8`;
    const res = await fetch(url, { signal });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.items) ? data.items : [];
  };

  // Debounce de la búsqueda
  useEffect(() => {
    const ctrl = new AbortController();
    const term = q.trim();
    if (!term) { setItems([]); return; }

    const id = setTimeout(async () => {
      try {
        const arr = await fetchArticles(term, ctrl.signal);
        setItems(arr);
      } catch {
        /* ignora aborts/errores */
      }
    }, 180);

    return () => { clearTimeout(id); ctrl.abort(); };
  }, [q]);

  const results = useMemo(() => items.slice(0, 8), [items]);
  useEffect(() => { setHighlight(0); }, [q]);

  const pick = (item) => {
    setSelected(item);
    setOpenList(false);
  };

  const onKeyDown = (e) => {
    if (!openList && (e.key === "ArrowDown" || e.key === "Enter")) { setOpenList(true); return; }
    if (!results.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlight(h => Math.min(h + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlight(h => Math.max(h - 1, 0)); }
    else if (e.key === "Enter")  { e.preventDefault(); pick(results[highlight] || results[0]); }
    else if (e.key === "Escape") { setOpenList(false); }
  };

  // Cierra dropdown al hacer click fuera
  useEffect(() => {
    const onDocClick = (e) => {
      const inside = listRef.current?.contains(e.target) || inputRef.current?.contains(e.target);
      if (!inside) setOpenList(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const safeTitle = (s) => {
    const t = String(s || "").trim();
    return t || "Titular en preparación";
  };
  const snippet = (s, max = 160) => {
    const t = String(s || "").replace(/\s+/g, " ").trim();
    return t.length > max ? `${t.slice(0, max)}…` : t;
  };
  const formatDate = (iso) => {
    if (!iso) return "Actualizado";
    try {
      return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
    } catch {
      return "Actualizado";
    }
  };

  return (
    <>
      <div className="searchbar" ref={inputRef}>
        <input
          className="search-input"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpenList(true); }}
          onKeyDown={onKeyDown}
          onFocus={() => q && setOpenList(true)}
          placeholder={placeholder}
          aria-label="Buscar noticias"
        />
        <button className="search-btn" onClick={() => setOpenList(v => !!q && !v)}>🔎</button>

        {openList && q && results.length > 0 && (
          <ul className="search-results" role="listbox" ref={listRef}>
            {results.map((it, i) => (
              <li
                key={it._id ?? i}
                role="option"
                aria-selected={i === highlight}
                className={`result-row ${i === highlight ? "active" : ""}`}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => pick(it)}
                title={it.titulo}
              >
                <div className="result-col">
                  <div className="result-name">{safeTitle(it.titulo)}</div>
                  <div className="result-cat">
                    {it.categoria || "General"} · {formatDate(it.fecha_publicacion || it.createdAt)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {openList && q && results.length === 0 && (
          <div className="search-empty">Sin resultados</div>
        )}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} ariaLabel={selected?.titulo || "Detalle"}>
        {selected && (
          <div className="news-detail">
            <div className="news-detail-head">
              <p className="eyebrow">{selected.categoria || "NorelNet News"}</p>
              <h3 style={{ margin: "4px 0 6px" }}>{safeTitle(selected.titulo)}</h3>
              <p className="subtle">{formatDate(selected.fecha_publicacion || selected.createdAt)}</p>
            </div>
            {selected.contenido && (
              <p className="news-snippet">{snippet(selected.contenido, 420)}</p>
            )}
            {Array.isArray(selected.etiquetas) && selected.etiquetas.length > 0 && (
              <div className="tag-row">
                {selected.etiquetas.slice(0, 6).map((tag) => (
                  <span key={tag} className="chip">{tag}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
