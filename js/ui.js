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
    },
    'languageLab': {
      tg: 'Здравствуйте, Наталья! Хотела бы оставить заявку на Language Lab. Спасибо.',
      wa: 'Здравствуйте, Наталья! Хотела бы оставить заявку на Language Lab. Спасибо.'
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
        } else if (card && card.classList.contains('service-card--lab')) {
          source = 'languageLab';
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

// -------------------------------------------------------
// СЛАЙДЕР СЕРТИФИКАТОВ — infinite loop, center active
// -------------------------------------------------------
(function () {
  'use strict';

  var slider   = document.getElementById('cert-slider');
  var track    = document.getElementById('cert-track');
  var dotsWrap = document.getElementById('cert-dots');
  var btnPrev  = document.getElementById('cert-prev');
  var btnNext  = document.getElementById('cert-next');

  if (!track) return;

  var ACTIVE_RATIO  = 0.52;
  var SIDE_RATIO    = 0.30;
  var GAP           = 20;
  var TRANSITION_MS = 500;

  var origSlides = Array.from(track.querySelectorAll('.cert-slide'));
  var total      = origSlides.length;
  var current    = 0;

  var cloneBefore = origSlides[total - 1].cloneNode(true);
  var cloneAfter  = origSlides[0].cloneNode(true);
  cloneBefore.setAttribute('aria-hidden', 'true');
  cloneAfter.setAttribute('aria-hidden', 'true');
  cloneBefore.classList.add('is-clone');
  cloneAfter.classList.add('is-clone');

  track.insertBefore(cloneBefore, origSlides[0]);
  track.appendChild(cloneAfter);

  function getAllSlides() {
    return Array.from(track.querySelectorAll('.cert-slide'));
  }

  var vpWidth       = 0;
  var activeW       = 0;
  var sideW         = 0;
  var isMobile      = false;

  function calcSizes() {
    vpWidth  = slider.offsetWidth;
    isMobile = vpWidth < 768;

    if (isMobile) {
      activeW = Math.round(vpWidth * 0.85);
      sideW   = Math.round(vpWidth * 0.60);
    } else {
      activeW = Math.round(vpWidth * ACTIVE_RATIO);
      sideW   = Math.round(vpWidth * SIDE_RATIO);
    }

    applySlideWidths();
    moveTo(current, false);
  }

  function applySlideWidths() {
    var all = getAllSlides();
    var activeReal = current + 1;

    all.forEach(function (slide, i) {
      var img = slide.querySelector('img');
      var isAct = (i === activeReal);

      if (isMobile) {
        slide.style.width  = (isAct ? activeW : sideW) + 'px';
        slide.style.height = 'auto';
        if (img) {
          img.style.width  = '100%';
          img.style.height = 'auto';
        }
      } else {
        var fixedH = Math.round(vpWidth * 0.40);
        slide.style.height = fixedH + 'px';
        slide.style.width  = 'auto';
        if (img) {
          img.style.height = '100%';
          img.style.width  = 'auto';
          img.style.maxWidth = 'none';
        }
      }

      slide.classList.toggle('is-active', isAct);
    });
  }

  function getSlideOffset(realIndex) {
    var all = getAllSlides();
    var offset = 0;
    for (var i = 0; i < realIndex; i++) {
      offset += all[i].offsetWidth + GAP;
    }
    var slideW = all[realIndex] ? all[realIndex].offsetWidth : activeW;
    offset -= (vpWidth - slideW) / 2;
    return -offset;
  }

  var isTransitioning = false;

  function moveTo(origIndex, animate) {
    if (animate === undefined) animate = true;
    var all      = getAllSlides();
    var realIndex = origIndex + 1;

    applySlideWidths();

    if (animate) {
      track.style.transition = 'transform ' + TRANSITION_MS + 'ms cubic-bezier(0.4,0,0.2,1)';
    } else {
      track.style.transition = 'none';
    }

    requestAnimationFrame(function () {
      track.style.transform = 'translateX(' + getSlideOffset(realIndex) + 'px)';
    });

    updateDots(origIndex);
  }

  function next() {
    if (isTransitioning) return;
    isTransitioning = true;
    current++;
    if (current > total - 1) current = total;

    moveTo(current < total ? current : total, true);

    setTimeout(function () {
      if (current >= total) {
        current = 0;
        moveTo(current, false);
      }
      isTransitioning = false;
    }, TRANSITION_MS + 20);
  }

  function prev() {
    if (isTransitioning) return;
    isTransitioning = true;
    current--;
    if (current < 0) current = -1;

    moveTo(current >= 0 ? current : -1, true);

    setTimeout(function () {
      if (current < 0) {
        current = total - 1;
        moveTo(current, false);
      }
      isTransitioning = false;
    }, TRANSITION_MS + 20);
  }

  var _origMoveTo = moveTo;
  moveTo = function (origIndex, animate) {
    if (origIndex === -1) {
      var all = getAllSlides();
      if (animate) {
        track.style.transition = 'transform ' + TRANSITION_MS + 'ms cubic-bezier(0.4,0,0.2,1)';
      } else {
        track.style.transition = 'none';
      }
      applySlideWidths();
      requestAnimationFrame(function () {
        track.style.transform = 'translateX(' + getSlideOffset(0) + 'px)';
      });
      updateDots(total - 1);
      return;
    }
    if (origIndex === total) {
      var all = getAllSlides();
      if (animate) {
        track.style.transition = 'transform ' + TRANSITION_MS + 'ms cubic-bezier(0.4,0,0.2,1)';
      } else {
        track.style.transition = 'none';
      }
      applySlideWidths();
      requestAnimationFrame(function () {
        track.style.transform = 'translateX(' + getSlideOffset(total + 1) + 'px)';
      });
      updateDots(0);
      return;
    }
    _origMoveTo(origIndex, animate);
  };

  function updateDots(origIndex) {
    var realIdx = ((origIndex % total) + total) % total;
    var dots = dotsWrap.querySelectorAll('.cert-dot');
    dots.forEach(function (d, i) {
      d.classList.toggle('is-active', i === realIdx);
    });
  }

  if (dotsWrap) {
    dotsWrap.querySelectorAll('.cert-dot').forEach(function (dot) {
      dot.addEventListener('click', function () {
        var idx = parseInt(dot.dataset.index, 10);
        current = idx;
        moveTo(current, true);
        isTransitioning = false;
      });
    });
  }

  if (btnPrev) btnPrev.addEventListener('click', prev);
  if (btnNext) btnNext.addEventListener('click', next);

  var touchStartX = 0;
  var touchEndX   = 0;

  track.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  track.addEventListener('touchend', function (e) {
    touchEndX = e.changedTouches[0].screenX;
    var diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) next(); else prev();
    }
  }, { passive: true });

  var dragStartX  = 0;
  var isDragging  = false;

  track.addEventListener('mousedown', function (e) {
    isDragging = true;
    dragStartX = e.pageX;
    track.style.cursor = 'grabbing';
  });

  document.addEventListener('mouseup', function (e) {
    if (!isDragging) return;
    isDragging = false;
    track.style.cursor = '';
    var diff = dragStartX - e.pageX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) next(); else prev();
    }
  });

  calcSizes();

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(calcSizes, 150);
  });

})();
