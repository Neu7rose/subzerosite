export function getTitle(music) {
  return music.title || music.name || music.music || music.nome || 'Sem nome';
}

export function getArtist(music) {
  return music.artist || music.author || music.channel || music.artista || 'Desconhecido';
}

export function extractYoutubeIdFromUrl(url) {
  if (!url) return '';

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname.includes('youtube.com')) return parsedUrl.searchParams.get('v') || '';
    if (parsedUrl.hostname.includes('youtu.be')) return parsedUrl.pathname.replace('/', '').trim();
    return '';
  } catch {
    return '';
  }
}

export function getYoutubeId(music) {
  return (
    music.id ||
    music.videoId ||
    music.video_id ||
    music.youtubeId ||
    music.youtube_id ||
    music.ytid ||
    music.identifier ||
    extractYoutubeIdFromUrl(music.url) ||
    extractYoutubeIdFromUrl(music.link) ||
    ''
  );
}

export function getCover(music) {
  const apiCover = music.thumb || music.thumbnail || music.image || music.cover || music.capa || '';
  if (apiCover) return apiCover;

  const youtubeId = getYoutubeId(music);
  if (youtubeId) return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;

  return 'https://via.placeholder.com/72x72/14100d/ff8a1f?text=%E2%99%AA';
}

export function getYoutubeUrl(music) {
  const youtubeId = getYoutubeId(music);
  if (youtubeId) return `https://www.youtube.com/watch?v=${encodeURIComponent(youtubeId)}`;

  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${getTitle(music)} ${getArtist(music)}`)}`;
}
