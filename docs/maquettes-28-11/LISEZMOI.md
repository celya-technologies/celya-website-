# Refonte de l'accueil, 28/11/2026 : le kit de référence

Bora a validé ce prototype le 28/11/2026 au soir. Le prompt qui l'accompagne se trouve dans
`Celya Claude mémoire/prompts/2026-11-28-X-site-accueil-refonte.md`.

## Ce que contient le kit

- `prototype/page.html` : la page de référence. Ouvre-la dans Chrome (`file://`) à 390 px et à
  1440 px. Toutes les animations y tournent.
- `prototype/nouveau.css` : toutes les retouches, en sections numérotées de 1 à 27. Une section
  plus loin dans le fichier remplace une section plus haute.
- `prototype/build.py` : le post-traitement qui fabrique `page.html` à partir de `live.html`
  (l'accueil FR de `main` au 28/11). C'est la liste exacte des changements de balisage.
- `prototype/iphones.py` et `prototype/generateur/v20.py` : la fonction qui dessine les iPhones
  et l'interface WhatsApp. Les chemins `/home/claude/...` viennent du conteneur où le prototype
  a été construit ; ils ne comptent pas.
- `prototype/assets/hero/` : `appelant.jpg` (photo du héros sur téléphone), `orbe.jpg` (l'avatar
  de Janet dans les bulles), `fond2.jpg` (le fond peint), `postit.jpg` (« pas un post-it »).
- `prototype/assets/metiers-photos/` : les onze photos des métiers. Les originaux sont dans
  `celya-reseaux/site-visuels/metiers/`.
- `references/` : la page entière à 1440 px et à 390 px (mouvement réduit, donc l'état final de
  chaque animation), et la vidéo de la transition du héros sur ordinateur.

Le prototype est une RÉFÉRENCE DE RENDU, pas du code à recopier. Sur le site, tout passe par
`_src/` (composants, gabarits, données), un seul fichier CSS et les trois langues.
