// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NewsList from "./pages/NewsList";
import ArticleDetail from "./pages/ArticleDetail";
import Navbar from "./components/Navbar";
import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<NewsList />} />
          <Route path="/news" element={<NewsList />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
