# X — L'accueil du site, refait comme le prototype du 28/11 (téléphone et ordinateur, FR · NL · EN)

Niveau d'effort : **xhigh**. Opus 5.5. Une seule PR pour tout le lot.

Dépôt : `celya-website-`. Pars d'un `main` à jour, sur une branche neuve. **Tu ne fusionnes jamais et tu ne pousses jamais sur `main`** : fusionner, c'est mettre en production (Vercel). C'est Bora qui fusionne, après avoir regardé la prévisualisation.

Avant tout :
- lis le `CLAUDE.md` du dépôt en entier ;
- lis `docs/vocabulaire-be.md` (toute page FR ou NL se relit contre lui) ;
- lis le brief du lot du 14/11 (`docs/maquettes-14-11/`) et le retour du 15/11 ;
- ouvre le kit de référence : `docs/maquettes-28-11/` de ce dépôt, sur la branche `claude/kit-accueil-28-11` (lis son `LISEZMOI.md`). C'est le même kit que celui du Mac de Bora. Pars de cette branche, qui ne diffère de `main` que par ce dossier et une ligne de `.vercelignore`.

## Le but

Bora a validé le 28/11 un prototype de l'accueil (`prototype/page.html` dans le kit). Il est parti de l'accueil réel et a rendu chaque élément plus élégant, **sans changer le fond**. Porte-le sur les **trois accueils** (`index.html`, `nl/index.html`, `en/index.html`), sur téléphone et sur ordinateur, par le générateur (`_src/`, `data/`, un seul fichier CSS).

Le prototype est une référence de rendu, pas du code à recopier :
- c'est un post-traitement de l'accueil FR (`build.py`) ;
- ses retouches sont dans un CSS à part (`nouveau.css`, en 27 sections numérotées) ;
- il n'existe qu'en français.

Sur le site :
- les composants s'écrivent une fois dans `_src/components/` ;
- les textes vivent dans `data/` (`i18n.json`, `metiers.json`) en FR, NL et EN ;
- le CSS va dans le fichier CSS unique du site.

**La section 22 de `nouveau.css` est remplacée par la 25 : ne porte pas la 22.** C'est un héros collant avec une feuille arrondie qui glisse dessus, et Bora l'a rejeté.

Rends aussi la page **plus légère que le prototype** : il a accumulé des retouches successives. Une seule règle finale par élément, sans couches qui se contredisent.

## Les décisions de Bora du 28/11, à écrire d'abord dans le `CLAUDE.md`

Ajoute un paragraphe daté « Lot « accueil du 28 novembre 2026 » » dans la section Design, avec ces décisions et leur portée exacte :

1. **Les téléphones sont des iPhone réalistes, et l'écran WhatsApp en a l'interface.**
   - Les cadres sobres « qui attendent de vraies captures » sont remplacés, sur les accueils, par des iPhone réalistes. C'est la fonction `iphone()` / `whatsapp()` de `generateur/v20.py`, plus les sections 2 et « WhatsApp, dans l'iPhone » de `nouveau.css`.
   - L'écran WhatsApp en imite l'interface (mode sombre).
   - Cette décision remplace, pour les accueils, « on ne reproduit pas l'interface de WhatsApp ». Elle ne permet pas d'imiter Google Agenda.
2. **Plus de mention « Exemple »** sur les illustrations des accueils.
3. **Exception au héros « H1, une phrase et les deux boutons, rien de plus », sur les trois accueils seulement.**
   - Le héros porte aussi la carte « L'appel / Le résumé », deux onglets.
   - **Sur téléphone (sous 720 px)**, le fond du héros est la photo `appelant.jpg` dans un cadre arrondi :
     - le visage reste visible ;
     - le titre, la carte et les boutons sont posés sur la photo ;
     - pas de vidéo.
   - **Sur ordinateur**, la vidéo actuelle (`hero-ordinateur-*`) :
     - héros long ;
     - vidéo à droite, fondue à gauche et en bas ;
     - fond peint derrière le texte ;
     - titre « éparpillé » sur toute la hauteur : « Elle répond à votre place. » décalé à droite, les boutons en bas.
4. **La transition du héros remplace l'exception d'opacité du 15/11 sur les accueils.**
   - Sur ordinateur, en défilant, piloté par `animation-timeline: scroll(root)` :
     - la vidéo recule (scale 1 → 0,8) et s'efface ;
     - le texte monte de 90 px et s'efface ;
     - la carte monte plus vite (160 px) ;
     - le fond peint descend et pâlit ;
     - les badges montent en apparaissant.
   - Sur téléphone, le cadre s'éloigne (scale 0,9, il descend, l'opacité baisse), piloté par `view()`.
   - **Conditions :**
     - CSS seul, sous `@supports (animation-timeline: scroll())` ;
     - `transform` et `opacity` seulement ;
     - rien sous `prefers-reduced-motion` ;
     - aucun écouteur de défilement nouveau.
   - L'ancien effet du 15/11 (la vidéo qui grossit à 1,06 et le C qui se pose à 72 px) disparaît des accueils.
5. **Le fond peint** (`fond2.jpg`, lentement animé, en pause hors écran) est permis à quatre endroits :
   - le héros sur ordinateur ;
   - « Ce que Janet fait pour vous » ;
   - les prix ;
   - l'appel final « Écoutez-la, plutôt que de nous croire ».

Rien d'autre du `CLAUDE.md` ne change. En particulier, restent en vigueur :
- le budget de rendu ;
- le consentement et GTM, identiques à l'octet ;
- les tailles minimales (12 px pour un libellé en capitales, 14 px pour une phrase) ;
- aucun tiret long ;
- les prix lus seulement dans `data/offre.json` ;
- les langues nommées, jamais comptées ;
- rien qui dépasse de son cadre.

## Ce qui change, section par section

Le numéro entre parenthèses renvoie à la section de `nouveau.css`, et `build.py` dit le balisage. **Les URL, `title`, description, H1, la liste et l'ordre des H2, les FAQ visibles, `canonical`, `hreflang` et le `@graph` ne bougent pas.** Les 14 H2 du prototype sont exactement ceux de `main`, dans le même ordre.

### 1. Le héros (1, 8 à 10, 12, 13, 15 à 17, 21, 25, 26)

- **Le H1 garde son texte.** Sur téléphone, « Elle répond à votre place. » passe à la ligne, plus grand, en `#FFC9AE` sur la photo.
- **Les boutons :**
  - sur téléphone, sur la photo, côte à côte : « Appeler Janet » en orange (sans le numéro, qui reste dans le lien `tel:`) et « Demander une démo » translucide ;
  - sur ordinateur, « Appeler Janet · +32 460 25 44 13 » et « Demander une démo », fondus dans le fond.
- **La barre « Appelez-la » sous la carte disparaît.**
- **La carte « L'appel / Le résumé »** : deux onglets en boutons radio, sans JS. L'onglet « L'appel » joue une **vraie conversation, en trois temps de 6 s**, sur une boucle de 18 s (sections 26) :
  1. « Bonjour, je voudrais un rendez-vous cette semaine. » / « Bien sûr. C'est pour quoi exactement ? » / « Un premier rendez-vous, on m'a conseillé chez vous. »
  2. « Mercredi 18 à 9h, ça vous va ? » / « Le mercredi je travaille… plutôt jeudi ? » / « Jeudi 19 à 10h, c'est libre. C'est à quel nom ? »
  3. « Lambert. Et si j'ai un empêchement ? » / « Vous aurez un rappel la veille sur WhatsApp, avec un bouton pour déplacer. » + l'étiquette verte « RDV pris · jeudi 10h · rappel la veille ».
  - Espace insécable avant « ? ».
  - Les trois temps sont empilés dans la même grille. La carte prend la hauteur du plus long et ne saute jamais.
  - En mouvement réduit, seul le troisième temps est visible.
  - En pause hors écran (classe posée par l'observateur existant).
- L'onglet « Le résumé » montre trois messages WhatsApp :
  - **RDV pris** · Mme Lambert, jeudi 10h · « Premier rendez-vous, venue sur recommandation. Rappel la veille. » ;
  - **Urgent** · M. Janssens ;
  - **À rappeler** · Mme Claes.
- Le jeudi 19 et le mercredi 18 novembre 2026 sont les bons jours (`tests/dates.mjs`).

### 2. Juste sous le héros

- **Les badges** Meta Tech Provider / Vérifiée par Google sont posés sur le fondu du héros. Sur ordinateur, ils montent en apparaissant. Sans grand vide après eux.
- **Téléphone, la barre d'accès rapide** (`nt-quick`) : collante sous l'en-tête, elle porte Comment ça marche · Métiers · WhatsApp · Prix · FAQ.
  - Elle défile au doigt.
  - L'entrée de la section visible est surlignée.
  - Un toucher mène directement à la section.

### 3. « Un appel, de bout en bout » (2, 23, 24)

- Le téléphone de la scène devient un iPhone. Ses étapes, son minutage de 15 s et sa pause en bloc (`data-anim-root`) ne changent pas.
- **Sur téléphone, les cinq étapes deviennent une bande de cartes au-dessus de l'iPhone** (section 24) :
  - chaque carte fait 76 % de la largeur ;
  - toutes les 3 s, la bande glisse d'une carte, en phase avec l'écran du téléphone ;
  - la carte suivante dépasse à droite ;
  - une barre de cinq segments avance avec.
  - **Attention** : `.scn-steps` est en `flex-direction: column` dans le CSS du site, il faut le passer en ligne.
- Sur ordinateur, la liste reste à côté du téléphone.

### 4. « Ce que Janet fait pour vous » (5, 16, 19)

- Fond peint.
- **Sur téléphone**, les huit cartes deviennent un carrousel au doigt.
- **Sur ordinateur**, un **index** (`nt-fait`) :
  - à gauche, les huit intitulés en grand ;
  - au survol ou au clic, à droite, la description et un petit échange d'exemple (une bulle du client, la réponse de Janet, une étiquette) ;
  - en radios, sans JS, sauf le `mouseenter` qui coche.
  - Les huit exemples sont dans la liste `EXF` de `build.py` : traduis-les en NL et EN.

### 5. « Comment ça marche » (18, 20)

- **Sur téléphone**, un fil vertical qui se remplit au défilement (`view()`).
- **Sur ordinateur**, les quatre étapes en grandes lignes éditoriales, l'une sous l'autre, sans cartes.

### 6. « Branchée sur vos outils » et la fiche (4)

- L'agenda et le second appareil de la section outils partent (`build.py`).
- Sous « Vous recevez une fiche claire, pas un post-it », l'image `postit.jpg` en `multiply`, qui apparaît une fois.

### 7. WhatsApp : une section, deux onglets (6, 14)

- « Vos clients confirment en un clic » et « En congé ? Dites-le-lui sur WhatsApp » deviennent **une seule section** (`id="whatsapp"`).
- Deux onglets : « Vos clients confirment » / « Vos consignes ».
- **Les deux panneaux ont la même forme** : le texte à gauche, l'iPhone à droite, empilés dans la même grille. Seul le contenu change, en fondu, sans que la mise en page bouge.
- Dans « Vos consignes », la liste devient des lignes « étiquette + phrase » : Congés · Bloquer · Fermer · Horaires.
- **Les deux H2 restent dans le DOM, dans leur ordre.**

### 8. Les métiers (7, 27)

- Les liens deviennent une **bande de photos de professionnels au travail qui défile** : les onze photos du kit, converties en WebP avec largeur et hauteur, sans dupliquer une image.
- **Chaque carte dit ce que Janet fait pour ce métier :**
  - le nom ;
  - la phrase du client en italique (celle d'aujourd'hui) ;
  - trois capacités, avec un point orange.
- **Ordre** : cabinets médicaux, restaurants, indépendants, garages, vétérinaires, plombiers, fiduciaires, chauffagistes, syndics, électriciens, serruriers. Bora ne veut pas que la page ait l'air faite pour les garages.
- **Les capacités (FR), à mettre dans `data/metiers.json` et à traduire en NL et EN** contre `docs/vocabulaire-be.md` :

  | Métier | Capacités |
  |---|---|
  | Garages | Rendez-vous d'atelier posés · Pannes urgentes signalées · Voiture et plaque notées |
  | Restaurants | Tables réservées · Groupes et demandes notés · Horaires et accès répondus |
  | Cabinets médicaux | Rendez-vous posés et déplacés · Messages pour le médecin · Rappel la veille |
  | Indépendants | Répond pendant vos rendez-vous · Demandes de devis notées · Résumé sur WhatsApp |
  | Vétérinaires | Consultations planifiées · Urgences transmises tout de suite · Rappel la veille |
  | Plombiers | Urgences sur le chantier · Demandes de devis notées · Passages planifiés |
  | Chauffagistes | Pannes de chaudière signalées · Entretiens planifiés · Adresse et accès notés |
  | Électriciens | Dépannages signalés · Devis notés · Passages planifiés |
  | Serruriers | Décroche la nuit · Urgences transmises · Adresse et numéro notés |
  | Syndics d'immeuble | Pannes d'immeuble notées · Message au gestionnaire · Copropriétaires rappelés |
  | Fiduciaires | Rendez-vous clients posés · Messages pour le comptable · Échéances rappelées |

  **Aucune capacité n'évalue un symptôme**, et rien ne promet ce que Janet ne fait pas. Liste ces lignes dans la PR pour que Bora les relise.
- **Défilement** : le prototype duplique les onze cartes (`aria-hidden`) pour boucler. **Ne le fais pas**, une image ne paraît jamais deux fois sur une page. Fais un aller-retour :
  - piste animée de `translateX(0)` à `translateX(calc(-100% + 100vw))`, en `alternate` ;
  - en pause au survol, au focus et hors écran ;
  - en mouvement réduit, une bande à défiler au doigt.

### 9. Les prix (5, 6, 16)

- Fond peint.
- La disposition actuelle des cartes reste.
- **Sur téléphone** :
  - un carrousel au doigt ;
  - au-dessus, des puces (une par formule, lues depuis les cartes, donc depuis `data/offre.json`) qui mènent à la carte et suivent celle qui est visible.
- La section reçoit `id="prix"`.

### 10. L'appel final (3)

- `panel bg-ink cta-final` devient la version au fond peint (`cta-peint`), le H2 à l'encre.
- `btn-line-d` devient `btn-line`.

### 11. Les espacements sur téléphone

- La page est plus courte : un seul rythme d'espaces (8 / 12 / 16 / 24) dans le héros, des sections plus serrées, les iPhone à 90 %.
- Reprends les valeurs du prototype sans les recopier aveuglément. Le critère est la référence `telephone-390-page-entiere.jpg`.

## Ce qui ne bouge pas

- l'en-tête, le menu, le pied de page ;
- le bandeau cookies et GTM ;
- la FAQ et son JSON-LD ;
- les articles ;
- les pages d'atterrissage ;
- les pages métiers ;
- toutes les autres pages.

Si un composant partagé change (par exemple `scene()`), ajoute une variante appelée par les accueils seulement. Les autres pages restent identiques à l'octet, et `node _src/build.mjs --check` le montre.

## Ce qui sera faux dans les tests, et comment

- **`tests/tailles.mjs`** : le prototype a des textes en 11, 12, 13 et 13,5 px. Remonte chaque phrase à 14 px, et chaque libellé en capitales à 12 px au moins.
- **`tests/texte-conserve.mjs`** : chaque texte retiré ou réécrit va dans `tests/corrections-autorisees.json`, page par page, avec la raison. Ce sont la barre « Appelez-la », les mentions « Exemple », le contenu de l'outil agenda retiré, l'ancien échange du héros et le résumé « Premier rendez-vous. ».
- **`tests/scene.mjs`** : il exige peut-être « Exemple » ; adapte-le aux accueils selon la décision 2.
- **`tests/heros.mjs`** :
  - les accueils changent de règle (photo sur téléphone, carte d'appel dans le héros) ;
  - réécris leurs vérifications d'après les décisions 3 et 4 ;
  - garde le contraste à 4,5:1 sur le pixel le plus clair, à 360, 390, 768 et 1440 px, carte comprise ;
  - les pages d'atterrissage ne changent pas.
- **`tests/budget-rendu.mjs`** : garde le budget. Le prototype n'a aucun `backdrop-filter` ; `will-change` ne garde que le grain.

## Tests à ajouter

Écris `tests/accueil-28-11.mjs`, sur les trois langues. Il vérifie :
- la carte du héros a trois temps, avec les bons textes dans chaque langue ;
- en mouvement réduit, seul le troisième temps est visible ;
- les onze cartes métiers, chacune avec trois capacités, sans aucune image en double ;
- les deux onglets WhatsApp ont la même boîte (largeur et hauteur identiques avant et après le changement d'onglet) ;
- la barre d'accès rapide sur téléphone : chaque lien mène à une section qui existe ;
- la bande des étapes sur téléphone est en ligne et en phase avec la barre de progression ;
- **rien ne dépasse**, avec `scrollWidth == innerWidth` et chaque bloc dans son cadre, à 360, 390, 768, 1100, 1280, 1440 et 1920 px, dans les trois langues ;
- les H2 et le H1 sont identiques à `main`.

Ajoute un mode `--mutants` (comme `tests/acces-app.mjs`) qui casse chaque vérification sur une copie et exige qu'elle crie.

## Vérifier avant de rendre

Lance toute la liste « Vérifications avant commit » du `CLAUDE.md`, et `sweep.js`, `sweep_nl.js`, `sweep_en.js`.

Puis compare, à 390 et à 1440 px, chaque accueil à `references/` dans le kit. Regarde aussi la transition du héros en défilant lentement (image par image) : elle doit ressembler à `references/transition-hero-ordinateur.mp4`.

## La PR

- **Ce qui change**, section par section, avec une capture téléphone et une capture ordinateur de chaque section, en FR.
- **Les décisions du 28/11** ajoutées au `CLAUDE.md`.
- **Les textes NL et EN nouveaux**, à faire relire par Bora : la conversation, les capacités, les onglets, la barre d'accès rapide, les exemples de l'index.
- **Ce que ce lot rend inutile** : supprime-le dans le même lot et nomme-le.
- **Les étapes de Bora** :
  1. regarder la prévisualisation Vercel sur son iPhone et sur son ordinateur, dans les trois langues ;
  2. relire les capacités des métiers ;
  3. fusionner ;
  4. resoumettre le sitemap si une URL a bougé (normalement aucune).
