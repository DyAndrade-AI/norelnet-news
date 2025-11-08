// src/pages/Reservations.jsx
export default function Reservations() {
  // Opcional: conecta luego con tu endpoint /api/reservations
  const wa = "https://wa.me/5215555555555?text=Hola%20quiero%20reservar%20para%20hoy";
  return (
    <div className="page">
      <h1>Reservaciones</h1>
      <p>Escríbenos por WhatsApp para confirmar disponibilidad.</p>
      <a className="btn primary" href={wa} target="_blank" rel="noreferrer">Abrir WhatsApp</a>
    </div>
  );
}
