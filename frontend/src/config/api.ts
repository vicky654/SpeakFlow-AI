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
  API_BASE_URL = import.meta.env.VITE_API_URL.trim();
} else {
  // In development, fall back to localhost if not specified in .env.local
  API_BASE_URL = import.meta.env.VITE_API_URL?.trim() || 'http://localhost:5000/api';
}

export default API_BASE_URL;
