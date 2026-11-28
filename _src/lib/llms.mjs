/* Celya : /llms.txt, la fiche du site pour les assistants IA (28/11/2026).
 *
 * Écrit par node _src/build.mjs, vérifié par --check comme les pages. Les
 * montants, minutes, la durée de l'essai et le numéro viennent de
 * data/offre.json, les adresses de l'application de _src/components/shell.mjs :
 * rien n'est écrit ici en dur. Les phrases suivent CLAUDE.md : appels entrants
 * uniquement, les langues nommées par la formulation autorisée, Google Agenda
 * relié (pas Outlook), aucun concurrent, aucun tiret long. */
import { num, eur } from './core.mjs';
import { APP_SIGNUP, APP_LOGIN } from '../components/shell.mjs';
import { PRIX_URL, SAME_AS } from './jsonld.mjs';

const SITE = 'https://celya.be/';
const plain = (s) => String(s).replace(/[  ]/g, ' ');

export function llms({ offre }) {
  const F = offre.formules, R = offre.regles;
  const tok = (s, lang) => plain(s.replace(/\{\{offre\.essai\}\}/g, num(R.essai_jours, lang))
    .replace(/\{\{offre\.max_minutes\}\}/g, num(Math.max(...F.map((f) => f.minutes)), lang))
    .replace(/\{\{offre\.meta\}\}/g, num(R.meta_mensuel_approx, lang)));
  const tel = plain(offre.telephone.affiche);
  const ligne = (f, lang, ht, mois, min) => `- ${f.nom[lang]} : ${plain(eur(f.prix_ht, lang))} ${ht} ${mois}, ${plain(num(f.minutes, lang))} ${min}`;
  const formulesFr = F.map((f) => `${ligne(f, 'fr', 'HT', 'par mois', 'minutes par mois')}. ${f.inclus.fr.map(plain).join('. ')}.`).join('\n');
  const formulesNl = F.map((f) => ligne(f, 'nl', 'excl. btw', 'per maand', 'minuten per maand').replace(' : ', ': ')).join('\n');
  const formulesEn = F.map((f) => ligne(f, 'en', 'excl. VAT', 'a month', 'minutes a month').replace(' : ', ': ')).join('\n');

  return `# Celya

> Celya (celya.be) est un secrétariat téléphonique avec assistante vocale IA, Janet, pour les indépendants, les commerces et les PME en Belgique. Janet répond aux appels entrants uniquement : elle prend les rendez-vous, note les messages et transfère les urgences. Celya ne passe aucun appel sortant, n'envoie aucun emailing et aucun message publicitaire.

Éditeur : Celya Technologies SRL, BCE 1042.115.837, Avenue de Broqueville 136/1, 1200 Woluwe-Saint-Lambert, Belgique.

Homonyme : Celya (celya.be, Celya Technologies SRL, BCE 1042.115.837) n'a aucun lien avec celya.fr.

## Ce que fait Janet

- Elle répond aux appels entrants de votre entreprise, 24h/24, quand vous ne pouvez pas décrocher.
- Numéro belge fourni, ou déviation de votre numéro actuel.
- Elle prend les rendez-vous pendant l'appel. Votre Google Agenda, relié : Janet lit vos disponibilités et y écrit les rendez-vous. Pas d'agenda ? Prenez celui de Celya, intégré et pensé pour votre métier.
- Le résumé de chaque appel vous arrive sur WhatsApp ; vos consignes à Janet passent aussi par WhatsApp.
- Langues : chez nos clients belges, Janet répond en français et en néerlandais, et bascule d'une langue à l'autre en cours d'appel. Une autre langue ? Parlons-en.
- Mise en ligne en 48 heures après l'accord.

## Formules et prix

Prix hors TVA, au mois. ${plain(R.decompte.fr)}.

${formulesFr}

- ${tok(R.mise_en_service.fr, 'fr')}.
- ${tok(R.depassement.fr, 'fr')}.
- ${tok(R.au_dela.fr, 'fr')}.
- ${tok(R.meta.fr, 'fr')}.

Détail des formules : ${PRIX_URL.fr}

## Essai gratuit

${tok(R.essai.fr, 'fr')}. L'essai se prend dans l'application : ${APP_SIGNUP} (la carte est demandée à l'inscription). Connexion des clients : ${APP_LOGIN}

## Contact

- Appeler Janet (numéro de démonstration) : ${tel}
- E-mail : sales@celya.be
- Demander une démo : ${SITE}demo.html

## Pages

- Accueil : ${SITE} · ${SITE}nl/ · ${SITE}en/
- Prix : ${PRIX_URL.fr} · ${PRIX_URL.nl} · ${PRIX_URL.en}
- Métiers : ${SITE}metiers.html · ${SITE}nl/sectoren.html · en : ${SITE}en/garages.html, ${SITE}en/medical-practices.html, ${SITE}en/restaurants.html, ${SITE}en/self-employed.html
- Questions fréquentes : ${SITE}questions.html · ${SITE}nl/vragen.html · ${SITE}en/#faq

## In het Nederlands

Celya is een telefoonsecretariaat met AI-spraakassistente Janet voor zelfstandigen, handelaars en kmo's in België. Janet beantwoordt alleen inkomende oproepen. Prijzen exclusief btw, per maand:

${formulesNl}

${tok(R.essai.nl, 'nl')}. Bij onze Belgische klanten antwoordt Janet in het Frans en het Nederlands. Prijzen: ${PRIX_URL.nl}

## In English

Celya is a phone answering service with an AI voice assistant, Janet, for self-employed people, shops and SMEs in Belgium. Janet answers incoming calls only. Prices excl. VAT, per month:

${formulesEn}

${tok(R.essai.en, 'en')}. Janet answers in French and Dutch. Pricing: ${PRIX_URL.en}

## Réseaux

${SAME_AS.map((u) => `- ${u}`).join('\n')}
`;
}
