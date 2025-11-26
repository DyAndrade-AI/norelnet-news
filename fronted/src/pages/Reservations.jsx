export default function Reservations() {
  return (
    <main className="page news-page" style={{ padding: "24px 16px" }}>
      <section className="container" style={{ display: "grid", gap: 20 }}>
        <div className="card" style={{ background: "#0f1622", borderColor: "#1c2532" }}>
          <p className="eyebrow">Sobre NorelNet News</p>
          <h1 style={{ marginTop: 4 }}>Equipo y contacto</h1>
          <p className="subtle" style={{ marginTop: 6 }}>
            Periodismo de datos, verificación y explicadores visuales. Si tienes una pista,
            quieres colaborar o necesitas datos, escríbenos.
          </p>
        </div>

        <div className="grid grid-2">
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Colabora</h3>
            <p className="subtle">Envíanos historias, filtraciones verificables o datasets que debamos revisar.</p>
            <a className="btn primary" href="mailto:investigacion@norelnet.news">investigacion@norelnet.news</a>
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>Prensa y agenda</h3>
            <p className="subtle">Solicita entrevistas, apariciones o permisos de republicación.</p>
            <a className="btn" href="mailto:prensa@norelnet.news">prensa@norelnet.news</a>
          </div>
        </div>

        <div className="card" id="boletin">
          <p className="eyebrow">Newsletter</p>
          <h3 style={{ marginTop: 4 }}>Suscríbete al resumen diario</h3>
          <p className="subtle">Lo más relevante en tu correo, con enlaces a las bases de datos y visualizaciones.</p>
          <button className="btn primary" style={{ width: "100%", marginTop: 10 }}>Suscribirme</button>
        </div>
      </section>
    </main>
  );
}
