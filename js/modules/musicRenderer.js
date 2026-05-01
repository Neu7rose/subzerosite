import { elements } from '../core/dom.js';
import { escapeHtml } from '../core/helpers.js';
import { getArtist, getCover, getTitle } from '../core/youtube.js';
import { icons } from '../ui/icons.js';

const fallbackCover = 'https://via.placeholder.com/72x72/14100d/ff8a1f?text=%E2%99%AA';

export function updateMusicHeader({ searchMode, resultsLength }) {
  if (!elements.sectionTitle || !elements.sectionSubtitle) return;

  if (searchMode) {
    elements.sectionTitle.textContent = 'Resultado da Busca';
    elements.sectionSubtitle.textContent = `${resultsLength} ${resultsLength === 1 ? 'música encontrada' : 'músicas encontradas'}`;
    return;
  }

  elements.sectionTitle.textContent = 'Mais Ouvidas';
  elements.sectionSubtitle.textContent = 'As músicas mais populares da comunidade';
}

export function updateFeaturedVisibility(state) {
  elements.maisOuvidasHead?.classList.toggle('hidden', state.loadingFeatured);
  updateMusicHeader({ searchMode: state.searchMode, resultsLength: state.results.length });
}

export function showLoading(text = 'Buscando músicas...', state) {
  elements.feedbackTitle.innerHTML = 'Buscando<span>...</span>';
  elements.feedbackText.textContent = text;
  elements.resultsFeedback.classList.add('show');
  elements.musicList.innerHTML = '';
  elements.emptyState.classList.add('hidden');
  updateFeaturedVisibility(state);
}

export function hideLoading(state) {
  elements.resultsFeedback.classList.remove('show');
  updateFeaturedVisibility(state);
}

export function animateCards() {
  elements.musicList.querySelectorAll('.music-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.animation = 'cardIn .42s cubic-bezier(.2,.8,.2,1) forwards';
    card.style.animationDelay = `${index * 70}ms`;
  });
}

function createMusicCard(music, index, searchMode) {
  const title = getTitle(music);
  const artist = getArtist(music);
  const cover = getCover(music);

  return `
    <article class="music-card">
      <div class="music-rank">#${index + 1}</div>
      <img class="music-cover" src="${escapeHtml(cover)}" alt="Capa" onerror="this.src='${fallbackCover}'">
      <div class="music-content">
        <div class="music-meta">
          ${searchMode ? '' : '<span class="music-badge">Top</span>'}
          <h3 class="music-title">${escapeHtml(title)}</h3>
        </div>
        <div class="music-artist">${escapeHtml(artist)}</div>
      </div>
      <div class="music-actions">
        <button class="icon-btn" data-action="youtube" data-index="${index}" title="Abrir no YouTube">${icons.external}</button>
        <button class="icon-btn" data-action="copy" data-index="${index}" title="Copiar normal">${icons.copy}</button>
        <button class="icon-btn" data-action="copy-bass" data-index="${index}" title="Copiar com grave">${icons.bass}</button>
      </div>
    </article>
  `;
}

export function renderMusicList(state) {
  hideLoading(state);
  updateFeaturedVisibility(state);

  if (!state.results.length) {
    elements.musicList.innerHTML = '';
    elements.emptyState.classList.remove('hidden');
    return;
  }

  elements.emptyState.classList.add('hidden');
  elements.musicList.innerHTML = state.results.map((music, index) => createMusicCard(music, index, state.searchMode)).join('');
  animateCards();
}
