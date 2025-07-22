
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// We want to register the service worker after the page has fully loaded
// to avoid impacting initial page load performance and prevent registration errors.
window.addEventListener('load', () => {
  // Skip Service Worker registration in StackBlitz environment
  if (window.location.hostname.includes('stackblitz') || window.location.hostname.includes('webcontainer')) {
    console.log('Service Workers are not supported in this environment (StackBlitz/WebContainer)');
    return;
  }

  if ('serviceWorker' in navigator) {
    // In some sandboxed environments, `window.location.href` can be an invalid base for
    // the `URL` constructor, causing registration to fail. A more reliable method is
    // to find the main application script tag. The browser will have resolved its `src`
    // attribute to a full, valid URL, which we can use as a stable base.
    const mainScript = document.querySelector('script[type="module"][src*="index.tsx"]');
    
    if (!mainScript) {
      console.error("Could not find main script tag to register service worker.");
      // As a last resort, try a relative path.
      navigator.serviceWorker.register('sw.js').catch(err => console.error('SW registration failed:', err));
      return;
    }
    
    try {
      const scriptSrc = (mainScript as HTMLScriptElement).src;
      const swUrl = new URL('sw.js', scriptSrc);

      navigator.serviceWorker.register(swUrl)
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    } catch (error) {
      // This catch block will handle the 'Failed to construct URL' error if scriptSrc is also invalid.
      console.error("Failed to construct Service Worker URL from script tag. Registration aborted.", error);
    }
  }
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);