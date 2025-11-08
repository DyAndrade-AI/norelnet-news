import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // 👈 importa tus estilos globales
import { EditorProvider } from './context/EditorContext.jsx'

// EditorProvider expone auth + helpers a toda la app

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <EditorProvider>
      <App />
    </EditorProvider>
  </React.StrictMode>,
)
