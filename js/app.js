(function () {
  'use strict';

  const API = {
    searchUrl: 'https://apimusic.thryl.com.br/search',
    localPlayPath: '/api/play'
  };

  const PIX_CONFIG = {
    enabled: true,
    key: 'semchavepixcadastrada@gmail.com',
    owner: 'Subzero Music',
    description: 'Apoie a plataforma e ajude o projeto a continuar online.'
  };

  const featuredSongs = [
    { title: 'SEQUÊNCIA FEITICEIRA', artist: 'Pedro Sampaio, MC GW, MC Rodrigo do CN, MC Jhey, MC Nito', id: '_zKnEm9xPWw' },
    { title: 'JETSKI', artist: 'Pedro Sampaio, MC Meno K, Melody', id: '7CF5qbw8zec' },
    { title: 'RELÍQUIA DO 2T', artist: 'MC Tuto, MC Joãozinho VT, MC FR da Norte, MC Vine7, MC Dkziin, DJ Gu', id: 'J0HkF9E0KPA' },
    { title: 'P do Pecado', artist: 'Grupo Menos É Mais, Simone Mendes', id: 'Q2cD49TtjcA' },
    { title: 'Loira Gelada', artist: 'Luísa Sonza', id: 'gQihxm0-U64' },
    { title: 'Apaguei Pra Todos', artist: 'Ferrugem, Sorriso Maroto', id: 'o3dknP3jclw' },
    { title: 'Ama um Maloqueiro', artist: 'Rafa e Junior, Hugo e Guilherme, DJ Ari SL', id: 'nclqEBJIxWk' },
    { title: 'Lapada Dela', artist: 'Grupo Menos É Mais, Matheus Fernandes', id: 'fd3PJfv7SaY' }
  ];

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const elements = {
    queryInput: $('#query'),
    musicList: $('#lista'),
    emptyState: $('#emptyState'),
    toastWrap: $('#toastWrap'),
    resultsFeedback: $('#resultsFeedback'),
    feedbackTitle: $('#feedbackTitle'),
    feedbackText: $('#feedbackText'),
    maisOuvidasHead: $('#maisOuvidasHead'),
    sectionTitle: $('#sectionTitle'),
    sectionSubtitle: $('#sectionSubtitle'),
    pixKeyText: $('#pixKeyText'),
    pixOwnerText: $('#pixOwnerText'),
    audio: $('#siteAudio'),
    player: $('#musicPlayer'),
    playerCover: $('#playerCover'),
    playerTitle: $('#playerTitle'),
    playerArtist: $('#playerArtist'),
    playerProgress: $('#playerProgress'),
    playerCurrent: $('#playerCurrent'),
    playerDuration: $('#playerDuration'),
    playerPlayIcon: $('#playerPlayIcon'),
    playerMainIcon: $('#playerMainIcon'),
    playerVolume: $('#playerVolume'),
    themeToggleIcon: $('#themeToggleIcon')
  };

  const icons = {
    external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    bass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h4v14H7z"/><path d="M13 5h4v14h-4z"/></svg>'
  };

  const state = { results: [], loadingFeatured: false, searchMode: false, currentMusic: null, isPlaying: false, isSeeking: false, theme: localStorage.getItem('subzero-theme') || 'dark' };
  const fallbackCover = 'https://via.placeholder.com/72x72/14100d/ff8a1f?text=%E2%99%AA';

  function escapeHtml(value = '') {
    return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  }

  function normalizeList(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.musics)) return data.musics;
    if (Array.isArray(data?.videos)) return data.videos;
    return [];
  }

  function getTitle(music) {
    return music?.title || music?.name || music?.nome || music?.titulo || music?.videoTitle || 'Música sem título';
  }

  function getArtist(music) {
    return music?.artist || music?.author || music?.channel || music?.canal || music?.uploader || 'Artista desconhecido';
  }

  function getYoutubeId(music) {
    const direct = music?.id || music?.videoId || music?.youtubeId || music?.ytid;
    if (direct) return String(direct);

    const url = music?.url || music?.link || music?.youtube || music?.webpage_url;
    if (!url) return '';

    const patterns = [
      /youtu\.be\/([\w-]{6,})/i,
      /youtube\.com\/watch\?v=([\w-]{6,})/i,
      /youtube\.com\/embed\/([\w-]{6,})/i,
      /youtube\.com\/shorts\/([\w-]{6,})/i,
      /[?&]v=([\w-]{6,})/i
    ];

    for (const pattern of patterns) {
      const match = String(url).match(pattern);
      if (match?.[1]) return match[1];
    }

    return '';
  }

  function getYoutubeUrl(music) {
    const id = getYoutubeId(music);
    return id ? `https://www.youtube.com/watch?v=${id}` : (music?.url || music?.link || '#');
  }



  function getPlayUrl(music) {
    const youtubeId = getYoutubeId(music);
    if (!youtubeId) return '';
    return `${API.localPlayPath}?q=${encodeURIComponent(youtubeId)}`;
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  }

  function setPlayerPlaying(playing) {
    state.isPlaying = playing;
    if (elements.playerPlayIcon) elements.playerPlayIcon.textContent = playing ? '⏸' : '▶';
    if (elements.playerMainIcon) elements.playerMainIcon.textContent = playing ? '⏸' : '▶';
    elements.player?.classList.toggle('is-playing', playing);
    updateCoverPlayIcons();
  }

  function updateCoverPlayIcons() {
    const currentIndex = state.currentMusic ? state.results.indexOf(state.currentMusic) : -1;
    $$(".music-cover-btn").forEach((button) => {
      const buttonIndex = Number(button.dataset.index);
      const active = buttonIndex === currentIndex && state.isPlaying;
      button.classList.toggle("is-current-playing", active);
      const icon = $(".youtube-play", button);
      if (icon) icon.innerHTML = active ? icons.pause : icons.play;
      button.setAttribute("aria-label", active ? "Pausar música no site" : "Tocar música no site");
      button.title = active ? "Pausar no site" : "Tocar no site";
    });
  }

  function resetPlayerProgress() {
    if (elements.playerProgress) elements.playerProgress.value = 0;
    if (elements.playerCurrent) elements.playerCurrent.textContent = '0:00';
    if (elements.playerDuration) elements.playerDuration.textContent = '0:00';
  }

  function applyTheme(theme) {
    const selectedTheme = theme === 'light' ? 'light' : 'dark';
    state.theme = selectedTheme;
    document.documentElement.dataset.theme = selectedTheme;
    localStorage.setItem('subzero-theme', selectedTheme);
    if (elements.themeToggleIcon) elements.themeToggleIcon.textContent = selectedTheme === 'light' ? '☀' : '☾';
  }

  function toggleTheme() {
    applyTheme(state.theme === 'light' ? 'dark' : 'light');
  }

  async function playInSite(index) {
    const music = state.results[index];
    if (!music || !elements.audio) return;

    const playUrl = getPlayUrl(music);
    if (!playUrl) return showToast('Essa música não carregou com ID válido.', 'warning');

    state.currentMusic = music;
    if (elements.playerCover) elements.playerCover.src = getCover(music);
    if (elements.playerTitle) elements.playerTitle.textContent = getTitle(music);
    if (elements.playerArtist) elements.playerArtist.textContent = getArtist(music);
    elements.player?.classList.add('player-visible');
    resetPlayerProgress();

    elements.audio.src = playUrl;
    elements.audio.volume = Number(elements.playerVolume?.value ?? 0.75);

    try {
      await elements.audio.play();
      setPlayerPlaying(true);
      showToast('Tocando no site.');
    } catch (error) {
      console.error('[Subzero Music] Erro ao tocar:', error);
      setPlayerPlaying(false);
      showToast('Não consegui tocar essa música agora.', 'error');
    }
  }

  async function togglePlayer() {
    if (!elements.audio) return;
    if (!elements.audio.src) return showToast('Clique na capa de uma música primeiro.', 'warning');

    if (elements.audio.paused) {
      try {
        await elements.audio.play();
        setPlayerPlaying(true);
      } catch {
        showToast('Não consegui continuar a música.', 'error');
      }
    } else {
      elements.audio.pause();
      setPlayerPlaying(false);
    }
  }

  function stopPlayer() {
    if (!elements.audio) return;
    elements.audio.pause();
    elements.audio.currentTime = 0;
    setPlayerPlaying(false);
    resetPlayerProgress();
  }

  function updatePlayerProgress() {
    if (!elements.audio || state.isSeeking) return;
    const duration = elements.audio.duration || 0;
    const current = elements.audio.currentTime || 0;
    if (elements.playerCurrent) elements.playerCurrent.textContent = formatTime(current);
    if (elements.playerDuration) elements.playerDuration.textContent = formatTime(duration);
    if (elements.playerProgress) elements.playerProgress.value = duration ? (current / duration) * 100 : 0;
  }

  function getCover(music) {
    const id = getYoutubeId(music);
    return music?.thumbnail || music?.image || music?.cover || music?.thumb || (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : fallbackCover);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand('copy');
      textarea.remove();
      return ok;
    }
  }

  function showToast(message, type = 'success') {
    if (!elements.toastWrap) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    elements.toastWrap.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 250);
    }, 2600);
  }

  function updateMusicHeader() {
    if (!elements.sectionTitle || !elements.sectionSubtitle) return;
    if (state.searchMode) {
      elements.sectionTitle.textContent = 'Resultado da Busca';
      elements.sectionSubtitle.textContent = `${state.results.length} ${state.results.length === 1 ? 'música encontrada' : 'músicas encontradas'}`;
    } else {
      elements.sectionTitle.textContent = 'Mais Ouvidas';
      elements.sectionSubtitle.textContent = 'As músicas mais populares da comunidade';
    }
  }

  function updateFeaturedVisibility() {
    elements.maisOuvidasHead?.classList.toggle('hidden', state.loadingFeatured);
    updateMusicHeader();
  }

  function showLoading(text = 'Buscando músicas...') {
    if (elements.feedbackTitle) elements.feedbackTitle.innerHTML = 'Buscando<span>...</span>';
    if (elements.feedbackText) elements.feedbackText.textContent = text;
    elements.resultsFeedback?.classList.add('show');
    if (elements.musicList) elements.musicList.innerHTML = '';
    elements.emptyState?.classList.add('hidden');
    updateFeaturedVisibility();
  }

  function hideLoading() {
    elements.resultsFeedback?.classList.remove('show');
    updateFeaturedVisibility();
  }

  function createMusicCard(music, index) {
    const title = getTitle(music);
    const artist = getArtist(music);
    const cover = getCover(music);
    return `
      <article class="music-card">
        <div class="music-rank">#${index + 1}</div>
        <button class="music-cover-btn" data-action="play-site" data-index="${index}" title="Tocar no site" aria-label="Tocar ${escapeHtml(title)} no site">
          <img class="music-cover" src="${escapeHtml(cover)}" alt="Capa" loading="lazy" decoding="async" onerror="this.src='${fallbackCover}'">
          <span class="music-cover-play"><span class="youtube-play">${icons.play}</span></span>
        </button>
        <div class="music-content">
          <div class="music-meta">
            ${state.searchMode ? '' : '<span class="music-badge">Top</span>'}
            <h3 class="music-title">${escapeHtml(title)}</h3>
          </div>
          <div class="music-artist">${escapeHtml(artist)}</div>
        </div>
        <div class="music-actions">
          <button class="icon-btn" data-action="youtube" data-index="${index}" title="Abrir no YouTube">${icons.external}</button>
          <button class="icon-btn" data-action="copy" data-index="${index}" title="Copiar normal">${icons.copy}</button>
          <button class="icon-btn" data-action="copy-bass" data-index="${index}" title="Copiar com grave">${icons.bass}</button>
        </div>
      </article>`;
  }

  function animateCards() {
    $$('.music-card', elements.musicList || document).forEach((card, index) => {
      card.style.opacity = '0';
      card.style.animation = 'cardIn .22s ease-out forwards';
      card.style.animationDelay = `${Math.min(index, 6) * 28}ms`;
    });
  }

  function renderMusicList() {
    hideLoading();
    updateFeaturedVisibility();
    if (!elements.musicList) return;

    if (!state.results.length) {
      elements.musicList.innerHTML = '';
      elements.emptyState?.classList.remove('hidden');
      return;
    }

    elements.emptyState?.classList.add('hidden');
    elements.musicList.innerHTML = state.results.map(createMusicCard).join('');
    updateCoverPlayIcons();
    animateCards();
  }

  async function searchMusic(query) {
    const response = await fetch(`${API.searchUrl}?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return normalizeList(await response.json());
  }

  function loadFeaturedSongs() {
    state.loadingFeatured = false;
    state.searchMode = false;
    state.results = featuredSongs.slice();
    renderMusicList();
  }

  async function handleSearch() {
    const query = elements.queryInput?.value.trim() || '';
    if (!query) {
      loadFeaturedSongs();
      return;
    }

    state.searchMode = true;
    state.results = [];
    showLoading(`Procurando por "${query}"...`);
    $('#musicas')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    try {
      state.results = await searchMusic(query);
      renderMusicList();
    } catch (error) {
      console.error('[Subzero Music] Erro na busca:', error);
      state.results = [];
      renderMusicList();
      showToast('Erro ao buscar músicas. Confira a API ou a internet.', 'error');
    }
  }

  function openYoutube(index) {
    const music = state.results[index];
    if (!music) return;
    window.open(getYoutubeUrl(music), '_blank');
  }

  async function copySong(index, bass = false) {
    const music = state.results[index];
    if (!music) return showToast('Música não encontrada.', 'warning');

    const youtubeId = getYoutubeId(music);
    if (!youtubeId) return showToast('Essa música não carregou com ID válido.', 'warning');

    const command = `setradio ${window.location.origin}${API.localPlayPath}?q=${encodeURIComponent(youtubeId)}${bass ? '&bass=true' : ''}`;
    const copied = await copyText(command);
    showToast(copied ? 'Link copiado.' : 'Falha ao copiar link.', copied ? 'success' : 'error');
  }

  function showPage(page) {
    const targetPage = page === 'contacts' ? 'contacts' : 'home';

    $('#homePage')?.classList.toggle('page-active', targetPage === 'home');
    $('#contactPage')?.classList.toggle('page-active', targetPage === 'contacts');

    $$('.nav-link').forEach((link) => {
      const isActive = link.dataset.page === targetPage;
      link.classList.toggle('active', isActive);
      link.setAttribute('aria-current', isActive ? 'page' : 'false');
    });

    if (targetPage === 'home') window.scrollTo({ top: 0, behavior: 'smooth' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function getPageFromHash() {
    if (window.location.hash === '#contatos') return 'contacts';
    return 'home';
  }

  function handleInitialPage() {
    const initialPage = getPageFromHash();
    showPage(initialPage);
    if (initialPage === 'home') setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }), 0);
  }

  function setupPix() {
    const pixBlock = $('.contacts-pix-block');
    if (!PIX_CONFIG.enabled) {
      pixBlock?.classList.add('hidden');
      return;
    }
    if (elements.pixKeyText) elements.pixKeyText.textContent = PIX_CONFIG.key;
    if (elements.pixOwnerText) elements.pixOwnerText.textContent = PIX_CONFIG.owner;
  }

  function bindEvents() {
    elements.audio?.addEventListener('timeupdate', updatePlayerProgress);
    elements.audio?.addEventListener('loadedmetadata', updatePlayerProgress);
    elements.audio?.addEventListener('ended', () => setPlayerPlaying(false));

    elements.playerVolume?.addEventListener('input', () => {
      if (elements.audio) elements.audio.volume = Number(elements.playerVolume.value || 0.75);
    });

    elements.playerProgress?.addEventListener('input', () => {
      state.isSeeking = true;
      const duration = elements.audio?.duration || 0;
      const value = Number(elements.playerProgress.value || 0);
      if (elements.playerCurrent) elements.playerCurrent.textContent = formatTime((value / 100) * duration);
    });

    elements.playerProgress?.addEventListener('change', () => {
      const duration = elements.audio?.duration || 0;
      if (elements.audio && duration) elements.audio.currentTime = (Number(elements.playerProgress.value || 0) / 100) * duration;
      state.isSeeking = false;
    });

    elements.queryInput?.addEventListener('input', () => {
      if (!elements.queryInput.value.trim() && state.searchMode) loadFeaturedSongs();
    });

    elements.queryInput?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') handleSearch();
    });

    document.addEventListener('click', (event) => {
      const navLink = event.target.closest('[data-page]');
      if (navLink) {
        event.preventDefault();
        const page = navLink.dataset.page || 'home';
        const nextHash = page === 'contacts' ? '#contatos' : '#inicio';
        history.pushState(null, '', nextHash);
        showPage(page);
        return;
      }

      const button = event.target.closest('[data-action]');
      if (!button) return;
      const action = button.dataset.action;
      const index = Number(button.dataset.index);
      if (action === 'search') handleSearch();
      if (action === 'play-site') playInSite(index);
      if (action === 'youtube') openYoutube(index);
      if (action === 'copy') copySong(index, false);
      if (action === 'copy-bass') copySong(index, true);
      if (action === 'toggle-player') togglePlayer();
      if (action === 'stop-player') stopPlayer();
      if (action === 'toggle-theme') toggleTheme();
      if (action === 'copy-pix') {
        copyText(PIX_CONFIG.key).then((copied) => showToast(copied ? 'Chave Pix copiada.' : 'Falha ao copiar Pix.', copied ? 'success' : 'error'));
      }
    });
  }

  function startRevealAnimations() {
    const items = $$('.reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach((item) => observer.observe(item));
  }

  window.addEventListener('popstate', handleInitialPage);

  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(state.theme);
    setupPix();
    bindEvents();
    startRevealAnimations();
    loadFeaturedSongs();
    handleInitialPage();
  });
})();
