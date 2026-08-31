// frontend/src/api.js
// Centralized API client.
//
// Local dev / single-port deploy (proxy.js): baseURL stays '' so requests
// hit the same origin (/api, /uploads proxied to the backend).
// Static hosting (GitHub Pages): set VITE_API_URL (and optionally
// VITE_UPLOADS_URL) at build time to point at the hosted backend.

import axios from 'axios';

const API_ORIGIN = import.meta.env.VITE_API_URL || '';

export const api = axios.create({ baseURL: API_ORIGIN });

export const UPLOADS_BASE =
  import.meta.env.VITE_UPLOADS_URL || `${API_ORIGIN}/uploads`;

export function uploadUrl(imageUrl) {
  if (!imageUrl) return null;
  const filename = String(imageUrl).split('/').pop();
  return `${UPLOADS_BASE}/${filename}`;
}
