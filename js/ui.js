(function () {
  'use strict';

  // -------------------------------------------------------
  // 1. ПЛАВНЫЙ СКРОЛЛ по якорям
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
  // 2. МОДАЛЬНОЕ ОКНО ЗАПИСИ
  // -------------------------------------------------------
  var modal = document.getElementById('booking-modal');
  var backdrop = document.getElementById('booking-modal-backdrop');
  var closeBtn = document.getElementById('booking-modal-close');
  var tgBtn = document.getElementById('booking-tg');
  var waBtn = document.getElementById('booking-wa');

  var bookingSource = ''; // Откуда была нажата кнопка записи

  var bookingMessages = {
    'meeting': {
      tg: 'Здравствуйте, Наталья! Хотела бы записаться на встречу-знакомство и обсудить возможное сотрудничество. Спасибо.',
      wa: 'Здравствуйте, Наталья! Хотела бы записаться на встречу-знакомство и обсудить возможное сотрудничество. Спасибо.'
    },
    'coaching': {
      tg: 'Здравствуйте, Наталья! Интересует индивидуальное коучинговое сопровождение. Буду рада обсудить формат работы.',
      wa: 'Здравствуйте, Наталья! Интересует индивидуальное коучинговое сопровождение. Буду рада обсудить формат работы.'
    },
    'supervision': {
      tg: 'Здравствуйте, Наталья! Интересует коучинговая супервизия. Хотелось бы обсудить детали и дальнейший формат.',
      wa: 'Здравствуйте, Наталья! Интересует коучинговая супервизия. Хотелось бы обсудить детали и дальнейший формат.'
    }
  };

  function openModal(source) {
    if (!modal) return;
    bookingSource = source || 'meeting';
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    bookingSource = '';
  }

  document.querySelectorAll('.booking-trigger').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      
      var source = 'meeting'; // по умолчанию
      var section = btn.closest('section');
      
      if (section && section.id === 'services') {
        // Определяем, какая услуга
        var card = btn.closest('.service-card');
        if (card && card.classList.contains('service-card--dark')) {
          source = 'supervision';
        } else {
          source = 'coaching';
        }
      }
      
      openModal(source);
    });
  });

  // Обработчики для Telegram и WhatsApp
  if (tgBtn) {
    tgBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var message = bookingMessages[bookingSource]?.tg || bookingMessages.meeting.tg;
      var encodedMessage = encodeURIComponent(message);
      window.open('https://t.me/natalia_talk?text=' + encodedMessage, '_blank', 'noopener');
      closeModal();
    });
  }

  if (waBtn) {
    waBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var message = bookingMessages[bookingSource]?.wa || bookingMessages.meeting.wa;
      var encodedMessage = encodeURIComponent(message);
      window.open('https://wa.me/+33664704944?text=' + encodedMessage, '_blank', 'noopener');
      closeModal();
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });
})();
