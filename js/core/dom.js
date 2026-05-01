export const $ = (selector, scope = document) => scope.querySelector(selector);
export const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

export const elements = {
  queryInput: $('#query'),
  musicList: $('#lista'),
  emptyState: $('#emptyState'),
  toastWrap: $('#toastWrap'),
  resultsFeedback: $('#resultsFeedback'),
  feedbackTitle: $('#feedbackTitle'),
  feedbackText: $('#feedbackText'),
  maisOuvidasHead: $('#maisOuvidasHead'),
  sectionTitle: $('#sectionTitle'),
  sectionSubtitle: $('#sectionSubtitle')
};
