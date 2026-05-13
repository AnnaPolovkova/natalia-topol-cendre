/**
 * ui.js — Интерактивные элементы
 * 1. Плавный скролл для якорных ссылок
 * 2. Кнопка "Записаться" — здесь подключи свою ссылку
 */

(function () {
  'use strict';

  // -------------------------------------------------------
  // 1. ПЛАВНЫЙ СКРОЛЛ по якорям (href="#section-id")
  // -------------------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var targetId = link.getAttribute('href');
      if (targetId === '#') return;

      var target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // -------------------------------------------------------
  // 2. КНОПКА "ЗАПИСАТЬСЯ"
  // Замени URL ниже на свою ссылку Calendly, Zoom или форму
  // -------------------------------------------------------
  var BOOKING_URL = 'https://t.me/natalia_talk_nomad_notes'; // ← ЗАМЕНИТЬ

  var bookingBtn = document.getElementById('booking-btn');
  if (bookingBtn) {
    bookingBtn.addEventListener('click', function (e) {
      e.preventDefault();
      window.open(BOOKING_URL, '_blank', 'noopener,noreferrer');
    });
  }

})();
