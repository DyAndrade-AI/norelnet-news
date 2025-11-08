import { useEffect, useMemo, useRef, useState } from "react";

/**
 * ComboBox (typeahead) genérico.
 *
 * Props:
 *  - value: objeto seleccionado { _id, name, slug } | null
 *  - onChange: (item|null) => void
 *  - fetcher: (term: string, signal: AbortSignal) => Promise<Array<{_id,name,slug}>>
 *  - placeholder: string
 *  - allowCreate: boolean (si true, muestra "Crear 'term'…")
 *  - onCreate: (term: string) => Promise<{_id,name,slug}>   // si se elige crear
 *  - display: (item) => string  // cómo mostrar cada item (default: "name · slug")
 */
export default function ComboBox({
  value,
  onChange,
  fetcher,
  placeholder = "Buscar…",
  allowCreate = true,
  onCreate,
  display,
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [hl, setHl] = useState(0);
  const rootRef = useRef(null);
  const listRef = useRef(null);

  const toLabel = display || ((it) => `${it.name}${it.slug ? ` · ${it.slug}` : ""}`);

  // Buscar remoto con debounce
  useEffect(() => {
    const term = q.trim();
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const arr = await fetcher(term, ctrl.signal);
        setItems(Array.isArray(arr) ? arr : []);
        setHl(0);
      } catch {}
    }, 180);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q, fetcher]);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const onDoc = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Acciones
  const pick = (item) => {
    onChange?.(item);
    setOpen(false);
    setQ("");
  };

  const tryCreate = async () => {
    if (!allowCreate || !onCreate) return;
    const term = q.trim();
    if (!term) return;
    const created = await onCreate(term);
    if (created) {
      onChange?.(created);
      setQ("");
      setOpen(false);
    }
  };

  const onKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) { setOpen(true); return; }
    if (!items.length && !(allowCreate && q.trim())) return;

    if (e.key === "ArrowDown") { e.preventDefault(); setHl(h => Math.min(h + 1, items.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHl(h => Math.max(h - 1, 0)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (items.length) pick(items[hl] || items[0]);
      else if (allowCreate && q.trim()) tryCreate();
    } else if (e.key === "Escape") setOpen(false);
  };

  // Texto visible en input si hay selección y no se está escribiendo
  const selectedLabel = value ? toLabel(value) : "";

  // Mostrar la fila de "Crear…" si no hay coincidencias
  const showCreateRow = allowCreate && q.trim() && !items.some(it => toLabel(it).toLowerCase() === q.trim().toLowerCase());

  return (
    <div className="combobox" ref={rootRef}>
      <div className="combobox-inputwrap" onClick={() => setOpen(true)}>
        <input
          className="inp"
          placeholder={value ? selectedLabel : placeholder}
          value={q}
          onChange={e => { setQ(e.target.value); setOpen(true); }}
          onKeyDown={onKeyDown}
          onFocus={() => setOpen(true)}
        />
        {value ? (
          <button className="cbx-clear" onClick={(e) => { e.stopPropagation(); onChange?.(null); }}>
            ×
          </button>
        ) : (
          <span className="cbx-icon">▾</span>
        )}
      </div>

      {open && (
        <div className="combobox-popover" ref={listRef}>
          {items.length > 0 ? (
            <ul className="combobox-list" role="listbox">
              {items.map((it, i) => (
                <li
                  key={it._id ?? i}
                  role="option"
                  aria-selected={i === hl}
                  className={`combobox-row ${i === hl ? "active" : ""}`}
                  onMouseEnter={() => setHl(i)}
                  onClick={() => pick(it)}
                >
                  {toLabel(it)}
                </li>
              ))}
            </ul>
          ) : (
            <div className="combobox-empty">Sin resultados</div>
          )}

          {showCreateRow && onCreate && (
            <button className="combobox-create" onClick={tryCreate}>
              Crear “{q.trim()}”
            </button>
          )}
        </div>
      )}
    </div>
  );
}
