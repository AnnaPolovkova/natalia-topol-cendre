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

  function bookingMessage() {
    var key = 'booking.msg.' + (bookingSource || 'meeting');
    return window.i18n ? window.i18n.t(key) : '';
  }

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
      var encodedMessage = encodeURIComponent(bookingMessage());
      window.open('https://t.me/natalia_talk?text=' + encodedMessage, '_blank', 'noopener');
      closeModal();
    });
  }

  if (waBtn) {
    waBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var encodedMessage = encodeURIComponent(bookingMessage());
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
// СЛАЙДЕР СЕРТИФИКАТОВ — фиксированные пропорции, без цикла
// -------------------------------------------------------
(function () {
  'use strict';

  var slider  = document.getElementById('cert-slider');
  var stage   = document.getElementById('cert-track');
  var dotsBox = document.getElementById('cert-dots');
  var counter = document.getElementById('cert-counter');
  var btnPrev = document.getElementById('cert-prev');
  var btnNext = document.getElementById('cert-next');

  if (!slider || !stage) return;

  var slides = Array.prototype.slice.call(stage.querySelectorAll('.cert-slide'));
  var total  = slides.length;
  if (!total) return;

  // Пропорции файлов известны заранее — раскладка не зависит от загрузки картинок.
  var RATIOS = [3300 / 2550, 1206 / 837, 1414 / 2000];

  var GAP_DESKTOP  = 28;
  var GAP_MOBILE   = 14;
  var PEEK_DESKTOP = 0.64; // масштаб бокового слайда
  var PEEK_MOBILE  = 0.52;
  var ACTIVE_SCALE = 1.2; // главный диплом крупнее базового бокса

  var current = 0;
  var geo = null;

  function measure() {
    var stageW = slider.offsetWidth;
    var mobile = window.innerWidth < 768; // как в @media (max-width: 768px)
    var gap    = mobile ? GAP_MOBILE : GAP_DESKTOP;
    var peek   = mobile ? PEEK_MOBILE : PEEK_DESKTOP;

    var boxH = mobile
      ? Math.round(Math.min(300, stageW * 0.9))
      : Math.round(Math.min(440, stageW * 0.46));

    // Десктоп: соседи влезают целиком. Мобила: соседи подрезаны узкой полоской.
    var boxW = mobile
      ? Math.round(stageW * 0.72)
      : Math.floor((stageW - 2 * gap) / (1 + 2 * peek));

    // Базовый размер — только для боковых слайдов (см. sizeOf).
    var sizes = slides.map(function (_, i) {
      var ratio = RATIOS[i] || 1;
      var w = Math.min(boxW, boxH * ratio);
      return { w: Math.round(w), h: Math.round(w / ratio) };
    });

    // Высота главного диплома всегда одна и та же, не зависит от пропорций
    // конкретного документа — иначе при переходе от альбомного к портретному
    // высота сцены гуляла бы и стрелки прыгали вверх-вниз вместе с ней.
    var activeH = Math.round(boxH * ACTIVE_SCALE);

    // Предохранитель для широких альбомных документов на узких экранах:
    // высота остаётся постоянной, только если при ней ширина ещё влезает
    // в сцену; иначе (редкий случай) ширину ограничиваем, а высоту уже
    // подгоняем под неё — лучше чуть ниже, чем обрезано по бокам.
    var activeMaxW = Math.round(stageW * (mobile ? 0.92 : 0.72));

    geo = { gap: gap, peek: peek, boxH: boxH, activeH: activeH, activeMaxW: activeMaxW, sizes: sizes };
    stage.style.height = activeH + 'px';
  }

  // Круговая дистанция от слайда i до активного: значение в диапазоне
  // (-total/2, total/2], т.е. всегда кратчайший путь по кругу. При total=3
  // это -1/0/1 — сосед никогда не бывает дальше одного шага. Параметр cur
  // позволяет посчитать дистанцию для другого "активного" (нужно, чтобы
  // сравнить положение слайда до и после перехода — см. goTo).
  function ringDelta(i, cur) {
    if (cur === undefined) cur = current;
    var raw = ((i - cur) % total + total) % total;
    if (raw > total / 2) raw -= total;
    return raw;
  }

  // Соседи — базовый (боковой) размер как есть. Активный слайд всегда имеет
  // одну и ту же высоту geo.activeH — ширина под неё подстраивается по
  // пропорциям конкретного документа (см. activeMaxW про исключение).
  function sizeOf(i) {
    if (i !== current) return geo.sizes[i];
    var ratio = RATIOS[i] || 1;
    var h = geo.activeH;
    var w = h * ratio;
    if (w > geo.activeMaxW) {
      w = geo.activeMaxW;
      h = w / ratio;
    }
    return { w: Math.round(w), h: Math.round(h) };
  }

  // Смещение слайда i от центра сцены = сумма ВИЗУАЛЬНЫХ ширин соседей
  // (уже умноженных на peek) по кратчайшему пути вокруг кольца.
  function offsetOf(i) {
    var delta = ringDelta(i);
    if (delta === 0) return 0;
    var dir   = delta > 0 ? 1 : -1;
    var steps = Math.abs(delta);
    var off   = sizeOf(current).w / 2;
    var idx   = current;
    for (var s = 1; s < steps; s++) {
      idx = ((idx + dir) % total + total) % total;
      off += geo.gap + geo.sizes[idx].w * geo.peek;
    }
    return dir * (off + geo.gap + (geo.sizes[i].w * geo.peek) / 2);
  }

  function applyGeometry(slide, i) {
    var scale = i === current ? 1 : geo.peek;
    var sz = sizeOf(i);
    slide.style.width  = sz.w + 'px';
    slide.style.height = sz.h + 'px';
    slide.style.transform =
      'translate(calc(-50% + ' + Math.round(offsetOf(i)) + 'px), -50%) scale(' + scale + ')';
  }

  function targetOpacity(d) {
    return d === 0 ? 1 : d === 1 ? 0.45 : 0;
  }

  var WRAP_FADE_MS = 160;

  // Слайд, который при переходе меняет сторону (был слева — стал справа,
  // или наоборот), гасим, телепортируем на новое место без анимации transform,
  // а потом проявляем — вместо того чтобы дать ему визуально проехать через
  // сцену позади активного диплома, отсюда и было ощущение "перепрыгивания".
  function teleport(slide, i) {
    if (slide._wrapTimer) clearTimeout(slide._wrapTimer);

    slide.style.transition = 'opacity ' + WRAP_FADE_MS + 'ms ease';
    slide.style.opacity = '0';

    slide._wrapTimer = setTimeout(function () {
      slide._wrapTimer = null;
      slide.style.transition = 'none';
      applyGeometry(slide, i);
      void slide.offsetWidth; // reflow, чтобы "none" точно применился до следующего шага
      slide.style.transition = '';
      requestAnimationFrame(function () {
        slide.style.opacity = targetOpacity(Math.abs(ringDelta(i)));
      });
    }, WRAP_FADE_MS);
  }

  function render(wrapped) {
    wrapped = wrapped || [];

    slides.forEach(function (slide, i) {
      var d = Math.abs(ringDelta(i));

      slide.style.zIndex = total - d;
      slide.style.pointerEvents = d <= 1 ? 'auto' : 'none';
      slide.classList.toggle('is-active', i === current);

      if (wrapped.indexOf(i) !== -1) {
        teleport(slide, i);
      } else {
        applyGeometry(slide, i);
        slide.style.opacity = targetOpacity(d);
      }
    });

    if (dotsBox) {
      dotsBox.querySelectorAll('.cert-dot').forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }
    if (counter) counter.textContent = (current + 1) + ' / ' + total;
  }

  // Листание бесконечное: индекс всегда оборачивается по кругу, стрелки
  // никогда не блокируются.
  function goTo(i) {
    var n = ((i % total) + total) % total;
    if (n === current) return;

    var prevCurrent = current;
    current = n;

    // Слайды, которые из-за кругового перехода поменяли сторону (были
    // слева от активного — стали справа, или наоборот), а не просто
    // сдвинулись к центру/от центра.
    var wrapped = [];
    for (var idx = 0; idx < total; idx++) {
      var before = ringDelta(idx, prevCurrent);
      var after  = ringDelta(idx, current);
      if (before !== 0 && after !== 0 && (before > 0) !== (after > 0)) {
        wrapped.push(idx);
      }
    }

    render(wrapped);
  }

  if (btnPrev) btnPrev.addEventListener('click', function () { goTo(current - 1); });
  if (btnNext) btnNext.addEventListener('click', function () { goTo(current + 1); });

  slides.forEach(function (slide, i) {
    slide.addEventListener('click', function () { goTo(i); });
  });

  if (dotsBox) {
    dotsBox.querySelectorAll('.cert-dot').forEach(function (dot, i) {
      dot.addEventListener('click', function () { goTo(i); });
    });
  }

  // Свайп и драг: один порог для мыши и тача
  var startX = null;
  stage.addEventListener('pointerdown', function (e) { startX = e.clientX; });
  window.addEventListener('pointerup', function (e) {
    if (startX === null) return;
    var diff = startX - e.clientX;
    startX = null;
    if (Math.abs(diff) > 40) goTo(current + (diff > 0 ? 1 : -1));
  });
  stage.querySelectorAll('img').forEach(function (img) { img.draggable = false; });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  measure();
  render();

  var t;
  window.addEventListener('resize', function () {
    clearTimeout(t);
    t = setTimeout(function () { measure(); render(); }, 150);
  });
})();
