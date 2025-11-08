// src/App.jsx
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Reservations from "./pages/Reservations";
import Navbar from "./components/Navbar";
import "./index.css";
import EditorFab from "./components/EditorFab";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/reservations" element={<Reservations />} />
          {/* más rutas aquí */}
        </Routes>
      </div>
      {/* Controles de colaboración para el staff */}
      <EditorFab />
    </BrowserRouter>
  );
}
