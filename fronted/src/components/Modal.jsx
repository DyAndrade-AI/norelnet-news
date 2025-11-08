import { useEffect } from "react";

/* Modal simple; cierra con fondo o Escape */
export default function Modal({ open, onClose, children, ariaLabel = "Detalle" }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-label={ariaLabel}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" aria-label="Cerrar" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
}
