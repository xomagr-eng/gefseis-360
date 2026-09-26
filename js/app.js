/* ΓΕΥΣΕΙΣ 360° — εφαρμογή */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const app = $('#app');
  const BY = {}; DB.forEach(x => BY[x.id] = x);
  const KEY = 'gefseis360_v1';
  let S = { fav: [], list: [], done: {}, recent: [], notes: {}, rate: {}, plan: {} };
  try { Object.assign(S, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} badges(); };

  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ς/g, 'σ');
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const catOf = x => CATS[x.cat];
  const groupOf = cat => GROUPS.find(g => g.cats.includes(cat));

  // reverse pairings: drink -> foods that reference it
  const REV = {};
  DB.forEach(x => (x.pr || []).concat(x.sd || []).forEach(id => { (REV[id] = REV[id] || []).push(x.id); }));

  function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 1800); }
  function badges() {
    const f = $('#favN'), l = $('#listN');
    f.hidden = !S.fav.length; f.textContent = S.fav.length;
    const open = S.list.filter(x => !x.d).length; l.hidden = !open; l.textContent = open;
  }
  // χρόνος σε λεπτά από κείμενο όπως «30′», «1 ώρα 15′», «2 ημέρες»
  function mins(t) {
    t = String(t || ''); if (!t || t === '-') return 0;
    let m = 0; const d = t.match(/(\d+(?:[.,]\d+)?)\s*ημέρ/); if (d) m += parseFloat(d[1].replace(',', '.')) * 1440;
    const h = t.match(/(\d+(?:[.,]\d+)?)\s*ώρ/); if (h) m += parseFloat(h[1].replace(',', '.')) * 60;
    const mm = t.match(/(\d+)\s*(?:′|λεπτ)/); if (mm) m += +mm[1];
    return Math.round(m);
  }
  function slotNow() { const h = new Date().getHours(); return (SLOTS.find(s => h >= s.from && h < s.to) || SLOTS[0]).id; }

  /* ---------- cards ---------- */
  function card(x, extra) {
    const c = catOf(x);
    const chips = [];
    if (x.t) chips.push(`<span class="chip">⏱ ${esc(x.t)}</span>`);
    if (x.l) chips.push(`<span class="chip">${'●'.repeat(x.l)}${'○'.repeat(3 - x.l)}</span>`);
    if (x.info && x.info['Αλκοόλ']) chips.push(`<span class="chip">${esc(x.info['Αλκοόλ'])}</span>`);
    (x.tg || []).filter(t => t !== 'αλκοόλ').slice(0, 2).forEach(t => chips.push(`<span class="chip red">${esc(t)}</span>`));
    const rt = S.rate[x.id];
    return `<a class="card" href="#/r/${x.id}" data-min="${mins(x.t)}" data-l="${x.l || 0}" data-tg="${esc((x.tg || []).join('|'))}"><span class="em">${x.emoji}</span><span class="b"><b>${esc(x.name)}</b><p>${esc(x.d || '')}</p>
      <span class="meta"><span class="chip gold">${c.emoji} ${esc(c.subs[x.sub] || c.name)}</span>${rt ? `<span class="chip">${'⭐'.repeat(rt)}</span>` : ''}${chips.join('')}</span>${extra || ''}</span>
      ${S.fav.includes(x.id) ? '<span class="fav">❤️</span>' : ''}</a>`;
  }
  const lnk = id => { const x = BY[id]; return x ? `<a class="lnk" href="#/r/${id}">${x.emoji} ${esc(x.name)}</a>` : ''; };

  /* ---------- pages ---------- */
  function home() {
    const sl = slotNow(), slot = SLOTS.find(s => s.id === sl);
    const combos = COMBOS[sl] || [];
    const c = pick(combos);
    const cnt = k => DB.filter(x => GROUPS.find(g => g.id === k).cats.includes(x.cat)).length;
    const rnd = pick(DB.filter(x => x.p && x.p.length > 2));
    return `<section class="hero">
      <h1>Καλώς ήρθες στις <b>ΓΕΥΣΕΙΣ 360°</b></h1>
      <div class="mut">Καφές, ροφήματα, ταβέρνα & ουζερί, γλυκά και ποτά — υλικά, τρόπος παρασκευής, κοπή, μαρινάδα, ψήσιμο και σερβίρισμα.</div>
      <div class="stats"><span class="stat"><b>${DB.length}</b> συνταγές & οδηγοί</span><span class="stat">☕ <b>${cnt('rofimata')}</b></span><span class="stat">🍽️ <b>${cnt('fagito')}</b></span><span class="stat">🍰 <b>${cnt('glyka')}</b></span><span class="stat">🍷 <b>${cnt('pota')}</b></span></div>
      <div class="row" style="margin-top:12px"><a class="btn sm" href="#/plan">📅 Το πρόγραμμα της εβδομάδας</a><a class="btn sm ghost" href="#/fridge">🧊 Τι φτιάχνω με ό,τι έχω</a>${deferredInstall ? '<button class="btn sm ghost" id="install">📲 Εγκατάσταση στο κινητό</button>' : ''}</div>
    </section>
    ${todayPlan()}
    ${S.recent.filter(i => BY[i]).length ? `<div class="sect"><h2>🕘 Είδες πρόσφατα</h2></div><div class="links">${S.recent.filter(i => BY[i]).slice(0, 12).map(lnk).join('')}</div>` : ''}
    <div class="sect"><h2>${slot.emoji} Τώρα είναι ώρα για ${slot.name.toLowerCase()}</h2><a class="btn sm ghost" href="#/meals/${sl}">Όλες οι προτάσεις →</a></div>
    ${c ? `<div class="combo"><b>${esc(c.t)}</b><p>${esc(c.x)}</p><div class="links">${c.ids.map(lnk).join('')}</div></div>` : ''}
    <div class="sect"><h2>Κατηγορίες</h2></div>
    <div class="tiles">${Object.keys(CATS).map(k => { const n = DB.filter(x => x.cat === k).length; return `<a class="tile" href="#/c/${k}"><span class="n">${n}</span><span class="em">${CATS[k].emoji}</span><b>${CATS[k].name}</b></a>`; }).join('')}
      <a class="tile" href="#/giortes"><span class="em">🎉</span><b>Γιορτές & έθιμα: τι τρώμε</b></a>
      <a class="tile" href="#/kouzines"><span class="em">🗺️</span><b>Παραδοσιακή κουζίνα: περιοχές & χώρες</b></a>
      <a class="tile" href="#/guide"><span class="em">📘</span><b>Οδηγός: κοπές, ψήσιμο, ταιριάσματα</b></a>
      <a class="tile" href="#/fridge"><span class="em">🧊</span><b>Τι φτιάχνω με ό,τι έχω</b></a></div>
    <div class="sect"><h2>🎲 Πρόταση της στιγμής</h2><a class="btn sm ghost" href="#/" onclick="setTimeout(()=>dispatchEvent(new HashChangeEvent('hashchange')));">Άλλη</a></div>
    <div class="grid">${card(rnd)}${card(pick(DB.filter(x => x.cat === 'glyka')))}${card(pick(DB.filter(x => ['krasia', 'cocktails', 'mpyres'].includes(x.cat))))}</div>`;
  }

  /* ---------- 📅 εβδομαδιαίο πρόγραμμα ---------- */
  const DAYS = ['Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο', 'Κυριακή'];
  const PSL = [['me', '🍽️ Μεσημέρι'], ['vr', '🌙 Βράδυ']];
  const todayIdx = () => (new Date().getDay() + 6) % 7;
  const MAINS = () => DB.filter(x => ['mageirefta', 'psita', 'thalassina', 'kynigi', 'pites'].includes(x.cat) && x.i && x.i.length > 2);
  function todayPlan() {
    const d = S.plan[todayIdx()] || {}; const ids = PSL.map(([k]) => d[k]).filter(i => BY[i]);
    return ids.length ? `<div class="box cyan" style="margin-top:12px"><b>📅 Σήμερα (${DAYS[todayIdx()]}) μαγειρεύεις:</b><div class="links" style="margin-top:6px">${ids.map(lnk).join('')}</div></div>` : '';
  }
  function plan() {
    const t = todayIdx();
    return `<h1>📅 Το πρόγραμμα της εβδομάδας</h1><p class="mut">Βάλε πιάτα σε κάθε μέρα (από κάθε συνταγή με «📅 Στο πρόγραμμα» ή με τυχαία πρόταση εδώ). Μετά, με ένα κουμπί, όλα τα υλικά πάνε στη λίστα αγορών.</p>
      <div class="row"><button class="btn" id="plAuto">🎲 Γέμισε όλη την εβδομάδα</button><button class="btn ghost" id="plList">🛒 Όλα τα υλικά στη λίστα</button><button class="btn ghost" id="plClr">Καθαρισμός</button></div>
      <div class="plan" style="margin-top:12px">${DAYS.map((dn, di) => { const d = S.plan[di] || {};
        return `<div class="pr ${di === t ? 'today' : ''}"><span class="e">${di === t ? '👉' : '📆'}</span><div style="flex:1"><b>${dn}</b>${di === t ? ' <span class="chip red">σήμερα</span>' : ''}
          ${PSL.map(([k, n]) => { const x = BY[d[k]]; return `<div class="pslot"><span class="small mut">${n}</span> ${x ? `${lnk(x.id)} <button class="x" data-pd="${di}" data-pk="${k}" title="Αφαίρεση">✕</button>` : `<button class="btn sm ghost" data-pr="${di}" data-pk="${k}">🎲 Πρότεινε</button>`}</div>`; }).join('')}</div></div>`; }).join('')}</div>`;
  }
  function wirePlan() {
    const pk = () => pick(MAINS()).id;
    app.querySelectorAll('[data-pr]').forEach(b => b.onclick = () => { const d = S.plan[b.dataset.pr] = S.plan[b.dataset.pr] || {}; d[b.dataset.pk] = pk(); save(); render(true); });
    app.querySelectorAll('[data-pd]').forEach(b => b.onclick = e => { e.preventDefault(); delete (S.plan[b.dataset.pd] || {})[b.dataset.pk]; save(); render(true); });
    $('#plAuto').onclick = () => { DAYS.forEach((_, di) => { const d = S.plan[di] = S.plan[di] || {}; PSL.forEach(([k]) => { if (!d[k]) d[k] = pk(); }); }); save(); render(true); toast('🎲 Η εβδομάδα γέμισε – άλλαξε ό,τι θέλεις'); };
    $('#plClr').onclick = () => { if (confirm('Να καθαριστεί το πρόγραμμα;')) { S.plan = {}; save(); render(true); } };
    $('#plList').onclick = () => { let n = 0; Object.values(S.plan).forEach(d => PSL.forEach(([k]) => { const x = BY[d[k]]; if (!x || !x.i) return; x.i.forEach(s => { if (s[0] === '#' || S.list.some(l => l.t === s)) return; S.list.push({ t: s, r: x.name }); n++; }); })); save(); toast(`🛒 ${n} υλικά στη λίστα`); };
  }
  function planPicker(id) {
    const m = $('#pmodal'), b = $('#pmbody'); m.hidden = false;
    b.innerHTML = `<h3 style="margin:0 36px 10px 0">📅 Πότε θα το φτιάξεις;</h3><div class="plpick">${DAYS.map((dn, di) => `<div><b class="small">${dn}</b>${PSL.map(([k, n]) => `<button class="fbtn" data-pd="${di}" data-pk="${k}">${n}</button>`).join('')}</div>`).join('')}</div>`;
    b.querySelectorAll('[data-pd]').forEach(x => x.onclick = () => { const d = S.plan[x.dataset.pd] = S.plan[x.dataset.pd] || {}; d[x.dataset.pk] = id; save(); m.hidden = true; toast(`📅 ${DAYS[x.dataset.pd]} – στο πρόγραμμα`); });
  }

  /* ---------- 👨‍🍳 λειτουργία μαγειρέματος ---------- */
  let CK = { id: null, n: 0, wl: null, speak: false };
  function cookOpen(id) {
    const x = BY[id]; if (!x || !x.p) return; CK = { id, n: 0, wl: null, speak: false };
    $('#cook').hidden = false; document.body.style.overflow = 'hidden';
    try { if (navigator.wakeLock) navigator.wakeLock.request('screen').then(w => CK.wl = w).catch(() => {}); } catch (e) {}
    cookDraw();
  }
  function cookClose() { $('#cook').hidden = true; document.body.style.overflow = ''; try { CK.wl && CK.wl.release(); } catch (e) {} try { speechSynthesis.cancel(); } catch (e) {} }
  function say(t) { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'el-GR'; u.rate = .95; speechSynthesis.speak(u); } catch (e) {} }
  function cookDraw() {
    const x = BY[CK.id], N = x.p.length, s = x.p[CK.n];
    $('#ckbody').innerHTML = `<div class="ckhead"><span class="big">${x.emoji}</span><div><b>${esc(x.name)}</b><div class="small mut">Βήμα ${CK.n + 1} από ${N}</div></div></div>
      <div class="ckbar"><span style="width:${(CK.n + 1) / N * 100}%"></span></div>
      <div class="ckstep">${stepHtml(s)}</div>
      ${x.i && x.i.length ? `<details class="ckings"><summary>🧺 Υλικά (${x.i.filter(i => i[0] !== '#').length})</summary><ul class="plain">${x.i.map(i => i[0] === '#' ? `<li><b>${esc(i.slice(1))}</b></li>` : `<li>${esc(i)}</li>`).join('')}</ul></details>` : ''}
      <div class="ckbtns"><button class="btn ghost" id="ckPrev" ${CK.n ? '' : 'disabled'}>◀ Πίσω</button><button class="btn ghost" id="ckSay">${CK.speak ? '🔊 Ανάγνωση: ON' : '🔈 Διάβασέ το'}</button>${CK.n < N - 1 ? '<button class="btn" id="ckNext">Επόμενο ▶</button>' : '<button class="btn" id="ckEnd">✅ Τέλος – καλή όρεξη!</button>'}</div>
      <p class="small mut" style="text-align:center;margin-top:10px">Η οθόνη μένει αναμμένη όσο μαγειρεύεις · πλήκτρα ← → για πλοήγηση</p>`;
    const go = d => { CK.n = Math.max(0, Math.min(N - 1, CK.n + d)); cookDraw(); if (CK.speak) say(x.p[CK.n]); };
    $('#ckPrev').onclick = () => go(-1);
    const nx = $('#ckNext'); if (nx) nx.onclick = () => go(1);
    const en = $('#ckEnd'); if (en) en.onclick = () => { cookClose(); toast('😋 Καλή όρεξη!'); };
    $('#ckSay').onclick = () => { CK.speak = !CK.speak; cookDraw(); if (CK.speak) say(s); else try { speechSynthesis.cancel(); } catch (e) {} };
    $('#ckbody').querySelectorAll('.tbtn').forEach(b => b.onclick = () => startTimer(+b.dataset.min, x.name));
  }
  $('#ckx').onclick = cookClose;
  addEventListener('keydown', e => { if ($('#cook').hidden) return; if (e.key === 'ArrowRight') { const b = $('#ckNext'); b && b.click(); } else if (e.key === 'ArrowLeft') { const b = $('#ckPrev'); b && !b.disabled && b.click(); } else if (e.key === 'Escape') cookClose(); });
  document.addEventListener('visibilitychange', () => { if (!$('#cook').hidden && document.visibilityState === 'visible' && navigator.wakeLock) navigator.wakeLock.request('screen').then(w => CK.wl = w).catch(() => {}); });

  /* ---------- 📲 εγκατάσταση PWA ---------- */
  let deferredInstall = null;
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; if (!location.hash || location.hash === '#/') render(true); });

  function group(gid) {
    const g = GROUPS.find(x => x.id === gid); if (!g) return notFound();
    return `<div class="crumbs"><a href="#/">Αρχική</a> › ${g.name}</div><h1>${g.emoji} ${g.name}</h1>
    ${g.cats.map(k => { const c = CATS[k]; const items = DB.filter(x => x.cat === k);
      return `<div class="sect"><h2>${c.emoji} ${c.name} <span class="mut small">(${items.length})</span></h2><a class="btn sm ghost" href="#/c/${k}">Όλα →</a></div>
      <p class="mut small" style="margin-top:-4px">${esc(c.desc)}</p>
      <div class="chips">${Object.entries(c.subs).map(([s, n]) => `<a class="fbtn" href="#/c/${k}/${s}">${esc(n)} (${items.filter(x => x.sub === s).length})</a>`).join('')}</div>
      <div class="grid">${items.slice(0, 6).map(x => card(x)).join('')}</div>`; }).join('')}`;
  }

  function category(k, sub, tag) {
    const c = CATS[k]; if (!c) return notFound();
    let items = DB.filter(x => x.cat === k);
    const tags = [...new Set(items.flatMap(x => x.tg || []))].filter(t => t !== 'αλκοόλ');
    if (sub && sub !== '_') items = items.filter(x => x.sub === sub);
    if (tag) items = items.filter(x => (x.tg || []).includes(tag));
    const g = groupOf(k);
    return `<div class="crumbs"><a href="#/">Αρχική</a> › <a href="#/g/${g.id}">${g.name}</a> › ${c.name}</div>
      <h1>${c.emoji} ${c.name}</h1><p class="mut">${esc(c.desc)}</p>
      <div class="chips"><a class="fbtn ${!sub || sub === '_' ? 'on' : ''}" href="#/c/${k}">Όλα</a>${Object.entries(c.subs).map(([s, n]) => `<a class="fbtn ${sub === s ? 'on' : ''}" href="#/c/${k}/${s}">${esc(n)}</a>`).join('')}</div>
      ${tags.length ? `<div class="chips">${tags.map(t => `<a class="fbtn ${tag === t ? 'on' : ''}" href="#/c/${k}/${sub || '_'}/${encodeURIComponent(tag === t ? '' : t)}">#${esc(t)}</a>`).join('')}</div>` : ''}
      <div class="chips qf"><span class="small mut">Γρήγορα φίλτρα:</span><button class="fbtn" data-qf="fast">⚡ Έως 30′</button><button class="fbtn" data-qf="easy">🙂 Εύκολα</button><button class="fbtn" data-qf="nist">✝️ Νηστίσιμα</button><button class="fbtn" data-qf="fav">❤️ Αγαπημένα μου</button><span class="small mut" id="qfN"></span></div>
      <div class="grid" id="cgrid">${items.map(x => card(x)).join('') || '<div class="empty">Τίποτα εδώ.</div>'}</div>`;
  }

  /* scaling of leading quantities */
  const FR = { '½': .5, '¼': .25, '¾': .75, '⅓': 1 / 3, '⅔': 2 / 3 };
  function fmt(n) { if (Math.abs(n - Math.round(n)) < .05) return String(Math.round(n)); const w = Math.floor(n), f = n - w; const m = [[.25, '¼'], [.5, '½'], [.75, '¾'], [1 / 3, '⅓'], [2 / 3, '⅔']].find(([v]) => Math.abs(f - v) < .06); return m ? (w ? w : '') + m[1] : n.toFixed(1).replace('.', ','); }
  function scaleLine(s, k) {
    if (k === 1) return esc(s);
    const m = s.match(/^(\d+(?:[.,]\d+)?)?(?:\s*([½¼¾⅓⅔]))?(?:\s*[–-]\s*(\d+(?:[.,]\d+)?))?/);
    if (!m || (!m[1] && !m[2])) return esc(s);
    let v = (m[1] ? parseFloat(m[1].replace(',', '.')) : 0) + (m[2] ? FR[m[2]] : 0);
    let out = fmt(v * k);
    if (m[3]) out += '–' + fmt(parseFloat(m[3].replace(',', '.')) * k);
    return `<b style="color:var(--gold)">${out}</b>` + esc(s.slice(m[0].length));
  }
  function stepHtml(s) {
    const m = s.match(/(\d+)(?:\s*[–-]\s*(\d+))?\s*λεπτ/);
    const t = m ? `<button class="tbtn" data-min="${m[2] || m[1]}">⏱ ${m[2] || m[1]}′</button>` : '';
    return esc(s) + t;
  }

  let curScale = 1;
  function recipe(id) {
    const x = BY[id]; if (!x) return notFound();
    const c = catOf(x), g = groupOf(x.cat);
    const dk = S.done[id] || { i: [], p: [] };
    const base = x.s || 1, sv = Math.max(1, Math.round(base * curScale));
    const box = (t, body, cls = '') => body ? `<div class="box ${cls}"><h3><span class="l">${t}</span></h3>${body}</div>` : '';
    const ul = a => a && a.length ? `<ul class="plain">${a.map(s => `<li>${esc(s)}</li>`).join('')}</ul>` : '';
    const info = x.info ? `<table class="kv">${Object.entries(x.info).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</table>` : '';
    const ing = x.i && x.i.length ? `<div class="box acc"><h3><span class="l">🧺 Υλικά</span>${x.s ? `<span class="scale noprint"><button data-sc="-">−</button><b>${sv}</b><button data-sc="+">+</button><span class="small mut">μερ.</span></span>` : ''}</h3>
      <ul class="ing">${x.i.map((s, n) => s[0] === '#' ? `<li class="grp">${esc(s.slice(1))}</li>` : `<li data-i="${n}" class="${dk.i.includes(n) ? 'done' : ''}"><span class="cb">${dk.i.includes(n) ? '✓' : ''}</span><span>${scaleLine(s, sv / base)}</span></li>`).join('')}</ul>
      <div class="row noprint" style="margin-top:10px"><button class="btn sm" id="addList">🛒 Στη λίστα αγορών</button></div></div>` : '';
    const steps = x.p && x.p.length ? `<div class="box acc"><h3><span class="l">👨‍🍳 ${x.cat === 'krasia' || x.cat === 'mpyres' || x.cat === 'apostagmata' || (x.cat === 'galaktokomika' && x.sub !== 'spitika') ? 'Πώς το σερβίρεις' : 'Τρόπος παρασκευής'}</span></h3><ol class="steps">${x.p.map((s, n) => `<li data-p="${n}" class="${dk.p.includes(n) ? 'done' : ''}">${stepHtml(s)}</li>`).join('')}</ol></div>` : '';
    const sides = (x.sd || []).filter(i => BY[i]);
    const pairs = (x.pr || []).filter(i => BY[i]);
    const rev = (REV[id] || []).filter(i => !pairs.includes(i) && !sides.includes(i));
    const chips = [x.t && `⏱ ${x.t}`, x.s && `🍽 ${x.s} μερίδες`, x.l && `${LEVELS[x.l]}`].filter(Boolean).map(t => `<span class="chip">${esc(t)}</span>`).join('')
      + (x.m || []).map(m => { const s = SLOTS.find(z => z.id === m); return `<a class="chip red" href="#/meals/${m}">${s.emoji} ${s.name}</a>`; }).join('')
      + (x.tg || []).map(t => `<a class="chip" href="#/s/${encodeURIComponent(t)}">#${esc(t)}</a>`).join('');
    const isFav = S.fav.includes(id);
    return `<div class="crumbs"><a href="#/">Αρχική</a> › <a href="#/g/${g.id}">${g.name}</a> › <a href="#/c/${x.cat}">${c.name}</a> › <a href="#/c/${x.cat}/${x.sub}">${esc(c.subs[x.sub] || '')}</a></div>
    <div class="rhead"><span class="big">${x.emoji}</span><div style="flex:1;min-width:0"><h1>${esc(x.name)}</h1><p>${esc(x.d || '')}</p><div class="meta">${chips}</div>
      <div class="row noprint" style="margin-top:12px">${x.p && x.p.length > 1 && x.i ? '<button class="btn sm" id="cookBtn">👨‍🍳 Μαγείρεψέ το βήμα-βήμα</button>' : ''}<button class="btn sm ${isFav ? '' : 'ghost'}" id="fav">${isFav ? '❤️ Στα αγαπημένα' : '🤍 Αγαπημένο'}</button>${x.i && x.i.length ? '<button class="btn sm ghost" id="toPlan">📅 Στο πρόγραμμα</button>' : ''}<button class="btn sm ghost" id="share">📤 Κοινοποίηση</button><button class="btn sm ghost" id="print">🖨️ Εκτύπωση</button><button class="btn sm ghost" id="copy">📋 Αντιγραφή</button>${(dk.i.length || dk.p.length) ? '<button class="btn sm ghost" id="reset">↺ Μηδενισμός</button>' : ''}</div></div></div>
    <div class="box noprint" style="margin-top:14px"><h3><span class="l">📷 Φωτογραφία</span></h3><div id="photoBox"></div></div>
    <div class="rgrid"><div>
      ${box('ℹ️ Στοιχεία', info)}
      ${x.use && x.use.length ? box('🍽️ Για τι κάνει', `<div class="meta">${x.use.map(u => `<a class="chip" href="#/s/${encodeURIComponent(u)}">${esc(u)}</a>`).join('')}</div>`, 'cyan') : ''}
      ${x.age ? box('⏳ Ωρίμανση / παλαίωση', `<p style="margin:0">${esc(x.age)}</p>`, 'gold') : ''}
      ${box('🔪 Κοπή & προετοιμασία', ul(x.cut), 'gold')}
      ${box('🫙 Μαρινάδα', ul(x.mar), 'gold')}
      ${ing}
    </div><div>
      ${steps}
      ${box('🔥 Ψήσιμο & βαθμοί', ul(x.ck), 'gold')}
      ${x.srv && x.srv.length ? box('🥃 Πώς σερβίρεται (όλοι οι τρόποι)', `<table class="kv">${x.srv.map(s => `<tr><td><b>${esc(s[0])}</b></td><td>${esc(s[1])}</td></tr>`).join('')}</table>`, 'cyan') : ''}
      ${x.mk && x.mk.length ? box(x.cat === 'krasia' ? '🍇 Πώς φτιάχνεται (οινοποίηση)' : x.cat === 'mpyres' ? '🌾 Πώς φτιάχνεται (ζυθοποίηση)' : '🏭 Πώς φτιάχνεται / παραγωγή', `<ol class="steps">${x.mk.map(s => `<li>${esc(s)}</li>`).join('')}</ol>`, 'gold') : ''}
      ${x.rem && x.rem.length ? box('🫖 Παραδοσιακή χρήση (γιατροσόφι)', ul(x.rem) + '<p class="small mut" style="margin:8px 0 0">Λαϊκή παράδοση – δεν αντικαθιστά ιατρική συμβουλή.</p>', 'cyan') : ''}
      ${x.warn && x.warn.length ? box('⚠️ Προσοχή', ul(x.warn), 'acc') : ''}
      ${x.sv ? box('🍽️ Σερβίρισμα', `<div class="sv">${esc(x.sv)}</div>`, 'cyan') : ''}
      ${sides.length ? box('🍟 Συνοδευτικά & σάλτσες (πώς φτιάχνονται)', `<div class="links">${sides.map(lnk).join('')}</div>`, 'cyan') : ''}
      ${pairs.length ? box(x.cat === 'krasia' || x.cat === 'mpyres' || x.cat === 'apostagmata' || x.cat === 'cocktails' ? '🍽️ Ταιριάζει με' : '🥂 Τι να πιεις μαζί', `<div class="links">${pairs.map(lnk).join('')}</div>`, 'cyan') : ''}
      ${rev.length ? box('🔗 Το προτείνουν επίσης', `<div class="links">${rev.slice(0, 18).map(lnk).join('')}</div>`) : ''}
      ${box('💡 Μυστικά & συμβουλές', ul(x.tip))}
      <div class="box noprint"><h3><span class="l">📝 Οι σημειώσεις μου</span><span class="stars" id="stars">${[1, 2, 3, 4, 5].map(n => `<button data-st="${n}" class="${(S.rate[id] || 0) >= n ? 'on' : ''}" title="${n}/5">★</button>`).join('')}</span></h3>
        <textarea class="inp" id="note" rows="3" placeholder="Π.χ. «λιγότερο αλάτι», «έβαλα και μανιτάρια», «το λάτρεψαν τα παιδιά»… (μένει μόνο σε αυτή τη συσκευή)">${esc(S.notes[id] || '')}</textarea></div>
    </div></div>
    <div class="sect"><h2>Παρόμοια</h2></div><div class="grid">${DB.filter(z => z.sub === x.sub && z.cat === x.cat && z.id !== id).slice(0, 6).map(z => card(z)).join('')}</div>`;
  }

  function wireRecipe(id) {
    const x = BY[id]; if (!x) return;
    const dk = S.done[id] = S.done[id] || { i: [], p: [] };
    S.recent = [id].concat((S.recent || []).filter(i => i !== id)).slice(0, 20); save();
    const cb = $('#cookBtn'); if (cb) cb.onclick = () => cookOpen(id);
    const tp = $('#toPlan'); if (tp) tp.onclick = () => planPicker(id);
    const sh = $('#share'); if (sh) sh.onclick = () => { const url = location.href.split('#')[0] + '#/r/' + id, data = { title: x.name + ' · ΓΕΥΣΕΙΣ 360°', text: x.d || x.name, url };
      if (navigator.share) navigator.share(data).catch(() => {}); else (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => toast('🔗 Ο σύνδεσμος αντιγράφηκε'), () => toast(url)); };
    const nt = $('#note'); if (nt) { let tmo; nt.oninput = () => { clearTimeout(tmo); tmo = setTimeout(() => { const v = nt.value.trim(); if (v) S.notes[id] = v; else delete S.notes[id]; save(); }, 400); }; }
    app.querySelectorAll('[data-st]').forEach(b => b.onclick = () => { const n = +b.dataset.st; S.rate[id] = S.rate[id] === n ? 0 : n; if (!S.rate[id]) delete S.rate[id]; save(); app.querySelectorAll('[data-st]').forEach(z => z.classList.toggle('on', (S.rate[id] || 0) >= +z.dataset.st)); toast(S.rate[id] ? `⭐ ${S.rate[id]}/5` : 'Η βαθμολογία αφαιρέθηκε'); });
    const pb = $('#photoBox'); if (pb) showPhoto(pb, x.name, x.wp || (window.WP || {})[x.id]);
    const tog = (arr, n) => { const i = arr.indexOf(n); i < 0 ? arr.push(n) : arr.splice(i, 1); };
    app.querySelectorAll('ul.ing li[data-i]').forEach(li => li.onclick = () => { tog(dk.i, +li.dataset.i); save(); li.classList.toggle('done'); li.firstChild.textContent = li.classList.contains('done') ? '✓' : ''; });
    app.querySelectorAll('ol.steps li').forEach(li => li.onclick = e => { if (e.target.closest('.tbtn')) return; tog(dk.p, +li.dataset.p); save(); li.classList.toggle('done'); });
    app.querySelectorAll('.tbtn').forEach(b => b.onclick = () => startTimer(+b.dataset.min, x.name));
    app.querySelectorAll('[data-sc]').forEach(b => b.onclick = () => { const base = x.s || 1; let sv = Math.max(1, Math.round(base * curScale) + (b.dataset.sc === '+' ? 1 : -1)); curScale = sv / base; render(true); });
    const f = $('#fav'); if (f) f.onclick = () => { const i = S.fav.indexOf(id); i < 0 ? S.fav.push(id) : S.fav.splice(i, 1); save(); toast(i < 0 ? '❤️ Προστέθηκε στα αγαπημένα' : 'Αφαιρέθηκε'); render(true); };
    const p = $('#print'); if (p) p.onclick = () => print();
    const r = $('#reset'); if (r) r.onclick = () => { S.done[id] = { i: [], p: [] }; save(); render(true); };
    const cp = $('#copy'); if (cp) cp.onclick = () => {
      const t = [x.name, x.d, x.i ? '\nΥΛΙΚΑ:\n' + x.i.map(s => (s[0] === '#' ? s.slice(1) : '• ' + s)).join('\n') : '', x.p ? '\nΤΡΟΠΟΣ:\n' + x.p.map((s, n) => `${n + 1}. ${s}`).join('\n') : '', x.sv ? '\nΣΕΡΒΙΡΙΣΜΑ: ' + x.sv : ''].join('\n');
      (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast('📋 Αντιγράφηκε'), () => toast('Δεν ήταν δυνατή η αντιγραφή'));
    };
    const al = $('#addList'); if (al) al.onclick = () => {
      const base = x.s || 1, k = Math.max(1, Math.round(base * curScale)) / base; let n = 0;
      x.i.forEach(s => { if (s[0] === '#') return; const txt = scaleLine(s, k).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&'); if (!S.list.some(l => l.t === txt)) { S.list.push({ t: txt, r: x.name }); n++; } });
      save(); toast(`🛒 ${n} υλικά στη λίστα`);
    };
  }

  function meals(sl) {
    sl = sl || slotNow(); const now = slotNow();
    const slot = SLOTS.find(s => s.id === sl) || SLOTS[0];
    const tagged = DB.filter(x => (x.m || []).includes(slot.id));
    const byCat = {}; tagged.forEach(x => (byCat[x.cat] = byCat[x.cat] || []).push(x));
    return `<h1>🕐 Τι να φάω & να πιω – όλη η μέρα</h1>
    <div class="slots">${SLOTS.map(s => `<a class="slot ${s.id === slot.id ? 'on' : ''} ${s.id === now ? 'now' : ''}" href="#/meals/${s.id}"><span class="e">${s.emoji}</span><b>${s.name}</b><small>${String(s.from).padStart(2, '0')}:00–${String(s.to % 24).padStart(2, '0')}:00</small></a>`).join('')}</div>
    <div class="box cyan" style="margin-top:12px"><b>${slot.emoji} ${slot.name}:</b> <span class="mut">${esc(slot.hint)}</span></div>
    <div class="row"><button class="btn" id="plan">🎲 Φτιάξε μου πρόγραμμα ημέρας</button></div>
    <div id="planOut"></div>
    <div class="sect"><h2>Έτοιμοι συνδυασμοί για ${slot.name.toLowerCase()}</h2></div>
    <div class="grid">${(COMBOS[slot.id] || []).map(c => `<div class="combo"><b>${esc(c.t)}</b><p>${esc(c.x)}</p><div class="links">${c.ids.map(lnk).join('')}</div></div>`).join('')}</div>
    <div class="sect"><h2>Όλες οι επιλογές (${tagged.length})</h2></div>
    ${Object.keys(CATS).filter(k => byCat[k]).map(k => `<h3 style="margin-top:14px">${CATS[k].emoji} ${CATS[k].name}</h3><div class="links">${byCat[k].map(x => lnk(x.id)).join('')}</div>`).join('')}`;
  }
  function planDay() {
    return `<div class="sect"><h2>📅 Το πρόγραμμά σου σήμερα</h2></div><div class="plan">${SLOTS.map(s => { const c = pick(COMBOS[s.id]); return `<div class="pr"><span class="e">${s.emoji}</span><div><b>${s.name}</b> · <span class="mut">${esc(c.t)}</span><p class="small mut" style="margin:2px 0 6px">${esc(c.x)}</p><div class="links">${c.ids.map(lnk).join('')}</div></div></div>`; }).join('')}</div>`;
  }

  function guide() {
    return `<h1>📘 Οδηγός</h1><p class="mut">Κοπές κρέατος, βαθμοί ψησίματος, μαρινάδες, ταιριάσματα κρασιού, θερμοκρασίες, μετρήσεις.</p>
      <div class="chips">${GUIDE.map(g => `<a class="fbtn" href="#/guide" data-jump="${g.id}">${esc(g.t)}</a>`).join('')}</div>
      ${GUIDE.map(g => `<div class="box" id="g_${g.id}"><h3>${esc(g.t)}</h3>${g.r ? `<div class="tscroll"><table class="gt"><tr>${g.h.map(h => `<th>${esc(h)}</th>`).join('')}</tr>${g.r.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table></div>` : ''}${g.list ? `<ul class="plain">${g.list.map(l => `<li>${esc(l)}</li>`).join('')}</ul>` : ''}</div>`).join('')}`;
  }

  function kouzines(tab, cont) {
    tab = tab === 'kosmos' ? 'kosmos' : 'ellada';
    const conts = [...new Set(COUNTRIES.map(c => c.c))];
    const list = tab === 'ellada' ? REGIONS : COUNTRIES.filter(c => !cont || c.c === cont);
    const dish = k => { const x = k[2] && BY[k[2]]; return `<li class="kdish" data-q="${esc(norm(k[0] + ' ' + (k[1] || '')))}">${x ? `<a href="#/r/${x.id}">${x.emoji} <b>${esc(k[0])}</b></a>` : `<b>${esc(k[0])}</b>`}${k[1] ? ` <span class="mut small">– ${esc(k[1])}</span>` : ''}${x ? ' <span class="chip red" style="font-size:10px">συνταγή</span>' : ''} <button class="pbtn" data-ph="${esc(k[0])}" data-wp="${esc((window.KWP || {})[k[0]] || (k[2] && (window.WP || {})[k[2]]) || '')}" title="Φωτογραφία">📷</button></li>`; };
    return `<h1>🗺️ Παραδοσιακή κουζίνα</h1><p class="mut">Τα χαρακτηριστικά φαγητά και ποτά κάθε περιοχής της Ελλάδας και κάθε χώρας. Όσα έχουν <span class="chip red" style="font-size:10px">συνταγή</span> ανοίγουν με ένα κλικ.</p>
      <div class="chips"><a class="fbtn ${tab === 'ellada' ? 'on' : ''}" href="#/kouzines/ellada">🇬🇷 Ελλάδα (${REGIONS.length} περιοχές)</a><a class="fbtn ${tab === 'kosmos' ? 'on' : ''}" href="#/kouzines/kosmos">🌐 Κόσμος (${COUNTRIES.length} χώρες)</a></div>
      ${tab === 'kosmos' ? `<div class="chips"><a class="fbtn ${!cont ? 'on' : ''}" href="#/kouzines/kosmos">Όλες</a>${conts.map(c => `<a class="fbtn ${cont === c ? 'on' : ''}" href="#/kouzines/kosmos/${encodeURIComponent(c)}">${esc(c)}</a>`).join('')}</div>` : ''}
      <input class="inp" id="kq" placeholder="Φίλτρο: π.χ. Κρήτη, παέγια, σούπα…" style="margin:6px 0 12px">
      <div class="grid" id="kgrid">${list.map(r => `<div class="box kreg" data-q="${esc(norm(r.n + ' ' + (r.d || '') + ' ' + (r.c || '')))}" style="margin:0"><h3><span class="l">${r.e} ${esc(r.n)}</span>${r.c ? `<span class="chip gold">${esc(r.c)}</span>` : ''}</h3>${r.d ? `<p class="mut small" style="margin:0 0 8px">${esc(r.d)}</p>` : ''}<ul class="plain">${r.k.map(dish).join('')}</ul></div>`).join('')}</div>`;
  }

  function giortes(sel) {
    const H = window.HOLIDAYS || [];
    const sec = (t, ids) => { const l = ids.filter(i => BY[i]); return l.length ? `<div style="margin-top:10px"><b class="small" style="color:var(--gold)">${t}</b><div class="links" style="margin-top:6px">${l.map(lnk).join('')}</div></div>` : ''; };
    const list = sel ? H.filter(h => h.id === sel) : H;
    return `<h1>🎉 Γιορτές & έθιμα – τι τρώμε</h1><p class="mut">Τα παραδοσιακά φαγητά, γλυκά και ποτά κάθε γιορτής, με τα έθιμα. Πάτα σε οποιοδήποτε για τη συνταγή.</p>
      <div class="chips"><a class="fbtn ${!sel ? 'on' : ''}" href="#/giortes">Όλες</a>${H.map(h => `<a class="fbtn ${sel === h.id ? 'on' : ''}" href="#/giortes/${h.id}">${h.e} ${esc(h.n)}</a>`).join('')}</div>
      <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(320px,1fr))">${list.map(h => `<div class="box acc" style="margin:0"><h3><span class="l">${h.e} ${esc(h.n)}</span><span class="chip gold">${esc(h.w)}</span></h3>
        <p class="mut small" style="margin:0">${esc(h.d)}</p>
        ${sec('🍽️ Φαγητά', h.f)}${sec('🍰 Γλυκά', h.s)}${sec('🥂 Ποτά & ροφήματα', h.dr)}
        ${h.c && h.c.length ? `<div style="margin-top:10px"><b class="small" style="color:var(--gold)">📜 Έθιμα</b><ul class="plain small">${h.c.map(c => `<li>${esc(c)}</li>`).join('')}</ul></div>` : ''}</div>`).join('')}</div>`;
  }

  function favs() {
    const it = S.fav.map(i => BY[i]).filter(Boolean);
    const rated = Object.keys(S.rate).filter(i => BY[i]).sort((a, b) => S.rate[b] - S.rate[a]);
    const noted = Object.keys(S.notes).filter(i => BY[i]);
    return `<h1>❤️ Αγαπημένα</h1>${it.length ? `<div class="grid">${it.map(x => card(x)).join('')}</div>` : '<div class="empty"><div class="e">🤍</div>Πάτα «Αγαπημένο» σε μια συνταγή για να τη βρίσκεις εδώ.</div>'}
      ${rated.length ? `<div class="sect"><h2>⭐ Οι βαθμολογίες μου</h2></div><div class="grid">${rated.map(i => card(BY[i])).join('')}</div>` : ''}
      ${noted.length ? `<div class="sect"><h2>📝 Συνταγές με σημειώσεις μου</h2></div><div class="grid">${noted.map(i => card(BY[i], `<span class="match">📝 ${esc(S.notes[i].slice(0, 80))}</span>`)).join('')}</div>` : ''}`;
  }
  function list() {
    return `<h1>🛒 Λίστα αγορών</h1>
      <div class="row" style="margin-bottom:10px"><input class="inp" id="newItem" placeholder="Πρόσθεσε κάτι…" style="flex:1;min-width:180px"><button class="btn" id="addItem">＋</button></div>
      ${S.list.length ? `<div class="box"><ul class="ing list">${S.list.map((l, n) => `<li data-l="${n}" class="${l.d ? 'done' : ''}"><span class="cb">${l.d ? '✓' : ''}</span><span>${esc(l.t)}${l.r ? ` <span class="small mut">· ${esc(l.r)}</span>` : ''}</span><button class="x" data-x="${n}">✕</button></li>`).join('')}</ul></div>
      <div class="row"><button class="btn ghost" id="clrDone">Διαγραφή τσεκαρισμένων</button><button class="btn ghost" id="copyList">📋 Αντιγραφή</button><button class="btn ghost" id="clrAll">Άδειασμα λίστας</button></div>` : '<div class="empty"><div class="e">🛒</div>Η λίστα είναι άδεια. Άνοιξε μια συνταγή και πάτα «Στη λίστα αγορών».</div>'}`;
  }
  function wireList() {
    const add = () => { const v = $('#newItem').value.trim(); if (v) { S.list.push({ t: v }); save(); render(true); } };
    $('#addItem').onclick = add; $('#newItem').onkeydown = e => { if (e.key === 'Enter') add(); };
    app.querySelectorAll('li[data-l]').forEach(li => li.onclick = e => { const n = +li.dataset.l; if (e.target.dataset.x != null) { S.list.splice(n, 1); } else S.list[n].d = !S.list[n].d; save(); render(true); });
    const b = (id, f) => { const el = $('#' + id); if (el) el.onclick = f; };
    b('clrDone', () => { S.list = S.list.filter(l => !l.d); save(); render(true); });
    b('clrAll', () => { if (confirm('Να αδειάσει όλη η λίστα;')) { S.list = []; save(); render(true); } });
    b('copyList', () => { const t = S.list.filter(l => !l.d).map(l => '• ' + l.t).join('\n'); navigator.clipboard && navigator.clipboard.writeText(t).then(() => toast('📋 Αντιγράφηκε')); });
  }

  function fridge() {
    return `<h1>🧊 Τι φτιάχνω με ό,τι έχω;</h1><p class="mut">Γράψε τι έχεις (χωρισμένα με κόμμα) και θα σου βρω συνταγές ταξινομημένες κατά πόσα υλικά ταιριάζουν.</p>
      <div class="row"><input class="inp" id="frIn" placeholder="π.χ. κιμάς, ντομάτα, ρύζι, φέτα" style="flex:1;min-width:200px" value="${esc(sessionStorage.getItem('fr') || '')}"><button class="btn" id="frGo">Βρες</button></div>
      <div class="chips" style="margin-top:8px">${['αυγά', 'κοτόπουλο', 'κιμάς', 'πατάτες', 'φέτα', 'ντομάτα', 'ρύζι', 'μελιτζάνα', 'λεμόνι', 'γιαούρτι', 'χταπόδι', 'σοκολάτα', 'espresso', 'ρούμι', 'τζιν'].map(t => `<button class="fbtn" data-add="${t}">+ ${t}</button>`).join('')}</div>
      <div id="frOut"></div>`;
  }
  function runFridge() {
    const v = $('#frIn').value; try { sessionStorage.setItem('fr', v); } catch (e) {}
    const terms = v.split(/[,،;\n]+/).map(s => norm(s.trim())).filter(s => s.length > 1);
    if (!terms.length) { $('#frOut').innerHTML = ''; return; }
    const stem = t => t.length > 4 ? t.slice(0, -1) : t;
    const res = DB.filter(x => x.i && x.i.length).map(x => { const ing = norm(x.i.join(' | ')); const hit = terms.filter(t => ing.includes(stem(t))); return { x, hit }; })
      .filter(r => r.hit.length).sort((a, b) => b.hit.length - a.hit.length || a.x.i.length - b.x.i.length).slice(0, 60);
    $('#frOut').innerHTML = res.length ? `<div class="sect"><h2>${res.length} προτάσεις</h2></div><div class="grid">${res.map(r => card(r.x, `<span class="match">✓ ${r.hit.length}/${terms.length}: ${esc(r.hit.join(', '))}</span>`)).join('')}</div>` : '<div class="empty">Δεν βρέθηκε κάτι. Δοκίμασε άλλα υλικά.</div>';
  }

  function search(q) {
    const t = norm(q).trim(); if (!t) return home();
    const words = t.split(/\s+/);
    const score = x => { const n = norm(x.name), tg = norm((x.tg || []).join(' ')), d = norm(x.d), i = norm((x.i || []).join(' ') + ' ' + Object.values(x.info || {}).join(' ')), c = norm(CATS[x.cat].name + ' ' + (CATS[x.cat].subs[x.sub] || ''));
      let s = 0; for (const w of words) { if (n.includes(w)) s += 10; else if (tg.includes(w) || c.includes(w)) s += 5; else if (d.includes(w)) s += 3; else if (i.includes(w)) s += 1; else return 0; } return s; };
    const res = DB.map(x => ({ x, s: score(x) })).filter(r => r.s).sort((a, b) => b.s - a.s);
    return `<h1>🔍 «${esc(q)}»</h1><p class="mut">${res.length} αποτελέσματα</p><div class="grid">${res.map(r => card(r.x)).join('') || '<div class="empty"><div class="e">🤷</div>Δεν βρέθηκε. Δοκίμασε άλλη λέξη.</div>'}</div>`;
  }
  const notFound = () => '<div class="empty"><div class="e">🍽️</div>Δεν βρέθηκε η σελίδα. <a href="#/" style="color:var(--red2)">Αρχική</a></div>';

  /* ---------- φωτογραφίες: ΜΟΝΟ με συγκατάθεση (opt-in), από Wikimedia Commons ----------
     Κανένα αίτημα προς τρίτους δεν γίνεται πριν πατήσει ο χρήστης «Δείξε φωτογραφία»
     ή ενεργοποιήσει ο ίδιος την αυτόματη φόρτωση (αποθηκεύεται μόνο στη συσκευή του). */
  const PH = {};
  const cleanQ = s => String(s).replace(/\(.*?\)/g, '').split(/\s[–\/-]\s|\//)[0].trim();
  const stripTags = s => String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const PQ = 'action=query&format=json&origin=*&prop=pageimages%7Cinfo&piprop=thumbnail%7Cname&pithumbsize=640&inprop=url&redirects=1';
  const okPage = p => p && p.thumbnail && p.pageimage && !/\.svg$/i.test(p.pageimage);
  const asRes = (lang, p) => ({ lang, title: p.title, page: p.fullurl, thumb: p.thumbnail.source, file: p.pageimage });
  // κλήση API: ταυτοποίηση εφαρμογής (Api-User-Agent, όπως ζητά η Wikimedia), σφάλμα σε HTTP≠200 (π.χ. 429 = προσωρινό όριο)
  async function api(url) {
    const res = await fetch(url, { referrerPolicy: 'no-referrer', headers: { 'Api-User-Agent': 'Gefseis360/1.0 (https://xomagr-eng.github.io/gefseis-360/)' } });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  }
  async function wikiTitle(lang, title) {
    const j = await api(`https://${lang}.wikipedia.org/w/api.php?${PQ}&titles=${encodeURIComponent(title)}`);
    const p = Object.values((j.query || {}).pages || {})[0];
    return okPage(p) ? asRes(lang, p) : null;
  }
  // ο τίτλος του λήμματος πρέπει να περιέχει (ρίζα) λέξης του πιάτου – αλλιώς «δεν βρέθηκε» αντί για λάθος εικόνα
  const stems = (q, min = 4) => norm(q).split(/[^a-zα-ω0-9]+/).filter(w => w.length >= min && !['σαλατα', 'σουπα', 'σπιτικο', 'σπιτικη', 'κλασικο', 'χοιρινο', 'with', 'style', 'the', 'and'].includes(w)).map(w => w.length > 4 ? w.slice(0, w.length - 1) : w);
  async function wikiSearch(lang, q) {
    const j = await api(`https://${lang}.wikipedia.org/w/api.php?${PQ}&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrlimit=6`);
    const st = stems(q), nq = norm(q); if (!st.length) return null;
    const fits = t => { const main = t.replace(/\(.*?\)/g, ''); return norm(main).includes(st[0]) && stems(main, 3).every(s => nq.includes(s)); };
    const pg = Object.values((j.query || {}).pages || {}).sort((a, b) => a.index - b.index).find(p => okPage(p) && fits(p.title));
    return pg ? asRes(lang, pg) : null;
  }
  async function fileMeta(r) {
    const u = `https://${r.lang}.wikipedia.org/w/api.php?action=query&format=json&origin=*&titles=${encodeURIComponent('File:' + r.file)}&prop=imageinfo&iiprop=extmetadata%7Curl`;
    const j = await api(u);
    const ii = ((Object.values(j.query.pages)[0] || {}).imageinfo || [])[0] || {}, m = ii.extmetadata || {};
    return { artist: stripTags((m.Artist || {}).value) || 'άγνωστος δημιουργός', license: stripTags((m.LicenseShortName || {}).value) || 'ελεύθερη άδεια', src: ii.descriptionurl || r.page };
  }
  // απευθείας αρχείο της Wikimedia Commons ('File:Όνομα.jpg') – για προϊόντα χωρίς δικό τους λήμμα
  async function commonsFile(file) {
    const j = await api(`https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&titles=${encodeURIComponent(file)}&prop=imageinfo&iiprop=url%7Cextmetadata&iiurlwidth=640`);
    const p = Object.values((j.query || {}).pages || {})[0] || {}, ii = (p.imageinfo || [])[0];
    if (!ii) return null;
    const m = ii.extmetadata || {};
    return { lang: 'commons', title: p.title.replace(/^File:/, '').replace(/\.\w+$/, ''), page: ii.descriptionurl, thumb: ii.thumburl || ii.url, file: p.title,
      meta: { artist: stripTags((m.Artist || {}).value) || 'άγνωστος δημιουργός', license: stripTags((m.LicenseShortName || {}).value) || 'ελεύθερη άδεια', src: ii.descriptionurl } };
  }
  async function findPhoto(name, alt) {
    const q = cleanQ(name);
    if (PH[q] !== undefined) return PH[q];
    let r = null, err = false;
    if (alt === '-') return (PH[q] = null);
    if (alt && /^File:/.test(alt)) { try { r = await commonsFile(alt); } catch (e) { return { error: true }; } if (r) return (PH[q] = r); }
    if (alt) { const m = /^el:(.+)$/.exec(alt); try { r = m ? await wikiTitle('el', m[1]) : await wikiTitle('en', alt); } catch (e) { err = true; } }
    if (!r) for (const lang of ['el', 'en']) { try { r = await wikiSearch(lang, q); } catch (e) { err = true; } if (r) break; }
    if (!r && err) return { error: true };            // προσωρινό πρόβλημα δικτύου/ορίου – δεν αποθηκεύεται
    if (r) { try { r.meta = await fileMeta(r); } catch (e) { r.meta = { artist: '', license: '', src: r.page }; } }
    return (PH[q] = r);
  }
  const retryHtml = '<div class="mut small">⚠️ Η Wikimedia δεν απάντησε αυτή τη στιγμή (ή δεν υπάρχει σύνδεση). <button class="btn sm ghost" data-phgo>Δοκίμασε ξανά</button></div>';
  function photoHtml(r) {
    if (r && r.error) return retryHtml;
    if (!r) return '<div class="mut small">Δεν βρέθηκε αξιόπιστη φωτογραφία για αυτό το πιάτο.</div>';
    return `<figure class="photo" style="margin:0"><img src="${esc(r.thumb)}" alt="${esc(r.title)}" referrerpolicy="no-referrer" onerror="this.outerHTML='<div class=&quot;mut small&quot; style=&quot;padding:10px&quot;>⚠️ Η εικόνα δεν φορτώθηκε – δοκίμασε αργότερα.</div>'">
      <figcaption class="cap">${r.lang === 'commons' ? 'Φωτογραφία' : 'Ενδεικτική φωτογραφία από το λήμμα'} «<a href="${esc(r.page)}" target="_blank" rel="noopener noreferrer">${esc(r.title)}</a>» · ${esc(r.meta.artist)} · ${esc(r.meta.license)} · <a href="${esc(r.meta.src)}" target="_blank" rel="noopener noreferrer">Wikimedia Commons</a>
      ${S.photoAuto ? ' · <a href="#" data-phoff>απενεργοποίηση αυτόματων φωτογραφιών</a>' : ''}</figcaption></figure>`;
  }
  const consentHtml = () => `<div class="consent">Η φωτογραφία φορτώνεται από τη <b>Wikimedia Commons</b> (Wikipedia). Αν πατήσεις το κουμπί, ο browser σου θα συνδεθεί στους servers της Wikimedia, που θα δουν τη διεύθυνση IP σου (<a href="https://foundation.wikimedia.org/wiki/Policy:Privacy_policy" target="_blank" rel="noopener noreferrer" style="color:var(--mut)">πολιτική απορρήτου</a>). Χωρίς το κλικ σου δεν στέλνεται τίποτα.
    <div class="row" style="margin-top:10px"><button class="btn sm" data-phgo>📷 Δείξε φωτογραφία</button></div>
    <label><input type="checkbox" data-phauto ${S.photoAuto ? 'checked' : ''}> Να φορτώνουν αυτόματα οι φωτογραφίες (αποθηκεύεται μόνο σε αυτή τη συσκευή)</label></div>`;
  async function loadPhotoInto(el, name, alt) {
    el.innerHTML = '<div class="mut small"><span class="spin"></span>Αναζήτηση φωτογραφίας…</div>';
    const r = await findPhoto(name, alt);
    el.innerHTML = photoHtml(r); wirePhoto(el, name, alt);
  }
  function wirePhoto(el, name, alt) {
    const go = el.querySelector('[data-phgo]'); if (go) go.onclick = () => loadPhotoInto(el, name, alt);
    const au = el.querySelector('[data-phauto]'); if (au) au.onchange = () => { S.photoAuto = au.checked; save(); if (au.checked) loadPhotoInto(el, name, alt); };
    const off = el.querySelector('[data-phoff]'); if (off) off.onclick = e => { e.preventDefault(); S.photoAuto = false; save(); toast('Οι φωτογραφίες θα φορτώνουν μόνο με κλικ'); el.innerHTML = consentHtml(); wirePhoto(el, name, alt); };
  }
  function showPhoto(el, name, alt) { if (S.photoAuto) loadPhotoInto(el, name, alt); else { el.innerHTML = consentHtml(); wirePhoto(el, name, alt); } }
  function photoModal(name, alt) {
    const m = $('#pmodal'), b = $('#pmbody'); m.hidden = false;
    b.innerHTML = `<h3 style="margin:0 36px 10px 0">📷 ${esc(name)}</h3><div id="pmph"></div>`;
    showPhoto($('#pmph'), name, alt);
  }
  $('#pmx').onclick = () => { $('#pmodal').hidden = true; };
  $('#pmodal').onclick = e => { if (e.target.id === 'pmodal') $('#pmodal').hidden = true; };

  /* ---------- timer ---------- */
  let T = { left: 0, run: false, iv: null, name: '' };
  function beep() { try { const a = new (window.AudioContext || window.webkitAudioContext)(); [0, .35, .7].forEach(d => { const o = a.createOscillator(), g = a.createGain(); o.frequency.value = 880; o.connect(g); g.connect(a.destination); g.gain.setValueAtTime(.3, a.currentTime + d); g.gain.exponentialRampToValueAtTime(.001, a.currentTime + d + .3); o.start(a.currentTime + d); o.stop(a.currentTime + d + .3); }); } catch (e) {} if (navigator.vibrate) navigator.vibrate([300, 150, 300]); }
  function drawT() { const m = Math.floor(T.left / 60), s = T.left % 60; $('#tt').textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`; $('#tPause').textContent = T.run ? '⏸' : '▶'; }
  function startTimer(min, name) {
    clearInterval(T.iv); T = { left: min * 60, run: true, name }; $('#timer').classList.add('show'); $('#timer').classList.remove('ring'); drawT(); toast(`⏱ ${min}′ – ${name}`);
    T.iv = setInterval(() => { if (!T.run) return; T.left--; drawT(); if (T.left <= 0) { clearInterval(T.iv); T.run = false; $('#timer').classList.add('ring'); beep(); toast('⏰ Έτοιμο! ' + T.name); } }, 1000);
  }
  $('#tPause').onclick = () => { if (T.left > 0) { T.run = !T.run; drawT(); } };
  $('#tStop').onclick = () => { clearInterval(T.iv); T.run = false; $('#timer').classList.remove('show', 'ring'); };

  /* ---------- router ---------- */
  let lastRoute = '';
  function render(keep) {
    const h = decodeURIComponent(location.hash.slice(1) || '/');
    const p = h.split('/').filter(Boolean);
    if (!keep && p[0] === 'r' && p[1] !== lastRoute) curScale = 1;
    let html, nav = 'home';
    switch (p[0]) {
      case undefined: html = home(); break;
      case 'g': html = group(p[1]); nav = p[1]; break;
      case 'c': html = category(p[1], p[2], p[3]); nav = (groupOf(p[1]) || {}).id; break;
      case 'r': html = recipe(p[1]); nav = (groupOf((BY[p[1]] || {}).cat) || {}).id; lastRoute = p[1]; break;
      case 'meals': html = meals(p[1]); nav = 'meals'; break;
      case 'guide': html = guide(); nav = ''; break;
      case 'kouzines': html = kouzines(p[1], p[2]); nav = ''; break;
      case 'giortes': html = giortes(p[1]); nav = ''; break;
      case 'fav': html = favs(); nav = ''; break;
      case 'list': html = list(); nav = ''; break;
      case 'fridge': html = fridge(); nav = ''; break;
      case 'plan': html = plan(); nav = ''; break;
      case 's': html = search(p.slice(1).join('/')); nav = ''; break;
      default: html = notFound();
    }
    app.innerHTML = html;
    document.querySelectorAll('#bnav a').forEach(a => a.classList.toggle('on', a.dataset.k === nav));
    if (p[0] === 'r') wireRecipe(p[1]);
    if (p[0] === 'plan') wirePlan();
    if (p[0] === 'c') { const on = new Set(); const apply = () => { let n = 0; app.querySelectorAll('#cgrid .card').forEach(c => { const m = +c.dataset.min, l = +c.dataset.l, tg = c.dataset.tg || '', id = c.getAttribute('href').slice(4);
        const ok = (!on.has('fast') || (m > 0 && m <= 30)) && (!on.has('easy') || l === 1) && (!on.has('nist') || /νηστίσιμο|vegan/.test(tg)) && (!on.has('fav') || S.fav.includes(id)); c.style.display = ok ? '' : 'none'; if (ok) n++; });
        $('#qfN').textContent = on.size ? `${n} αποτελέσματα` : ''; };
      app.querySelectorAll('[data-qf]').forEach(b => b.onclick = () => { const k = b.dataset.qf; on.has(k) ? on.delete(k) : on.add(k); b.classList.toggle('on'); apply(); }); }
    if (!p[0]) { const ib = $('#install'); if (ib) ib.onclick = () => { deferredInstall.prompt(); deferredInstall.userChoice.finally(() => { deferredInstall = null; render(true); }); }; }
    if (p[0] === 'list') wireList();
    if (p[0] === 'meals') { const b = $('#plan'); b.onclick = () => { $('#planOut').innerHTML = planDay(); }; }
    if (p[0] === 'fridge') { $('#frGo').onclick = runFridge; $('#frIn').onkeydown = e => { if (e.key === 'Enter') runFridge(); };
      app.querySelectorAll('[data-add]').forEach(b => b.onclick = () => { const i = $('#frIn'); i.value = (i.value.trim() ? i.value.replace(/[,\s]*$/, '') + ', ' : '') + b.dataset.add; runFridge(); }); if ($('#frIn').value) runFridge(); }
    if (p[0] === 'kouzines') app.querySelectorAll('[data-ph]').forEach(b => b.onclick = () => photoModal(b.dataset.ph, b.dataset.wp || undefined));
    if (p[0] === 'kouzines') $('#kq').oninput = e => { const t = norm(e.target.value.trim());
      app.querySelectorAll('.kreg').forEach(b => { const hitReg = !t || b.dataset.q.includes(t); let any = false;
        b.querySelectorAll('.kdish').forEach(li => { const h = hitReg || li.dataset.q.includes(t); li.style.display = h ? '' : 'none'; any = any || h; });
        b.style.display = any ? '' : 'none'; }); };
    if (p[0] === 'guide') app.querySelectorAll('[data-jump]').forEach(a => a.onclick = e => { e.preventDefault(); $('#g_' + a.dataset.jump).scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    if (p[0] !== 's') { const q = $('#q'); if (document.activeElement !== q) q.value = ''; }
    if (!keep) window.scrollTo(0, 0);
    document.title = (p[0] === 'r' && BY[p[1]] ? BY[p[1]].name + ' · ' : '') + 'ΓΕΥΣΕΙΣ 360°';
  }
  let qt;
  $('#q').addEventListener('input', e => { clearTimeout(qt); const v = e.target.value; qt = setTimeout(() => { location.hash = v.trim() ? '#/s/' + encodeURIComponent(v) : '#/'; }, 250); });
  addEventListener('hashchange', () => render(false));
  badges(); render(false);

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
