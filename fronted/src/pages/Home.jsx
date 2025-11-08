import Carousel from "../components/Carousel";
import ReelCard from "../components/ReelCard";
import ReelPlayer from "../components/ReelPlayer";

export default function Home() {
  // Fuente mock; en producción podrías traer esto desde una API
  const reels = [
    { id: "r1", src: "/reels/lasanta.mp4", title: "La santa" },
    { id: "r2", src: "/reels/doggies.mp4", title: "Hot Doggies" },
    { id: "r3", src: "/reels/mxburguer.mp4", title: "MX Burguer" },
    { id: "r4", src: "/reels/sonaria.mp4", title: "Como sonaria el Terruno" },
  ];

  return (
    <main className="page">
         {/* Hero estático en lugar del título/subtítulo */}
      <div className="hero">
        <picture>
          <img
            src="/static/terruno.jpg"
            alt="Mi Terruño — parrilla y barra"
            loading="eager"
          />
        </picture>
      </div>

      {/* Reels a todo el ancho de la ventana */}
      <section className="section bleed">
        <div className="container-fluid" style={{ marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>Reels</h2>
        </div>


        <Carousel neighbors={2} gap={16} peek={40} minSlidePx={500} maxSlidePx={820} scaleInactive={0.94}>
          {reels.map((r) => (
            <ReelCard key={r.id} title={r.title}>
              <ReelPlayer src={r.src} autoPlay={true} />
            </ReelCard>
          ))}
        </Carousel>



      </section>

      {/* Contenido informativo a lo ancho de la ventana con padding lateral */}
      <section className="section container-fluid grid grid-2">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Novedades</h3>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Nuevo combo parrillero</li>
            <li>Música en vivo los viernes</li>
            <li>Descuento estudiantes 10%</li>
          </ul>
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Sobre nosotros</h3>
          <p style={{ margin: 0 }}>
            Somos un restaurante de barrio con enfoque en parrilla.
            Usamos ingredientes locales y técnicas sencillas para resaltar el sabor.
          </p>
        </div>
      </section>
    </main>
  );
}
