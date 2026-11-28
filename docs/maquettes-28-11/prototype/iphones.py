# Les aperçus de téléphone du site deviennent les iPhone générés (cadre réaliste, WhatsApp en mode sombre).
# Le contenu de chaque aperçu est relu dans la page en ligne : aucun message n'est réécrit.
import re
ns = {}
src = open('/home/claude/proto/v20.py', encoding='utf-8').read()
src = src[:src.index("# 1. Un appel, de bout en bout")]
cwd = __import__('os').getcwd(); __import__('os').chdir('/home/claude/proto')
exec(src, ns)
__import__('os').chdir(cwd)
iphone, whatsapp, msg, chip = ns['iphone'], ns['whatsapp'], ns['msg'], ns['chip']

def fin_div(t, i):
    """Index juste après le </div> qui ferme le <div …> ouvert en i."""
    d = 0
    for m in re.finditer(r'<div\b|</div>', t[i:]):
        d += 1 if m.group(0) != '</div>' else -1
        if d == 0:
            return i + m.end()
    raise ValueError('div non fermé')

def chat_depuis(body):
    items = []
    for m in re.finditer(r'<span class="ph-day">(.*?)</span>|<span class="(bub bub-(?:me|her))[^"]*"><span>(.*?)</span><time>(.*?)</time></span>|<span class="feed[^"]*"><b><span[^>]*></span>(.*?)</b>(.*?)<time>(.*?)</time></span>|<span class="ph-btns">(.*?)</span></span>', body, re.S):
        if m.group(1): items.append(('chip', m.group(1)))
        elif m.group(2): items.append(('msg', m.group(3), m.group(4), 'me' in m.group(2), []))
        elif m.group(5):
            lignes = re.findall(r'<span>(.*?)</span>', m.group(6))
            items.append(('msg', f'<b>{m.group(5)}</b> · ' + '<br>'.join(lignes), m.group(7), False, []))
        else:
            btns = re.findall(r'<span>(.*?)</span>', m.group(8) + '</span>')
            for it in reversed(items):
                if it[0] == 'msg': it[4].extend(btns); break
    out, k = [], 0
    for it in items:
        if it[0] == 'chip': out.append(chip(it[1]))
        else: out.append(msg(it[1], it[2], out=it[3], btns=tuple(it[4]), i=k)); k += 1
    return out

pos = 0
while True:
    i = s.find('<div class="phone', pos)
    if i < 0: break
    j = fin_div(s, i)
    bloc = s[i:j]
    if 'scn-ph' in bloc:
        k = bloc.index('<div class="ph-scr">'); inner = bloc[k + len('<div class="ph-scr">'):-len('</div></div>')]
        new = iphone(inner, 'scn-ip').replace('<div class="dev3d"', '<div class="dev3d phone ipw"', 1)
    else:
        nom = re.search(r'<div class="ph-head">.*?<b>(.*?)</b>', bloc, re.S).group(1)
        enc = re.search(r'ph-av ph-av-ink">(.*?)</span>', bloc)
        body = re.search(r'<div class="ph-body">(.*)$', bloc, re.S).group(1)
        new = whatsapp(nom, enc.group(1) if enc else 'celya', chat_depuis(body), 'seqwa')
        new = new.replace('<div class="dev3d"', '<div class="dev3d ipw"', 1)
    s = s[:i] + new + s[j:]
    pos = i + len(new)
