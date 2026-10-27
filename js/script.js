(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const EN = document.documentElement.lang === 'en';
  const T = EN
    ? { menu: 'Open menu', sending: 'Sending…', ok: 'Message sent ✓ I’ll get back to you shortly.', fail: 'Failed', failT: 'Failed: ', school: 'school', pfe: '"early 2027"' }
    : { menu: 'Ouvrir le menu', sending: 'Envoi…', ok: 'Message envoyé ✓ Je vous réponds rapidement.', fail: 'Échec', failT: 'Échec : ', school: 'école', pfe: '"début 2027"' };
  const toast = (m) => { const t = $('.toast'); t.textContent = m; t.classList.add('show'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 2200); };


  /* Thème clair / sombre : choix mémorisé, sinon préférence système */
  const root = document.documentElement, tbtn = $('.theme-btn'), tmeta = $('meta[name=theme-color]');
  const applyTheme = (t, save) => {
    root.dataset.theme = t; tbtn.setAttribute('aria-pressed', t === 'dark'); if (tmeta) tmeta.content = t === 'dark' ? '#0E0A1F' : '#5B34D9';
    if (save) { try { localStorage.setItem('theme', t); } catch (e) {} }
  };
  applyTheme(root.dataset.theme || 'light', false);
  tbtn.onclick = () => {
    if (!reduce) { root.classList.add('theme-anim'); clearTimeout(tbtn._t); tbtn._t = setTimeout(() => root.classList.remove('theme-anim'), 400); }
    applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true);
  };
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => { let s = null; try { s = localStorage.getItem('theme'); } catch (_) {} if (!s) applyTheme(e.matches ? 'dark' : 'light', false); });

  /* Images cassées : on masque proprement */
  $$('img').forEach(i => i.addEventListener('error', () => { i.style.visibility = 'hidden'; }, { once: true }));

  /* Header : menu mobile, ombre, barre de progression, scrollspy */
  const header = $('header[role=banner]'), nav = $('nav', header);
  const burger = Object.assign(document.createElement('button'), { type: 'button', className: 'menu-btn', textContent: '☰' });
  burger.setAttribute('aria-label', T.menu); burger.setAttribute('aria-expanded', 'false'); header.append(burger);
  const setMenu = o => { header.classList.toggle('open', o); burger.setAttribute('aria-expanded', o); };
  burger.onclick = () => setMenu(!header.classList.contains('open'));
  nav.addEventListener('click', e => e.target.closest('a') && setMenu(false));
  addEventListener('keydown', e => e.key === 'Escape' && setMenu(false));
  const bar = $('.progress');
  const onScroll = () => { const h = document.documentElement; bar.style.transform = `scaleX(${scrollY / (h.scrollHeight - innerHeight || 1)})`; header.classList.toggle('stuck', scrollY > 20); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const links = $$('a', nav), byId = new Map(links.map(a => [a.hash.slice(1), a]));
  const spy = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { links.forEach(a => a.classList.remove('active')); byId.get(e.target.id)?.classList.add('active'); } }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main>section').forEach(s => spy.observe(s));

  /* Apparition + compteurs + anneaux de langues */
  $$('main>section>*:not(.reveal), .pgrid>*, .stats li, .about-card, .tl-item, .certs>li, .lang').forEach(el => { el.classList.add('reveal'); });
  $$('.pgrid>.reveal,.about-card,.stats li,.certs>li,.lang').forEach((el, i) => el.style.setProperty('--i', i % 6));
  const count = el => {
    const to = +el.dataset.to, dec = +el.dataset.dec, t0 = performance.now();
    const step = t => { const k = Math.min((t - t0) / 1400, 1), v = to * (1 - Math.pow(1 - k, 3)); el.textContent = v.toFixed(dec); if (k < 1) requestAnimationFrame(step); };
    reduce ? (el.textContent = to.toFixed(dec)) : requestAnimationFrame(step);
  };
  const rv = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); $$('.count', e.target).forEach(count); rv.unobserve(e.target); } }), { threshold: .12 });
  $$('.reveal').forEach(el => rv.observe(el));

  /* Hero : code qui s'écrit, parallaxe des tuiles, halo qui suit la souris */
  const code = [['const ', 'k'], ['emna', ''], [' = {\n', ''], ['  role: ', ''], ['"AI · Data · Full Stack"', 's'], [',\n  ' + T.school + ': ', ''], ['"ENIS"', 's'], [',\n  pfe: ', ''], [T.pfe, 's'], [',\n};', '']];
  const out = $('#typed');
  if (out) {
    if (reduce) out.innerHTML = code.map(([t, c]) => c ? `<span class="${c}">${t}</span>` : t).join('');
    else { let seg = 0, ch = 0, html = ''; const tick = () => {
      if (seg >= code.length) { setTimeout(() => { seg = ch = 0; html = ''; tick(); }, 4500); return; }
      const [t, c] = code[seg]; ch++; const cur = t.slice(0, ch);
      out.innerHTML = html + (c ? `<span class="${c}">${cur}</span>` : cur);
      if (ch >= t.length) { html += c ? `<span class="${c}">${t}</span>` : t; seg++; ch = 0; }
      setTimeout(tick, 55); }; tick(); }
  }
  const spot = $('.spot'), fl = $$('.floats li');
  if (fine && !reduce) addEventListener('pointermove', e => {
    spot.style.setProperty('--mx', e.clientX + 'px'); spot.style.setProperty('--my', e.clientY + 'px');
    const x = (e.clientX / innerWidth - .5), y = (e.clientY / innerHeight - .5);
    fl.forEach((el, i) => { const d = (i % 3 + 1) * 10; el.style.transform = `translate(${x * d}px,${y * d}px)`; });
  }, { passive: true });

  /* Tilt 3D + boutons magnétiques */
  if (fine && !reduce) {
    $$('.tilt').forEach(el => {
      el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; el.style.transition = 'transform .1s'; el.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-4px)`; });
      el.addEventListener('pointerleave', () => { el.style.transition = 'transform .5s'; el.style.transform = ''; });
    });
    $$('.magnet').forEach(el => {
      el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .2}px,${(e.clientY - r.top - r.height / 2) * .3}px)`; });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* Onglets accessibles génériques (expériences, compétences, engagements) */
  const tabs = (list) => {
    const bs = $$('[role=tab]', list), sel = i => bs.forEach((b, j) => { const on = i === j; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; const p = document.getElementById(b.getAttribute('aria-controls')); p.hidden = !on; });
    bs.forEach((b, i) => { b.onclick = () => sel(i); b.onkeydown = e => { const v = list.getAttribute('aria-orientation') === 'vertical', n = { [v ? 'ArrowDown' : 'ArrowRight']: 1, [v ? 'ArrowUp' : 'ArrowLeft']: -1, Home: -i, End: bs.length - 1 - i }[e.key]; if (n !== undefined) { e.preventDefault(); const k = (i + n + bs.length) % bs.length; sel(k); bs[k].focus(); } }; });
  };
  $$('[role=tablist]').forEach(tabs);

  /* Projets : filtres + modale détail */
  const fb = $$('.filters button'), cards = $$('.proj');
  fb.forEach(b => b.onclick = () => { fb.forEach(x => x.setAttribute('aria-pressed', x === b)); const f = b.dataset.f; cards.forEach(c => c.classList.toggle('off', f !== 'all' && !c.dataset.cat.split(' ').includes(f))); });
  const modal = $('.modal'), mb = $('.m-body', modal);
  $('.x', modal).onclick = () => modal.close(); modal.addEventListener('click', e => e.target === modal && modal.close());
  cards.forEach(c => {
    const open = () => { mb.innerHTML = `<p class="kind">${$('.kind', c).innerHTML}</p><h3>${$('h3', c).innerHTML}</h3>` + $('template', c).innerHTML; modal.showModal(); mb.scrollTop = 0; };
    $('.more', c).onclick = open; c.addEventListener('click', e => { if (!e.target.closest('a,button')) open(); });
  });

  /* Galerie photos : lightbox avec navigation */
  const lb = $('.lightbox'), lim = $('img', lb), cap = $('figcaption', lb); let set = [], idx = 0;
  const show = i => { idx = (i + set.length) % set.length; lim.src = set[idx].src; lim.alt = set[idx].alt; cap.textContent = `${set[idx].alt} (${idx + 1}/${set.length})`; };
  $$('.shot').forEach(s => s.onclick = () => { set = $$(`.shot[data-g="${s.dataset.g}"] img`); show(+s.dataset.i); lb.showModal(); });
  $('.x', lb).onclick = () => lb.close(); $('.prev', lb).onclick = () => show(idx - 1); $('.next', lb).onclick = () => show(idx + 1);
  lb.addEventListener('click', e => e.target === lb && lb.close());
  lb.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1); });
  let sx = 0; lb.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true }); lb.addEventListener('touchend', e => { const d = e.changedTouches[0].clientX - sx; if (Math.abs(d) > 50) show(idx + (d < 0 ? 1 : -1)); });

  /* Contact : copier + envoi via client mail */
  const form = $('.cform'), ok = $('.form-ok'), btn = $('button[type=submit]', form), lbl = $('span', btn);
form.addEventListener('submit', async e => {
  e.preventDefault();
  const txt = lbl.textContent;
  btn.disabled = true; lbl.textContent = T.sending; ok.hidden = true;
  try {
    const data = Object.fromEntries(new FormData(form));
    data.subject = '[Portfolio] ' + data.sujet;
    data.from_name = data.nom;
    const r = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data)
    });
    const j = await r.json();
    if (!r.ok || !j.success) throw new Error(j.message || T.fail);
    ok.textContent = T.ok;
    ok.hidden = false; form.reset();
  } catch (err) {
  console.error('Web3Forms :', err.message);
  toast(T.failT + err.message);
} finally {
    btn.disabled = false; lbl.textContent = txt;
  }
});
})();
