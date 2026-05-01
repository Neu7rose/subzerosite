import { API } from '../config/api.js';
import { getYoutubeId } from '../core/youtube.js';

export function createRadioCommand(music, bass = false) {
  const youtubeId = getYoutubeId(music);
  if (!youtubeId) return '';

  const baseUrl = window.location.origin;
  const url = `${baseUrl}${API.localPlayPath}?q=${encodeURIComponent(youtubeId)}${bass ? '&bass=true' : ''}`;

  return `setradio ${url}`;
}
