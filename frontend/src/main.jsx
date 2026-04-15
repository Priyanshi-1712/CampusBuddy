import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';

// 1. Get the 'root' div from your index.html
const container = document.getElementById('root');

// 2. Create the root ONLY ONCE to prevent the "container already passed" error
const root = ReactDOM.createRoot(container);

// 3. Render the app with all necessary Providers
// We wrap the App in BrowserRouter and ThemeProvider so 
// navigation and themes work in every single component.
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);