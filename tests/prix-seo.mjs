#!/usr/bin/env node
/* Les prix dans le SEO et pour les assistants IA (lot du 28/11/2026).
 *
 * Sur chaque page générée (_src/pages → page servie) et sur /llms.txt :
 *  1. aucun montant en euros, dans le texte comme dans le JSON-LD (réponses du
 *     FAQPage comprises), qui ne soit pas un prix d'une formule de
 *     data/offre.json (49 / 99 / 199). Les listes et les plages (« 49, 99 et
 *     199 € », « 300 – 3 000 € ») sont lues nombre par nombre. Seules
 *     exceptions : le coût Meta des messages WhatsApp (regles.meta_mensuel_approx,
 *     dans sa phrase), et les montants qui ne sont pas des prix de Celya, listés
 *     page par page ci-dessous (HORS_GRILLE), avec leur raison ;
 *  2. dans le JSON-LD, tout price / lowPrice / highPrice / minPrice / maxPrice
 *     est un prix de la grille ;
 *  3. tout nœud Service porte "offers" : un AggregateOffer (lowPrice = le prix
 *     le plus bas, highPrice = le plus haut, offerCount = nombre de formules,
 *     EUR, hors TVA, url = la page prix de la langue) ;
 *  4. sur les pages prix, cet AggregateOffer contient les Offer de chaque
 *     formule : bon prix pour le nom, une description qui donne les minutes,
 *     une url vers l'ancre de la carte, ancre présente dans la page, et la
 *     référence mensuelle (UnitPriceSpecification, unitCode MON) ;
 *  5. l'Organization porte "sameAs" ;
 *  6. /llms.txt donne chaque formule avec son prix et ses minutes, et est à
 *     jour (node _src/build.mjs --check le vérifie aussi).
 *
 *   node tests/prix-seo.mjs            vérifie le site
 *   node tests/prix-seo.mjs --mutants  vérifie que chaque contrôle crie sur une copie cassée
 * Sortie 1 au premier écart. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadData } from '../_src/lib/core.mjs';
import { PRIX_URL, SAME_AS } from '../_src/lib/jsonld.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { offre } = loadData();
const F = offre.formules;
const PRIX = F.map((f) => f.prix_ht);
const META = offre.regles.meta_mensuel_approx;
const PAGES_PRIX = { 'prix.html': 'fr', 'nl/prijzen.html': 'nl', 'en/pricing.html': 'en' };

/* Montants publiés qui ne sont pas des prix de Celya : { page : { montant : raison } } */
const HORS_GRILLE = {
  'garages.html': { 120: "exemple de tarif que le garage donne lui-même (FAQ « Peut-elle donner mes tarifs ? »)" },
  'blog/garages-appels-manques.html': { 150: 'prix d’atelier (vidange) de l’enquête sur les garages', 300: 'travail d’atelier en jeu (enquête garages)', 500: 'entretien complet (enquête garages)', 3000: 'travail d’atelier en jeu (enquête garages)' },
  'nl/blog/garages-gemiste-oproepen.html': { 150: 'prix d’atelier (enquête garages)', 300: 'enquête garages', 500: 'enquête garages', 3000: 'enquête garages' },
  'en/blog/garages-missed-calls.html': { 150: 'prix d’atelier (enquête garages)', 300: 'enquête garages', 500: 'enquête garages', 3000: 'enquête garages' },
  'combien-coute-une-secretaire-en-belgique.html': { 2200: 'hypothèse de salaire brut (source Securex, CP 200)', 550: 'part de cette hypothèse', 2024: 'pécule de vacances de cette hypothèse', 168: 'idem, par mois', 183: 'prime de fin d’année de cette hypothèse, par mois' },
  'nl/wat-kost-een-secretaresse-in-belgie.html': { 2200: 'hypothèse de salaire brut (source Securex, PC 200)', 550: 'part de cette hypothèse', 2024: 'vakantiegeld de cette hypothèse', 168: 'idem, par mois', 183: 'eindejaarspremie de cette hypothèse, par mois' },
  'si-je-suis-souvent-en-deplacement.html': { 174: 'amende pour distraction au volant (source mobilit.belgium.be)' },
};

const UTILISEES = new Set();   /* exceptions rencontrées : une exception qui ne sert plus est un écart */

const dec = (h) => h
  .replace(/&nbsp;|&#160;|&#xa0;|&#8239;|&#x202f;|&thinsp;/gi, ' ')
  .replace(/&euro;|&#8364;|&#x20ac;/gi, '€')
  .replace(/&ndash;|&#8211;/gi, '–').replace(/&amp;/g, '&')
  .replace(/[   ]/g, ' ');
const NUM = String.raw`\d{1,3}(?:[ .,]\d{3})+|\d+`;
const LIEN = String.raw`\s*(?:,|–|-|à|et|en|and|ou|of|or|tot|to)\s*`;
const EUR_APRES = new RegExp(String.raw`(?<![\d.,])((?:${NUM})(?:[.,]\d{1,2})?(?:${LIEN}(?:${NUM})(?:[.,]\d{1,2})?)*)\s*(?:€|euros?\b|EUR\b)`, 'gi');
const EUR_AVANT = new RegExp(String.raw`€\s*((?:${NUM})(?:[.,]\d{1,2})?(?:${LIEN}€?\s*(?:${NUM})(?:[.,]\d{1,2})?)*)`, 'g');
const valeur = (s) => {
  const t = s.replace(/\s/g, '');
  if (/^\d{1,3}([.,]\d{3})+$/.test(t)) return +t.replace(/[.,]/g, '');
  return Math.round(parseFloat(t.replace(',', '.')) * 100) / 100;
};
const nombres = (chaine) => (chaine.match(new RegExp(String.raw`(?:${NUM})(?:[.,]\d{1,2})?`, 'g')) || []).map(valeur);

/** Montants en euros d'un texte : [{ v, i, ctx }] */
export function montants(txt) {
  const out = [];
  for (const re of [EUR_APRES, EUR_AVANT]) {
    for (const m of txt.matchAll(re)) for (const v of nombres(m[1])) out.push({ v, i: m.index, ctx: txt.slice(Math.max(0, m.index - 60), m.index + m[0].length + 20) });
  }
  return out;
}

function texteMontants(rel, txt, err) {
  const hors = HORS_GRILLE[rel] || {};
  for (const { v, i, ctx } of montants(txt)) {
    if (PRIX.includes(v)) continue;
    if (v === META && /Meta/.test(txt.slice(Math.max(0, i - 250), i))) continue;
    if (v in hors) { UTILISEES.add(`${rel} ${v}`); continue; }
    err.push(`montant hors grille « ${v} » : …${ctx.replace(/\s+/g, ' ')}…`);
  }
}

function graphOf(html, err) {
  const g = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { const d = JSON.parse(m[1]); g.push(...(d['@graph'] || [d])); } catch (e) { err.push(`JSON-LD invalide : ${e.message}`); }
  }
  return g;
}

function walk(v, fn) {
  if (Array.isArray(v)) v.forEach((x) => walk(x, fn));
  else if (v && typeof v === 'object') { fn(v); Object.values(v).forEach((x) => walk(x, fn)); }
}

/** Les écarts d'une page : [] si elle est conforme. */
export function checkPage(rel, html, lang) {
  const err = [];
  const sansScripts = html.replace(/<script(?![^>]*application\/ld\+json)[^>]*>[\s\S]*?<\/script>/gi, '');
  texteMontants(rel, dec(sansScripts), err);
  const graph = graphOf(html, err);
  walk(graph, (o) => {
    for (const k of ['price', 'lowPrice', 'highPrice', 'minPrice', 'maxPrice']) {
      if (k in o && !PRIX.includes(valeur(String(o[k])))) err.push(`JSON-LD ${o['@type']}.${k} = ${o[k]} : hors grille (${PRIX.join(' / ')})`);
    }
  });
  for (const n of graph.filter((x) => x['@type'] === 'Service')) {
    const a = n.offers;
    if (!a) { err.push(`Service ${n['@id'] || ''} sans "offers"`); continue; }
    if (a['@type'] !== 'AggregateOffer') { err.push(`Service ${n['@id'] || ''} : offers n'est pas un AggregateOffer`); continue; }
    const attendu = { lowPrice: Math.min(...PRIX), highPrice: Math.max(...PRIX), priceCurrency: 'EUR', offerCount: F.length, valueAddedTaxIncluded: false, url: PRIX_URL[lang] };
    for (const [k, v] of Object.entries(attendu)) if (a[k] !== v) err.push(`AggregateOffer.${k} = ${JSON.stringify(a[k])}, attendu ${JSON.stringify(v)}`);
    if (PAGES_PRIX[rel]) {
      const liste = a.offers || [];
      if (liste.length !== F.length) err.push(`page prix : ${liste.length} Offer dans l'AggregateOffer, ${F.length} attendues`);
      for (const f of F) {
        const o = liste.find((x) => x.name === f.nom[lang]);
        if (!o) { err.push(`page prix : pas d'Offer « ${f.nom[lang]} »`); continue; }
        if (valeur(String(o.price)) !== f.prix_ht) err.push(`Offer « ${o.name} » : price ${o.price}, attendu ${f.prix_ht}`);
        if (!o.description || !new RegExp(`(^|\\D)${f.minutes}\\s`).test(o.description.replace(/[  ]/g, ' '))) err.push(`Offer « ${o.name} » : description sans ses ${f.minutes} minutes`);
        const ancre = (o.url || '').split('#')[1];
        if (!o.url || !o.url.startsWith(PRIX_URL[lang] + '#') || !html.includes(`id="${ancre}"`)) err.push(`Offer « ${o.name} » : url ${o.url} sans ancre présente dans la page`);
        const ps = o.priceSpecification || {};
        if (ps['@type'] !== 'UnitPriceSpecification' || ps.unitCode !== 'MON' || valeur(String(ps.price)) !== f.prix_ht) err.push(`Offer « ${o.name} » : référence mensuelle (UnitPriceSpecification, MON, ${f.prix_ht}) absente`);
      }
    }
  }
  const org = graph.find((x) => x['@type'] === 'Organization' && x['@id'] === 'https://celya.be/#organization');
  if (org && JSON.stringify(org.sameAs) !== JSON.stringify(SAME_AS)) err.push(`Organization.sameAs = ${JSON.stringify(org.sameAs)}, attendu ${JSON.stringify(SAME_AS)}`);
  return err;
}

export function checkLlms(txt) {
  const err = [];
  texteMontants('llms.txt', txt.replace(/[  ]/g, ' '), err);
  for (const f of F) {
    const re = new RegExp(`${f.nom.fr} : ${f.prix_ht} € HT par mois, ${f.minutes} minutes`);
    if (!re.test(txt.replace(/[  ]/g, ' '))) err.push(`llms.txt : « ${f.nom.fr} : ${f.prix_ht} € HT par mois, ${f.minutes} minutes » attendu`);
  }
  for (const s of ['celya.fr', 'BCE 1042.115.837', 'sales@celya.be', offre.telephone.affiche, ...Object.values(PRIX_URL)]) if (!txt.includes(s)) err.push(`llms.txt : « ${s} » attendu`);
  return err;
}

function pages() {
  const dir = path.join(ROOT, '_src/pages');
  return fs.readdirSync(dir, { recursive: true }).filter((f) => f.endsWith('.html')).map((f) => f.split(path.sep).join('/')).sort().map((rel) => {
    const src = fs.readFileSync(path.join(dir, rel), 'utf8');
    const lang = JSON.parse(/<!--@page\s+(\{[\s\S]*?\})\s*-->/.exec(src)[1]).lang;
    return { rel, lang, html: fs.readFileSync(path.join(ROOT, rel), 'utf8') };
  });
}

function run() {
  const fails = [];
  let services = 0;
  for (const { rel, lang, html } of pages()) {
    if (html.includes('"@type": "Service"')) services++;
    for (const e of checkPage(rel, html, lang)) fails.push(`${rel} : ${e}`);
  }
  const llmsPath = path.join(ROOT, 'llms.txt');
  if (!fs.existsSync(llmsPath)) fails.push('llms.txt absent : lancer node _src/build.mjs');
  else for (const e of checkLlms(fs.readFileSync(llmsPath, 'utf8'))) fails.push(e);
  for (const [rel, m] of Object.entries(HORS_GRILLE)) for (const v of Object.keys(m)) if (!UTILISEES.has(`${rel} ${v}`)) fails.push(`HORS_GRILLE : « ${v} » sur ${rel} ne sert plus, retirer l'exception`);
  if (services < 35) fails.push(`${services} page(s) avec un Service : au moins 35 attendues`);
  console.log(fails.length ? fails.join('\n') + `\n\n${fails.length} écart(s).` : `Prix SEO : ${pages().length} pages et llms.txt sans montant hors grille ; ${services} pages avec un Service, toutes avec leur AggregateOffer ; pages prix détaillées ; sameAs présent.`);
  return fails.length;
}

function mutants() {
  const P = Object.fromEntries(pages().map((p) => [p.rel, p]));
  const sub = (s, a, b) => { if (!s.includes(a)) throw new Error(`mutant inapplicable : « ${a} » absent`); return s.replace(a, b); };
  const cas = [
    ['prix en dur faux dans le texte', () => checkPage('prix.html', P['prix.html'].html.replace(/<b>49([\s\u00a0]|&nbsp;)€<\/b>/, '<b>59 €</b>'), 'fr')],
    ['prix faux dans une liste (« 59, 99 et 199 € »)', () => checkPage('index.html', sub(P['index.html'].html, 'Trois formules : 49, 99 et 199', 'Trois formules : 59, 99 et 199'), 'fr')],
    ['prix faux en anglais (« €59 »)', () => checkPage('en/pricing.html', P['en/pricing.html'].html.replace(/<b>€49<\/b>/, '<b>€59</b>'), 'en')],
    ['lowPrice faux', () => checkPage('index.html', sub(P['index.html'].html, '"lowPrice": 49', '"lowPrice": 39'), 'fr')],
    ['price d\'une Offer faux', () => checkPage('prix.html', sub(P['prix.html'].html, '"price": "49.00"', '"price": "45.00"'), 'fr')],
    ['Service sans offers', () => checkPage('garages.html', P['garages.html'].html.replace(/, "offers": \{"@type": "AggregateOffer"[^}]*\}/, ''), 'fr')],
    ['url d\'AggregateOffer vers la mauvaise langue', () => checkPage('nl/index.html', sub(P['nl/index.html'].html, '"url": "https://celya.be/nl/prijzen.html"', '"url": "https://celya.be/prix.html"'), 'nl')],
    ['ancre de formule absente', () => checkPage('prix.html', sub(P['prix.html'].html, 'id="formule-pro"', ''), 'fr')],
    ['sameAs absent', () => checkPage('a-propos.html', P['a-propos.html'].html.replace(/, "sameAs": \[[^\]]*\]/, ''), 'fr')],
    ['llms.txt : prix faux', () => checkLlms(fs.readFileSync(path.join(ROOT, 'llms.txt'), 'utf8').replace('99 € HT', '89 € HT'))],
  ];
  let bad = 0;
  for (const [nom, f] of cas) {
    const e = f();
    if (e.length) console.log(`  ✓ ${nom} : ${e[0].slice(0, 110)}`);
    else { bad++; console.log(`  ✗ ${nom} : le test ne crie pas`); }
  }
  console.log(bad ? `\n${bad} mutant(s) non détecté(s).` : `\n${cas.length} mutants, tous détectés.`);
  return bad;
}

if (import.meta.url === `file://${process.argv[1]}`) process.exit(process.argv.includes('--mutants') ? (mutants() ? 1 : 0) : (run() ? 1 : 0));
