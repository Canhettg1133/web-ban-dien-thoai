import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import "./styles/global.css";
import "./styles/header.css";
import "./styles/nav.css";
import "./styles/home.css";
import "./styles/product.css";
import "./styles/cart.css";
import "./styles/footer.css";


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
