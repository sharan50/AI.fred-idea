// AI.fred navigation script. Navigation only: nothing here fetches, stores or animates.
// 1. On narrow screens, turns the rail (publication list and page contents) into a disclosure.
// 2. Builds the "On this page" list from the document's h2 headings.
// 3. Marks the current document in the publication list.
(function () {
  'use strict';

  var rail = document.querySelector('.rail');
  var doc = document.querySelector('.doc');

  // 2. On this page
  var contents = document.querySelector('[data-contents]');
  if (contents && doc) {
    var headings = doc.querySelectorAll('h2[id]');
    if (headings.length > 1) {
      var list = document.createElement('ol');
      for (var i = 0; i < headings.length; i++) {
        var h = headings[i];
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = '#' + h.id;
        var no = h.querySelector('.no');
        if (no) {
          var n = document.createElement('span');
          n.className = 'n';
          n.textContent = no.textContent.trim();
          a.appendChild(n);
        }
        var text = h.textContent;
        if (no) text = text.replace(no.textContent, '');
        a.appendChild(document.createTextNode(text.trim()));
        li.appendChild(a);
        list.appendChild(li);
      }
      contents.appendChild(list);
      contents.hidden = false;
    }
  }

  // 3. Current document in the publication list
  var here = location.pathname.replace(/index\.html$/, '');
  var links = document.querySelectorAll('.site-nav a[href]');
  for (var j = 0; j < links.length; j++) {
    var abs = new URL(links[j].getAttribute('href'), location.href).pathname.replace(/index\.html$/, '');
    if (abs === here) {
      links[j].setAttribute('aria-current', 'page');
    } else {
      var section = abs.split('/').filter(Boolean).pop() || '';
      var hereSection = here.split('/').filter(Boolean)[0] || '';
      if (section && section === hereSection && here !== '/') links[j].setAttribute('aria-current', 'true');
    }
  }

  // 1. Rail disclosure on narrow screens
  if (rail && window.matchMedia) {
    var narrow = window.matchMedia('(max-width: 760px)');
    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'rail-toggle';
    toggle.textContent = 'Contents';
    toggle.setAttribute('aria-controls', rail.id || 'rail');
    if (!rail.id) rail.id = 'rail';
    var setOpen = function (open) {
      rail.classList.toggle('is-collapsed', !open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    rail.parentNode.insertBefore(toggle, rail);
    setOpen(!narrow.matches);
    toggle.addEventListener('click', function () {
      setOpen(rail.classList.contains('is-collapsed'));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && narrow.matches && !rail.classList.contains('is-collapsed')) {
        setOpen(false);
        toggle.focus();
      }
    });
    var onChange = function (ev) { setOpen(!ev.matches); };
    if (narrow.addEventListener) narrow.addEventListener('change', onChange);
    else if (narrow.addListener) narrow.addListener(onChange);
  }
})();
