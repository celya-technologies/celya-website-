#!/usr/bin/env node
/* Test — l'accès à l'application (décision de Bora du 19/11/2026).
 *
 * « Se connecter » mène à APP_LOGIN, « Essai gratuit » à APP_SIGNUP (les deux
 * adresses vivent dans _src/components/shell.mjs, et nulle part ailleurs) ;
 * les pages NL et EN y ajoutent ?lang=nl / ?lang=en.
 *
 *   url      chaque adresse est écrite une seule fois dans _src/ et data/ ;
 *   header   pages avec menu : dans .hdr-cta, « Se connecter » (lien texte)
 *            puis « Demander une démo » (bouton orange, qui porte aussi son
 *            libellé court « Démo », 24/11/2026), rien d'autre : ni
 *            « Essai gratuit », ni « Appeler Janet » ; la langue est un
 *            sélecteur « FR ▾ » (révision du 19/11/2026, décision de Bora) ;
 *   menu     menu mobile (refait le 23/11/2026, décision de Bora) : les
 *            entrées de l'en-tête de l'ordinateur, dans le même ordre ;
 *            « Votre métier » en <details> avec tous les métiers et « Tous les
 *            métiers » écrits dans le HTML ; en bas, « Essai gratuit · N
 *            jours » seul bouton, puis « Se connecter » et les langues sur une
 *            ligne ; plus de « Demander une démo » dans le panneau ;
 *   footer   pied de page : « Se connecter » dans la colonne Entreprise, après
 *            Contact ;
 *   pricing  sous chaque grille de prix (hors pages d'atterrissage) :
 *            « Commencer l'essai gratuit », puis « Demander une démo », puis la
 *            règle de l'essai de data/offre.json ;
 *   lp       pages d'atterrissage : aucun lien vers l'application, la grille
 *            garde sa seule démo vers le formulaire de la page ;
 *   layout   l'en-tête tient dans son cadre (360 à 1440 px, FR/NL/EN) ; à
 *            toutes les largeurs « Se connecter » est visible, à gauche du
 *            bouton de démo (décision de Bora du 24/11/2026, qui remplace
 *            « sous 720 px, seul Demander une démo reste à côté du menu ») ;
 *            sous 720 px le bouton affiche son libellé court, au-dessus le
 *            complet ; partout il garde son nom accessible complet ; le menu
 *            ouvert garde le bloc dans son cadre ;
 *   mnav     le menu ouvert (360, 390, 768 px ; FR, NL, EN) : la croix et
 *            « Fermer » ; la page figée et la barre d'appel cachée ; le
 *            panneau sous l'en-tête, au-dessus du bandeau cookies, sans flou ;
 *            à 360 × 640 bandeau affiché, l'essai, la connexion et les langues
 *            visibles sans défiler ; zones d'appui de 44 px au moins ;
 *            « Votre métier » s'ouvre sur place ; fermeture au voile, sur un
 *            lien, à Échap ;
 *   events   avec accord cookies : sign_up_start / login_click {place, page,
 *            lang} au clic (en-tête, menu, prix, pied de page) ; rien sans
 *            accord.
 *
 *   node tests/acces-app.mjs             le dépôt
 *   node tests/acces-app.mjs --mutants   casse une copie du dépôt, une fois par
 *                                        vérification, et exige qu'elle crie */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

/* hôte exact, jamais un préfixe d'URL (CodeQL : « Incomplete URL substring sanitization ») */
const isLocal = (u) => { try { const h = new URL(u).hostname; return h === '127.0.0.1' || h === 'localhost'; } catch { return false; } };
const LOGIN = 'https://app.celya.be/login';
const SIGNUP = 'https://app.celya.be/inscription';
const href = (u, lang) => (lang === 'fr' ? u : `${u}?lang=${lang}`);
const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const SKIP = /^(_src|docs|tests|api|assets|node_modules|\.git|\.claude)(\/|$)/;
const walk = (root, d = '') => fs.readdirSync(path.join(root, d), { withFileTypes: true }).flatMap((e) => {
  const rel = d ? `${d}/${e.name}` : e.name;
  if (SKIP.test(rel)) return [];
  return e.isDirectory() ? walk(root, rel) : rel.endsWith('.html') ? [rel] : [];
});
const walkAll = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walkAll(path.join(dir, e.name)) : [path.join(dir, e.name)]));

/* ---------- vérifications statiques ---------- */

function statics(root) {
  const F = { url: [], header: [], menu: [], footer: [], pricing: [], lp: [] };
  const i18n = JSON.parse(fs.readFileSync(path.join(root, 'data/i18n.json'), 'utf8'));
  const offre = JSON.parse(fs.readFileSync(path.join(root, 'data/offre.json'), 'utf8'));

  /* url : une seule fois dans les sources */
  for (const u of [LOGIN, SIGNUP]) {
    const hits = [...walkAll(path.join(root, '_src')), path.join(root, 'data/i18n.json'), path.join(root, 'data/offre.json'), path.join(root, 'data/metiers.json')]
      .flatMap((f) => (fs.readFileSync(f, 'utf8').split(u).length - 1 ? [`${path.relative(root, f)}×${fs.readFileSync(f, 'utf8').split(u).length - 1}`] : []));
    if (!(hits.length === 1 && hits[0] === '_src/components/shell.mjs×1')) F.url.push(`${u} : ${hits.join(', ') || 'absente'}`);
  }

  let normal = 0, lps = 0, prices = 0;
  for (const rel of walk(root)) {
    const html = fs.readFileSync(path.join(root, rel), 'utf8');
    if (!/<header class="hdr[" ]/.test(html)) continue;
    const lang = (/<html lang="(\w+)"/.exec(html) || [])[1];
    const t = i18n[lang];
    const L = href(LOGIN, lang), S = href(SIGNUP, lang);
    const days = String(offre.regles.essai_jours);
    if (html.includes('<header class="hdr hdr-bare">')) {
      lps++;
      if (html.includes('app.celya.be')) F.lp.push(`${rel} : lien vers l'application sur une page d'atterrissage`);
      if (!/<div class="price-go"><a class="btn btn-ink" href="#lp" data-demo>[^<]+<\/a><\/div>/.test(html)) F.lp.push(`${rel} : la grille ne garde pas sa seule démo vers #lp`);
      continue;
    }
    normal++;
    /* en-tête */
    const cta = (/<div class="hdr-cta">([\s\S]*?)<\/div>\n<button class="burger"/.exec(html) || [])[1] || '';
    const want = new RegExp(`^<a class="hdr-login" href="${reEsc(L)}" data-app="login" data-place="header">${reEsc(t.login)}</a>` +
      `<a class="btn btn-orange btn-sm hdr-demo" href="[^"]+" data-demo><span class="hd-l">${reEsc(t.cta_demo)}</span><span class="hd-s" aria-hidden="true">${reEsc(t.demo_short)}</span></a>$`);
    if (!want.test(cta)) F.header.push(`${rel} : en-tête « ${cta.slice(0, 160)}… »`);
    const hdr = (/<header class="hdr">[\s\S]*?<\/header>/.exec(html) || [''])[0];
    if (/<div class="hdr-lang">/.test(hdr)) F.header.push(`${rel} : langues en liens côte à côte dans l'en-tête`);
    const langDrop = /<div class="drop hdr-lang"><span class="drop-t" tabindex="0" aria-label="[^"]+">([A-Z]{2})<svg[\s\S]*?<div class="drop-p lang-p">((?:<a href="[^"]+" hreflang="[a-z]{2}" lang="[a-z]{2}">[A-Z]{2}<\/a>)+)<\/div><\/div>/.exec(hdr);
    if (/<nav class="mnav"[\s\S]*?<div class="mnav-lang">[\s\S]*?hreflang=/.test(html) && (!langDrop || langDrop[1] !== lang.toUpperCase() || langDrop[2].includes(`>${lang.toUpperCase()}<`))) F.header.push(`${rel} : sélecteur de langue « ${lang.toUpperCase()} ▾ » absent ou faux`);
    if (/<header class="hdr">[\s\S]*?data-call[\s\S]*?<\/header>/.test(html)) F.header.push(`${rel} : « ${t.cta_call} » encore dans l'en-tête`);
    /* menu mobile (23/11/2026) */
    const mnav = (/<nav class="mnav" id="mnav"[\s\S]*?<\/nav>/.exec(html) || [''])[0];
    const menu = new RegExp(`<div class="mnav-app"><a class="btn btn-orange" href="${reEsc(S)}" data-app="signup" data-place="menu">${reEsc(t.trial_menu.replace('{{offre.essai}}', days))}</a>` +
      `<div class="mnav-foot"><a class="mnav-login" href="${reEsc(L)}" data-app="login" data-place="menu">${reEsc(t.login)}</a><div class="mnav-lang">`);
    if (!menu.test(mnav)) F.menu.push(`${rel} : bas du panneau absent ou dans le désordre (essai, puis Se connecter et les langues)`);
    if (/data-demo/.test(mnav)) F.menu.push(`${rel} : « ${t.cta_demo} » répété dans le panneau`);
    const list = (/<div class="mnav-list">([\s\S]*?)<\/div><div class="mnav-app">/.exec(mnav) || [])[1] || '';
    const entries = [...list.replace(/(<details class="mnav-met"><summary>[^<]*)[\s\S]*?<\/details>/g, '$1').matchAll(/<(?:a href="[^"]*"|details class="mnav-met"><summary)>([^<]*)/g)].map((m) => m[1]);
    if (entries.join('|') !== t.nav.map((n) => n.label).join('|')) F.menu.push(`${rel} : entrées « ${entries.join(' | ')} » ≠ en-tête « ${t.nav.map((n) => n.label).join(' | ')} »`);
    const met = (/<details class="mnav-met">[\s\S]*?<\/details>/.exec(list) || [''])[0];
    const metLinks = [...met.matchAll(/<a (?:class="mnav-all" )?href="[^"]*">([^<]*)/g)].map((m) => m[1].trim());
    const wantMet = [...t.metiers_nav.map(([, l]) => l), ...(t.metiers_all ? [t.metiers_all[1]] : [])];
    if (metLinks.join('|') !== wantMet.join('|')) F.menu.push(`${rel} : « ${t.nav.find((n) => n.drop).label} » : ${metLinks.length} lien(s) au lieu de ${wantMet.length}`);
    /* pied de page : après Contact, dans la dernière colonne */
    const cols = (/<div class="ft-cols">([\s\S]*?)<\/div><\/div>\n/.exec(html) || [])[1] || '';
    const last = cols.split('<div><b>').pop();
    if (!new RegExp(`<a href="[^"]*contact\\.html">[^<]+</a><a class="ft-login" href="${reEsc(L)}" data-app="login" data-place="footer">${reEsc(t.login)}</a>`).test(last)) F.footer.push(`${rel} : « ${t.login} » absent de la colonne ${(/^[^<]+/.exec(last) || [''])[0]} (après Contact)`);
    /* compte : en-tête, menu, pied de page ; grille de prix */
    const nL = html.split(`"${L}"`).length - 1, nS = html.split(`"${S}"`).length - 1;
    const go = html.match(/<div class="price-go">[\s\S]*?<\/div>/g) || [];
    if (nL !== 3) F.footer.push(`${rel} : ${nL} lien(s) « ${t.login} » (3 attendus : en-tête, menu, pied de page)`);
    if (nS !== 1 + go.length) F.pricing.push(`${rel} : ${nS} lien(s) d'essai pour ${go.length} grille(s) (menu + grilles attendus)`);
    /* grille de prix */
    const rule = offre.regles.essai[lang].replace('{{offre.essai}}', days) + '.';
    for (const g of go) {
      prices++;
      const w = new RegExp(`^<div class="price-go"><a class="btn btn-orange" href="${reEsc(S)}" data-app="signup" data-place="pricing">${reEsc(t.price_trial)}</a>` +
        `<a class="btn btn-line" href="[^"]+" data-demo>${reEsc(t.price_start)}</a><small>${reEsc(rule)}</small></div>$`);
      if (!w.test(g)) F.pricing.push(`${rel} : grille « ${g.slice(0, 200)}… »`);
    }
  }
  if (normal < 250) F.header.push(`seulement ${normal} pages avec menu`);
  if (lps !== 4) F.lp.push(`${lps} pages d'atterrissage (4 attendues)`);
  if (prices < 20) F.pricing.push(`seulement ${prices} grilles de prix trouvées`);
  return { F, normal, lps, prices };
}

/* ---------- vérifications dans Chromium ---------- */

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.avif': 'image/avif', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.mp4': 'video/mp4' };
function serve(root) {
  return new Promise((res) => {
    const srv = http.createServer((req, rsp) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p.endsWith('/')) p += 'index.html';
      const f = path.join(root, p);
      if (!f.startsWith(root) || !fs.existsSync(f)) { rsp.writeHead(404); return rsp.end(); }
      rsp.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(rsp);
    }).listen(0, '127.0.0.1', () => res(srv));
  });
}

async function browserChecks(root, browser, { widths = [360, 390, 768, 1024, 1050, 1180, 1181, 1200, 1280, 1440], pages = ['index.html', 'nl/index.html', 'en/index.html', 'prise-de-message.html'] } = {}) {
  const F = { layout: [], events: [] };
  const srv = await serve(root);
  const base = `http://127.0.0.1:${srv.address().port}/`;
  const css = fs.readFileSync(path.join(root, 'celya.css'), 'utf8');
  const i18n = JSON.parse(fs.readFileSync(path.join(root, 'data/i18n.json'), 'utf8'));
  const burgerMax = +((/@media \(max-width:(\d+)px\)\{[^\n]*\n\s*\.hdr-nav,\.hdr-lang\{display:none\}/.exec(css) || [])[1] || 0);
  const newCtx = async (w, consent) => {
    const ctx = await browser.newContext({ viewport: { width: w, height: 800 }, reducedMotion: 'reduce' });
    await ctx.addInitScript((v) => {
      try { localStorage.setItem('celya-consent', v); } catch (e) {}
      /* rester sur la page après le clic : la navigation vers l'application est empêchée APRÈS celya.js */
      addEventListener('click', (e) => { if (e.target.closest && e.target.closest('a[data-app]')) e.preventDefault(); });
    }, consent);
    await ctx.route('**/*', (r) => (isLocal(r.request().url()) ? r.continue() : r.abort()));
    return ctx;
  };
  /* layout */
  for (const rel of pages) {
    for (const w of widths) {
      const ctx = await newCtx(w, 'denied');
      const p = await ctx.newPage();
      await p.goto(base + rel, { waitUntil: 'load' });
      await p.evaluate(() => document.fonts.ready);
      const r = await p.evaluate(() => {
        const hi = document.querySelector('.hdr-in'), H = hi.getBoundingClientRect();
        const vis = (e) => e && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden';
        const out = [...hi.querySelectorAll('*')].filter(vis).map((e) => [e, e.getBoundingClientRect()])
          .filter(([, b]) => b.width && (b.right > H.right + 0.5 || b.left < H.left - 0.5 || b.bottom > H.bottom + 0.5)).map(([e]) => e.className || e.tagName);
        const order = [...document.querySelectorAll('.hdr-cta > *')].filter(vis).map((e) => [e.className.split(' ').pop(), e.getBoundingClientRect()]);
        const sorted = order.every((x, i) => !i || order[i - 1][1].right <= x[1].left);
        const lines = [...document.querySelectorAll('.hdr-cta > *')].filter(vis).every((e) => e.getClientRects().length === 1 && e.getBoundingClientRect().height < 60);
        /* libellé affiché : le court sous 720 px, le complet au-dessus (24/11/2026) */
        const shown = (e) => e && e.getBoundingClientRect().width > 2 && getComputedStyle(e).display !== 'none';
        const label = shown(document.querySelector('.hdr-demo .hd-s')) && !shown(document.querySelector('.hdr-demo .hd-l')) ? 'court'
          : shown(document.querySelector('.hdr-demo .hd-l')) && !shown(document.querySelector('.hdr-demo .hd-s')) ? 'complet' : 'les deux ou aucun';
        return { out, sw: document.documentElement.scrollWidth, vw: innerWidth, order: order.map((x) => x[0]), sorted, lines, label, lang: document.documentElement.lang, burger: vis(document.querySelector('.burger')), nav: vis(document.querySelector('.hdr-nav')) };
      });
      /* nom accessible du lien de démo : toujours le libellé complet, même quand le court s'affiche */
      const full = i18n[r.lang].cta_demo;
      r.name = (await p.getByRole('link', { name: full, exact: true }).and(p.locator('.hdr-cta .hdr-demo')).count()) === 1 ? full : 'absent';
      /* 24/11/2026 : « Se connecter » visible à toutes les largeurs, à gauche du bouton de démo */
      const wantOrder = ['hdr-login', 'hdr-demo'];
      const okLayout = !r.out.length && r.sw === r.vw && r.sorted && r.lines && JSON.stringify(r.order) === JSON.stringify(wantOrder)
        && r.label === (w <= 720 ? 'court' : 'complet') && r.name === full && r.burger === (w <= burgerMax) && r.nav === (w > burgerMax);
      if (!okLayout) F.layout.push(`${rel} @${w} : ${JSON.stringify(r)}`);
      if (r.burger) {
        await p.click('.burger', { timeout: 3000 }).catch(() => {});
        const m = await p.evaluate(() => {
          const n = document.querySelector('.mnav'), a = document.querySelector('.mnav-app'), N = n.getBoundingClientRect();
          if (!a) return { missing: true };
          const kids = [...a.querySelectorAll('[data-app], .mnav-lang a')].map((e) => [e.dataset.app || 'lang', e.getBoundingClientRect()]);
          const inside = kids.every(([, b]) => b.width > 0 && b.left >= N.left - 0.5 && b.right <= N.right + 0.5 && b.bottom <= N.bottom + 0.5);
          const z = { top: 0, bottom: 0, left: 0, right: 0 }, gb = (e) => (e ? e.getBoundingClientRect() : z);
          const tr = gb(a.querySelector('[data-app=signup]')), lg = gb(a.querySelector('[data-app=login]')), la = gb(a.querySelector('.mnav-lang'));
          return { order: kids.map((k) => k[0]).filter((x, i, l) => l.indexOf(x) === i), inside, row: tr.bottom <= lg.top + 0.5 && Math.abs(lg.top - la.top) < 8 && lg.right <= la.left, sw: document.documentElement.scrollWidth, vw: innerWidth };
        });
        if (!(m.inside && m.row && m.sw === m.vw && m.order.join() === 'signup,login,lang')) F.layout.push(`${rel} @${w} menu ouvert : ${JSON.stringify(m)}`);
      }
      await ctx.close();
    }
  }
  /* mnav : le menu mobile ouvert (23/11/2026) */
  F.mnav = [];
  for (const [rel, w, h] of [['index.html', 360, 640], ['nl/index.html', 390, 844], ['en/index.html', 768, 1024], ['prise-de-message.html', 360, 640]]) {
    for (const banner of [true, false]) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h } });
      if (!banner) await ctx.addInitScript(() => { try { localStorage.setItem('celya-consent', 'denied'); } catch (e) {} });
      await ctx.route('**/*', (r) => (isLocal(r.request().url()) ? r.continue() : r.abort()));
      const p = await ctx.newPage();
      await p.goto(base + rel, { waitUntil: 'load' });
      await p.evaluate(() => document.fonts.ready);
      await p.evaluate(() => scrollTo(0, 900));
      await p.waitForTimeout(350);
      const tag = `${rel} @${w}×${h}${banner ? ' bandeau cookies' : ''}`;
      const before = await p.evaluate(() => ({ y: scrollY, label: document.querySelector('.burger').getAttribute('aria-label') }));
      /* un appui direct, comme un doigt : le clic de Playwright ferait d'abord défiler la page vers l'en-tête collant (scrollIntoView) */
      const tap = () => p.evaluate(() => document.querySelector('.burger').click());
      await tap();
      await p.waitForTimeout(300);
      const r = await p.evaluate(() => {
        const q = (s) => document.querySelector(s), R = (e) => e.getBoundingClientRect();
        const nav = q('.mnav'), N = R(nav), hdr = R(q('.hdr-in')), ban = q('.cbanner'), B = ban ? R(ban) : null, veil = q('.mnav-veil');
        const vis = (e) => { if (!e) return false; const b = R(e); return b.width > 0 && b.top >= N.top - 0.5 && b.bottom <= N.bottom + 0.5 && b.bottom <= innerHeight && (!B || b.bottom <= B.top + 0.5); };
        const acts = [q('.mnav-app [data-app=signup]'), q('.mnav-app [data-app=login]'), ...document.querySelectorAll('.mnav-lang a')];
        const targets = [...nav.querySelectorAll('.mnav-list > a, .mnav-met > summary, .mnav-app a')].map((e) => Math.round(R(e).height));
        const bar = q('.mbar');
        const vs = getComputedStyle(veil);
        return {
          expanded: q('.burger').getAttribute('aria-expanded'), label: q('.burger').getAttribute('aria-label'),
          cross: getComputedStyle(q('.burger i')).transform !== getComputedStyle(q('.burger i + i')).transform && /matrix\(0\.7/.test(getComputedStyle(q('.burger i')).transform),
          under: N.top >= hdr.bottom - 0.5, aboveBanner: !B || N.bottom <= B.top + 0.5, actsVisible: acts.every(vis), nActs: acts.length,
          minTarget: Math.min(...targets), veil: vs.display !== 'none' && /rgba\(/.test(vs.backgroundColor) && R(veil).height >= innerHeight - 1,
          noBlur: [nav, veil, q('.hdr')].every((e) => getComputedStyle(e).backdropFilter === 'none' && getComputedStyle(e).filter === 'none'),
          locked: getComputedStyle(document.documentElement).overflow === 'hidden' || getComputedStyle(document.body).overflow === 'hidden',
          mbar: bar ? bar.checkVisibility({ visibilityProperty: true }) : false, sw: document.documentElement.scrollWidth, vw: innerWidth,
        };
      });
      const okMenu = r.expanded === 'true' && r.label !== before.label && r.cross && r.under && r.aboveBanner && r.actsVisible && r.minTarget >= 44 && r.veil && r.noBlur && r.locked && !r.mbar && r.sw === r.vw;
      if (!okMenu) F.mnav.push(`${tag} : ${JSON.stringify(r)} (fermé : « ${before.label} »)`);
      /* la page derrière ne défile pas */
      await p.mouse.move(w / 2, h - 40); await p.mouse.wheel(0, 600); await p.waitForTimeout(250);
      if ((await p.evaluate(() => scrollY)) !== before.y) F.mnav.push(`${tag} : la page derrière défile, menu ouvert`);
      /* « Votre métier » s'ouvre sur place, ses liens dans le panneau */
      await p.click('.mnav-met > summary');
      const met = await p.evaluate(() => {
        const d = document.querySelector('.mnav-met'), a = d.querySelectorAll('.mnav-grid a'), N = document.querySelector('.mnav').getBoundingClientRect(), ban = document.querySelector('.cbanner'), B = ban ? ban.getBoundingClientRect() : null;
        const acts = [document.querySelector('.mnav-app [data-app=signup]'), document.querySelector('.mnav-app [data-app=login]'), ...document.querySelectorAll('.mnav-lang a')];
        return { open: d.open, n: a.length, inside: [...a].every((x) => { const b = x.getBoundingClientRect(); return b.left >= N.left && b.right <= N.right; }), still: !!document.querySelector('body.mnav-open'),
          aboveBanner: N.bottom <= innerHeight && (!B || N.bottom <= B.top + 0.5), acts: acts.every((e) => { if (!e) return false; const b = e.getBoundingClientRect(); return b.bottom <= N.bottom + 0.5 && b.top >= N.top; }) };
      });
      if (!(met.open && met.n >= 4 && met.inside && met.still && met.aboveBanner && met.acts)) F.mnav.push(`${tag} : « Votre métier » : ${JSON.stringify(met)}`);
      /* fermeture : le voile */
      const hdrB = await p.evaluate(() => document.querySelector('.mnav').getBoundingClientRect().bottom);
      await p.mouse.click(w / 2, Math.min(h - 10, hdrB + 30)).catch(() => {});
      await p.waitForTimeout(200);
      const shut = await p.evaluate(() => ({ open: document.body.classList.contains('mnav-open'), label: document.querySelector('.burger').getAttribute('aria-label') }));
      const banTop = await p.evaluate(() => { const b = document.querySelector('.cbanner'); return b ? b.getBoundingClientRect().top : Infinity; });
      if (hdrB + 30 < Math.min(h - 10, banTop) && (shut.open || shut.label !== before.label)) F.mnav.push(`${tag} : un appui sur le voile ne ferme pas le menu (${JSON.stringify(shut)})`);
      /* fermeture : Échap */
      await tap(); await p.keyboard.press('Escape'); await p.waitForTimeout(100);
      if (await p.evaluate(() => document.body.classList.contains('mnav-open'))) F.mnav.push(`${tag} : Échap ne ferme pas le menu`);
      /* fermeture : un lien (ancre de la page, pour rester sur place) */
      await tap();
      await p.evaluate(() => { const a = document.querySelector('.mnav-list > a'); a.setAttribute('href', '#main'); });
      await p.click('.mnav-list > a');
      await p.waitForTimeout(150);
      if (await p.evaluate(() => document.body.classList.contains('mnav-open') || document.querySelector('.burger').getAttribute('aria-expanded') !== 'false')) F.mnav.push(`${tag} : un appui sur un lien ne ferme pas le menu`);
      await ctx.close();
    }
  }
  /* events */
  const cases = [
    ['index.html', 1440, '.hdr-login', 'login_click', 'header', 'fr'],
    ['nl/index.html', 1440, '.hdr-login', 'login_click', 'header', 'nl'],
    ['en/index.html', 390, '.mnav-app [data-app=signup]', 'sign_up_start', 'menu', 'en'],
    ['index.html', 390, '.mnav-login', 'login_click', 'menu', 'fr'],
    ['prix.html', 1440, '.price-go [data-app=signup]', 'sign_up_start', 'pricing', 'fr'],
    ['nl/prijzen.html', 390, '.price-go [data-app=signup]', 'sign_up_start', 'pricing', 'nl'],
    ['en/index.html', 1440, '.ft-login', 'login_click', 'footer', 'en'],
  ];
  for (const [rel, w, sel, ev, place, lang] of cases) {
    for (const consent of ['granted', 'denied']) {
      const ctx = await newCtx(w, consent);
      const p = await ctx.newPage();
      await p.goto(base + rel, { waitUntil: 'load' });
      if (place === 'menu') await p.click('.burger', { timeout: 3000 }).catch(() => {});
      if (!(await p.locator(sel).count())) { F.events.push(`${rel} @${w} : ${sel} introuvable`); await ctx.close(); continue; }
      await p.locator(sel).first().scrollIntoViewIfNeeded({ timeout: 3000 }).catch(() => {});
      await p.locator(sel).first().click({ force: true, timeout: 3000 }).catch(() => {});
      const r = await p.evaluate(() => ({ url: location.pathname, dl: (window.dataLayer || []).filter((e) => e && /^(sign_up_start|login_click)$/.test(e.event)).map((e) => ({ event: e.event, place: e.place, page: e.page, lang: e.lang })) }));
      const want = consent === 'granted' ? [{ event: ev, place, page: '/' + rel, lang }] : [];
      if (JSON.stringify(r.dl) !== JSON.stringify(want)) F.events.push(`${rel} @${w} ${sel} (${consent}) : ${JSON.stringify(r.dl)} ≠ ${JSON.stringify(want)}`);
      await ctx.close();
    }
  }
  srv.close();
  return F;
}

/* ---------- rapport ---------- */

async function run(root, { quiet = false, browserOpts } = {}) {
  const s = statics(root);
  const browser = await chromium.launch();
  const b = await browserChecks(root, browser, browserOpts);
  await browser.close();
  const F = { ...s.F, ...b };
  if (!quiet) {
    const label = { url: 'adresses écrites une seule fois (shell.mjs)', header: `en-tête des ${s.normal} pages avec menu : Se connecter, démo ; langue en sélecteur`, menu: 'menu mobile : entrées de l\'en-tête, métiers dans le HTML, essai puis connexion et langues, pas de démo', footer: 'pied de page : Se connecter après Contact', pricing: `${s.prices} grilles de prix : essai, démo, règle de l'essai`, lp: `${s.lps} pages d'atterrissage : aucun lien vers l'application`, layout: 'en-tête dans son cadre, Se connecter puis démo (court sous 720 px, nom complet), menu (360 à 1440 px, FR/NL/EN)', mnav: 'menu ouvert : croix, « Fermer », voile, page figée, barre cachée, actions visibles à 360 × 640 bandeau affiché, 44 px, fermeture au voile, au lien, à Échap', events: 'sign_up_start / login_click avec accord, rien sans' };
    for (const [k, v] of Object.entries(F)) {
      console.log(`  ${v.length ? '✗' : '✓'} ${label[k]}`);
      v.slice(0, 8).forEach((x) => console.log(`      ${x}`));
      if (v.length > 8) console.log(`      … ${v.length - 8} de plus`);
    }
  }
  return F;
}

/* ---------- mutants : chaque vérification doit crier sur une copie cassée ---------- */

const MUTANTS = [
  ['url', 'adresse recopiée dans un composant', (r) => fs.appendFileSync(path.join(r, '_src/components/blocks.mjs'), `\n/* ${LOGIN} */\n`)],
  ['header', '« Se connecter » après la démo', (r) => edit(r, 'index.html', /(<a class="hdr-login"[^>]*>[^<]*<\/a>)(<a class="btn btn-orange btn-sm hdr-demo"[^>]*>[\s\S]*?<\/a>)/, '$2$1')],
  ['header', 'libellé court retiré de l\'en-tête', (r) => edit(r, 'en/index.html', /<span class="hd-s" aria-hidden="true">[^<]*<\/span>/, '')],
  ['header', '« Essai gratuit » revient dans l\'en-tête', (r) => edit(r, 'prix.html', /(<a class="btn btn-orange btn-sm hdr-demo"[^>]*>[\s\S]*?<\/a>)<\/div>/, `$1<a class="btn btn-orange btn-sm hdr-trial" href="${SIGNUP}" data-app="signup" data-place="header">Essai gratuit</a></div>`)],
  ['header', 'langues de nouveau côte à côte', (r) => edit(r, 'en/index.html', /<div class="drop hdr-lang">[\s\S]*?<\/div><\/div>/, '<div class="hdr-lang"><a href="../index.html">FR</a><a href="../nl/index.html">NL</a><a class="on" href="index.html">EN</a></div>')],
  ['header', '« Appeler Janet » revient dans l\'en-tête', (r) => edit(r, 'garages.html', /(<div class="hdr-cta">)/, '$1<a class="btn btn-orange btn-sm hdr-call" href="tel:+32460254413" data-call>x</a>')],
  ['header', '?lang=nl oublié', (r) => edit(r, 'nl/garages.html', 'https://app.celya.be/login?lang=nl" data-app="login" data-place="header"', 'https://app.celya.be/login" data-app="login" data-place="header"')],
  ['menu', 'connexion retirée du menu', (r) => edit(r, 'nl/index.html', /<a class="mnav-login"[^>]*>[^<]*<\/a>/, '')],
  ['menu', '« Demander une démo » revient dans le panneau', (r) => edit(r, 'prix.html', /(<div class="mnav-app"><a class="btn btn-orange"[^>]*>[^<]*<\/a>)/, '$1<a class="btn btn-line" href="demo.html" data-demo>Demander une démo</a>')],
  ['menu', 'un métier manque dans le panneau', (r) => edit(r, 'garages.html', /(<div class="mnav-grid">)<a href="[^"]*">[^<]*<\/a>/, '$1')],
  ['menu', 'entrées dans le désordre', (r) => edit(r, 'en/index.html', /(<div class="mnav-list">)(<a href="[^"]*">[^<]*<\/a>)(<details[\s\S]*?<\/details>)/, '$1$3$2')],
  ['mnav', 'le voile ne ferme plus', (r) => edit(r, 'celya.js', '(x===veil||(nav&&nav.contains(x)&&x.closest(\'a\')))', '(nav&&nav.contains(x)&&x.closest(\'a\'))')],
  ['mnav', 'un lien ne ferme plus', (r) => edit(r, 'celya.js', '(x===veil||(nav&&nav.contains(x)&&x.closest(\'a\')))', '(x===veil)')],
  ['mnav', 'la page derrière défile', (r) => edit(r, 'celya.css', '  html.mnav-open{overflow:hidden}', '')],
  ['mnav', 'la barre d\'appel reste', (r) => edit(r, 'celya.css', '.mnav-open .mbar,.mbar-hide .mbar{', '.mbar-hide .mbar{')],
  ['mnav', 'le panneau passe sous le bandeau cookies', (r) => edit(r, 'celya.css', 'max-height:calc(100dvh - var(--mnav-top) - var(--cbanner-h,0px))}', 'max-height:none}')],
  ['mnav', 'aria-label figé sur « Menu »', (r) => edit(r, 'celya.js', "var l=btn.getAttribute(open?'data-close':'data-open');", "var l=btn.getAttribute('data-open');")],
  ['mnav', 'zones d\'appui trop petites', (r) => edit(r, 'celya.css', '.mnav-lang a{display:inline-flex;align-items:center;justify-content:center;min-width:44px;min-height:44px;padding:0 6px}', '.mnav-lang a{display:inline-flex;padding:4px}')],
  ['mnav', 'voile flouté', (r) => edit(r, 'celya.css', '.mnav-veil{position:fixed;inset:0;z-index:-1;background:rgba(21,21,21,.42)}', '.mnav-veil{position:fixed;inset:0;z-index:-1;background:rgba(21,21,21,.42);backdrop-filter:blur(4px)}')],
  ['footer', 'connexion retirée du pied de page', (r) => edit(r, 'en/index.html', /<a class="ft-login"[^>]*>[^<]*<\/a>/, '')],
  ['pricing', 'essai retiré de la grille', (r) => edit(r, 'prix.html', /(<div class="price-go">)<a class="btn btn-orange"[^>]*>[^<]*<\/a>/, '$1')],
  ['pricing', 'règle de l\'essai modifiée', (r) => edit(r, 'nl/prijzen.html', /(<div class="price-go">[\s\S]*?<small>)[^<]*/, '$130 dagen gratis.')],
  ['lp', 'connexion sur une page d\'atterrissage', (r) => edit(r, 'lp/garages.html', /(<\/footer>)/, `<a href="${LOGIN}">x</a>$1`)],
  ['layout', 'seuil du menu ramené à 1040 px', (r) => edit(r, 'celya.css', '@media (max-width:1180px){', '@media (max-width:1040px){')],
  ['layout', 'connexion de nouveau masquée sous 720 px', (r) => edit(r, 'celya.css', '  .hdr-login{display:inline-flex;align-items:center;min-height:44px;padding:0 6px;font-size:14px}', '  .hdr-login{display:none}')],
  ['layout', 'libellé complet masqué par display:none sous 720 px (plus de nom accessible)', (r) => edit(r, 'celya.css', '  .hdr-demo .hd-l{position:absolute!important;', '  .hdr-demo .hd-l{display:none;position:absolute!important;')],
  ['layout', 'libellé court affiché sur ordinateur', (r) => edit(r, 'celya.css', '.hdr-demo .hd-s{display:none}', '.hdr-demo .hd-s{display:inline}')],
  ['layout', 'menu : bloc d\'accès qui déborde', (r) => edit(r, 'celya.css', '.mnav-app .btn{width:100%}', '.mnav-app .btn{width:130%}')],
  ['events', 'sign_up_start renommé', (r) => edit(r, 'celya.js', "'sign_up_start'", "'signup_start'")],
  ['events', 'place perdu', (r) => edit(r, 'celya.js', "place:app.getAttribute('data-place')||''", "place:''")],
  ['events', 'événement envoyé sans accord', (r) => edit(r, 'celya.js', "if(app)track({event:", "if(app)(window.dataLayer=window.dataLayer||[]).push({event:")],
];
function edit(root, rel, from, to) {
  const f = path.join(root, rel), s = fs.readFileSync(f, 'utf8');
  const n = typeof from === 'string' ? s.replace(from, to) : s.replace(from, to);
  if (n === s) throw new Error(`mutant sans effet sur ${rel}`);
  fs.writeFileSync(f, n);
}
async function mutants() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'acces-app-'));
  const copy = () => {
    fs.rmSync(path.join(tmp, 'r'), { recursive: true, force: true });
    fs.cpSync(REPO, path.join(tmp, 'r'), { recursive: true, filter: (s) => !/\/(\.git|node_modules|docs)(\/|$)/.test(s.slice(REPO.length)) });
    return path.join(tmp, 'r');
  };
  let killed = 0;
  for (const [id, what, apply] of MUTANTS) {
    const r = copy();
    apply(r);
    const browserOpts = ['layout', 'events', 'mnav'].includes(id) ? undefined : { widths: [1440], pages: ['index.html'] };
    const F = await run(r, { quiet: true, browserOpts });
    const hit = F[id].length > 0;
    killed += hit;
    console.log(`  ${hit ? '✓' : '✗'} ${id} crie : ${what}${hit ? '' : ' — NON DÉTECTÉ'}`);
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`\n${killed}/${MUTANTS.length} mutants détectés.`);
  process.exit(killed === MUTANTS.length ? 0 : 1);
}

if (process.argv.includes('--mutants')) await mutants();
else {
  console.log('Accès à l\'application (19/11/2026)');
  const F = await run(REPO);
  const n = Object.values(F).reduce((a, v) => a + v.length, 0);
  console.log(n ? `\n${n} écart(s).` : '\nTout passe.');
  process.exit(n ? 1 : 0);
}
