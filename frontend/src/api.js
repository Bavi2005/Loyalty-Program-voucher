// Centralized API client. The base URL stays empty for the single-port deploy
// (proxy.js serves the SPA and proxies /api and /uploads to the backend),
// and can be overridden at build time via VITE_API_URL / VITE_UPLOADS_URL.

import axios from 'axios';

const API_ORIGIN = import.meta.env.VITE_API_URL || '';

export const api = axios.create({ baseURL: API_ORIGIN });

// Attach the matching JWT on every request so authorization survives a
// browser refresh (where a fresh axios instance has no in-memory header yet).
api.interceptors.request.use((config) => {
  const url = config.url || '';
  const isAdminPath = url.startsWith('/api/admin');
  const token = localStorage.getItem(isAdminPath ? 'adminToken' : 'token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const UPLOADS_BASE =
  import.meta.env.VITE_UPLOADS_URL || `${API_ORIGIN}/uploads`;

export function uploadUrl(imageUrl) {
  if (!imageUrl) return null;
  const filename = String(imageUrl).split('/').pop();
  return `${UPLOADS_BASE}/${filename}`;
}
