/*
  Reproductor de reels con autoplay silencioso y botón mute/unmute.
  - Un click/tap activa el audio (requisito de los navegadores).
  - Solo un reel suena a la vez.
*/
import { useEffect, useRef, useState } from "react";

export default function ReelPlayer({ src, autoPlay = true }) {
  const ref = useRef(null);
  const [muted, setMuted] = useState(true);

  // Al desmutear uno, mutea los demás
  useEffect(() => {
    const onSomeoneUnmuted = (e) => {
      if (ref.current && e.detail?.el !== ref.current) {
        ref.current.muted = true;
        setMuted(true);
      }
    };
    document.addEventListener("reel:unmuted", onSomeoneUnmuted);
    return () => document.removeEventListener("reel:unmuted", onSomeoneUnmuted);
  }, []);

  // Autoplay silencioso
  useEffect(() => {
    if (!ref.current) return;
    if (autoPlay) {
      // intentamos reproducir; si el navegador bloquea, no pasa nada
      ref.current.play().catch(() => {});
    }
  }, [autoPlay]);

  const toggleMute = async () => {
    if (!ref.current) return;
    // gesto del usuario: activar audio y reproducir
    if (ref.current.muted) {
      ref.current.muted = false;
      ref.current.volume = 1;
      setMuted(false);
      try { await ref.current.play(); } catch {}
      // Avisar a otros players para que se muteen
      document.dispatchEvent(new CustomEvent("reel:unmuted", { detail: { el: ref.current } }));
    } else {
      ref.current.muted = true;
      setMuted(true);
    }
  };

  return (
    <div className="reel-wrap" style={{ position: "relative" }}>
      <video
        ref={ref}
        className="reel-media"
        src={src}
        playsInline
        muted={muted}
        preload="metadata"
        autoPlay={autoPlay}
        controls={false}
      />
      {/* Botón overlay para activar/desactivar audio */}
      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? "Activar sonido" : "Silenciar"}
        title={muted ? "Activar sonido" : "Silenciar"}
        style={{
          position: "absolute", right: 12, bottom: 12, zIndex: 2,
          border: "1px solid var(--border)", borderRadius: 10,
          background: "rgba(0,0,0,.5)", color: "var(--text)", padding: "6px 10px"
        }}
      >
        {muted ? "🔇" : "🔊"}
      </button>
    </div>
  );
}
