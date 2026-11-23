#!/usr/bin/env node
/* Pages d'atterrissage (lot conversion Google Ads du 16/11/2026, refait par
 * le lot « site mobile » du 23/11/2026, décisions de Bora).
 *
 *  1. ordre des blocs : héros, badges, la scène (qui suit le doigt), le
 *     formulaire, les cases RDV / À rappeler / Urgent, les prix, la FAQ,
 *     l'appel final ; plus de « Comment ça marche », plus de « Appelez-la,
 *     comme un client », plus de trois bénéfices ;
 *  2. héros : le H1, la pastille de l'appel (quatre états de data/i18n.json,
 *     clé live, le C animé à gauche), le bouton d'appel (numéro de
 *     data/offre.json), « Être rappelé » vers #lp (affiché sous 860 px
 *     seulement) ; plus de phrase sous le titre, aucune accroche ni sous-ligne ;
 *  3. formulaire : même envoi (data-lead, source « demo form », page merci),
 *     mêmes champs que demo.html, dans le même ordre ; écrit une fois, après
 *     la scène ; dans la colonne droite du héros au-dessus de 860 px, après la
 *     scène en dessous ;
 *  4. prix et appel final : le bouton renvoie au formulaire de la page (#lp) ;
 *     une action, un nom : tout ce qui mène au formulaire dit « Être rappelé
 *     pour une démo » (NL « Bel mij terug voor een demo ») ; sous 720 px, les
 *     prix en carrousel (une carte par écran, scroll-snap, la carte Pro au
 *     centre au départ, trois points) ; au-dessus, la grille d'avant ;
 *  5. FAQ : cinq questions, « Vos questions, nos réponses », dont « changer de
 *     numéro » et « sauront-ils que c'est une IA » ;
 *  6. cases : textes du métier sur les pages garages, génériques ailleurs ;
 *  7. barre mobile : appeler Janet + être rappelé (#lp) ; cachée au premier
 *     écran, pendant la scène et tant que le formulaire est à l'écran,
 *     affichée ailleurs une fois le héros dépassé ;
 *  8. CSS : aucun backdrop-filter, aucun filter, aucune ombre sur le héros ni
 *     sur le formulaire ; aucune adresse e-mail dans celya.js ;
 *  9. pastille dans Chromium : boucle de 10 s, en pause hors écran, sous
 *     prefers-reduced-motion « Rendez-vous pris » seul et fixe.
 *
 *   node tests/lp.mjs */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { loadData } from '../_src/lib/core.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); console.log(`  ${c ? '✓' : '✗'} ${m}`); };
const data = loadData();
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const dec = (s) => s.replace(/&nbsp;/g, ' ').replace(/ /g, ' ');
const fields = (html) => {
  const f = /<form class="form" id="(?:lp|demo)"[\s\S]*?<\/form>/.exec(html)[0];
  return [...f.matchAll(/<(?:input|select)\b[^>]*\bname="([^"]+)"/g)].map((m) => m[1]).join(',');
};

const PAGES = [
  ['lp/garages.html', 'fr', 'garages'], ['lp/ne-plus-rater-d-appels.html', 'fr', null],
  ['nl/lp/garages.html', 'nl', 'garages'], ['nl/lp/geen-oproepen-meer-missen.html', 'nl', null],
];
const tel = data.offre.telephone;
for (const [rel, lang, metier] of PAGES) {
  console.log(`\n${rel}`);
  const html = read(rel), t = data.i18n[lang];
  const main = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
  /* 1. ordre */
  const marks = ['<section class="hv lpv" data-hv="lp">', '<section class="hero-badges">', 'class="sec scn-sec scn-drive"', '<section class="lpf"', 'class="cases"', 'class="prices prices-swipe"', 'id="faq"', 'cta-final'];
  const at = marks.map((m) => main.indexOf(m));
  ok(at.every((x, i) => x >= 0 && (i === 0 || x > at[i - 1])), `ordre : ${marks.map((m) => m.replace(/.*class="|.*id="|".*|<section /g, '')).join(' → ')}`);
  ok(!/class="benefits"|id="marche"|class="steps"|class="try"/.test(main), 'plus de trois bénéfices, de « Comment ça marche » ni de « Appelez-la, comme un client »');
  /* 2. héros */
  const hero = /<section class="hv lpv"[\s\S]*?<\/div>\s*<\/div><\/section>/.exec(main)[0];
  const txt = /<div class="lpv-t">[\s\S]*?<\/div>\s*<\/div>/.exec(hero)[0];
  const pill = /<p class="lc">[\s\S]*?<\/p>/.exec(txt);
  ok((txt.match(/<h1>/g) || []).length === 1 && !/class="lead"/.test(txt) && (txt.match(/<p\b/g) || []).length === 1 && !!pill, 'héros : le H1 et la pastille de l\'appel, plus de phrase');
  ok(pill && txt.indexOf('<h1>') < txt.indexOf('<p class="lc">') && txt.indexOf('<p class="lc">') < txt.indexOf('data-call'), 'pastille sous le H1, au-dessus du bouton d\'appel');
  const states = pill ? [...pill[0].matchAll(/<span class="lc-st" style="--d:([\d.]+)s"><b>([^<]*)<\/b><i> · <\/i><span>([^<]*)<\/span><\/span>/g)] : [];
  ok(states.length === 4 && states.every((m, i) => +m[1] === i * 2.5 && dec(m[2]) === dec(t.live[i][0]) && dec(m[3]) === dec(t.live[i][1])), `pastille : quatre états de data/i18n.json (live), un toutes les 2,5 s (${states.map((m) => m[2]).join(' / ')})`);
  ok(pill && /<span class="lc-c"><span class="cv cv-on"/.test(pill[0]) && /<span class="sr">/.test(pill[0]), 'pastille : le C animé à gauche, le texte entier pour les lecteurs d\'écran');
  ok(!/class="(label|kick|cta-sub|proofs?|live-pill|hv-tag)/.test(hero), 'héros : aucune accroche, sous-ligne ni ancienne pastille');
  ok(hero.includes(`href="tel:${tel.e164}"`) && dec(hero).includes(dec(tel.affiche)), `héros : bouton d'appel ${tel.affiche} (data/offre.json)`);
  ok(/<a class="btn btn-line lpv-m" href="#lp">/.test(hero), 'héros : « Être rappelé » vers le formulaire (#lp)');
  ok(/<video [^>]*data-src-d="[^"]*assets\/hero\/hero-ordinateur-(720|1080)\.mp4"[^>]*data-src-m="[^"]*hero-mobile-(720|1080)\.mp4"/.test(hero), 'héros : la vidéo de l\'accueil (mêmes fichiers, même choix de source)');
  /* 3. formulaire */
  const fsec = /<section class="lpf"[\s\S]*?<\/section>/.exec(main)[0];
  ok(!/<form/.test(hero) && (main.match(/<form /g) || []).length === 1, 'formulaire : écrit une fois, hors du code du héros');
  ok(new RegExp(`<form class="form" id="lp" data-lead="lp-${path.basename(rel, '.html')}" data-source="demo form" data-next="[^"]*merci\\.html"`).test(fsec), `formulaire : même envoi (web-lead, « demo form », merci), data-lead « lp-${path.basename(rel, '.html')} »`);
  ok(fields(html) === fields(read(lang === 'fr' ? 'demo.html' : 'nl/demo.html')), 'formulaire : mêmes champs que la page démo, même ordre');
  /* 4. prix */
  ok(/<div class="price-go"><a class="btn btn-ink" href="#lp" data-demo>/.test(main), 'prix : le bouton renvoie au formulaire de la page');
  ok(/<p class="pc-dots" aria-hidden="true"><i><\/i><i class="on"><\/i><i><\/i><\/p>/.test(main), 'prix : trois points sous le carrousel, la carte Pro marquée');
  const cta = /<div class="panel bg-ink cta-final">[\s\S]*?<\/section>/.exec(main)[0];
  ok(/<a class="btn btn-line-d" href="#lp" data-demo>/.test(cta) && !/demo\.html/.test(cta), 'appel final : le bouton renvoie au formulaire de la page, plus à la page démo');
  ok(!/href="[^"]*demo\.html"/.test(main), 'aucun lien vers la page démo : tout renvoie au formulaire de la page');
  /* une action, un nom (décision de Bora du 17/11/2026) : tout ce qui mène au
   * formulaire porte le libellé de son bouton ; seule la barre mobile garde la forme courte */
  const toForm = [...main.matchAll(/<a [^>]*href="#lp"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => dec(m[1].replace(/<[^>]+>/g, '')).trim());
  ok(toForm.length === 3 && toForm.every((x) => x === dec(t.form.submit)), `vers le formulaire : ${toForm.length} boutons (héros, prix, appel final), tous « ${t.form.submit} » (${[...new Set(toForm)].join(' / ')})`);
  ok(!html.includes(t.price_start) && !html.includes(t.cta_demo), `plus aucun « ${t.cta_demo} » sur la page`);
  /* 5. FAQ */
  const faq = /<section class="sec bg-page" id="faq">[\s\S]*?<\/section>/.exec(main)[0];
  const qs = [...faq.matchAll(/<summary>([\s\S]*?)<\/summary>/g)].map((m) => dec(m[1]));
  ok(qs.length === 5, `FAQ : cinq questions (${qs.length})`);
  ok(lang === 'fr' ? /Vos questions, <em>nos réponses<\/em>/.test(faq) : /Uw vragen, <em>onze antwoorden<\/em>/.test(faq), 'FAQ : « Vos questions, nos réponses »');
  ok(qs.some((q) => /changer de numéro|van nummer veranderen/.test(q)) && qs.some((q) => /que c'est une IA|dat het een AI is/.test(q)), 'FAQ : numéro et IA');
  ok(!/application\/ld\+json/.test(html) || !/FAQPage/.test(html), 'pas de FAQPage à tenir en phase (page noindex)');
  /* 6. cases */
  const k = metier ? data.metiers[metier][lang].cases : t.cases_generique;
  ok([k.rdv_p, k.rappel_p, k.urgent_p].every((x) => dec(main).includes(dec(x))), `cases : textes ${metier || 'génériques'}`);
  /* 7. barre mobile (statique) */
  const bar = /<div class="mbar"[\s\S]*?<\/div>/.exec(html);
  ok(bar && bar[0].includes(`href="tel:${tel.e164}"`) && bar[0].includes(`href="#lp">${t.mbar_callback}</a>`), `barre mobile : « ${t.cta_call} » et « ${t.mbar_callback} » (#lp)`);
}

/* 8. CSS et JS */
console.log('\nCSS / JS');
const css = read('celya.css').replace(/\/\*[\s\S]*?\*\//g, '');
const lpRules = [...css.matchAll(/([^{}]*\.lpv[^{}]*)\{([^{}]*)\}/g)];
ok(lpRules.length > 8 && lpRules.every((m) => !/backdrop-filter|(^|;)\s*filter\s*:|will-change/.test(m[2])), `héros des pages d'atterrissage : aucun backdrop-filter, filter ni will-change (${lpRules.length} règles)`);
ok(lpRules.filter((m) => /box-shadow/.test(m[2])).every((m) => /box-shadow:none/.test(m[2])), 'héros : aucune ombre');
const lpfRules = [...css.matchAll(/([^{}]*\.(?:lpf|lc)\b[^{}]*)\{([^{}]*)\}/g)];
ok(lpfRules.length > 8 && lpfRules.every((m) => !/backdrop-filter|(^|;)\s*filter\s*:|will-change/.test(m[2]) && (!/box-shadow/.test(m[2]) || /box-shadow:none/.test(m[2]))), `formulaire translucide et pastille : aucun flou, filter, will-change ni ombre (${lpfRules.length} règles)`);
ok(!/[\w.+-]+@[\w-]+\.[a-z]{2,}/i.test(read('celya.js')), 'aucune adresse e-mail dans celya.js');

/* 7. barre mobile et bouton « Être rappelé » dans Chromium */
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.mp4': 'video/mp4' };
const srv = await new Promise((res) => {
  const s = http.createServer((req, rsp) => {
    const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { rsp.writeHead(404); return rsp.end(); }
    rsp.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(rsp);
  }).listen(0, '127.0.0.1', () => res(s));
});
const base = `http://127.0.0.1:${srv.address().port}/`;
const browser = await chromium.launch();
console.log('\nChromium');
const box = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { top: b.top + scrollY, bottom: b.bottom + scrollY, left: b.left, right: b.right }; }, sel);
for (const [rel] of PAGES) {
  for (const [w, h] of [[1440, 900], [1280, 800], [768, 1024], [390, 844], [360, 640]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    await ctx.addInitScript(() => { try { localStorage.setItem('celya-consent', 'denied'); } catch (e) {} });
    const p = await ctx.newPage();
    await p.goto(base + rel, { waitUntil: 'load' });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(250);
    const m = await p.evaluate(() => getComputedStyle(document.querySelector('.lpv-m')).display !== 'none');
    ok(m === w <= 860, `${rel} @${w} : « Être rappelé » ${w <= 860 ? 'affiché' : 'masqué (le formulaire est à côté)'}`);
    /* 3. où est le formulaire */
    const [hv, f, sc, tx] = [await box(p, '.lpv'), await box(p, '#lp'), await box(p, '.scn-sec'), await box(p, '.lpv-t')];
    if (w > 860) ok(f.top >= hv.top && f.bottom <= hv.bottom && f.left > tx.right, `${rel} @${w} : formulaire dans la colonne droite du héros`);
    else ok(f.top >= sc.bottom - 1, `${rel} @${w} : formulaire après la scène`);
    ok(await p.evaluate(() => document.documentElement.scrollWidth === innerWidth), `${rel} @${w} : rien ne dépasse`);
    /* la pastille tient dans sa colonne, tous états confondus */
    /* le texte glisse dans .lc-s, découpée (overflow:hidden) : on mesure sa boîte, et la taille non transformée de chaque état */
    const lc = await p.evaluate(() => { const L = document.querySelector('.lc'), S = document.querySelector('.lc-s'), l = L.getBoundingClientRect(), x = S.getBoundingClientRect(), c = document.querySelector('.lpv-t').getBoundingClientRect(); return getComputedStyle(S).overflow === 'hidden' && [...S.children].every((s) => s.offsetWidth <= S.clientWidth + 0.5 && s.offsetHeight <= S.clientHeight + 0.5 && s.scrollWidth <= s.offsetWidth + 0.5) && x.right <= l.right && x.bottom <= l.bottom && l.right <= c.right + 0.5 && l.left >= c.left - 0.5; });
    ok(lc, `${rel} @${w} : la pastille tient dans son cadre (quatre états)`);
    /* 4. carrousel des prix */
    const pr = await p.evaluate(() => {
      const g = document.querySelector('.prices'), cs = getComputedStyle(g), cards = [...g.querySelectorAll('.pc')].map((c) => c.getBoundingClientRect()), G = g.getBoundingClientRect();
      const reco = g.querySelector('.pc-ink').getBoundingClientRect();
      return { scroll: g.scrollWidth > g.clientWidth + 2, snap: cs.scrollSnapType, display: cs.display, cols: cs.gridTemplateColumns.split(' ').length, centered: Math.abs((reco.left + reco.right) / 2 - (G.left + G.right) / 2) < 2, oneRow: cards.every((c) => Math.abs(c.top - cards[0].top) < 1), dots: getComputedStyle(document.querySelector('.pc-dots')).display !== 'none' };
    });
    if (w <= 720) ok(pr.scroll && /x mandatory/.test(pr.snap) && pr.centered && pr.oneRow && pr.dots, `${rel} @${w} : prix en carrousel (scroll-snap, Pro au centre, trois points)`);
    else ok(!pr.scroll && pr.display === 'grid' && !pr.dots && pr.cols === (w > 900 ? 3 : 1), `${rel} @${w} : prix comme avant (grille de ${pr.cols} colonne(s))`);
    if (w < 720) {
      /* 7. barre mobile */
      const bar = () => p.evaluate(() => getComputedStyle(document.querySelector('.mbar')).visibility !== 'hidden' && document.querySelector('.mbar').getBoundingClientRect().top < innerHeight);
      const go = async (y) => { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(450); };
      ok(!(await bar()), `${rel} @${w} : barre mobile cachée au premier écran`);
      await go(sc.top + (sc.bottom - sc.top) / 2);
      ok(!(await bar()), `${rel} @${w} : barre mobile cachée pendant la scène`);
      await go(f.top - 100);
      ok(!(await bar()), `${rel} @${w} : barre mobile cachée tant que le formulaire est à l'écran`);
      await go((await box(p, '#faq')).top);
      ok(await bar(), `${rel} @${w} : barre mobile affichée plus bas (FAQ)`);
      /* « Être rappelé » du héros mène au formulaire */
      await go(0);
      await p.click('.lpv-m');
      await p.waitForTimeout(600);
      ok(await p.evaluate(() => { const b = document.querySelector('#lp').getBoundingClientRect(); return b.top < innerHeight && b.bottom > 0; }), `${rel} @${w} : « Être rappelé » du héros mène au formulaire`);
    }
    await ctx.close();
  }
}
/* 9. pastille : boucle de 10 s, pause hors écran, mouvement réduit */
for (const rel of ['lp/garages.html', 'nl/lp/garages.html']) {
  for (const reduce of [false, true]) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: reduce ? 'reduce' : 'no-preference' });
    await ctx.addInitScript(() => { try { localStorage.setItem('celya-consent', 'denied'); } catch (e) {} });
    const p = await ctx.newPage();
    await p.goto(base + rel, { waitUntil: 'load' });
    await p.waitForTimeout(400);
    const st = () => p.evaluate(() => [...document.querySelectorAll('.lc-st')].map((s) => ({ op: +getComputedStyle(s).opacity, a: s.getAnimations().map((a) => ({ d: a.effect.getTiming().duration, s: a.playState, n: a.animationName })) })));
    let r = await st();
    if (reduce) {
      ok(r.every((x) => !x.a.length) && r.map((x) => x.op).join() === '0,0,1,0', `${rel} (mouvement réduit) : « ${data.i18n[rel.startsWith('nl') ? 'nl' : 'fr'].live[2][0]} » seul et fixe (${r.map((x) => x.op).join()})`);
    } else {
      ok(r.every((x) => x.a.length === 1 && x.a[0].n === 'lc' && x.a[0].d === 10000 && x.a[0].s === 'running'), `${rel} : quatre états en CSS seul, boucle de 10 s, en marche à l'écran`);
      await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
      await p.waitForTimeout(500);
      r = await st();
      ok(r.every((x) => x.a[0].s === 'paused'), `${rel} : hors écran, la pastille est en pause`);
    }
    await ctx.close();
  }
}
await browser.close();
srv.close();
console.log(fails.length ? `\n${fails.length} échec(s).` : '\nPages d\'atterrissage : tout passe.');
process.exit(fails.length ? 1 : 0);
