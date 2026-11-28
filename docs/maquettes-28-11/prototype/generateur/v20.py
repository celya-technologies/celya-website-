#!/usr/bin/env python3
"""Accueil celya.be sur téléphone, v4 : tout le contenu de la page actuelle, H2 dans le même ordre,
avec la disposition des sites de référence (centré, visuel puis légende, deux tons au lieu de l'italique)."""
logo = open('logo.svg.txt').read().strip().replace(
    '<svg class="logo" viewBox', '<svg class="logo" style="height:22px;width:auto;display:block" viewBox')
WAVE = '<span class="wave">' + ''.join(f'<i style="--d:{d}s"></i>' for d in (0, .2, .4, .1, .3, .5, .15, .35, .05, .25)) + '</span>'

def h2(a, b=''):
    return f'<h2>{a}{" <span class=mute>" + b + "</span>" if b else ""}</h2>'

def kick(t):
    return f'<p class="kick">{t}</p>'

STATUS = '''<div class="sbar"><b>9:41</b><span class="ic"><svg width="17" height="11" viewBox="0 0 17 11"><rect x="0" y="7" width="3" height="4" rx="1"/><rect x="4.5" y="5" width="3" height="6" rx="1"/><rect x="9" y="2.5" width="3" height="8.5" rx="1"/><rect x="13.5" y="0" width="3" height="11" rx="1"/></svg><svg width="25" height="12" viewBox="0 0 25 12"><rect x=".5" y=".5" width="21" height="11" rx="3.5" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="16" height="8" rx="2"/><rect x="22.5" y="4" width="1.8" height="4" rx="1" opacity=".4"/></svg></span></div>'''
def iphone(inner, cls='', ex=True, scr=''):
    return f'''<div class="dev3d" data-in><div class="tilt"><div class="iphone {cls}"><div class="bezel"><div class="scr {scr}"><span class="island"></span>{STATUS}{inner}</div></div></div></div></div>'''
def phone(title, sub, body, cls=''):
    return iphone(f'''<div class="ph-top"><span class="av">{title[0]}</span><span><b>{title}</b><small>{sub}</small></span></div><div class="ph-body">{body}</div>''', cls)
RE = '<svg width="16" height="14" viewBox="0 0 16 14"><path d="M6 1 1 6l5 5M1.5 6H10a5 5 0 0 1 5 5v2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
LK = '<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1.5" y="1.5" width="13" height="13" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M6 10l4.5-4.5M6.5 5.5h4v4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
TK = '<svg width="16" height="10" viewBox="0 0 16 10"><path d="M1 5.5 4 8.5 10 1.5M6.5 8.5 7 9l7-7.5" fill="none" stroke="#53bdeb" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
def msg(text, t, out=False, btns=(), link=None, quote=None, i=0):
    q = f'<div class="wq"><b>{quote[0]}</b>{quote[1]}</div>' if quote else ''
    bb = ''.join(f'<span>{RE}{b}</span>' for b in btns) + (f'<span>{LK}{link}</span>' if link else '')
    return f'<div class="m{" out" if out else ""}" style="--i:{i}">{q}<p>{text}<time>{t}{TK if out else ""}</time></p>{f"<div class=qr>{bb}</div>" if bb else ""}</div>'
def whatsapp(name, avatar, msgs, cls=''):
    av = '<img src="img/celya-avatar.svg" alt="">' if avatar == 'celya' else f'<span>{avatar}</span>'
    body = ''.join(m if m.startswith('<div class="chip') else m for m in msgs)
    return iphone(f'''<div class="wa-top"><svg width="12" height="20" viewBox="0 0 12 20"><path d="M10 2 2 10l8 8" fill="none" stroke="#e9edef" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg><div class="wa-pill"><i class="wa-av">{av}</i><b>{name}</b></div></div>
<div class="wa-body">{body}</div><div class="wa-in"><svg width="18" height="18" viewBox="0 0 18 18"><path d="M9 2v14M2 9h14" stroke="#e9edef" stroke-width="2" stroke-linecap="round"/></svg><span class="fld"></span><span class="mic"><svg width="12" height="16" viewBox="0 0 12 16"><rect x="3" y="1" width="6" height="9" rx="3" fill="#0b0b0b"/><path d="M1 7a5 5 0 0 0 10 0M6 12v3" stroke="#0b0b0b" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg></span></div>''', 'wa ' + cls, scr='dark')
def slab(name, avatar, msgs, cls=''):
    av = '<img src="img/celya-avatar.svg" alt="">' if avatar == 'celya' else f'<span>{avatar}</span>'
    return f'''<div class="slab3d" data-in><div class="slab {cls}"><div class="sl-top"><i class="wa-av">{av}</i><b>{name}</b></div><div class="sl-body">{"".join(msgs)}</div></div></div>'''
def chip(t):
    return f'<div class="chip">{t}</div>'
def macbook(inner):
    return f'''<div class="dev3d" data-in><div class="tilt mac"><div class="lid"><span class="cam"></span><div class="disp">{inner}</div></div><div class="base"></div></div></div>'''

# 1. Un appel, de bout en bout : un téléphone où les cinq moments arrivent l'un après l'autre.
bout = '''<ol class="story">
<li style="--i:0"><div class="vis"><div class="b l">Bonjour, je voudrais un rendez-vous cette semaine.</div><div class="b r me">Jeudi 19 novembre à 10h ?</div></div><b>L’appel</b><span>Elle décroche et comprend la demande.</span></li>
<li style="--i:1"><div class="vis"><div class="ev1"><small>Jeudi 19 nov.</small><b>10:00 · Mme Lambert</b><em class="ok">RDV pris</em></div></div><b>Le rendez-vous se pose</b><span>Dans votre agenda, sur un créneau libre.</span></li>
<li style="--i:2"><div class="vis dk"><div class="m"><p><b>RDV pris</b> · Mme Lambert, jeudi 10h<br>Premier rendez-vous.</p></div></div><b>Vous êtes prévenu</b><span>Le résumé de l’appel arrive sur votre WhatsApp.</span></li>
<li style="--i:3"><div class="vis"><div class="btns"><i class="on">Confirmer</i><i>Déplacer</i><i>Annuler</i></div></div><b>Le client confirme</b><span>Confirmer, déplacer ou annuler : en un clic.</span></li>
<li style="--i:4"><div class="vis dk"><div class="m out"><p>Bloque-moi la journée de demain.</p></div></div><b>Vous donnez une consigne</b><span>Par WhatsApp, en une phrase.</span></li>
</ol>'''

fait = [('Elle décroche', 'À la deuxième sonnerie, quand vous êtes occupé, absent ou fermé.'),
        ('Elle prend les rendez-vous', 'Dans votre Google Agenda ou l’agenda Celya, avec vos durées et vos créneaux.'),
        ('Elle passe les urgences', 'Votre mobile sonne, avec le contexte déjà résumé.'),
        ('Elle prend les messages', 'Nom, numéro, motif : rien ne se perd.'),
        ('Elle vous résume tout', 'Un message WhatsApp après chaque vraie conversation.'),
        ('Elle parle français et néerlandais', 'Et bascule d’une langue à l’autre en cours d’appel.'),
        ('Elle ne ferme jamais', 'Le soir, le week-end, pendant vos congés.'),
        ('Vous gardez la main', 'Chaque appel, son résumé et sa transcription dans votre console.')]
EX = [('Le soir, 21h15', 'Allô ? Vous êtes encore là ?', 'Bonsoir, ici Janet, l’assistante du garage. Je vous écoute.', 'Décroché', 'gr'), ('Vidange', 'Je peux passer pour la vidange ?', 'Demain, dépôt à partir de 9h. Je vous le réserve ?', 'RDV pris', 'ok'), ('Panne', 'Ma voiture est bloquée sur le parking, elle ne démarre plus.', 'Je préviens tout de suite le garage, il vous rappelle.', 'Urgent', 'urg'), ('Pour Marc', 'Dites à Marc que la pièce est arrivée.', 'C’est noté, je lui transmets avec votre numéro.', 'À rappeler', 'rap'), ('Après l’appel', 'Je voudrais un devis pour ma carrosserie.', 'C’est noté. Le garage reçoit le résumé sur WhatsApp et vous rappelle.', 'Résumé envoyé', 'rap'), ('Néerlandais', 'Goedemiddag, spreekt u Nederlands?', 'Natuurlijk. Waarmee kan ik u helpen?', 'NL', 'gr'), ('Pendant les congés', 'Vous êtes ouverts le 26 décembre ?', 'Le garage rouvre le lundi 28. Je vous réserve un créneau ?', 'Réponse', 'gr'), ('Suivi', 'Ma voiture est prête ?', 'Je transmets au garage, il vous rappelle dans la journée.', 'Dans votre console', 'rap')]
fait_html = '<div class="tabs">' + ''.join(f'<input type="radio" name="fait" id="f{i}"{" checked" if i==0 else ""}><label for="f{i}">{t}</label>' for i,(t,d) in enumerate(fait)) + '<div class="panes">' + ''.join(f'''<div class="pane p{i}"><div class="tr">{'<img class=moon src=img/3d/lune.jpg alt="">' if i==6 else ''}<small>{EX[i][0]}</small><p class="cl">« {EX[i][1]} »</p><p class="jn"><span class="av">J</span>{EX[i][2]}</p><span class="tag {EX[i][4]}">{EX[i][3]}</span></div><h3>{t}</h3><p>{d}</p></div>''' for i,(t,d) in enumerate(fait)) + '</div></div>'

steps = [('Un client appelle', 'Vous êtes occupé, fermé, ou déjà en ligne.'),
         ('Janet décroche', 'En quelques secondes, elle accueille l’appelant et comprend sa demande.'),
         ('Elle agit', 'Selon la demande : <span class="mini">Rendez-vous</span> <span class="mini">Message</span> <span class="mini">Réponse</span>'),
         ('Vous recevez tout', 'Appel transcrit, résumé et classé. Urgent ? Vous êtes prévenu tout de suite.')]
steps_html = ''.join(f'<li style="--i:{i}"><b>{t}</b><span>{d}</span></li>' for i, (t, d) in enumerate(steps))

PHOTO = {'sonnette':('p-cabinet','66% 45%'),'carnet':('p-restaurant','62% 50%'),'livre':('p-atelier','70% 50%')}
def role(r, title, body, obj, q, a, i):
    ph, pos = PHOTO[obj]
    return f'''<article class="role4" data-in style="--i:{i}"><div class="pframe"><img src="img/{ph}.jpg" alt="" loading="lazy" style="object-position:{pos}"><div class="pcard"><span class="q">{q}</span><span class="a"><img class="av-orb" src="img/3d/orbe.jpg" alt="">{a}</span></div></div><p class="role">{r}</p><h3>{title}</h3><p class="rb">{body}</p></article>'''
def scene(role, title, body, img, pos, ui):
    return f'''<article class="scene" data-in><div class="frame"><img src="img/{img}" alt="" loading="lazy" style="object-position:{pos}"><div class="ui">{ui}</div></div>
<p class="role">{role}</p><h3>{title}</h3><p>{body}</p></article>'''

ui_rec = f'<div class="bub">« Vous êtes ouverts samedi ? »</div><div class="bub me">Oui, de 9h à 12h. Je vous réserve un créneau ?</div><div class="pill"><b>Janet</b>{WAVE}<span class="tm">00:42</span></div>'
ui_ass = '<div class="agenda"><div class="day">Jeudi 19</div><div class="slot"><span>12:30</span><b>Table pour 4, Martin</b></div><div class="slot new"><span>20:00</span><b>Table pour 2, Sophie</b><em>Pris par Janet</em></div></div>'
ui_con = '<div class="bub">« Vous faites les pneus d’hiver ? C’est combien ? »</div><div class="bub me">Oui. Le garage vous fera un devis : je note votre numéro ?</div>'

wa = whatsapp('Celya', 'celya', [chip('Aujourd’hui'),
 msg('<b>Urgent</b> · M. Janssens<br><u>0475 •• •• 21</u><br>Veut : être dépanné ce matin, batterie à plat.', '11:20', link='Voir l’appel', i=0),
 msg('<b>À rappeler</b> · Mme Claes<br><u>0486 •• •• 07</u><br>Veut : un devis carrosserie.', '13:41', link='Voir l’appel', i=1),
 msg('<b>RDV pris</b> · M. Peeters, jeudi 10h<br>Contrôle + pneus hiver.', '14:05', link='Voir l’appel', i=2)], 'seqwa')


ag = '''<div class="drop"><div class="dh"><b>Jeudi 19 novembre</b><span>Votre agenda</span></div>
<div class="hr"><span>9h</span><i>Vidange · Golf 7</i></div><div class="hr"><span>10h</span><i class="slot-in">M. Peeters · contrôle + pneus hiver<small>Réservé par Janet pendant l’appel</small></i></div><div class="hr"><span>11h</span><i class="free"></i></div><div class="hr"><span>12h</span><i>Pneus hiver · Clio</i></div></div>'''

fiche = '''<div class="fan" data-in>
<div class="fc c3"><b>M. Peeters</b><span>Réponse · Normale</span></div>
<div class="fc c2"><b>Karim B.</b><span class="u">Message · Urgente</span></div>
<div class="fc c1"><div class="fh"><b>Fiche d’appel</b><span class="tag ok">RDV pris</span></div><dl><dt>Appelant</dt><dd>Marie D.</dd><dt>Motif</dt><dd>Rendez-vous</dd><dt>Urgence</dt><dd>Normale</dd><dt>Réservé</dt><dd>Jeudi 15 h 20</dd><dt>Transcription</dt><dd>Disponible</dd></dl></div>
</div>'''

semaine = macbook('''<div class="week"><div class="wh"><b>Novembre 2026</b><span>Votre agenda · semaine</span></div>
<div class="wg"><span></span><span>Lun 16</span><span>Mar 17</span><span>Mer 18</span><span>Jeu 19</span><span>Ven 20</span>
<span>9h</span><i>Vidange</i><i></i><i>Diagnostic</i><i></i><i></i>
<span>10h</span><i></i><i>Révision</i><i></i><i class="j">M. Peeters<br>par Janet</i><i></i>
<span>11h</span><i></i><i></i><i class="j">Mme Claes<br>par Janet</i><i></i><i>Pneus</i></div></div>''')

conf = slab('Garage Martin', 'G', [chip('Aujourd’hui'),
 msg('Bonjour M. Peeters, votre rendez-vous est enregistré.<br><b>Jeudi 19 novembre à 10h00</b><br>Entretien + pneus hiver<br>Garage Martin, Waterloo', '14:06', btns=('Confirmer', 'Déplacer', 'Annuler'), i=0),
 msg('Confirmer', '14:07', out=True, i=1),
 msg('Merci, c’est confirmé. À jeudi !', '14:07', i=2)], 'seqwa')

cons = slab('Celya', 'celya', [chip('Aujourd’hui'),
 msg('« Je suis en congé du 23 au 27 décembre. »', '09:12', out=True, i=0),
 msg('À valider<br>1. Fermer l’agenda du mer. 23 au dim. 27 déc.<br>2. Annoncer votre retour le lun. 28 aux clients qui appellent', '09:12', btns=('Oui', 'Non'), i=1),
 msg('Oui', '09:13', out=True, quote=('Celya', '« Je suis en congé du 23 au 27 décembre. » À valider'), i=2),
 msg('✓ Agenda fermé du 23 au 27 déc., retour annoncé le 28', '09:13', btns=('Défaire',), i=3)], 'seqwa')

metiers = [('Garages', '« Ma voiture ne démarre pas, c’est urgent. »'), ('Restaurants', '« Une table pour 4 ce soir, c’est possible ? »'),
           ('Cabinets médicaux', '« Je voudrais déplacer mon rendez-vous de jeudi. »'), ('Indépendants', '« Vous faites aussi les dépannages le samedi ? »'),
           ('Vétérinaires', 'Rendez-vous et urgences triés pendant la consultation.'), ('Plombiers', 'Sur le chantier, les urgences vous arrivent.'),
           ('Chauffagistes', 'Les pannes de chaudière ne passent plus à la trappe.'), ('Électriciens', 'Devis et dépannages notés, même en intervention.'),
           ('Serruriers', 'La nuit aussi, elle décroche.'), ('Syndics d’immeuble', 'Les copropriétaires ont toujours quelqu’un.'),
           ('Fiduciaires', 'Les clients rappelés, les échéances respectées.')]
OBJ = {'Garages':'cle-voiture','Restaurants':'fouet','Cabinets médicaux':'stethoscope','Indépendants':'ciseaux'}
met_top = ''.join(f'<a href="#" class="mo" style="--i:{i}"><img src="img/3d/{OBJ[n]}.jpg" alt="" loading="lazy"><b>{n}</b><span>{d}</span></a>' for i,(n,d) in enumerate(metiers[:4]))
met_html = ''.join(f'<a href="#" class="{"q" if i < 4 else ""}"><b>{n}</b><span>{d}</span></a>' for i, (n, d) in enumerate(metiers[4:], 4))

plans = [('Essentiel', '', 49, 100, 'Pour ne plus rater un appel.', ['Numéro belge inclus', 'En français et en néerlandais', '1 agenda : Google ou Celya', 'Résumé de chaque appel sur WhatsApp', 'Vos consignes par WhatsApp', 'Transfert des urgences vers votre portable']),
         ('Pro', 'Recommandé', 99, 300, 'Pour une équipe qui prend des rendez-vous.', ['Tout l’Essentiel', 'Jusqu’à 3 agendas', 'Confirmations et rappels sur WhatsApp', 'Vos clients confirment, déplacent ou annulent en un clic', '50 SMS de secours par mois']),
         ('Premier répondant', '', 199, 750, 'Pour les gros volumes et plusieurs adresses.', ['Tout le Pro', 'Agendas illimités, plusieurs sites', 'Revue mensuelle de vos appels', 'Support prioritaire', '100 SMS de secours par mois'])]
plans_html = ''.join(f'''<details class="plan{" rec" if r else ""}"{" open" if r else ""}><summary><span><b>{n}</b>{f"<em>{r}</em>" if r else ""}<small>{m} minutes par mois · {pour}</small></span><strong>{p} €<small>HT / mois</small></strong></summary><ul>{"".join(f"<li>{x}</li>" for x in li)}</ul></details>''' for n, r, p, m, pour, li in plans)

articles = [('Indépendants', '« Je le rappellerai plus tard »', 'Le vrai coût des appels manqués quand personne ne décroche à votre place.'),
            ('Cabinets', '« Tapez 1 pour un rendez-vous »', 'Pourquoi les patients raccrochent devant un serveur vocal, et ce qui a changé depuis.'),
            ('Restaurants', 'Le téléphone sonne toujours au pire moment', 'Ce qu’on a constaté chez les restaurateurs belges, et qui prend les réservations.'),
            ('Garages', '8 garages sur 10 n’ont pas décroché', 'Nous avons appelé des dizaines de garages belges en pleine journée. Les chiffres.')]
art_html = ''.join(f'<a class="art" href="#"><small>{c} · 12 août 2026</small><h3>{t}</h3><span>{d}</span></a>' for c, t, d in articles)

faq = [('Combien ça coûte ?', 'Trois formules : 49, 99 et 199 € par mois hors TVA, pour 100, 300 et 750 minutes d’appels. Tout est sur la page des prix : ce que contient chaque formule, et ce qui se passe si vous dépassez vos minutes.'),
       ('Est-ce légal en Belgique ?', 'Oui. Janet ne fait qu’une chose : répondre aux appels que votre entreprise reçoit. Elle annonce qu’elle est une IA, et vos données restent hébergées en Europe, conformément au RGPD.'),
       ('Ça sonne comment ?', 'Comme une personne au téléphone : une voix naturelle, une vraie conversation. Le plus simple est de juger vous-même : appelez le +32 460 25 44 13.'),
       ('Quelles langues parle-t-elle ?', 'Chez nos clients belges, Janet répond en français et en néerlandais, et bascule d’une langue à l’autre en cours d’appel. Une autre langue ? Parlons-en.'),
       ('Est-ce qu’elle prend vraiment les rendez-vous ?', 'Oui. Elle propose vos créneaux libres et réserve pendant l’appel : le rendez-vous apparaît directement dans votre agenda.')]
faq_html = ''.join(f'<details class="qa"><summary>{q}<i></i></summary><p>{a}</p></details>' for q, a in faq)

CSS = open('v20.css').read()

JS = r'''
(function(){
  var all=document.querySelectorAll('[data-in]');
  if(!('IntersectionObserver' in window)){all.forEach(function(e){e.classList.add('in')});return}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.3});
  all.forEach(function(e){io.observe(e)});
  var pz=new IntersectionObserver(function(es){es.forEach(function(e){e.target.classList.toggle('anim-off',!e.isIntersecting)})});
  document.querySelectorAll('[data-loop]').forEach(function(e){pz.observe(e)});
  var v=document.querySelector('.hero-mob .person-v');
  if(v&&innerWidth>=720){v.poster=v.dataset.poster;
    if(!matchMedia('(prefers-reduced-motion:reduce)').matches){v.preload='metadata';v.src=v.dataset.src;
      new IntersectionObserver(function(es){es[0].isIntersecting?v.play().catch(function(){}):v.pause()}).observe(v)}}
  if(window.matchMedia('(min-width:960px)').matches){document.querySelectorAll('details.plan').forEach(function(d){d.open=true})}
})();
'''

HTML = f'''<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Celya, prototype de l’accueil sur téléphone (v20)</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Figtree:wght@500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400&display=swap" rel="stylesheet">
<style>{CSS}</style></head>
<body><div class="wrap">
<header class="hdr2"><div class="pillbar">{logo}<nav class="nav-d"><a href="#">Comment ça marche</a><a href="#">Votre métier</a><a href="#">Prix</a><a href="#">FAQ</a><a href="#">Blog</a><a href="#">Contact</a></nav><a class="login" href="#">Se connecter</a><a class="demo-b" href="#"><span class="dl">Demander une démo</span><span class="ds">Démo</span></a></div></header>

<div class="hero-mob">
<div class="stage2 withphoto" data-loop><video class="person-v" muted loop playsinline preload="none" aria-hidden="true" tabindex="-1" disablepictureinpicture data-src="img/hero/hero-ordinateur-720.mp4" data-poster="img/hero/hero-ordinateur-poster.webp"></video><img class="person" src="img/appelant.jpg" alt="Une cliente appelle un commerce depuis la rue, téléphone à l’oreille">
<h1 class="ov">Vous ratez des appels&nbsp;? <em>Elle répond à votre place.</em></h1>
<div class="ctas ov in"><a class="k" href="tel:+32460254413"><svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>Appeler Janet, +32 460 25 44 13</a><a class="o" href="#">Demander une démo</a></div>
<input type="radio" name="vue" id="v1" checked><input type="radio" name="vue" id="v2">
<div class="seg"><label for="v1">L’appel</label><label for="v2">Le résumé</label></div>
<div class="card2">
<div class="pane1 call1"><p class="who2">Appel entrant · Mme Lambert</p><div class="bq me2 s1">Bonjour, je voudrais un rendez-vous cette semaine.</div><div class="ba s2"><img src="img/3d/orbe.jpg" alt=""><span>Jeudi 19 novembre à 10h, ça vous va ?</span></div><div class="bq me2 s3">Parfait, merci !</div><span class="res ok s4">RDV pris · jeudi 10h</span></div>
<div class="pane2"><div class="wa-mini"><p class="who2">Sur votre WhatsApp, 30 secondes après</p><div class="m"><p><b>RDV pris</b> · Mme Lambert, jeudi 10h<br>Premier rendez-vous.</p></div><div class="m"><p><b>Urgent</b> · M. Janssens<br><u>0475 •• •• 21</u><br>Veut : être dépanné ce matin.</p></div><div class="m"><p><b>À rappeler</b> · Mme Claes<br>Message pour Marc : son devis.</p></div></div></div>
<div class="bar2"><a class="callbtn" href="tel:+32460254413" aria-label="Appeler Janet"><svg width="18" height="18" viewBox="0 0 24 24"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1L6.6 10.8z" fill="#151515"/></svg></a><a class="callpill" href="tel:+32460254413">Appelez-la : +32 460 25 44 13</a></div>
</div></div>
<div class="ctas ov out"><a class="k" href="tel:+32460254413"><svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>Appeler Janet, +32 460 25 44 13</a><a class="o" href="#">Demander une démo</a></div>
</div>

<div class="asks" data-loop aria-label="Exemples de demandes reçues au téléphone"><div class="mq l"><div class="mq-in"><span>« Vous êtes ouverts samedi ? »</span><span>« Je voudrais déplacer mon rendez-vous de jeudi. »</span><span>« Ma voiture ne démarre plus. »</span><span>« Une table pour 4 ce soir ? »</span><span>« C’est combien, une vidange ? »</span><span>« Vous êtes ouverts samedi ? »</span><span>« Je voudrais déplacer mon rendez-vous de jeudi. »</span><span>« Ma voiture ne démarre plus. »</span><span>« Une table pour 4 ce soir ? »</span><span>« C’est combien, une vidange ? »</span></div></div><div class="mq r"><div class="mq-in"><span>« Kan ik een afspraak maken? »</span><span>« Je voudrais parler à Marc. »</span><span>« Vous faites les pneus d’hiver ? »</span><span>« Ma voiture est prête ? »</span><span>« Vous prenez de nouveaux patients ? »</span><span>« Kan ik een afspraak maken? »</span><span>« Je voudrais parler à Marc. »</span><span>« Vous faites les pneus d’hiver ? »</span><span>« Ma voiture est prête ? »</span><span>« Vous prenez de nouveaux patients ? »</span></div></div></div>
<div class="badges"><div><b>Meta Tech Provider</b><span>Fournisseur officiel WhatsApp Business</span></div><div><b>Vérifiée par Google</b><span>Application vérifiée Google Agenda</span></div></div>

<section class="c">
<h3 class="lead-h3">Un appel, de bout en bout.</h3>
<div data-in>{bout}</div>
</section>

<section class="c">
{h2('Ce que Janet fait pour vous.')}
<p class="sub">Une réceptionniste au téléphone, sans pause ni planning. Elle répond avec vos informations, règle ce qui peut l’être et vous prévient pour le reste.</p>
{fait_html}
</section>

<section class="c">
{h2('Le même appel.', 'Deux fins.')}
<p class="sub">Sans Celya, le client tombe sur le répondeur et appelle ailleurs. Avec Celya, il repart avec un rendez-vous.</p>
<div class="vs" data-loop data-in>
<div class="no"><img class="obj o-rep" src="img/3d/repondeur.jpg" alt="" loading="lazy"><span class="lab">Répondeur</span><span class="num">0 RDV</span><div class="tape"><span>« Bonjour, vous êtes bien chez… laissez un message après le bip. » Le client raccroche.</span></div></div>
<div class="yes photo"><img class="ph-bg" src="img/garage-fin.jpg" alt="" loading="lazy"><span class="lab">Janet</span><span class="num">1 RDV pris</span><div class="pill"><b>En appel</b>{WAVE}<span class="tm">00:42</span></div></div>
</div></section>

<section class="c" data-in>
{kick('Le parcours d’un appel reçu')}
{h2('Comment ça marche')}
<div class="stepwrap"><div class="rail-orb"><img src="img/3d/orbe.jpg" alt=""></div><ol class="steps">{steps_html}</ol></div>
</section>

<section class="c">
{kick('Ce qu’elle fait pendant que vous travaillez')}
{h2('Vos mains sont prises.', 'Elle décroche.')}
<div class="gloves" data-in><img class="obj" src="img/3d/gants.jpg" alt="" loading="lazy"></div>
<div class="roles">{role('Réceptionniste', 'Elle décroche à chaque appel', 'Fini les appels manqués : Janet répond en quelques secondes et accueille vos clients, comme un vrai secrétariat téléphonique, sans musique d’attente.', 'sonnette', '« Vous êtes ouverts samedi ? »', 'Oui, de 9h à 12h. Je vous réserve un passage ?', 0)}
{role('Assistante', 'Elle prend les rendez-vous', 'La prise de rendez-vous se fait pendant l’appel, directement dans votre agenda. Un message urgent ? Vous le recevez immédiatement.', 'carnet', '« Une table pour 4 ce soir, c’est possible ? »', 'Oui, à 20h. C’est à quel nom ?', 1)}
{role('Conseillère', 'Elle répond aux questions', 'Horaires, tarifs, services : elle renseigne vos clients à partir de vos informations. Si elle ne sait pas, elle note et vous transmet.', 'livre', '« Vous faites les pneus d’hiver ? »', 'Oui. Le garage vous fera un devis : je note votre numéro ?', 2)}</div>
</section>

<section class="c">
{kick('Intégrations')}
{h2('Branchée sur vos outils.', 'WhatsApp et Google Agenda.')}
<p class="sub">Rien à installer. Vous recevez tout là où vous êtes déjà, et vos rendez-vous tombent dans votre agenda.</p>
<div class="tools"><div class="tool" data-in><div>{wa}</div>
<h3>Le résumé de chaque appel, dans WhatsApp.</h3><p>Un message après chaque vraie conversation : rendez-vous pris, à rappeler ou urgent. Avec le nom, le numéro et ce qu’il faut savoir.</p>
<p class="cert"><b>Meta Tech Provider</b> Celya est fournisseur technologique de la plateforme WhatsApp Business de Meta : les messages passent par l’API officielle.</p></div>
<div class="tool" data-in><div class="withobj"><img class="obj o-cal" src="img/3d/calendrier.jpg" alt="" loading="lazy">{ag}</div>
<h3>Le rendez-vous s’écrit tout seul dans votre agenda.</h3><p>Janet voit vos disponibilités en temps réel et réserve le bon créneau. Pas d’agenda ? L’agenda Celya, complet et pensé pour votre métier, est inclus.</p>
<p class="cert"><b>Vérifiée par Google</b> L’accès de Celya à votre agenda a passé la vérification de sécurité de Google. Vous le coupez quand vous voulez.</p></div></div>
</section>

<section class="c" data-in>
{kick('Après chaque appel')}
{h2('Vous recevez une fiche claire,', 'pas un post-it')}
<div class="withobj"><img class="obj o-post" src="img/3d/postit.jpg" alt="" loading="lazy">{fiche}</div>
</section>

<section class="c" data-in>
{h2('Ce n’est pas un agenda.', 'C’est votre métier, compris.')}
<p class="sub">Elle connaît vos tables, vos ponts, vos durées. Elle réserve ce qui est réellement disponible, pas un créneau théorique.</p>
{semaine}
</section>

<section class="c">
{kick('Confirmations WhatsApp, formule Pro')}
{h2('Vos clients confirment', 'en un clic.')}
<p class="sub">Janet prend le rendez-vous, votre client reçoit la confirmation sur WhatsApp et répond d’un geste. Votre agenda suit tout seul.</p>
<div data-in>{conf}</div>
<dl class="three"><dt>Confirmer</dt><dd>Confirmé dans votre agenda, sans rien faire.</dd><dt>Déplacer</dt><dd>Janet lui propose trois créneaux libres. Il choisit, c’est réglé.</dd><dt>Annuler</dt><dd>Le créneau se libère et vous êtes prévenu.</dd></dl>
<p class="fine">Envoyé depuis votre numéro, à votre nom. Rappel automatique la veille. Pas de WhatsApp ? Votre client reçoit un SMS.</p>
</section>

<section class="c">
{kick('Vos consignes par WhatsApp, toutes les formules')}
{h2('En congé ?', 'Dites\u2011le\u2011lui sur WhatsApp.')}
<p class="sub">Pas besoin d’ouvrir l’application. Vous écrivez à Janet comme à une collègue : elle change vos horaires, bloque un créneau et prévient vos clients.</p>
<div class="withobj"><img class="obj o-val" src="img/3d/valise.jpg" alt="" loading="lazy">{cons}</div>
<div class="quotes"><span>« Je suis en congé du 23 au 27 »</span><span>« Bloque demain de 14h à 16h »</span><span>« Ne prends plus de rendez-vous aujourd’hui »</span><span>« Samedi, on ouvre de 9h à 12h »</span></div>
</section>

<section class="c">
{kick('Une permanence téléphonique pour votre métier')}
{h2('En plein service,', 'aucun appel ne se perd.')}
<div class="motop" data-in>{met_top}</div><div class="met">{met_html}</div>
<a class="lnk" href="#" style="display:inline-block;margin-top:22px">Tous les métiers</a>
</section>

<section class="c">
{h2('Dès 49 € HT par mois.')}
<p class="sub">14 jours gratuits, rien n’est débité avant la fin de l’essai.</p>
<div class="ctas"><a class="btn" href="#">Commencer l’essai gratuit</a></div>
<div class="plans">{plans_html}</div>
<p class="fine">Prix hors TVA. Minutes décomptées à la seconde. Mise en service : une mensualité. Au-delà de 750 minutes : sur devis. Messages WhatsApp à vos clients facturés par Meta sur votre compte (environ 2 € par mois).</p>
</section>

<section class="c">
{kick('Le blog de Celya')}
{h2('Nos derniers articles')}
<div class="arts">{art_html}</div>
</section>

<section class="c">
{kick('Questions fréquentes')}
{h2('Vos questions, sans détour')}
<div class="faq">{faq_html}</div>
<a class="lnk" href="#" style="display:inline-block;margin-top:22px">Toutes les questions</a>
</section>

<div class="end2 painted" data-in><div>{h2('Écoutez-la,', 'plutôt que de nous croire.')}<p>Appelez-la maintenant. Elle décroche en quelques secondes.</p><a class="num" href="tel:+32460254413">+32 460 25 44 13</a><div class="ctas"><a class="btn" href="tel:+32460254413">Appeler Janet</a><a class="lnk" href="#">Demander une démo</a></div></div></div>
<footer>{logo}<p>Celya Technologies SRL, Bruxelles</p></footer>
</div><script>{JS}</script></body></html>'''
open('index.html', 'w').write(HTML)
print('ok', len(HTML))
