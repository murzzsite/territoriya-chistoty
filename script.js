const LEAD_ENDPOINT = 'https://lead-relay.leestygpt.workers.dev/lead/RDD8TZ75HK';

(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const nb = s => String(s).replace(/ /g, ' ');
  const fmt = n => nb(new Intl.NumberFormat('ru-RU').format(Math.round(n)));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const plural = (n, a, b, c) => { const m = n % 100, d = n % 10; return (m > 10 && m < 20) ? c : d === 1 ? a : (d > 1 && d < 5) ? b : c; };

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ===== intro: hero lines rise once the font is in =====
  const start = () => root.classList.add('go');
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, sleep(1200)]).then(() => requestAnimationFrame(start));
  } else start();

  // ===== header, burger =====
  const header = $('#header');
  const burger = $('#burger');
  const nav = $('#nav');
  const hero = $('.hero');
  const contact = $('#contact');
  let lastY = window.scrollY;

  const setMenu = open => {
    burger.classList.toggle('is-open', open);
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    if (open) header.classList.remove('is-hidden');
  };
  burger?.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  $$('a', nav).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  // ===== scroll loop: header, hero drift, parallax =====
  const heroLn = $$('.hero__title .ln');
  const pics = $$('.pane__pic img');
  const arch = $('#arch');
  const archImg = $('#arch img');
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    const vh = window.innerHeight;
    const menuOpen = nav.classList.contains('is-open');
    header.classList.toggle('is-solid', y > vh * 0.55 || menuOpen);
    if (!menuOpen) {
      if (y > lastY + 6 && y > vh * 0.9) header.classList.add('is-hidden');
      if (y < lastY - 4 || y < vh * 0.9) header.classList.remove('is-hidden');
    }
    lastY = y;

    if (!reduce) {
      const p = clamp(y / vh, 0, 1);
      if (heroLn[0]) heroLn[0].style.setProperty('--dx', (-p * 14) + 'vw');
      if (heroLn[1]) heroLn[1].style.setProperty('--dx2', (p * 18) + 'vw');
      pics.forEach(img => {
        const r = img.parentElement.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const c = (r.top + r.height / 2 - vh / 2) / vh;
        img.style.setProperty('--py', (-c * 36).toFixed(1) + 'px');
      });
      if (archImg && arch) {
        const r = arch.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) archImg.style.setProperty('--py', (((r.top + r.height / 2 - vh / 2) / vh) * -30).toFixed(1) + 'px');
      }
    }

    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  let lastW = window.innerWidth;
  window.addEventListener('resize', () => { if (window.innerWidth !== lastW) { lastW = window.innerWidth; buildPlot(); } onScroll(); });

  // ===== entrances =====
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  $$('[data-r], [data-lines], #blocks').forEach(el => io.observe(el));
  if (reduce) $$('[data-r], [data-lines], #blocks').forEach(el => el.classList.add('in'));
  // the arch has its own clip-path, so it is revealed by its panel
  new IntersectionObserver((es, o) => {
    if (es[0].isIntersecting) { arch.classList.add('in'); o.disconnect(); }
  }, { threshold: 0.25 }).observe($('.panel-in'));

  // ===== services: tabs =====
  const tabs = $$('.tab');
  const panels = $$('.panel');
  const showPanel = (i, focus) => {
    tabs.forEach((t, k) => {
      t.setAttribute('aria-selected', k === i);
      t.tabIndex = k === i ? 0 : -1;
    });
    panels.forEach((p, k) => {
      p.hidden = k !== i;
      p.classList.remove('in-anim');
    });
    void panels[i].offsetWidth;
    if (!reduce) panels[i].classList.add('in-anim');
    if (focus) tabs[i].focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => showPanel(i));
    t.addEventListener('keydown', e => {
      const k = e.key;
      const horiz = window.matchMedia('(max-width: 900px)').matches;
      const next = horiz ? 'ArrowRight' : 'ArrowDown', prev = horiz ? 'ArrowLeft' : 'ArrowUp';
      if (k === next || k === prev) {
        e.preventDefault();
        showPanel((i + (k === next ? 1 : tabs.length - 1)) % tabs.length, true);
      }
    });
  });
  const agenda = $('.agenda');
  new IntersectionObserver((es, o) => {
    if (es[0].isIntersecting) { if (!reduce) panels.find(p => !p.hidden).classList.add('in-anim'); o.disconnect(); }
  }, { threshold: 0.25 }).observe(agenda);

  // choose a service → form
  const fTask = $('#f-task');
  const fCalc = $('#f-calc');
  const formMsg = $('#formMsg');
  const goForm = () => {
    const top = contact.getBoundingClientRect().top + window.scrollY - 8;
    window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
  };
  $$('.band__go').forEach(b => b.addEventListener('click', () => {
    fTask.value = b.dataset.service;
    formMsg.textContent = 'Выбрано: ' + b.dataset.service;
    goForm();
  }));

  // ===== price: the sotka plot =====
  const area = $('#area');
  const areaOut = $('#areaOut');
  const sumEl = $('#sum');
  const plot = $('#plot');
  const plotCap = $('#plotCap');
  const runBtn = $('#run');
  const toForm = $('#toForm');
  const RATE = { clear: [10000, 25000], mow: [1500, 0] };
  let job = 'clear';
  let n = +area.value;
  let runId = 0;
  let rig = null;
  let cells = [];

  const rng = seed => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const wildSvg = (i, j) => {
    const r = rng(i * 97 + 13);
    let s = '';
    if (j === 'clear') {
      s += '<rect width="100" height="100" fill="#3b7a35"/>';
      for (let k = 0; k < 5; k++) s += `<circle cx="${(10 + r() * 80).toFixed(0)}" cy="${(10 + r() * 80).toFixed(0)}" r="${(8 + r() * 6).toFixed(0)}" fill="#5aa045"/>`;
      for (let k = 0; k < 2; k++) s += `<circle cx="${(22 + r() * 56).toFixed(0)}" cy="${(22 + r() * 56).toFixed(0)}" r="${(15 + r() * 7).toFixed(0)}" fill="#1f5a26"/>`;
      for (let k = 0; k < 5; k++) s += `<circle cx="${(8 + r() * 84).toFixed(0)}" cy="${(8 + r() * 84).toFixed(0)}" r="${(3 + r() * 3).toFixed(0)}" fill="#8cc968"/>`;
    } else {
      s += '<rect width="100" height="100" fill="#74b04c"/>';
      for (let k = 0; k < 26; k++) {
        const x = (4 + r() * 92).toFixed(0), y = (6 + r() * 78).toFixed(0), h = (10 + r() * 14).toFixed(0);
        s += `<rect x="${x}" y="${y}" width="3" height="${h}" fill="${k % 3 ? '#4f8f33' : '#a3d870'}"/>`;
      }
    }
    return `<g class="wild">${s}</g>`;
  };
  const lawnSvg = j => j === 'mow'
    ? '<g class="lawn"><rect y="0" width="100" height="34" fill="#a7d279"/><rect y="68" width="100" height="32" fill="#a7d279"/></g>'
    : '<g class="lawn"><rect y="24" width="100" height="7" fill="#d9cfb6"/><rect y="69" width="100" height="7" fill="#d9cfb6"/><rect x="6" y="6" width="9" height="9" fill="#f9531f"/></g>';

  const plotCols = () => {
    const W = plot.parentElement.clientWidth - 2;
    const H = Math.max(plot.parentElement.clientHeight - 60, 260);
    let best = 1, bestSize = 0;
    for (let c = 1; c <= n; c++) {
      const rows = Math.ceil(n / c);
      const size = Math.min((W - (c - 1) * 4) / c, (H - (rows - 1) * 4) / rows);
      if (size > bestSize) { bestSize = size; best = c; }
    }
    return { cols: best, size: Math.min(bestSize, 190) };
  };

  function buildPlot() {
    runId++;
    if (rig) { rig.remove(); rig = null; }
    plot.dataset.job = job;
    const { cols, size } = plotCols();
    plot.style.gridTemplateColumns = `repeat(${cols}, ${Math.floor(size)}px)`;
    plot.style.justifyContent = 'center';
    plot.innerHTML = '';
    cells = [];
    for (let i = 0; i < n; i++) {
      const c = document.createElement('div');
      c.className = 'cell';
      c.style.setProperty('--i', i);
      c.innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none">${lawnSvg(job)}${wildSvg(i, job)}</svg>`;
      plot.appendChild(c);
      cells.push(c);
    }
    plotCap.textContent = 'Участок зарос';
    runBtn.textContent = job === 'clear' ? 'Расчистить участок' : 'Покосить участок';
    runBtn.disabled = false;
  }

  const priceText = () => {
    if (job === 'clear') {
      const lo = RATE.clear[0] * n / 1000, hi = RATE.clear[1] * n / 1000;
      return `${fmt(lo)}–${fmt(hi)} тыс. ₽`;
    }
    return `от ${fmt(RATE.mow[0] * n)} ₽`;
  };
  let tween = 0;
  const setSum = () => {
    const text = priceText();
    const target = job === 'clear' ? RATE.clear[0] * n : RATE.mow[0] * n;
    if (reduce) { sumEl.textContent = text; return; }
    const from = +sumEl.dataset.v || 0;
    const t0 = performance.now();
    cancelAnimationFrame(tween);
    const step = t => {
      const p = clamp((t - t0) / 600, 0, 1);
      const e = 1 - Math.pow(1 - p, 3);
      const v = from + (target - from) * e;
      if (p < 1) {
        const k = v / (target || 1);
        sumEl.textContent = job === 'clear'
          ? `${fmt(RATE.clear[0] * n / 1000 * k)}–${fmt(RATE.clear[1] * n / 1000 * k)} тыс. ₽`
          : `от ${fmt(v)} ₽`;
        tween = requestAnimationFrame(step);
      } else sumEl.textContent = text;
    };
    tween = requestAnimationFrame(step);
    sumEl.dataset.v = target;
  };
  const setArea = () => {
    n = +area.value;
    areaOut.textContent = `${n} ${plural(n, 'сотка', 'сотки', 'соток')}`;
    const pct = ((n - area.min) / (area.max - area.min)) * 100;
    area.style.setProperty('--p', pct + '%');
    setSum();
  };

  async function run() {
    const id = ++runId;
    runBtn.disabled = true;
    // reset to overgrown
    cells.forEach(c => c.classList.remove('is-clean'));
    if (reduce) {
      cells.forEach(c => c.classList.add('is-clean'));
      plotCap.textContent = `Готово: ${n} ${plural(n, 'сотка', 'сотки', 'соток')} чистые`;
      runBtn.disabled = false; runBtn.textContent = 'Ещё раз';
      return;
    }
    await sleep(250);
    if (id !== runId) return;
    const first = cells[0];
    const size = first.offsetWidth;
    rig = document.createElement('div');
    rig.className = 'rig';
    rig.style.width = rig.style.height = size + 'px';
    plot.appendChild(rig);
    const cols = Math.round(plot.clientWidth ? getComputedStyle(plot).gridTemplateColumns.split(' ').length : 1);
    const order = [];
    for (let r = 0; r * cols < n; r++) {
      const row = [];
      for (let c = 0; c < cols && r * cols + c < n; c++) row.push(r * cols + c);
      if (r % 2) row.reverse();
      order.push(...row);
    }
    const dt = clamp(4800 / n, 130, 340);
    rig.style.transition = 'none';
    rig.style.transform = `translate(${first.offsetLeft - size}px, ${first.offsetTop}px)`;
    void rig.offsetWidth;
    rig.classList.add('is-on');
    rig.style.transition = `transform ${dt * 0.9}ms linear, opacity .3s`;
    let done = 0;
    for (const idx of order) {
      if (id !== runId) return;
      const c = cells[idx];
      rig.style.transform = `translate(${c.offsetLeft}px, ${c.offsetTop}px)`;
      await sleep(dt * 0.55);
      if (id !== runId) return;
      c.classList.add('is-clean');
      done++;
      plotCap.textContent = `${job === 'clear' ? 'Расчищено' : 'Скошено'} ${done} из ${n}`;
      await sleep(dt * 0.45);
    }
    if (id !== runId) return;
    const last = cells[order[order.length - 1]];
    rig.style.transform = `translate(${last.offsetLeft + size * 1.2}px, ${last.offsetTop}px)`;
    rig.classList.remove('is-on');
    plotCap.textContent = `Готово: ${n} ${plural(n, 'сотка', 'сотки', 'соток')} чистые`;
    runBtn.disabled = false;
    runBtn.textContent = 'Ещё раз';
  }

  $$('input[name="job"]').forEach(r => r.addEventListener('change', () => {
    job = r.value;
    sumEl.dataset.v = 0;
    buildPlot();
    setArea();
  }));
  let rebuild = 0;
  area.addEventListener('input', () => {
    setArea();
    clearTimeout(rebuild);
    rebuild = setTimeout(buildPlot, 80);
  });
  runBtn.addEventListener('click', run);
  toForm.addEventListener('click', e => {
    e.preventDefault();
    const label = job === 'clear' ? 'Расчистка' : 'Покос';
    fTask.value = label + ' участка';
    fCalc.value = `${label}, ${n} ${plural(n, 'сотка', 'сотки', 'соток')}, ориентир ${priceText().replace(/ /g, ' ')}`;
    formMsg.textContent = 'Передадим в заявку: ' + fCalc.value;
    goForm();
  });
  // build the plot when it is about to be seen (width is known then)
  setArea();
  buildPlot();
  new IntersectionObserver((es, o) => {
    if (es[0].isIntersecting) { buildPlot(); o.disconnect(); }
  }, { rootMargin: '300px' }).observe($('#calc'));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => buildPlot());

  // ===== process: accordion of tinted panels =====
  const steps = $$('.step');
  const openStep = i => {
    steps.forEach((s, k) => {
      const on = k === i;
      s.classList.toggle('is-open', on);
      $('.step__btn', s).setAttribute('aria-expanded', on);
    });
  };
  let touched = false;
  steps.forEach((s, i) => $('.step__btn', s).addEventListener('click', () => { touched = true; openStep(i); }));
  if (!reduce) {
    new IntersectionObserver((es, o) => {
      if (!es[0].isIntersecting) return;
      o.disconnect();
      let i = 0;
      const tick = () => {
        if (touched || i >= steps.length - 1) return;
        i++; openStep(i);
        setTimeout(tick, 2600);
      };
      setTimeout(tick, 2400);
    }, { threshold: 0.6 }).observe($('#steps'));
  }

  // ===== faq: animated details =====
  const qs = $$('.q');
  const close = d => {
    const ans = $('.ans', d);
    const h = ans.offsetHeight;
    if (reduce) { d.open = false; return; }
    ans.animate([{ height: h + 'px' }, { height: '0px' }], { duration: 280, easing: 'cubic-bezier(.65,0,.35,1)' }).onfinish = () => { d.open = false; };
  };
  qs.forEach(d => {
    $('summary', d).addEventListener('click', e => {
      e.preventDefault();
      if (d.open) { close(d); return; }
      qs.filter(o => o !== d && o.open).forEach(close);
      d.open = true;
      if (reduce) return;
      const ans = $('.ans', d);
      const h = ans.offsetHeight;
      ans.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' });
    });
  });

  // ===== form =====
  document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.startsWith('8')) v = '7' + v.slice(1);
      if (v && !v.startsWith('7')) v = '7' + v;
      v = v.slice(0, 11);
      let out = v ? '+7' : '';
      if (v.length > 1) out += ' (' + v.slice(1, 4);
      if (v.length >= 4) out += ') ' + v.slice(4, 7);
      if (v.length >= 7) out += '-' + v.slice(7, 9);
      if (v.length >= 9) out += '-' + v.slice(9, 11);
      e.target.value = out;
    });
  });

  // source of the visit: UTM / click ids, kept for the session
  const sourceStr = (() => {
    const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'yclid', 'gclid', 'ref'];
    const q = new URLSearchParams(location.search);
    const found = keys.filter(k => q.get(k)).map(k => `${k}=${q.get(k)}`);
    let saved = '';
    try {
      if (found.length) sessionStorage.setItem('tc_src', found.join('; '));
      saved = sessionStorage.getItem('tc_src') || '';
    } catch (e) { saved = found.join('; '); }
    if (saved) return saved;
    try { const h = document.referrer && new URL(document.referrer).hostname; return h ? 'переход с ' + h : 'прямой заход'; } catch (e) { return 'прямой заход'; }
  })();
  $('#f-source').value = sourceStr;

  const form = $('#leadForm');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    const payload = {};
    new FormData(form).forEach((v, k) => { payload[k] = v; });
    if (payload._gotcha) return;
    if (!payload.name || payload.phone.replace(/\D/g, '').length < 11) {
      formMsg.textContent = 'Укажите имя и телефон полностью, чтобы мы могли перезвонить.';
      return;
    }
    payload.comment = [payload.task, payload.calc].filter(Boolean).join('. ');
    payload.page = location.origin + location.pathname;
    btn.disabled = true;
    btn.textContent = 'Отправляем…';
    try {
      const resp = await fetch(LEAD_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      btn.textContent = 'Заявка отправлена';
      formMsg.textContent = 'Спасибо. Перезвоним в ближайшее время. Фото можно сразу прислать в Telegram или Max.';
      form.reset();
      fTask.value = ''; fCalc.value = ''; $('#f-source').value = sourceStr;
    } catch (err) {
      console.error(err);
      btn.textContent = 'Не отправилось, ещё раз';
      formMsg.textContent = 'Не удалось отправить. Позвоните нам или напишите в Telegram.';
    } finally {
      setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 3500);
    }
  });

  // ===== smooth anchors =====
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href.length <= 1 || a.id === 'toForm') return;
    const target = $(href);
    if (!target) return;
    e.preventDefault();
    const top = href === '#top' ? 0 : target.getBoundingClientRect().top + window.scrollY - (href === '#contact' ? 8 : 64);
    window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
  }));

  onScroll();
})();
