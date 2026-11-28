/* Celya : le JSON-LD complété par le générateur (lot « prix dans le SEO et
 * pour les assistants IA » du 28/11/2026).
 *
 * Le JSON-LD de chaque page vit dans le bloc <!--@head--> de sa source. Ce
 * module le relit après la résolution des jetons et y ajoute, une fois pour
 * tout le site, ce qui vient des données :
 *
 *  - chaque nœud Service reçoit "offers" : un AggregateOffer (prix le plus bas,
 *    le plus haut, nombre de formules, hors TVA) qui renvoie à la page prix de
 *    la langue. Sur les pages prix, les trois Offer déjà écrites passent dans
 *    cet AggregateOffer, chacune complétée d'une description (minutes et
 *    contenu de la formule, les textes de la carte de prix) et de l'URL de sa
 *    carte (#formule-<id>) ;
 *  - l'Organization (#organization) reçoit "sameAs" : les comptes de la marque.
 *
 * Tous les montants, minutes et textes viennent de data/offre.json et de
 * data/i18n.json : rien n'est écrit ici. La mise en forme du JSON est celle
 * des pages (séparateurs « , » et « : », caractères non échappés) : une page
 * dont le JSON-LD ne change pas ressort identique à l'octet. */
import { num } from './core.mjs';

/** La page prix de chaque langue : la cible de tous les "offers". */
export const PRIX_URL = {
  fr: 'https://celya.be/prix.html',
  nl: 'https://celya.be/nl/prijzen.html',
  en: 'https://celya.be/en/pricing.html',
};

/** Les comptes de la marque (Organization.sameAs). Pas de Facebook : son lien
 *  n'est pas dans le pied de page du site (vérifié le 28/11/2026). */
export const SAME_AS = [
  'https://www.instagram.com/celya.be/',
  'https://www.tiktok.com/@celya_be',
];

const ORG_ID = 'https://celya.be/#organization';

/** L'ancre de la carte d'une formule sur la page prix (id posé par priceCards). */
export const ancre = (f) => `formule-${f.id}`;

/** Sérialise comme les pages : {"a": 1, "b": [2, 3]} */
export function dumps(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return '[' + v.map(dumps).join(', ') + ']';
  if (typeof v === 'object') return '{' + Object.entries(v).map(([k, x]) => JSON.stringify(k) + ': ' + dumps(x)).join(', ') + '}';
  return JSON.stringify(v);
}

/** Description d'une formule : « <minutes> minutes par mois. <pour>. <inclus>. … » */
export function offreDescription(f, lang, t) {
  const phrase = (s) => (/[.!?]$/.test(s) ? s : s + '.');
  return [`${num(f.minutes, lang)} ${t.price_minutes}`, f.pour[lang], ...f.inclus[lang]].map(phrase).join(' ').replace(/ | /g, ' ');
}

/** Les "offers" d'un Service : un AggregateOffer, et ses Offer sur les pages prix. */
function offers(offre, lang, t, existantes, file) {
  const F = offre.formules, prix = F.map((f) => f.prix_ht);
  const agg = {
    '@type': 'AggregateOffer',
    lowPrice: Math.min(...prix),
    highPrice: Math.max(...prix),
    priceCurrency: 'EUR',
    offerCount: F.length,
    valueAddedTaxIncluded: false,
    url: PRIX_URL[lang],
  };
  if (existantes) {
    const liste = Array.isArray(existantes) ? existantes : [existantes];
    if (liste.length !== F.length) throw new Error(`${file} : ${liste.length} Offer dans le Service, ${F.length} formules dans data/offre.json`);
    agg.offers = liste.map((o) => {
      const f = F.find((x) => x.nom[lang] === o.name);
      if (!f) throw new Error(`${file} : Offer « ${o.name} » ne correspond à aucune formule de data/offre.json`);
      const { '@type': type, name, ...reste } = o;
      return { '@type': type, name, description: offreDescription(f, lang, t), url: `${PRIX_URL[lang]}#${ancre(f)}`, ...reste };
    });
  }
  return agg;
}

function enrichNode(n, ctx) {
  if (!n || typeof n !== 'object' || Array.isArray(n)) return n;
  if (n['@type'] === 'Service') {
    const deja = n.offers && !Array.isArray(n.offers) && n.offers['@type'] === 'AggregateOffer';
    if (!deja) return { ...n, offers: offers(ctx.offre, ctx.lang, ctx.t, n.offers, ctx.file) };
  }
  if (n['@type'] === 'Organization' && n['@id'] === ORG_ID && !n.sameAs) return { ...n, sameAs: [...SAME_AS] };
  return n;
}

/** Complète tous les blocs JSON-LD d'une page générée. */
export function enrichJsonLd(html, { offre, i18n, lang, file }) {
  if (!PRIX_URL[lang]) throw new Error(`${file} : langue inconnue « ${lang} » pour la page prix`);
  const ctx = { offre, lang, t: i18n[lang], file };
  return html.replace(/(<script type="application\/ld\+json">)(\s*)([\s\S]*?)(\s*)(<\/script>)/g, (m, a, s1, raw, s2, b) => {
    let d;
    try { d = JSON.parse(raw); } catch (e) { throw new Error(`${file} : JSON-LD invalide : ${e.message}`); }
    const out = Array.isArray(d['@graph']) ? { ...d, '@graph': d['@graph'].map((n) => enrichNode(n, ctx)) } : enrichNode(d, ctx);
    const txt = dumps(out);
    if (/<\/script/i.test(txt)) throw new Error(`${file} : « </script » dans le JSON-LD`);
    return a + s1 + txt + s2 + b;
  });
}
