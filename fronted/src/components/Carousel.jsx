import { useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback } from "react";

// Carrusel infinito con soporte para autoplay de videos y autoajuste de ancho.

export default function Carousel({
  children,
  startIndex = 0,
  neighbors = 1,
  gap = 16,
  peek = 0,
  minSlidePx = 480,
  maxSlidePx = 820,
  scaleInactive = 0.94,
  intervalMs = 6000,
}) {
  const base = useMemo(
    () => (Array.isArray(children) ? children : [children]).filter(Boolean),
    [children]
  );
  const N = Math.max(1, neighbors);

  // Duplicación para loop visual
  const slides = useMemo(() => {
    if (base.length <= 1) return base;
    const head = base.slice(-N);
    const tail = base.slice(0, N);
    return [...head, ...base, ...tail];
  }, [base, N]);

  const [index, setIndex] = useState(
    Math.min(Math.max(0, startIndex), Math.max(0, base.length - 1)) + N
  );

  const wrapRef = useRef(null);
  const trackRef = useRef(null);
  const autoAdvanceTimerRef = useRef(null);
  const playAttemptsRef = useRef(null);
  const currentVideoRef = useRef(null);
  const isTransitioningRef = useRef(false);
  const justJumpedRef = useRef(false);
  
  const [wrapW, setWrapW] = useState(0);
  const [slideW, setSlideW] = useState(minSlidePx);

  // Medición contenedor + ancho de slide
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      setWrapW(w);
      const visible = 1 + 2 * N;
      const usable = Math.max(0, w - 2 * peek);
      const totalGaps = gap * (visible - 1);
      const raw = (usable - totalGaps) / visible;
      const clamped = Math.max(minSlidePx, Math.min(raw, maxSlidePx));
      setSlideW(clamped);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [N, gap, peek, minSlidePx, maxSlidePx]);

  // Limpieza centralizada de timers y listeners
  const clearAllTimers = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    if (playAttemptsRef.current) {
      playAttemptsRef.current.forEach(clearTimeout);
      playAttemptsRef.current = null;
    }
  }, []);

  // Navegación
  const go = useCallback((i) => {
    if (isTransitioningRef.current || slides.length === 0) return;
    isTransitioningRef.current = true;
    justJumpedRef.current = false;
    clearAllTimers();
    setIndex(i);
  }, [slides.length, clearAllTimers]);

  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  // Pausar todos los videos excepto el activo
  const pauseAllVideos = useCallback((exceptVideo = null) => {
    const track = trackRef.current;
    if (!track) return;
    
    Array.from(track.children).forEach(slide => {
      const video = slide.querySelector("video");
      if (video && video !== exceptVideo) {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, []);

  // Reproducir video con estrategia optimizada
  const playVideo = useCallback((video) => {
    if (!video) return;
    
    video.muted = true;
    video.playsInline = true;
    
    const attempts = [];
    const tryPlay = (delay = 0) => {
      const timer = setTimeout(() => {
        if (currentVideoRef.current !== video) return;
        
        if (video.readyState < 2) {
          video.load();
        }
        video.play().catch(() => {});
      }, delay);
      attempts.push(timer);
    };

    tryPlay(0);
    tryPlay(100);
    tryPlay(300);
    
    playAttemptsRef.current = attempts;
  }, []);

  // Manejar el slide actual
  const handleCurrentSlide = useCallback(() => {
    const track = trackRef.current;
    if (!track || !track.children[index]) return;

    clearAllTimers();
    
    const currentSlide = track.children[index];
    const video = currentSlide.querySelector("video");
    
    currentVideoRef.current = video;

    if (!video) {
      autoAdvanceTimerRef.current = setTimeout(next, intervalMs);
      return;
    }

    pauseAllVideos(video);

    const onEnded = () => {
      if (currentVideoRef.current === video) {
        next();
      }
    };

    const onCanPlay = () => {
      if (currentVideoRef.current === video) {
        playVideo(video);
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && currentVideoRef.current === video) {
        playVideo(video);
      }
    };

    video.addEventListener("ended", onEnded, { once: true });
    video.addEventListener("canplay", onCanPlay);
    document.addEventListener("visibilitychange", onVisibilityChange);

    const cleanup = () => {
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("canplay", onCanPlay);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };

    playVideo(video);

    return cleanup;
  }, [index, next, intervalMs, clearAllTimers, pauseAllVideos, playVideo]);

  // Efecto separado: hacer el salto invisible inmediatamente cuando llegamos a un clon
  useEffect(() => {
    if (base.length <= 1) return;
    
    const track = trackRef.current;
    if (!track) return;

    // Detectar si estamos en un clon
    const needsJumpForward = index >= base.length + N;
    const needsJumpBackward = index < N;

    if (needsJumpForward || needsJumpBackward) {
      // Hacer el salto INMEDIATAMENTE sin transición
      track.style.transition = "none";
      const newIndex = needsJumpForward ? index - base.length : index + base.length;
      justJumpedRef.current = true;
      
      // Forzar el cambio de posición sin animación
      setIndex(newIndex);
      
      // Restaurar transiciones en el siguiente frame
      requestAnimationFrame(() => {
        if (track) {
          track.style.transition = "transform 400ms ease";
        }
      });
    }
  }, [index, base.length, N]);

  // Cuando cambia el índice, manejar el slide y marcar transición completa
  useEffect(() => {
    const track = trackRef.current;
    if (!track || base.length <= 1) {
      isTransitioningRef.current = false;
      const cleanup = handleCurrentSlide();
      return cleanup;
    }

    const onTransitionEnd = (e) => {
      if (e.target !== track || e.propertyName !== "transform") return;
      
      // Marcar que ya no estamos en transición
      isTransitioningRef.current = false;
      
      // Si estamos en un clon, NO manejar el slide aquí
      // El otro effect se encargará del salto y luego manejará el slide
      const isOnClone = index < N || index >= base.length + N;
      if (isOnClone) {
        return;
      }
      
      // Estamos en un slide normal, manejar normalmente
      handleCurrentSlide();
    };

    track.addEventListener("transitionend", onTransitionEnd);
    
    return () => {
      track.removeEventListener("transitionend", onTransitionEnd);
    };
  }, [index, base.length, N, handleCurrentSlide]);

  // Manejar slide cuando NO hay transición (montaje inicial o después de salto)
  useEffect(() => {
    if (!isTransitioningRef.current && !justJumpedRef.current) {
      const cleanup = handleCurrentSlide();
      return cleanup;
    }
  }, [index, handleCurrentSlide]);

  // Cleanup global
  useEffect(() => {
    return () => {
      clearAllTimers();
      pauseAllVideos();
    };
  }, [clearAllTimers, pauseAllVideos]);

  // Cálculo correcto del offset
  const step = slideW + gap;
  const centerOffset = (wrapW - slideW) / 2;
  const offsetX = index * step - centerOffset + peek;

  return (
    <div
      ref={wrapRef}
      className="carousel"
      style={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        borderRadius: 16,
        border: "1px solid #1f1f1f",
        background: "#000",
        paddingLeft: peek,
        paddingRight: peek,
      }}
    >
      <div
        ref={trackRef}
        className="carousel-track"
        style={{
          display: "flex",
          gap,
          transition: "transform 400ms ease",
          transform: `translateX(-${offsetX}px)`,
          willChange: "transform",
        }}
      >
        {slides.map((child, i) => {
          const active = i === index;
          return (
            <div
              key={i}
              className="carousel-slide"
              style={{
                flex: `0 0 ${slideW}px`,
                maxWidth: `${slideW}px`,
                transform: active ? "scale(1)" : `scale(${scaleInactive})`,
                opacity: active ? 1 : 0.85,
                transition: "transform 300ms ease, opacity 300ms ease",
                willChange: "transform, opacity",
                borderRadius: 16,
                overflow: "hidden",
              }}
            >
              {child}
            </div>
          );
        })}
      </div>

      {base.length > 1 && (
        <>
          <div
            className="carousel-nav"
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              pointerEvents: "none",
            }}
          >
            <button aria-label="Anterior" onClick={prev} style={navBtnStyle}>
              ‹
            </button>
            <button aria-label="Siguiente" onClick={next} style={navBtnStyle}>
              ›
            </button>
          </div>

          <div
            className="carousel-dots"
            style={{
              position: "absolute",
              bottom: 8,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              gap: 8,
              pointerEvents: "none",
            }}
          >
            {base.map((_, i) => {
              const real = i + N;
              const active = index === real;
              return (
                <button
                  key={i}
                  aria-label={`Ir al slide ${i + 1}`}
                  onClick={() => go(real)}
                  style={{
                    pointerEvents: "all",
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    border: 0,
                    background: active ? "#fafafa" : "#3f3f46",
                    cursor: "pointer",
                    transition: "background 200ms ease",
                  }}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

const navBtnStyle = {
  pointerEvents: "all",
  width: 40,
  height: 40,
  borderRadius: 999,
  border: "1px solid #2a2a2a",
  background: "rgba(0,0,0,0.65)",
  color: "#fff",
  cursor: "pointer",
  display: "grid",
  placeItems: "center",
  margin: 12,
  fontSize: 24,
  transition: "background 200ms ease",
};
