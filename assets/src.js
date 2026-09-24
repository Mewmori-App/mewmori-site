// Где посетитель нашёл сайт, одной меткой, которая переезжает на все внутренние
// страницы и, в итоге, на редирект `/go` со страницы загрузки. Без неё путь
// «ролик → главная → цены → скачать» теряет источник до того, как Worker
// успевает его посчитать.
//
// Метка берётся из самого явного, что есть в адресе первой страницы:
// `?src=`, затем `utm_source` и `ref` (их ставят Product Hunt, рассылки и
// каталоги сами). Если метки нет, остаётся реферер: его хост уходит дальше как
// `?via=www.google.com`, а в канал его превращает Worker. Реферер виден только
// на первой странице визита, дальше им уже будет сам mewmori.com, поэтому его и
// надо нести по ссылкам.
//
// Считает не этот файл, а редирект `/go` в воркере: блокировщик рекламы его не
// вырежет, cookie он не ставит, и посетителя не запоминает — записываются
// только канал и дата. Здесь метка просто передаётся дальше по сайту.
//
// Ничего не ломается без JS: ссылки остаются прежними, скачивание работает,
// незасчитанным остаётся только клик.
(function () {
  var TAG = /^[a-z0-9][a-z0-9._-]{0,39}$/;
  var HOST = /^[a-z0-9.-]{1,253}$/;
  var params = new URLSearchParams(window.location.search);

  function clean(value) {
    return (value || '').trim().toLowerCase();
  }

  function refererHost() {
    try {
      var referrer = new URL(document.referrer);
      return referrer.origin === window.location.origin ? '' : referrer.hostname;
    } catch (error) {
      return '';
    }
  }

  var attribution = null;
  var tag = clean(params.get('src') || params.get('utm_source') || params.get('ref'));
  if (TAG.test(tag)) {
    attribution = { name: 'src', value: tag };
  } else {
    var via = clean(params.get('via')) || refererHost();
    if (HOST.test(via)) attribution = { name: 'via', value: via };
  }

  // Страница загрузки читает это из своего скрипта, чтобы дописать метку к `/go`.
  window.mewmoriAttribution = attribution;
  if (!attribution) return;

  function decorate() {
    var links = document.querySelectorAll('a[href]');
    for (var index = 0; index < links.length; index += 1) {
      var href = links[index].getAttribute('href');
      // A fragment stays on this document. Adding a query string to it would turn
      // an in-page navigation into a reload, so it deliberately keeps no rewrite.
      if (!href || href.charAt(0) === '#') continue;

      var url = new URL(href, window.location.href);
      // Never decorate a checkout, a social link, mail, or any other external
      // destination: the tag is only the site's own anonymous attribution.
      if (url.origin !== window.location.origin) continue;

      url.searchParams.set(attribution.name, attribution.value);
      links[index].setAttribute('href', url.pathname + url.search + url.hash);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', decorate);
  } else {
    decorate();
  }
})();
