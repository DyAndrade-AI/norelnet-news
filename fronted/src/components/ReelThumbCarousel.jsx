import { useMemo } from "react";

/*
  Carrusel de thumbnails opcional. No controla reproducción.
  Úsalo si quieres miniaturas clicables debajo del Reel principal.
*/
export default function ReelThumbCarousel({ items = [], current = 0, onPick }) {
  const list = useMemo(() => items.slice(0, 12), [items]);

  return (
    <div className="grid" style={{ gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
      {list.map((r, i) => (
        <button
          key={r.id ?? i}
          onClick={() => onPick?.(i)}
          style={{
            aspectRatio: "9 / 16",
            borderRadius: 10,
            border: i === current ? "2px solid #fff" : "1px solid #1f1f1f",
            overflow: "hidden",
            background: "#0a0a0a",
            cursor: "pointer"
          }}
          aria-label={`Reel ${i + 1}`}
          title={r.title ?? `Reel ${i + 1}`}
        >
          {/* En producción podrías usar poster/imágenes; para mp4 el poster vendría del servidor */}
          <video src={r.src} muted playsInline preload="metadata" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </button>
      ))}
    </div>
  );
}
