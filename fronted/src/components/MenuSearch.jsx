import { useEffect, useMemo, useRef, useState } from "react";
import Modal from "./Modal";

/* Busca en /api/products?search=... y muestra sugerencias + modal */
export default function MenuSearch({ placeholder = "Buscar platillos…" }) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [openList, setOpenList] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [selected, setSelected] = useState(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Llama a tu backend. Soporta ?search= y, como fallback, ?q=
  const fetchProducts = async (term, signal) => {
    const tryUrls = [
      `/api/products?search=${encodeURIComponent(term)}&page=1`,
      `/api/products?q=${encodeURIComponent(term)}&page=1`,
    ];
    for (const url of tryUrls) {
      const res = await fetch(url, { signal });
      if (res.ok) {
        const data = await res.json();
        // Tu backend regresa { items: [...], total, page, pages }
        const arr = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : []);
        return arr;
      }
    }
    return [];
  };

  // Debounce de la búsqueda
  useEffect(() => {
    const ctrl = new AbortController();
    const term = q.trim();
    if (!term) { setItems([]); return; }

    const id = setTimeout(async () => {
      try {
        const arr = await fetchProducts(term, ctrl.signal);
        setItems(arr);
      } catch {
        /* ignora aborts/errores */
      }
    }, 180);

    return () => { clearTimeout(id); ctrl.abort(); };
  }, [q]);

  // Top 8 resultados
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

  // Helpers de UI
  const fmtPrice = (v) => (typeof v === "number" ? `$${v.toFixed(2)}` : "");
  const catName = (it) => (it?.categoryId && typeof it.categoryId === "object" ? it.categoryId.name : null);
  const safeName = (s) => {
    const t = String(s || "").trim();
    return t && !/^[a-f0-9]{24}$/i.test(t) ? t : "Platillo";
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
          aria-label="Buscar en menú"
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
                title={it.description || it.product_name}
              >
                <div className="result-col">
                  <div className="result-name">{safeName(it.product_name)}</div>
                  {catName(it) && <div className="result-cat">{catName(it)}</div>}
                </div>
                {it.price != null && <div className="result-price">{fmtPrice(it.price)}</div>}
              </li>
            ))}
          </ul>
        )}

        {openList && q && results.length === 0 && (
          <div className="search-empty">Sin resultados</div>
        )}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} ariaLabel={selected?.product_name || "Detalle"}>
        {selected && (
          <div className="dish-detail">
            <div className="dish-media">
              {/* Placeholder temporal porque no tienes imagen aún */}
              <div className="img-placeholder">
                <span>{getInitials(safeName(selected.product_name))}</span>
              </div>
            </div>
            <div className="dish-info">
              <h3 style={{ marginTop: 0 }}>
                {safeName(selected.product_name)}
                {catName(selected) && <small className="dish-cat"> · {catName(selected)}</small>}
              </h3>
              {selected.description && <p className="dish-desc">{selected.description}</p>}
              {selected.price != null && (
                <div className="dish-price">{fmtPrice(selected.price)}</div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

/* Iniciales simples para el placeholder */
function getInitials(s) {
  const t = String(s || "").trim().split(/\s+/).slice(0, 2);
  return t.map(x => x[0]?.toUpperCase() || "").join("");
}
