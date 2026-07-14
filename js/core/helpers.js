export function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function normalizeList(data) {
  const candidates = [data, data?.results, data?.result, data?.data, data?.data?.results, data?.data?.items, data?.items, data?.musics, data?.songs, data?.videos];
  return (candidates.find(Array.isArray) || []).map(normalizeMusic).filter(Boolean);
}

function normalizeMusic(item) {
  if (!item || typeof item !== 'object') return null;
  const source = item.video || item.music || item.song || item.track || item.data || item;
  const thumbnails = source.thumbnails || item.thumbnails;
  const candidate = Array.isArray(thumbnails) ? [...thumbnails].reverse().find((entry) => typeof entry === 'string' || entry?.url) : null;
  return {
    ...item,
    ...source,
    id: source.id || source.videoId || source.video_id || source.youtubeId || source.youtube_id || source.ytid || source.identifier || item.id,
    title: source.title || source.name || source.nome || source.titulo || source.videoTitle || item.title,
    artist: source.artist || source.author || source.channel || source.channelTitle || source.uploader || source.artista || item.artist,
    thumbnail: source.thumbnail?.url || source.thumbnail || source.thumb || source.image?.url || source.image || source.cover?.url || source.cover || source.capa || (typeof candidate === 'string' ? candidate : candidate?.url),
    url: source.url || source.webpage_url || source.youtubeUrl || source.youtube_url || source.link || item.url
  };
}
