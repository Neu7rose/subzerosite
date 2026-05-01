import { elements } from '../core/dom.js';
import { escapeHtml } from '../core/helpers.js';
import { icons } from './icons.js';

const subtexts = {
  success: 'Ação concluída com sucesso',
  error: 'Ocorreu um problema',
  warning: 'Verifique essa ação',
  info: 'Informação do sistema'
};

export function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.info}</div>
    <div class="toast-content">
      <div class="toast-message">${escapeHtml(message)}</div>
      <div class="toast-subtext">${subtexts[type] || subtexts.info}</div>
    </div>
  `;

  elements.toastWrap.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}
