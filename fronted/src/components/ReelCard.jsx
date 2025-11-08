/*
  Tarjeta simple de 9:16. Se diseñó para contener un <video className="reel-media" />
*/
export default function ReelCard({ title, children }) {
  return (
    <div className="reel-card">
      <div className="reel-box">
        {children}
        <div className="reel-overlay">
          {title ? <div className="reel-title">{title}</div> : null}
        </div>
      </div>
    </div>
  );
}
