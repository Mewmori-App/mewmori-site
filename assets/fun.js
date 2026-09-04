// Кнопка-кот отвечает репликой. Ролик в герое крутится сам (muted autoplay+loop),
// а при reduced-motion замирает на постере с обычными controls.
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isEnglish = document.documentElement.lang === 'en';

  var lines = isEnglish ? [
    'Mrrp.',
    'Oh, a dust speck! This is urgent.',
    "I'm feral! ⚡",
    "Just kidding! 😹 Everything's fine.",
    'I want to know you better! 😸',
    'Ready for a chase? Try to dodge! 🐾',
    "Let's play hide-and-seek! 🙈",
    'Found myself something important to do.'
  ] : [
    'Мур.',
    'О, пылинка! Это срочно.',
    'Я бешеный! ⚡',
    'Шутка! 😹 Всё под контролем.',
    'Хочу узнать тебя получше! 😸',
    'Готов к догонялкам? Попробуй увернуться! 🐾',
    'Давай сыграем в прятки! 🙈',
    'Кажется, я нашёл себе важное занятие.'
  ];

  var cat = document.querySelector('.hero-cat');
  var bubble = document.querySelector('#cat-status');
  var previousLine = -1;
  var catAnimation;

  if (cat && bubble) {
    cat.addEventListener('click', function () {
      var index = Math.floor(Math.random() * lines.length);
      if (index === previousLine) index = (index + 1) % lines.length;
      previousLine = index;
      bubble.textContent = lines[index];

      if (!reduced) {
        if (catAnimation) catAnimation.cancel();
        catAnimation = cat.animate(
          [
            { transform: 'translateY(0)' },
            { transform: 'translateY(-18px)', offset: .35 },
            { transform: 'translateY(0)' }
          ],
          { duration: 520, easing: 'cubic-bezier(.34, 1.4, .64, 1)' }
        );
      }
    });
  }

  var demo = document.querySelector('.hero-demo video');
  var videoStatus = document.querySelector('#video-status');

  if (demo && videoStatus) {
    var showReady = function () {
      videoStatus.textContent = '';
      videoStatus.classList.remove('is-error');
    };
    var showError = function () {
      videoStatus.textContent = videoStatus.dataset.error;
      videoStatus.classList.add('is-error');
    };

    demo.addEventListener('loadeddata', showReady);
    demo.addEventListener('error', showError);

    if (demo.error) {
      showError();
    } else if (demo.readyState >= 2) {
      showReady();
    }

    // Без muted браузер autoplay всё равно запретит. Reduced motion:
    // ролик замирает на постере и остаётся с кнопкой воспроизведения.
    if (reduced) {
      demo.removeAttribute('autoplay');
      demo.removeAttribute('loop');
      demo.pause();
    }
  }
})();
