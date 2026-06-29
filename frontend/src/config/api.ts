/**
 * Global API configuration for SpeakFlow AI.
 * This is the ONLY place where the backend URL is defined.
 * All stores and components must import from this file.
 *
 * - Production : reads VITE_API_URL from Vercel Environment Variables
 * - Development: reads VITE_API_URL from .env.local (defaults to localhost)
 */

let API_BASE_URL = '';

if (import.meta.env.PROD) {
  if (!import.meta.env.VITE_API_URL) {
    throw new Error(
      '[SpeakFlow] VITE_API_URL is not set. ' +
      'Add it in Vercel → Settings → Environment Variables: ' +
      'VITE_API_URL = https://speakflow-api-dtdn.onrender.com/api'
    );
  }
  let url = import.meta.env.VITE_API_URL.trim();
  // Strip trailing slash if present
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  // Append /api suffix if not already present
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  API_BASE_URL = url;
} else {
  // In development, fall back to localhost if not specified in .env.local
  let url = import.meta.env.VITE_API_URL?.trim() || 'http://localhost:5000/api';
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  API_BASE_URL = url;
}

export default API_BASE_URL;
