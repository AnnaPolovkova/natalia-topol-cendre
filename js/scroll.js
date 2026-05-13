/**
 * scroll.js — Scroll Reveal
 * Когда элемент с классом .reveal попадает во вьюпорт —
 * добавляем ему .visible, и CSS-переход его показывает.
 */

(function () {
  'use strict';

  // Настройки
  var THRESHOLD  = 0.12;   // сколько % элемента должно быть видно
  var ROOT_MARGIN = '0px 0px -40px 0px'; // немного раньше нижней границы

  // Создаём наблюдатель
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Перестаём наблюдать — анимация один раз
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold:  THRESHOLD,
    rootMargin: ROOT_MARGIN
  });

  // Наблюдаем за всеми .reveal
  function init() {
    var elements = document.querySelectorAll('.reveal');
    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  // Запускаем после загрузки DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
