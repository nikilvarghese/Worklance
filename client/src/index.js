import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';   // <-- corrected path
import App from './App';
import reportWebVitals from './reportWebVitals';

// Reject emojis globally from all inputs and textareas in the project
document.addEventListener("input", (e) => {
  if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) {
    const originalValue = e.target.value || "";
    // Strip emojis using unicode property escape matching extended pictographics
    const cleanedValue = originalValue.replace(/\p{Extended_Pictographic}/gu, "");
    if (originalValue !== cleanedValue) {
      e.target.value = cleanedValue;
      // Dispatch a synthetic input event so React state registers the change
      const inputEvent = new Event("input", { bubbles: true });
      e.target.dispatchEvent(inputEvent);
    }
  }
}, true);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();

