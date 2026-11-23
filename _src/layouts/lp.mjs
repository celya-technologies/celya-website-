/* Pages d'atterrissage (lp/, nl/lp/) : un seul objectif, la démo (ou
 * l'appel). noindex, hors sitemap, sans menu (en-tête « bare » : logo et
 * bouton d'appel).
 *
 * Lot conversion Google Ads du 16/11/2026 (décision de Bora, exception datée
 * de CLAUDE.md) : le héros porte la vidéo de fond de l'accueil, et le
 * formulaire de démo y est posé en transparence, sur ces quatre pages
 * seulement. Puis, dans cet ordre : badges, la scène « Un appel, de bout en
 * bout », Comment ça marche (quatre étapes), les cases RDV / À rappeler /
 * Urgent, « Appelez-la, comme un client », les prix (bouton vers le
 * formulaire de la page), la FAQ (cinq questions), l'appel final (son bouton
 * renvoie aussi au formulaire de la page).
 *
 * Lot « site mobile » du 23/11/2026 (décisions de Bora, exception datée de
 * CLAUDE.md) : le héros porte le H1, la pastille de l'appel (à la place de la
 * phrase) et les deux boutons ; puis badges, la scène qui suit le doigt, le
 * formulaire (dans le héros au-dessus de 860 px), les cases, les prix (en
 * carrousel sous 720 px), la FAQ, l'appel final. « Comment ça marche » et
 * « Appelez-la, comme un client » quittent ces pages. Une action, un nom (17/11/2026) :
 * partout où l'on va au formulaire, le bouton dit « Être rappelé pour une
 * démo », comme le bouton du formulaire ; la barre mobile garde « Être rappelé ».
 * Lot du 18/11/2026 : le titre du formulaire vient de data/i18n.json (le même
 * partout), et le métier de la page (garages) est pré-rempli dans le choix. */
import { one } from '../lib/core.mjs';
import { shell } from '../components/shell.mjs';
import { badges, prices, faq, ctaFinal, heroMedia, scene, sceneText, cases, livePill } from '../components/blocks.mjs';
import { demoForm } from '../components/form.mjs';

export default function lp(c) {
  const { page, t, offre } = c;
  const metier = page.meta.metier;
  const M = metier && c.data.metiers[metier] && c.data.metiers[metier][c.lang];
  const form = '#lp';
  /* data-lead de la page : « lp-garages », « lp-ne-plus-rater-d-appels »… : il
   * part dans form des événements generate_lead et click_call (17/11/2026) */
  const lead = 'lp-' + c.rel.split('/').pop().replace(/\.html$/, '');
  /* le héros : le H1, la pastille de l'appel et les deux boutons, sur la vidéo,
   * voile crème léger. « Être rappelé » n'existe que sous 860 px, quand le
   * formulaire est plus bas. */
  const hero = `<section class="hv lpv" data-hv="lp">
${heroMedia(c)}
<div class="w lpv-grid">
<div class="lpv-t">
<h1>${one(page, 'h1')}</h1>
${livePill(c)}
<div class="cta-btns" data-hero><a class="btn btn-orange" href="tel:${offre.telephone.e164}" data-call><span>${t.cta_call} · <span class="nw">${offre.telephone.affiche}</span></span></a><a class="btn btn-line lpv-m" href="${form}">${t.form.submit}</a></div>
</div>
</div></section>`;
  /* le formulaire : une section à lui, écrite une fois, après la scène. Sous
   * 860 px il est lu là ; au-dessus, la grille de <main> (celya.css, .p-lp) le
   * pose dans la colonne droite du héros, comme avant le 23/11/2026. L'ordre du
   * code ne change rien au clavier : entre les boutons du héros et le
   * formulaire, ni les badges ni la scène n'ont d'élément actif. */
  const formSec = `<section class="lpf" data-mbar-hide><div class="w lpf-grid">${demoForm(c, { id: 'lp', kind: lead, metier: metier || '' })}</div></section>`;

  const main = `${hero}
<section class="hero-badges"><div class="w">${badges(c)}</div></section>
${scene(c, sceneText(c, metier), { drive: true })}
${formSec}
${cases(c, (M && M.cases) || t.cases_generique)}
${prices(c, { demoHref: form, demoLabel: t.form.submit, swipe: true })}
${faq(c, page.blocks.faq[0])}
${ctaFinal(c, page.blocks.cta[0], { demoHref: form, demoLabel: t.form.submit })}`;
  return shell(c, { headHTML: one(page, 'head'), main, bare: true, bodyClass: 'p-lp', mbarSecond: [form, t.mbar_callback] });
}
