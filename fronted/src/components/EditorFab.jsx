import { useEffect, useState } from "react";
import { useEditor } from "../context/EditorContext";
import ProductEditor from "./ProductEditor";

// Botón flotante visible solo para editores/admins que abre el panel lateral.
export default function EditorFab() {
  const { isEditor } = useEditor();
  const [open, setOpen] = useState(false);

  // Escucha el evento del Navbar "open-editor-panel"
  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onClose = () => setOpen(false);
    document.addEventListener("open-editor-panel", onOpen);
    document.addEventListener("close-editor-panel", onClose);
    return () => {
      document.removeEventListener("open-editor-panel", onOpen);
      document.removeEventListener("close-editor-panel", onClose);
    };
  }, []);

  // Si no es editor/admin, no mostramos nada
  if (!isEditor) return null;

  return (
    <>
      {/* Botón flotante para abrir/cerrar manualmente */}
      <button
        className={`fab ${open ? "fab-on" : ""}`}
        aria-label={open ? "Cerrar editor" : "Abrir editor"}
        title={open ? "Cerrar editor" : "Abrir editor"}
        onClick={() => setOpen(v => !v)}
      >
        {open ? "✕" : "✎"}
      </button>

      {/* Panel solo cuando open === true */}
      {open && <ProductEditor onClose={() => setOpen(false)} />}
    </>
  );
}
