// Маленькие радости лендинга: кот говорит по клику, блоки появляются при
// прокрутке, а долиставшему до конца выдаётся ачивка — как в приложении.
// Всё необязательное: без JS страница остаётся полностью читаемой.
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isEnglish = document.documentElement.lang === 'en';

  // Реплики взяты из сценариев приложения, а не выдуманы.
  var LINES = isEnglish ? [
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

  // --- кот говорит по клику ---
  var cat = document.querySelector('.cat-hero');
  if (cat) {
    var bubble = document.createElement('div');
    bubble.className = 'cat-say panel';
    bubble.setAttribute('role', 'status');
    cat.parentNode.insertBefore(bubble, cat);

    var previous = -1;
    var hideTimer;
    cat.addEventListener('click', function () {
      var index = Math.floor(Math.random() * LINES.length);
      if (index === previous) index = (index + 1) % LINES.length;
      previous = index;

      bubble.textContent = LINES[index];
      bubble.classList.add('visible');
      clearTimeout(hideTimer);
      hideTimer = setTimeout(function () { bubble.classList.remove('visible'); }, 3200);

      if (!reduced) {
        cat.animate(
          [{ transform: 'translateY(0)' }, { transform: 'translateY(-22px)', offset: .35 }, { transform: 'translateY(0)' }],
          { duration: 620, easing: 'cubic-bezier(.34, 1.4, .64, 1)' }
        );
      }
      unlock();
    });
  }

  // --- кот, гуляющий по первому экрану ---
  var hero = document.querySelector('.hero');
  if (hero && cat && !reduced) {
    var walker = document.createElement('img');
    walker.className = 'walker';
    walker.alt = '';
    walker.setAttribute('aria-hidden', 'true');
    // Путь берём от героя, чтобы не гадать про базовый адрес сайта
    walker.src = cat.getAttribute('src').replace(/[^/]+\.png$/, 'white_cat.png');
    hero.appendChild(walker);

    // Прогон отдаём в CSS в пикселях: анимация едет на transform, а проценты
    // в translateX меряются по ширине кота, а не по ширине героя. Следим
    // ResizeObserver'ом, а не событием resize: герой меняет ширину и без него -
    // например когда подгрузился шрифт или появился скроллбар.
    var setWalkSpan = function () {
      walker.style.setProperty('--walk-span', hero.clientWidth + 'px');
    };
    setWalkSpan();
    if ('ResizeObserver' in window) {
      new ResizeObserver(setWalkSpan).observe(hero);
    } else {
      window.addEventListener('resize', setWalkSpan);
    }
  }

  // --- появление блоков при прокрутке ---
  if (!reduced && 'IntersectionObserver' in window) {
    var blocks = document.querySelectorAll('.card, .reaction, .split > div, .faq details');
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('shown');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px' });

    blocks.forEach(function (block, index) {
      block.classList.add('reveal');
      block.style.transitionDelay = Math.min(index % 4, 3) * 60 + 'ms';
      observer.observe(block);
    });
  }

  // --- ачивка за долистанный лендинг ---
  var unlocked = false;
  function unlock() {
    if (unlocked) return;
    try { if (sessionStorage.getItem('mewmori-achievement')) return; } catch (error) { /* пусто */ }
    unlocked = true;
    try { sessionStorage.setItem('mewmori-achievement', '1'); } catch (error) { /* пусто */ }

    var toast = document.createElement('div');
    toast.className = 'achievement panel';
    toast.setAttribute('role', 'status');
    toast.innerHTML = '<span class="emoji">🐾</span><span>' +
      '<span class="title">' + (isEnglish ? 'Achievement unlocked' : 'Достижение получено') + '</span><br>' +
      '<span class="desc">' + (isEnglish ? 'You poked the cat. It noticed.' : 'Ты ткнул кота. Он заметил.') + '</span></span>';
    document.body.appendChild(toast);

    requestAnimationFrame(function () { toast.classList.add('shown'); });
    setTimeout(function () {
      toast.classList.remove('shown');
      setTimeout(function () { toast.remove(); }, 400);
    }, 4200);
  }
})();

// Ролик в герое крутится сам, но не у тех, кто просил систему не двигать картинку:
// для них он замирает на первом кадре и получает кнопку воспроизведения.
(() => {
  const demo = document.querySelector('.hero-demo video');
  if (!demo || !window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  demo.removeAttribute('autoplay');
  demo.removeAttribute('loop');
  demo.controls = true;
  demo.pause();
})();
