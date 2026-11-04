import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './styles/new-post.css';
import './styles/pricing.css';
import './styles/responsive.css';
import './styles/nav.css';
import './styles/browse-posts.css';
import './styles/banner-original.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
