#!/usr/bin/env node
/* La scène « Un appel, de bout en bout » (lot conversion du 16/11/2026).
 *
 * Statique, sur les 301 pages générées :
 *  1. placement : accueils juste après la vidéo et les badges ; pages métiers
 *     juste sous les badges du héros ; pages d'atterrissage sous les badges,
 *     avant « Comment ça marche » ; articles : version compacte (téléphone
 *     seul) juste après la première section ; nulle part ailleurs ; une fois ;
 *  2. aucun H2 dans la scène (la liste des H2 des pages ne bouge pas) ;
 *     mention « Exemple » ; cinq étapes ; le jeudi 19 novembre ;
 *  3. textes : ceux du métier de la page (data/metiers.json), le jeu générique
 *     ailleurs ; jamais de freins hors des pages garages ; chaque métier a sa
 *     scène dans chaque langue où sa page existe.
 * Dans Chromium :
 *  4. CSS seul : uniquement les @keyframes de la scène, boucle de 15 s, toutes
 *     les animations en phase (même currentTime) ;
 *  5. hors écran : toutes en pause, d'un bloc (la scène ne tourne que si son
 *     téléphone est entier à l'écran) ; au retour, toujours en phase ;
 *  6. chaque étape tient dans l'écran du téléphone, à 360 et 1440 px ; rien
 *     ne dépasse de la page (scrollWidth == innerWidth) ;
 *  7. prefers-reduced-motion : aucune animation, l'état final fixe, les cinq
 *     étapes visibles, empilées sans se chevaucher.
 *
 * Lot « site mobile » du 23/11/2026 (décisions de Bora) :
 *  8. plus aucun numéro : ni « 1 · » dans le téléphone, ni compteur dans la
 *     liste (un point orange de 8 px) ;
 *  9. pages d'atterrissage : la scène suit le doigt (1440, 1280, 390, 360 px) :
 *     téléphone fixé à l'écran (sticky) sur environ 2,75 hauteurs d'écran ;
 *     plus aucune animation qui tourne ; --t, --p, --pr posés par celya.js ;
 *     l'écran affiché suit l'avancée, glisse de droite à gauche, arrive avec
 *     sa première bulle ; à l'envers en remontant ; ordinateur : étape en cours
 *     surlignée et rail qui se remplit ; téléphone : légende et barre, liste
 *     masquée à l'œil mais lue ; rien ne dépasse ; sous mouvement réduit et
 *     sous 600 px de haut, la scène d'avant.
 *
 *   node tests/scene.mjs */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { loadData, parsePage } from '../_src/lib/core.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); if (!c || process.env.VERBOSE) console.log(`  ${c ? '✓' : '✗'} ${m}`); };
const data = loadData();
const dec = (s) => s.replace(/&nbsp;/g, ' ').replace(/&#39;|&rsquo;/g, "'").replace(/ /g, ' ');

/* ---------- 1-3. statique ---------- */
const SRC = path.join(ROOT, '_src/pages');
const rels = fs.readdirSync(SRC, { recursive: true }).filter((f) => f.endsWith('.html')).map((f) => f.split(path.sep).join('/')).sort();
const count = {};
const runtime = [];
for (const rel of rels) {
  const meta = parsePage(fs.readFileSync(path.join(SRC, rel), 'utf8'), rel).meta;
  const html = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const main = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
  const n = (main.match(/data-anim-root/g) || []).length;
  const L = meta.layout;
  const want = ['accueil', 'metier', 'lp', 'article'].includes(L) ? 1 : 0;
  count[L] = (count[L] || 0) + n;
  ok(n === want, `${rel} (${L}) : ${want} scène attendue, ${n} trouvée(s)`);
  if (!n) continue;
  const place = {
    accueil: /<section class="hv-next">[\s\S]*?<\/section>\s*<section class="sec scn-sec">/,
    metier: /<section class="hero-badges">[\s\S]*?<\/section>\s*<section class="sec scn-sec">/,
    lp: /<section class="hero-badges">[\s\S]*?<\/section>\s*<section class="sec scn-sec scn-drive"[\s\S]*?<\/section>\s*<section class="lpf"/,
  }[L];
  if (L === 'article') {
    /* juste après la première section de la page source (un outil ou une FAQ
     * placés plus haut ne comptent pas) : la section qui précède la scène
     * porte le texte de ce premier bloc « section » */
    const page = parsePage(fs.readFileSync(path.join(SRC, rel), 'utf8'), rel);
    const first = page.seq.find((b) => b.name === 'section');
    const snip = dec(first.html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim().slice(0, 60);
    const before = main.slice(0, main.indexOf('<figure class="scn scn-compact"'));
    const lastSec = before.slice(before.lastIndexOf('<section class="art-s"'));
    ok(/<\/section>\s*$/.test(lastSec) && dec(lastSec.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').includes(snip), `${rel} : scène compacte juste après la première section`);
  } else ok(place.test(main), `${rel} : scène à sa place (${L})`);
  const sc = L === 'article' ? /<figure class="scn scn-compact"[\s\S]*?<\/figure>/.exec(main)[0] : /<section class="sec scn-sec[^"]*"[\s\S]*?<\/section>/.exec(main)[0];
  ok(!/>\s*\d+\s*·/.test(sc) && !/class="scn-tag">\d/.test(sc), `${rel} : aucun numéro dans le parcours (« 1 · … »)`);
  ok((L === 'lp') === /data-scn-drive/.test(sc), `${rel} : scène ${L === 'lp' ? 'pilotée au défilement' : 'en boucle'}`);
  const t = data.i18n[meta.lang];
  const metier = L === 'metier' || L === 'lp' ? meta.metier : null;
  const ex = (metier && data.metiers[metier][meta.lang].scene) || t.scene.generique;
  const txt = dec(sc);
  ok(!/<h2/i.test(sc), `${rel} : aucun H2 dans la scène`);
  ok(txt.includes(`<span class="ex-tag">${t.example}</span>`), `${rel} : mention « ${t.example} » visible`);
  ok((sc.match(/class="scn-st"/g) || []).length === 5, `${rel} : cinq étapes`);
  ok(txt.includes(t.scene.jour) && txt.includes(t.scene.jour_court), `${rel} : exemple du jeudi 19 novembre`);
  ok([ex.appel[0], ex.appel[1], ex.confirmation, ex.motif, ...t.scene.consigne].every((x) => txt.includes(dec(x))), `${rel} : textes ${metier || 'génériques'} (${meta.lang})`);
  if (metier !== 'garages') ok(!/frein|remmen|brake|voiture|wagen|\bcar\b/i.test(txt), `${rel} : aucun exemple de garage hors des pages garages`);
  if (L === 'article') ok(!/scn-steps|<h3/.test(sc), `${rel} : version compacte, téléphone seul`);
  if (L !== 'article' || !runtime.some((r) => r.L === 'article')) runtime.push({ rel, L });
}
for (const [k, M] of Object.entries(data.metiers)) {
  if (k === '_doc') continue;
  for (const [lang, page] of Object.entries(M.pages)) if (page) ok(M[lang] && M[lang].scene && M[lang].scene.appel.length === 3, `data/metiers.json : ${k}.${lang}.scene`);
}
/* 8. aucun compteur dans le CSS du parcours */
const cssAll = fs.readFileSync(path.join(ROOT, 'celya.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
ok(!/\.(scn-steps|steps) li::before\{[^}]*counter\(/.test(cssAll) && /\.steps li::before\{content:"";[^}]*width:8px;height:8px[^}]*background:var\(--o\)/.test(cssAll) && /\.scn-steps li::before\{content:"";[^}]*width:8px;height:8px[^}]*background:var\(--o\)/.test(cssAll), 'CSS : « Comment ça marche » et la liste de la scène sans compteur, un point orange de 8 px');
console.log(`Statique : scènes — accueils ${count.accueil}, métiers ${count.metier}, atterrissage ${count.lp}, articles ${count.article} ; aucune ailleurs.`);

/* ---------- 4-7. Chromium ---------- */
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.avif': 'image/avif', '.png': 'image/png', '.woff2': 'font/woff2', '.mp4': 'video/mp4' };
const srv = await new Promise((res) => {
  const s = http.createServer((req, rsp) => {
    const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { rsp.writeHead(404); return rsp.end(); }
    rsp.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(rsp);
  }).listen(0, '127.0.0.1', () => res(s));
});
const base = `http://127.0.0.1:${srv.address().port}/`;
const browser = await chromium.launch();
const KF = new Set(['scn', 'scn-in', 'scn-slide', 'scn-hi']);
/* les contrôles d'animation : un accueil FR et EN, une page métier, deux pages d'atterrissage, un article */
const ANIM = new Set(['index.html', 'en/index.html', 'garages.html', runtime.find((r) => r.L === 'article').rel]);
const anims = () => {
  const r = document.querySelector('[data-anim-root]');
  return r.getAnimations({ subtree: true }).map((a) => ({ name: a.animationName, state: a.playState, t: a.currentTime, d: a.effect.getTiming().duration }));
};
for (const [w, h] of [[1440, 900], [360, 640]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => { try { localStorage.setItem('celya-consent', 'denied'); } catch (e) {} });
  for (const { rel } of runtime) {
    const p = await ctx.newPage();
    await p.goto(base + rel, { waitUntil: 'load' });
    await p.evaluate(() => document.fonts.ready);
    /* 6. chaque étape tient dans l'écran du téléphone */
    const fit = await p.evaluate(() => {
      const body = document.querySelector('.scn-body');
      return [...body.querySelectorAll('.scn-st')].map((s) => s.offsetTop + s.offsetHeight).filter((b) => b > body.clientHeight).length;
    });
    ok(fit === 0, `${rel} @${w} : chaque étape tient dans l'écran du téléphone`);
    ok(await p.evaluate(() => document.documentElement.scrollWidth === innerWidth), `${rel} @${w} : rien ne dépasse`);
    if (w === 1440 && ANIM.has(rel)) {
      await p.evaluate(() => document.querySelector('[data-anim-root]').scrollIntoView({ block: 'center' }));
      await p.waitForTimeout(700);
      let a = await p.evaluate(anims);
      const spread = (xs) => Math.max(...xs.map((x) => x.t)) - Math.min(...xs.map((x) => x.t));
      ok(a.length > 10 && a.every((x) => KF.has(x.name) && x.d === 15000), `${rel} : ${a.length} animations CSS, @keyframes de la scène seulement, boucle de 15 s`);
      ok(a.every((x) => x.state === 'running') && spread(a) < 50, `${rel} : à l'écran, toutes en marche et en phase (écart ${spread(a).toFixed(0)} ms)`);
      await p.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
      await p.waitForTimeout(600);
      a = await p.evaluate(anims);
      ok(a.every((x) => x.state === 'paused'), `${rel} : hors écran, toutes en pause (${a.filter((x) => x.state !== 'paused').length} en marche)`);
      /* téléphone coupé par le bas de l'écran : la scène attend d'être entière */
      await p.evaluate(() => { const b = document.querySelector('[data-anim-root] .phone').getBoundingClientRect(); scrollTo({ top: b.top + scrollY - innerHeight + 200, behavior: 'instant' }); });
      await p.waitForTimeout(600);
      a = await p.evaluate(anims);
      ok(a.every((x) => x.state === 'paused'), `${rel} : téléphone à moitié visible, toujours en pause (${a.filter((x) => x.state !== 'paused').length} en marche)`);
      await p.evaluate(() => document.querySelector('[data-anim-root]').scrollIntoView({ block: 'center' }));
      await p.waitForTimeout(600);
      a = await p.evaluate(anims);
      ok(a.every((x) => x.state === 'running') && spread(a) < 50, `${rel} : au retour, reprises et toujours en phase (écart ${spread(a).toFixed(0)} ms)`);
    }
    await p.close();
  }
  await ctx.close();
}
/* 7. mouvement réduit */
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await ctx.addInitScript(() => { try { localStorage.setItem('celya-consent', 'denied'); } catch (e) {} });
  for (const { rel } of runtime.filter((r) => /^(index|nl\/garages|lp\/garages|nl\/lp\/garages|en\/index)\.html$/.test(r.rel) || r.L === 'article')) {
    const p = await ctx.newPage();
    await p.goto(base + rel, { waitUntil: 'load' });
    const r = await p.evaluate(() => {
      const root = document.querySelector('[data-anim-root]');
      const st = [...root.querySelectorAll('.scn-st')];
      const box = st.map((s) => s.getBoundingClientRect());
      const vis = [...root.querySelectorAll('.scn-st, .scn-st *')].every((e) => getComputedStyle(e).opacity === '1' && getComputedStyle(e).visibility !== 'hidden');
      return { n: root.getAnimations({ subtree: true }).length, vis, stacked: box.every((b, i) => i === 0 || b.top >= box[i - 1].bottom - 0.5), tag: getComputedStyle(root.querySelector('.ex-tag')).display !== 'none' };
    });
    ok(r.n === 0, `${rel} (mouvement réduit) : aucune animation (${r.n})`);
    if (/lp\//.test(rel)) ok(await p.evaluate(() => !document.querySelector('.scn-on') && getComputedStyle(document.querySelector('.scn-pin')).position === 'static' && !document.querySelector('[data-scn-drive]').style.cssText), `${rel} (mouvement réduit) : la scène ne suit pas le doigt (rien de fixé, aucune variable)`);
    ok(r.vis && r.stacked && r.tag, `${rel} (mouvement réduit) : état final fixe, cinq étapes visibles et empilées, « Exemple » affiché`);
    await p.close();
  }
  await ctx.close();
}
/* 9. la scène qui suit le doigt (pages d'atterrissage) */
{
  const state = (p) => p.evaluate(() => {
    const sec = document.querySelector('[data-scn-drive]'), ph = sec.querySelector('.scn-ph'), body = sec.querySelector('.scn-body').getBoundingClientRect();
    const st = [...sec.querySelectorAll('.scn-st')].map((s) => { const b = s.getBoundingClientRect(), o = +getComputedStyle(s).opacity; const first = s.querySelector('.scn-in, .scn-cal'); return { o, left: b.left - body.left, w: body.width, first: first ? +getComputedStyle(first).opacity : 1 }; });
    const shown = st.map((x, i) => [i, x]).filter(([, x]) => x.o > 0.5 && x.left > -x.w / 2 && x.left < x.w / 2).map(([i]) => i);
    const hi = [...sec.querySelectorAll('.scn-hi')].map((x) => +getComputedStyle(x).opacity);
    const rl = [...sec.querySelectorAll('.scn-rl')].map((x) => new DOMMatrix(getComputedStyle(x).transform).d);
    const capi = [...sec.querySelectorAll('.scn-cap-in p')].map((x) => +getComputedStyle(x).opacity);
    const cap = getComputedStyle(sec.querySelector('.scn-cap')).display !== 'none';
    const list = sec.querySelector('.scn-steps').getBoundingClientRect();
    const bar = document.querySelector('.mbar');
    return { on: sec.classList.contains('scn-on'), vars: ['--t', '--p', '--pr'].map((k) => sec.style.getPropertyValue(k)), phTop: Math.round(ph.getBoundingClientRect().top), shown, firstOk: st.every((x) => x.o < 0.05 || x.left >= x.w - 1 || x.first > 0.95), running: sec.getAnimations({ subtree: true }).filter((a) => a.playState === 'running').length, hi, rl, cap, capi, listW: list.width, sw: document.documentElement.scrollWidth, vw: innerWidth, mbar: bar ? getComputedStyle(bar).visibility !== 'hidden' && bar.getBoundingClientRect().top < innerHeight : false };
  });
  const goto = (p, pr) => p.evaluate((pr) => { const t = document.querySelector('.scn-track'), pin = document.querySelector('.scn-pin'); scrollTo(0, t.getBoundingClientRect().top + scrollY - parseFloat(getComputedStyle(pin).top) + (t.offsetHeight - pin.offsetHeight) * pr); }, pr);
  for (const rel of ['lp/garages.html', 'nl/lp/geen-oproepen-meer-missen.html']) {
    for (const [w, h] of [[1440, 900], [1280, 720], [390, 844], [360, 640]]) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h } });
      await ctx.addInitScript(() => { try { localStorage.setItem('celya-consent', 'granted'); } catch (e) {} });
      await ctx.route('**/*', (r) => (r.request().url().startsWith('http://127.0.0.1') ? r.continue() : r.abort()));
      const p = await ctx.newPage();
      await p.goto(base + rel, { waitUntil: 'load' });
      await p.evaluate(() => document.fonts.ready);
      const tag = `${rel} @${w}×${h}`;
      const run = await p.evaluate(() => { const t = document.querySelector('.scn-track'), pin = document.querySelector('.scn-pin'); return (t.offsetHeight - pin.offsetHeight) / innerHeight; });
      ok(run > 2.6 && run < 2.9, `${tag} : téléphone fixé sur ${run.toFixed(2)} hauteurs d'écran (environ 2,75)`);
      const seen = [];
      for (const [pr, want] of [[0.05, 0], [0.3, 1], [0.5, 2], [0.7, 3], [0.95, 4], [0.5, 2], [0.1, 0]]) {
        await goto(p, pr); await p.waitForTimeout(250);
        const r = await state(p); seen.push(r);
        ok(r.on && r.vars.every((v) => v !== '') && r.running === 0, `${tag} pr=${pr} : pilotée (--t ${r.vars[0]}, --p ${r.vars[1]}, --pr ${r.vars[2]}), aucune animation qui tourne`);
        ok(r.shown.length === 1 && r.shown[0] === want, `${tag} pr=${pr} : écran ${want + 1} affiché (${r.shown.join(',')})`);
        ok(r.firstOk, `${tag} pr=${pr} : chaque écran visible a sa première bulle`);
        ok(r.sw === r.vw, `${tag} pr=${pr} : rien ne dépasse (${r.sw})`);
        if (w > 860) ok(r.hi.indexOf(Math.max(...r.hi)) === want && Math.max(...r.hi) > 0.95 && !r.cap, `${tag} pr=${pr} : l'étape ${want + 1} surlignée dans la liste, pas de légende`);
        else ok(r.cap && r.capi.indexOf(Math.max(...r.capi)) === want && Math.max(...r.capi) > 0.95 && r.listW <= 1, `${tag} pr=${pr} : légende de l'étape ${want + 1}, liste masquée à l'œil`);
        if (w < 720) ok(!r.mbar, `${tag} pr=${pr} : barre d'appel cachée pendant la scène`);
      }
      ok(new Set(seen.map((r) => r.phTop)).size === 1, `${tag} : le téléphone ne bouge pas pendant la scène (top ${[...new Set(seen.map((r) => r.phTop))].join(', ')})`);
      if (w > 860) ok(seen[2].rl.map((x) => x.toFixed(1)).join() === '1.0,1.0,0.5,0.0' && seen[4].rl.every((x) => x === 1) && seen[0].rl.every((x) => x < 0.3), `${tag} : le rail se remplit avec l'avancée (${seen.map((r) => r.rl.map((x) => x.toFixed(1)).join('·')).join(' | ')})`);
      /* au milieu d'un glissement : l'entrant arrive par la droite, le sortant s'efface vers la gauche */
      await goto(p, 0.18); await p.waitForTimeout(250);
      const mid = await p.evaluate(() => { const body = document.querySelector('.scn-body').getBoundingClientRect(); return [...document.querySelectorAll('.scn-st')].slice(0, 2).map((s) => ({ x: s.getBoundingClientRect().left - body.left, o: +getComputedStyle(s).opacity })); });
      ok(mid[0].x < 0 && mid[0].o < 1 && mid[1].x > 0 && mid[1].o === 1, `${tag} : glissement de droite à gauche, le sortant s'efface (${mid.map((m) => `${m.x.toFixed(0)}px/${m.o.toFixed(2)}`).join(' → ')})`);
      ok(await p.evaluate(() => getComputedStyle(document.querySelector('.scn-steps')).display !== 'none' && document.querySelectorAll('.scn-steps li').length === 5), `${tag} : la liste des cinq étapes reste dans la page (lecteurs d'écran)`);
      await ctx.close();
    }
  }
  /* écran bas : la scène d'avant */
  for (const [w, h] of [[1280, 560], [390, 560]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    await ctx.addInitScript(() => { try { localStorage.setItem('celya-consent', 'denied'); } catch (e) {} });
    const p = await ctx.newPage();
    await p.goto(base + 'lp/garages.html', { waitUntil: 'load' });
    await p.evaluate(() => document.querySelector('[data-anim-root] .phone').scrollIntoView({ block: 'center' }));
    await p.waitForTimeout(700);
    const r = await p.evaluate(() => ({ on: !!document.querySelector('.scn-on'), pin: getComputedStyle(document.querySelector('.scn-pin')).position, n: document.querySelector('[data-anim-root]').getAnimations({ subtree: true }).filter((a) => a.effect.getTiming().duration === 15000).length }));
    ok(!r.on && r.pin === 'static' && r.n > 10, `lp/garages.html @${w}×${h} : sous 600 px de haut, la scène d'avant (boucle de 15 s, ${r.n} animations, rien de fixé)`);
    await ctx.close();
  }
}
await browser.close();
srv.close();
console.log(fails.length ? `\n${fails.length} échec(s).` : `Scène : tout passe (${runtime.length} pages ouvertes dans Chromium).`);
process.exit(fails.length ? 1 : 0);
