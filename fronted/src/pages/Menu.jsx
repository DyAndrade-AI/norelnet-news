import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Menu() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    // Cargamos el menú una sola vez al montar la página
    (async () => {
      try {
        const { data } = await api.get("/api/menu");
        setMenu(data);
      } catch (e) {
        setErr(e?.response?.data?.error || e.message || "Error cargando menú");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="page" style={{ padding: 16 }}>Cargando…</div>;
  if (err) return <div className="page" style={{ padding: 16, color: "crimson" }}>{err}</div>;

  return (
    <main className="menu-page">
      {/* Hero de menú */}
      <section className="menu-hero">
        <div className="menu-hero-inner">
          <h1>Menú</h1>
          <p>Hamburguesas, grill y coctelería de autor.</p>
        </div>
      </section>

      {/* Contenido del menú */}
      <section className="menu-body">
        {(!menu || !menu.length) && (
          <div className="menu-empty">Sin categorías aún.</div>
        )}

        {menu.map(({ category, items }) => (
          <section key={category.slug} className="menu-section" id={category.slug}>
            <div className="menu-section-head">
              <h2>{category.name}</h2>
            </div>

            {items?.length ? (
              <ul className="menu-list">
                {items.map(it => (
                  <li key={it.id} className="menu-item">
                    <div className="mi-row">
                      <div className="mi-name">{it.product_name}</div>
                      <div className="mi-price">${it.price}</div>
                    </div>
                    {it.description && (
                      <div className="mi-desc">{it.description}</div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="menu-empty small">Sin platillos en esta categoría.</div>
            )}
          </section>
        ))}
      </section>
    </main>
  );
}
