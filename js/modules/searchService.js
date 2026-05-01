import { API } from '../config/api.js';
import { normalizeList } from '../core/helpers.js';

export async function searchMusic(query) {
  const response = await fetch(`${API.searchUrl}?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const data = await response.json();
  return normalizeList(data);
}
