# Prototype : la vraie page d'accueil de celya.be, deux retouches seulement.
# 1. le héros devient le cadre arrondi (vidéo sur ordinateur, la dame sur téléphone) avec la carte d'appel ;
# 2. les aperçus de téléphone prennent le style de la carte du héros (claire, petit écran en bas), sans « Exemple ».
import re
s = open('live.html', encoding='utf-8').read()

PHONE = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>'
MSG = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 5h16v11H8l-4 4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>'
CTAS = '''<div class="nh-cta{x}"><a class="btn btn-ink" href="tel:+32460254413" data-call>{p}<span>Appeler Janet<span class="nh-num"> · <span class="nw">+32 460 25 44 13</span></span></span></a><a class="btn btn-line" href="demo.html" data-demo>Demander une démo</a></div>'''

HERO = f'''<section class="nh">
<div class="nh-frame">
<video class="nh-v" muted loop playsinline preload="none" aria-hidden="true" tabindex="-1" disablepictureinpicture data-src="assets/hero/hero-ordinateur-720.mp4" data-poster="assets/hero/hero-ordinateur-poster.webp"></video>
<img class="nh-p" src="assets/hero/appelant.jpg" alt="Une cliente appelle un commerce depuis la rue, téléphone à l’oreille">
<div class="nh-txt"><h1>Vous ratez des appels&nbsp;? <em>Elle répond<br class="nt-br"> à votre place.</em></h1>
<p class="nh-lead">Celya répond au téléphone quand vous ne pouvez pas.</p>
{CTAS.format(x=' nh-in', p=PHONE)}</div>
<div class="nh-side">
<input type="radio" name="nhv" id="nh1" checked><input type="radio" name="nhv" id="nh2">
<div class="nh-seg"><label for="nh1">L’appel</label><label for="nh2">Le résumé</label></div>
<div class="nh-card">
<div class="nh-p1"><p class="nh-who">Appel entrant · Mme Lambert</p>
<div class="nh-scs"><div class="nh-sc nh-sc1"><span class="nh-me nh-b nh-b1">Bonjour, je voudrais un rendez-vous cette semaine.</span><span class="nh-her nh-b nh-b2"><img src="assets/hero/orbe.jpg" alt=""><span>Bien sûr. C’est pour quoi exactement&nbsp;?</span></span><span class="nh-me nh-b nh-b3">Un premier rendez-vous, on m’a conseillé chez vous.</span></div><div class="nh-sc nh-sc2"><span class="nh-her nh-b nh-b1"><img src="assets/hero/orbe.jpg" alt=""><span>Mercredi 18 à 9h, ça vous va&nbsp;?</span></span><span class="nh-me nh-b nh-b2">Le mercredi je travaille… plutôt jeudi&nbsp;?</span><span class="nh-her nh-b nh-b3"><img src="assets/hero/orbe.jpg" alt=""><span>Jeudi 19 à 10h, c’est libre. C’est à quel nom&nbsp;?</span></span></div><div class="nh-sc nh-sc3"><span class="nh-me nh-b nh-b1">Lambert. Et si j’ai un empêchement&nbsp;?</span><span class="nh-her nh-b nh-b2"><img src="assets/hero/orbe.jpg" alt=""><span>Vous aurez un rappel la veille sur WhatsApp, avec un bouton pour déplacer.</span></span><span class="nh-res nh-b nh-b3">RDV pris · jeudi 10h · rappel la veille</span></div></div></div>
<div class="nh-p2"><p class="nh-who">Sur votre WhatsApp, 30 secondes après</p>
<span class="nh-wa"><b class="k">RDV pris</b> · Mme Lambert, jeudi 10h<br>Premier rendez-vous, venue sur recommandation. Rappel la veille.</span>
<span class="nh-wa"><b class="u">Urgent</b> · M. Janssens<br>0475 •• •• 21<br>Veut : être dépanné ce matin.</span>
<span class="nh-wa"><b class="r">À rappeler</b> · Mme Claes<br>Message pour Marc : son devis.</span></div>
</div></div>
</div>
{CTAS.format(x=' nh-out', p=PHONE)}
</section>'''

a = s.index('<section class="hv" data-hv>')
b = s.index('<section class="hv-next">', a)
s = s[:a] + HERO + '\n' + s[b:]

# plus de mention « Exemple » sur les aperçus
s = s.replace('<span class="ex-tag">Exemple</span>', '')

exec(open('iphones.py', encoding='utf-8').read())



# moins de téléphones : « Branchée sur vos outils » garde ses textes et ses badges, sans le téléphone ni le petit agenda
i = s.index('<div class="tools">'); j = s.index('</section>', i)
bloc = s[i:j]
k = bloc.index('<div class="dev3d'); bloc = bloc[:k] + bloc[fin_div(bloc, k):]
k = bloc.index('<div class="tool-cal"'); bloc = bloc[:k] + bloc[fin_div(bloc, k):]
s = s[:i] + bloc + s[j:]


# WhatsApp : la confirmation client et les consignes dans UNE section, un onglet chacune
i1 = s.index('Vos clients confirment <em>en un clic.</em>'); a1 = s.rfind('<section', 0, i1); e1 = s.index('</section>', i1)
i2 = s.index('En congé ? <em>'); a2 = s.rfind('<section', 0, i2); e2 = s.index('</section>', i2)
assert a2 > e1
def inner(a, e):
    k = s.index('<div class="w split', a); return s[k:fin_div(s, k)].replace('class="w split', 'class="split', 1)
pa, pb = inner(a1, e1), inner(a2, e2)
# même forme pour les deux onglets : le texte à gauche, le téléphone à droite, des lignes « étiquette + phrase »
kt = pb.index('<div class="split-t">'); txt_b = pb[kt:fin_div(pb, kt)]
kp = pb.index('<div class="dev3d'); tel_b = pb[kp:fin_div(pb, kp)]
ordres = re.findall(r'<li><span>(.*?)</span></li>', txt_b)
etiquettes = ['Congés', 'Bloquer', 'Fermer', 'Horaires']
rangs = ''.join(f'<div class="cf-row"><span class="cf-b">{e}</span><p>{o}</p></div>' for e, o in zip(etiquettes, ordres))
txt_b = re.sub(r'<ul class="orders".*?</ul>', f'<div class="cf-rows">{rangs}</div>', txt_b, flags=re.S)
pb = f'<div class="split split-r">{txt_b}<div class="cf-phone">{tel_b}</div></div>'
wa_sec = ('<section class="sec bg-cream nt-wa" id="whatsapp"><div class="w">'
  '<input type="radio" name="ntwa" id="ntwa1" checked><input type="radio" name="ntwa" id="ntwa2">'
  '<div class="nt-seg" role="group" aria-label="WhatsApp"><label for="ntwa1">Vos clients confirment</label><label for="ntwa2">Vos consignes</label></div>'
  f'<div class="nt-panes"><div class="nt-pa">{pa}</div><div class="nt-pb">{pb}</div></div></div></section>')
s = s[:a1] + wa_sec + s[e2 + len('</section>'):]

# les métiers : une bande de photos de gens au travail, qui défile
i = s.index('<nav class="met-l"'); j = s.index('</nav>', i) + len('</nav>')
liens = re.findall(r'<a href="([a-z]+)\.html"><b>(.*?)</b><span>(.*?)</span>(?:<svg.*?</svg>)?</a>', s[i:j], re.S)
assert len(liens) == 11, len(liens)
CAP = {
 'garages': ['Rendez-vous d’atelier posés', 'Pannes urgentes signalées', 'Voiture et plaque notées'],
 'restaurants': ['Tables réservées', 'Groupes et demandes notés', 'Horaires et accès répondus'],
 'cabinets': ['Rendez-vous posés et déplacés', 'Messages pour le médecin', 'Rappel la veille'],
 'independants': ['Répond pendant vos rendez-vous', 'Demandes de devis notées', 'Résumé sur WhatsApp'],
 'veterinaires': ['Consultations planifiées', 'Urgences transmises tout de suite', 'Rappel la veille'],
 'plombiers': ['Urgences sur le chantier', 'Demandes de devis notées', 'Passages planifiés'],
 'chauffagistes': ['Pannes de chaudière signalées', 'Entretiens planifiés', 'Adresse et accès notés'],
 'electriciens': ['Dépannages signalés', 'Devis notés', 'Passages planifiés'],
 'serruriers': ['Décroche la nuit', 'Urgences transmises', 'Adresse et numéro notés'],
 'syndics': ['Pannes d’immeuble notées', 'Message au gestionnaire', 'Copropriétaires rappelés'],
 'fiduciaires': ['Rendez-vous clients posés', 'Messages pour le comptable', 'Échéances rappelées'],
}
ORDRE = ['cabinets', 'restaurants', 'independants', 'garages', 'veterinaires', 'plombiers', 'fiduciaires', 'chauffagistes', 'syndics', 'electriciens', 'serruriers']
liens = sorted(liens, key=lambda l: ORDRE.index(l[0]))
def carte(h, nom, txt, cache=False):
    att = ' aria-hidden="true" tabindex="-1"' if cache else ''
    cap = ''.join(f'<i>{c}</i>' for c in CAP[h])
    return (f'<a class="nt-mc" href="{h}.html"{att}><img src="assets/metiers-photos/{h}.jpg" alt="" loading="lazy" width="900" height="506">'
            f'<span class="nt-mc-t"><b>{nom}</b><span class="nt-mc-q">{txt}</span><span class="nt-cap">{cap}</span></span></a>')
piste = ''.join(carte(*l) for l in liens) + ''.join(carte(*l, cache=True) for l in liens)
s = s[:i] + f'<nav class="met-l nt-mq" aria-label="Votre métier"><div class="nt-track">{piste}</div></nav>' + s[j:]
s = s.replace('<div class="w-wide split-met">', '<div class="w-wide split-met nt-met">', 1)

# les prix : une ancre
k = s.index('<div class="price-head">'); a = s.rfind('<section class="sec bg-cream"', 0, k)
s = s[:a] + '<section class="sec bg-cream" id="prix"' + s[a + len('<section class="sec bg-cream"'):]

# la barre d'accès rapide (téléphone)
s = s.replace('</section>\n<section class="hv-next">', '</section>\n<nav class="nt-quick" aria-label="Aller à"><a href="#marche">Comment ça marche</a><a href="#metier">Métiers</a><a href="#whatsapp">WhatsApp</a><a href="#prix">Prix</a><a href="#faq">FAQ</a></nav>\n<section class="hv-next">', 1)
assert 'nt-quick' in s

# le fond peint à d'autres endroits
s = s.replace('<section class="nh">', '<section class="nh nt-peint">', 1)
s = s.replace('<section class="sec" id="pour-vous">', '<section class="sec nt-peint" id="pour-vous">', 1)
s = s.replace('<section class="sec bg-cream" id="prix"', '<section class="sec bg-cream nt-peint" id="prix"', 1)


# ordinateur : « Ce que Janet fait pour vous » en index (la liste à gauche, l'exemple à droite)
EXF = [('Le soir, 21h15', 'Allô ? Vous êtes encore là ?', 'Bonsoir, ici Janet, l’assistante du garage. Je vous écoute.', 'Décroché', 'gr'),
       ('Vidange', 'Je peux passer pour la vidange ?', 'Demain, dépôt à partir de 9h. Je vous le réserve ?', 'RDV pris', 'ok'),
       ('Panne', 'Ma voiture est bloquée sur le parking, elle ne démarre plus.', 'Je préviens tout de suite le garage, il vous rappelle.', 'Urgent', 'urg'),
       ('Pour Marc', 'Dites à Marc que la pièce est arrivée.', 'C’est noté, je lui transmets avec votre numéro.', 'À rappeler', 'rap'),
       ('Après l’appel', 'Je voudrais un devis pour ma carrosserie.', 'C’est noté. Le garage reçoit le résumé sur WhatsApp et vous rappelle.', 'Résumé envoyé', 'rap'),
       ('Néerlandais', 'Goedemiddag, spreekt u Nederlands?', 'Natuurlijk. Waarmee kan ik u helpen?', 'NL', 'gr'),
       ('Pendant les congés', 'Vous êtes ouverts le 26 décembre ?', 'Le garage rouvre le lundi 28. Je vous réserve un créneau ?', 'Réponse', 'gr'),
       ('Dans votre console', 'Ma voiture est prête ?', 'Je transmets au garage, il vous rappelle dans la journée.', 'À rappeler', 'rap')]
i = s.index('<ul class="grid8"'); j = s.index('</ul>', i) + 5
items = re.findall(r'<li><h3>(.*?)</h3><p>(.*?)</p></li>', s[i:j])
assert len(items) == 8
radios = ''.join(f'<input type="radio" name="ntf" id="ntf{k}"{" checked" if k == 0 else ""}>' for k in range(8))
labels = ''.join(f'<label for="ntf{k}" class="nt-fl" data-k="{k}"><span>{t}</span></label>' for k, (t, d) in enumerate(items))
panes = ''.join(f'<div class="nt-fp nt-fp{k}"><p class="nt-fd">{d}</p><div class="nt-fx"><small>{e[0]}</small><span class="nh-me">« {e[1]} »</span><span class="nh-her"><img src="assets/hero/orbe.jpg" alt=""><span>{e[2]}</span></span><em class="nt-ft {e[4]}">{e[3]}</em></div></div>' for k, ((t, d), e) in enumerate(zip(items, EXF)))
index = f'<div class="nt-fait">{radios}<div class="nt-fls">{labels}</div><div class="nt-fps">{panes}</div></div>'
s = s[:j] + index + s[j:]

# ordinateur : « Comment ça marche » en grandes lignes qui s'allument au défilement
i = s.index('<ol class="steps"'); s = s[:i] + s[i:].replace('<ol class="steps"', '<ol class="steps nt-lignes"', 1)


# mobile : « Un appel, de bout en bout », l'étape en cours au-dessus du téléphone, avec sa barre de progression
i = s.index('<ol class="scn-steps"'); j = s.index('</ol>', i) + 5
s = s[:j] + '<div class="nt-prog" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>' + s[j:]

# la fiche : le post-it du prototype, et plus de mention « Exemple »
old = '<h2>Vous recevez une fiche claire, <em>pas un post-it</em></h2></div>'
assert old in s
s = s.replace(old, '<h2>Vous recevez une fiche claire, <em>pas un post-it</em></h2><img class="nt-postit" src="assets/hero/postit.jpg" alt="" loading="lazy"></div>', 1)
s = s.replace('<span class="fm-ex">Exemple</span>', '')

# la fin de page : le fond peint du prototype au lieu du panneau noir
i = s.index('<div class="panel bg-ink cta-final">')
j = s.index('</section>', i)
bloc = s[i:j].replace('<div class="panel bg-ink cta-final">', '<div class="panel cta-final cta-peint">', 1).replace('btn btn-line-d', 'btn btn-line')
s = s[:i] + bloc + s[j:]
s = s.replace('<link rel="stylesheet" href="celya.css">', '<link rel="stylesheet" href="celya.css"><link rel="stylesheet" href="nouveau.css?v=' + __import__('time').strftime('%H%M%S') + '">')
assert 'nouveau.css' in s, 'lien CSS'
s = s.replace('</body>', '''<script>(function(){var f=document.querySelector('.nh-frame');if(!f)return;
var v=f.querySelector('.nh-v'),red=matchMedia('(prefers-reduced-motion:reduce)').matches;
if(v&&innerWidth>=720){v.poster=v.dataset.poster;if(!red){v.preload='metadata';v.src=v.dataset.src;}}
new IntersectionObserver(function(es){var on=es[0].isIntersecting;f.classList.toggle('nh-off',!on);if(v&&v.src&&!red){on?v.play().catch(function(){}):v.pause();}}).observe(f);})();

var q=document.querySelector('.nt-quick'),hero=document.querySelector('.nh');
if(q&&hero){new IntersectionObserver(function(es){q.classList.toggle('on',!es[0].isIntersecting);}).observe(hero);
var links=[].slice.call(q.querySelectorAll('a')),secs=links.map(function(a){return document.querySelector(a.getAttribute('href'));});
var so=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var i=secs.indexOf(e.target);links.forEach(function(l,k){l.classList.toggle('cur',k===i);});if(links[i])links[i].scrollIntoView({block:'nearest',inline:'center'});}});},{rootMargin:'-45% 0px -50% 0px'});
secs.forEach(function(x){if(x)so.observe(x);});}
var pr=document.querySelector('.prices');
if(pr){var cards=[].slice.call(pr.querySelectorAll('.pc')),ch=document.createElement('div');ch.className='nt-pchips';
cards.forEach(function(c,i){var bt=document.createElement('button');bt.type='button';bt.textContent=c.querySelector('.pc-top .label').textContent+' · '+c.querySelector('.pc-price b').textContent;
bt.onclick=function(){pr.scrollTo({left:c.offsetLeft-pr.offsetLeft,behavior:'smooth'});};ch.appendChild(bt);});
pr.parentNode.insertBefore(ch,pr);var bs=[].slice.call(ch.children);
function cur(){var x=pr.scrollLeft,best=0,d=1e9;cards.forEach(function(c,i){var dd=Math.abs(c.offsetLeft-pr.offsetLeft-x);if(dd<d){d=dd;best=i;}});bs.forEach(function(b,i){b.classList.toggle('cur',i===best);});}
pr.addEventListener('scroll',cur,{passive:true});cur();}
var mq=document.querySelector('.nt-mq');if(mq)new IntersectionObserver(function(es){mq.classList.toggle('nh-off',!es[0].isIntersecting);}).observe(mq);
document.querySelectorAll('input[name=ntwa]').forEach(function(r){r.addEventListener('change',function(){var p=document.querySelector(r.id==='ntwa1'?'.nt-pa':'.nt-pb'),d=p&&p.querySelector('.dev3d');if(d){d.classList.remove('in');void d.offsetWidth;d.classList.add('in');}});});
document.querySelectorAll('.nt-peint').forEach(function(x){new IntersectionObserver(function(es){x.classList.toggle('nh-off',!es[0].isIntersecting);}).observe(x);});
document.querySelectorAll('.nt-fl').forEach(function(l){l.addEventListener('mouseenter',function(){var r=document.getElementById(l.getAttribute('for'));if(r)r.checked=true;});});
var cp=document.querySelector('.cta-peint');if(cp)new IntersectionObserver(function(es){cp.classList.toggle('nh-off',!es[0].isIntersecting);}).observe(cp);
var pi=document.querySelector('.nt-postit');if(pi)new IntersectionObserver(function(es,o){if(es[0].isIntersecting){pi.classList.add('in');o.disconnect();}},{threshold:.3}).observe(pi);
document.querySelectorAll('.dev3d').forEach(function(d){new IntersectionObserver(function(es,o){if(es[0].isIntersecting){d.classList.add('in');o.disconnect();}},{threshold:.25}).observe(d);});</script>
</body>''', 1)
open('page.html', 'w', encoding='utf-8').write(s)
print('ok', k, 'aperçus')
