/* Elli lernt laufen – Grafiken als SVG-Strings.
   Alle Farben stehen hier zentral, damit Figuren leicht angepasst werden können. */
(function () {
  'use strict';

  const C = {
    skin: '#F7D4BF', hair: '#B8935C', pink: '#F28DAE', pinkDark: '#E06F96',
    lady: '#EE7B72', dot: '#4A3557', ink: '#4A3557', mint: '#8ED5BF',
    butter: '#FFD98A', butterDark: '#E8B84A', sky: '#A9CBF2', tomato: '#F26B5B',
    leaf: '#6CBF7E', pug: '#E3C49A', pugDark: '#5B4636', white: '#FFFFFF',
    // Familie (Platzhalter – hier anpassen)
    mamaHair: '#8A5A3C', mamaDress: '#F28DAE',
    papaHair: '#6B5040', papaShirt: '#A9CBF2', papaPants: '#5A6B85',
    rubyHair: '#B8935C', rubyDress: '#8ED5BF'
  };

  const FONT = "Arial Rounded MT Bold, Arial, Helvetica, sans-serif";

  function svg(w, h, body) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h +
      '" width="' + w * 3 + '" height="' + h * 3 + '">' + body + '</svg>';
  }

  // ---------- Elli ----------
  const elliHead =
    '<circle cx="50" cy="40" r="24" fill="' + C.skin + '"/>' +
    '<path d="M28 36 Q30 14 50 15 Q70 15 73 34 Q64 24 54 26 Q46 21 40 29 Q33 28 28 36 Z" fill="' + C.hair + '"/>' +
    '<path d="M50 16 q-6 -10 2 -12 q6 1 0 8" fill="none" stroke="' + C.hair + '" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M62 19 l10 -7 l2 12 z M62 19 l-2 -12 l12 4 z" fill="' + C.pink + '"/>' +
    '<circle cx="63" cy="18" r="3" fill="' + C.pinkDark + '"/>' +
    '<ellipse cx="42" cy="42" rx="2.6" ry="3.4" fill="' + C.ink + '"/>' +
    '<ellipse cx="58" cy="42" rx="2.6" ry="3.4" fill="' + C.ink + '"/>' +
    '<circle cx="43" cy="40.6" r="0.9" fill="#fff"/><circle cx="59" cy="40.6" r="0.9" fill="#fff"/>' +
    '<circle cx="36" cy="50" r="4" fill="' + C.pink + '" opacity=".45"/>' +
    '<circle cx="64" cy="50" r="4" fill="' + C.pink + '" opacity=".45"/>' +
    '<path d="M45 51 Q50 56 55 51" fill="none" stroke="' + C.ink + '" stroke-width="2.2" stroke-linecap="round"/>';

  const elliHeadWorried =
    '<circle cx="50" cy="40" r="24" fill="' + C.skin + '"/>' +
    '<path d="M28 36 Q30 14 50 15 Q70 15 73 34 Q64 24 54 26 Q46 21 40 29 Q33 28 28 36 Z" fill="' + C.hair + '"/>' +
    '<path d="M50 16 q-6 -10 2 -12 q6 1 0 8" fill="none" stroke="' + C.hair + '" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M62 19 l10 -7 l2 12 z M62 19 l-2 -12 l12 4 z" fill="' + C.pink + '"/>' +
    '<circle cx="63" cy="18" r="3" fill="' + C.pinkDark + '"/>' +
    '<circle cx="42" cy="42" r="3.6" fill="' + C.ink + '"/><circle cx="58" cy="42" r="3.6" fill="' + C.ink + '"/>' +
    '<circle cx="43.2" cy="40.8" r="1.2" fill="#fff"/><circle cx="59.2" cy="40.8" r="1.2" fill="#fff"/>' +
    '<circle cx="36" cy="50" r="4" fill="' + C.pink + '" opacity=".6"/>' +
    '<circle cx="64" cy="50" r="4" fill="' + C.pink + '" opacity=".6"/>' +
    '<ellipse cx="50" cy="53" rx="3.2" ry="2.8" fill="' + C.ink + '"/>';

  const elliDress =
    '<path d="M34 66 Q50 60 66 66 L76 104 Q50 112 24 104 Z" fill="' + C.lady + '"/>' +
    '<path d="M34 66 L23 66" stroke="' + C.lady + '" stroke-width="10" stroke-linecap="round"/>' +
    '<path d="M66 66 L77 66" stroke="' + C.lady + '" stroke-width="10" stroke-linecap="round"/>' +
    '<path d="M50 64 L50 108" stroke="' + C.dot + '" stroke-width="1.6" opacity=".45"/>' +
    '<circle cx="38" cy="82" r="3.4" fill="' + C.dot + '"/><circle cx="62" cy="80" r="3.4" fill="' + C.dot + '"/>' +
    '<circle cx="34" cy="98" r="3.4" fill="' + C.dot + '"/><circle cx="66" cy="97" r="3.4" fill="' + C.dot + '"/>' +
    '<circle cx="44" cy="94" r="2.6" fill="' + C.dot + '"/><circle cx="57" cy="92" r="2.6" fill="' + C.dot + '"/>';

  // Oberkörper ohne Arme und Beine (die werden im Spiel animiert gezeichnet)
  const elliUpper = svg(100, 140, elliDress + elliHead);
  const elliUpperWorried = svg(100, 140, elliDress + elliHeadWorried);

  const elliFull = svg(100, 140,
    '<ellipse cx="50" cy="134" rx="24" ry="5" fill="#000" opacity=".10"/>' +
    '<rect x="37" y="102" width="10" height="26" rx="5" fill="' + C.skin + '"/>' +
    '<rect x="53" y="102" width="10" height="26" rx="5" fill="' + C.skin + '"/>' +
    '<ellipse cx="41" cy="129" rx="8" ry="5" fill="' + C.pink + '"/>' +
    '<ellipse cx="59" cy="129" rx="8" ry="5" fill="' + C.pink + '"/>' +
    '<path d="M22 66 L10 52" stroke="' + C.skin + '" stroke-width="8" stroke-linecap="round"/>' +
    '<path d="M78 66 L90 52" stroke="' + C.skin + '" stroke-width="8" stroke-linecap="round"/>' +
    elliDress + elliHead);

  const elliSit = svg(120, 110,
    '<rect x="22" y="88" width="34" height="11" rx="5.5" fill="' + C.skin + '"/>' +
    '<rect x="64" y="88" width="34" height="11" rx="5.5" fill="' + C.skin + '"/>' +
    '<ellipse cx="20" cy="92" rx="6" ry="8" fill="' + C.pink + '"/>' +
    '<ellipse cx="100" cy="92" rx="6" ry="8" fill="' + C.pink + '"/>' +
    '<path d="M42 56 Q60 50 78 56 L86 94 Q60 102 34 94 Z" fill="' + C.lady + '"/>' +
    '<circle cx="50" cy="72" r="3.2" fill="' + C.dot + '"/><circle cx="70" cy="70" r="3.2" fill="' + C.dot + '"/>' +
    '<circle cx="46" cy="86" r="3.2" fill="' + C.dot + '"/><circle cx="74" cy="86" r="3.2" fill="' + C.dot + '"/>' +
    '<path d="M40 60 L28 76" stroke="' + C.skin + '" stroke-width="8" stroke-linecap="round"/>' +
    '<path d="M80 60 L92 76" stroke="' + C.skin + '" stroke-width="8" stroke-linecap="round"/>' +
    '<circle cx="60" cy="32" r="23" fill="' + C.skin + '"/>' +
    '<path d="M39 28 Q41 7 60 8 Q79 8 82 27 Q73 18 64 20 Q56 15 50 23 Q44 21 39 28 Z" fill="' + C.hair + '"/>' +
    '<path d="M71 13 l10 -7 l2 12 z M71 13 l-2 -12 l12 4 z" fill="' + C.pink + '"/>' +
    '<path d="M48 33 q4 -4 8 0" fill="none" stroke="' + C.ink + '" stroke-width="2.2" stroke-linecap="round"/>' +
    '<path d="M64 33 q4 -4 8 0" fill="none" stroke="' + C.ink + '" stroke-width="2.2" stroke-linecap="round"/>' +
    '<circle cx="46" cy="41" r="4" fill="' + C.pink + '" opacity=".5"/>' +
    '<circle cx="74" cy="41" r="4" fill="' + C.pink + '" opacity=".5"/>' +
    '<ellipse cx="60" cy="44" rx="4" ry="3.2" fill="' + C.ink + '"/>');

  // ---------- Familie (Ganzkörper, Arme offen) ----------
  function face(cx, cy, r) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + C.skin + '"/>' +
      '<circle cx="' + (cx - r * 0.36) + '" cy="' + (cy + r * 0.08) + '" r="' + (r * 0.11) + '" fill="' + C.ink + '"/>' +
      '<circle cx="' + (cx + r * 0.36) + '" cy="' + (cy + r * 0.08) + '" r="' + (r * 0.11) + '" fill="' + C.ink + '"/>' +
      '<circle cx="' + (cx - r * 0.58) + '" cy="' + (cy + r * 0.38) + '" r="' + (r * 0.17) + '" fill="' + C.pink + '" opacity=".4"/>' +
      '<circle cx="' + (cx + r * 0.58) + '" cy="' + (cy + r * 0.38) + '" r="' + (r * 0.17) + '" fill="' + C.pink + '" opacity=".4"/>' +
      '<path d="M' + (cx - r * 0.3) + ' ' + (cy + r * 0.45) + ' Q' + cx + ' ' + (cy + r * 0.75) + ' ' + (cx + r * 0.3) + ' ' + (cy + r * 0.45) +
      '" fill="none" stroke="' + C.ink + '" stroke-width="' + (r * 0.1) + '" stroke-linecap="round"/>';
  }

  const mamaFull = svg(100, 190,
    '<rect x="39" y="140" width="9" height="44" rx="4.5" fill="' + C.skin + '"/>' +
    '<rect x="52" y="140" width="9" height="44" rx="4.5" fill="' + C.skin + '"/>' +
    '<ellipse cx="42" cy="185" rx="8" ry="4" fill="#7A5A8C"/><ellipse cx="58" cy="185" rx="8" ry="4" fill="#7A5A8C"/>' +
    '<path d="M27 66 Q25 30 50 26 Q75 30 73 66 L72 100 L28 100 Z" fill="' + C.mamaHair + '"/>' +
    '<path d="M33 74 Q50 66 67 74 L80 146 Q50 154 20 146 Z" fill="' + C.mamaDress + '"/>' +
    '<path d="M35 80 L8 62" stroke="' + C.mamaDress + '" stroke-width="11" stroke-linecap="round"/>' +
    '<path d="M65 80 L92 62" stroke="' + C.mamaDress + '" stroke-width="11" stroke-linecap="round"/>' +
    '<circle cx="6" cy="60" r="6" fill="' + C.skin + '"/><circle cx="94" cy="60" r="6" fill="' + C.skin + '"/>' +
    face(50, 46, 21) +
    '<path d="M29 44 Q31 24 50 24 Q69 24 71 44 Q62 32 50 34 Q38 32 29 44 Z" fill="' + C.mamaHair + '"/>');

  const papaFull = svg(100, 190,
    '<rect x="36" y="128" width="12" height="56" rx="6" fill="' + C.papaPants + '"/>' +
    '<rect x="52" y="128" width="12" height="56" rx="6" fill="' + C.papaPants + '"/>' +
    '<ellipse cx="41" cy="185" rx="9" ry="4" fill="#3E3346"/><ellipse cx="59" cy="185" rx="9" ry="4" fill="#3E3346"/>' +
    '<path d="M30 74 Q50 66 70 74 L72 134 L28 134 Z" fill="' + C.papaShirt + '"/>' +
    '<path d="M32 80 L6 62" stroke="' + C.papaShirt + '" stroke-width="12" stroke-linecap="round"/>' +
    '<path d="M68 80 L94 62" stroke="' + C.papaShirt + '" stroke-width="12" stroke-linecap="round"/>' +
    '<circle cx="4" cy="60" r="6" fill="' + C.skin + '"/><circle cx="96" cy="60" r="6" fill="' + C.skin + '"/>' +
    face(50, 44, 22) +
    '<path d="M28 40 Q28 18 50 18 Q72 18 72 40 Q66 28 50 29 Q34 28 28 40 Z" fill="' + C.papaHair + '"/>');

  const rubyFull = svg(80, 140,
    '<rect x="30" y="98" width="8" height="36" rx="4" fill="' + C.skin + '"/>' +
    '<rect x="42" y="98" width="8" height="36" rx="4" fill="' + C.skin + '"/>' +
    '<ellipse cx="33" cy="135" rx="7" ry="3.5" fill="' + C.pink + '"/><ellipse cx="47" cy="135" rx="7" ry="3.5" fill="' + C.pink + '"/>' +
    '<path d="M28 58 Q40 52 52 58 L62 104 Q40 110 18 104 Z" fill="' + C.rubyDress + '"/>' +
    '<path d="M29 62 L8 48" stroke="' + C.rubyDress + '" stroke-width="9" stroke-linecap="round"/>' +
    '<path d="M51 62 L72 48" stroke="' + C.rubyDress + '" stroke-width="9" stroke-linecap="round"/>' +
    '<circle cx="6" cy="46" r="5" fill="' + C.skin + '"/><circle cx="74" cy="46" r="5" fill="' + C.skin + '"/>' +
    '<circle cx="18" cy="32" r="8" fill="' + C.rubyHair + '"/><circle cx="62" cy="32" r="8" fill="' + C.rubyHair + '"/>' +
    '<circle cx="23" cy="25" r="3" fill="' + C.pink + '"/><circle cx="57" cy="25" r="3" fill="' + C.pink + '"/>' +
    face(40, 34, 18) +
    '<path d="M22 32 Q23 15 40 15 Q57 15 58 32 Q50 23 40 24 Q30 23 22 32 Z" fill="' + C.rubyHair + '"/>');

  // Trude von der Seite, schaut nach rechts (wird zum Laufen nach links gespiegelt)
  function trudeBody(legPose) {
    const l = legPose || 0;
    return '<rect x="' + (24 + l) + '" y="40" width="7" height="16" rx="3.5" fill="' + C.pug + '"/>' +
      '<rect x="' + (56 - l) + '" y="40" width="7" height="16" rx="3.5" fill="' + C.pug + '"/>' +
      '<rect x="' + (31 - l) + '" y="40" width="7" height="15" rx="3.5" fill="#D4B184"/>' +
      '<rect x="' + (63 + l) + '" y="40" width="7" height="15" rx="3.5" fill="#D4B184"/>' +
      '<ellipse cx="46" cy="35" rx="27" ry="14" fill="' + C.pug + '"/>' +
      '<path d="M20 28 q-10 -8 -4 -14 q6 2 2 8" fill="none" stroke="' + C.pug + '" stroke-width="5" stroke-linecap="round"/>' +
      '<circle cx="72" cy="25" r="13" fill="' + C.pug + '"/>' +
      '<path d="M64 15 q-4 8 2 12 q3 -6 2 -12 z" fill="' + C.pugDark + '"/>' +
      '<ellipse cx="81" cy="29" rx="7" ry="6" fill="' + C.pugDark + '"/>' +
      '<circle cx="75" cy="22" r="2.6" fill="#2E2229"/><circle cx="75.8" cy="21.2" r=".9" fill="#fff"/>' +
      '<path d="M80 35 q2 6 5 1 z" fill="' + C.pink + '"/>';
  }
  const trudeA = svg(90, 60, trudeBody(0));
  const trudeB = svg(90, 60, trudeBody(5));

  // ---------- Portraits für die Zielanzeige ----------
  const avMama = svg(60, 60,
    '<rect width="60" height="60" fill="#FCE3EA"/>' +
    '<path d="M12 60 Q10 22 30 16 Q50 22 48 60 Z" fill="' + C.mamaHair + '"/>' +
    face(30, 30, 14) +
    '<path d="M16 28 Q18 13 30 13 Q43 13 44 28 Q36 20 30 22 Q22 20 16 28 Z" fill="' + C.mamaHair + '"/>' +
    '<path d="M14 60 Q30 46 46 60 Z" fill="' + C.mamaDress + '"/>');
  const avPapa = svg(60, 60,
    '<rect width="60" height="60" fill="#DDEBFB"/>' + face(30, 30, 14) +
    '<path d="M16 27 Q16 13 30 13 Q44 13 44 27 Q40 19 30 20 Q20 19 16 27 Z" fill="' + C.papaHair + '"/>' +
    '<path d="M12 60 Q30 44 48 60 Z" fill="' + C.papaShirt + '"/>');
  const avRuby = svg(60, 60,
    '<rect width="60" height="60" fill="#FFF0CC"/>' +
    '<circle cx="13" cy="30" r="6" fill="' + C.rubyHair + '"/><circle cx="47" cy="30" r="6" fill="' + C.rubyHair + '"/>' +
    face(30, 32, 13) +
    '<path d="M17 30 Q18 17 30 17 Q42 17 43 30 Q38 23 30 24 Q22 23 17 30 Z" fill="' + C.rubyHair + '"/>' +
    '<path d="M16 60 Q30 48 44 60 Z" fill="' + C.rubyDress + '"/>');
  const avTrude = svg(60, 60,
    '<rect width="60" height="60" fill="#E9F6EF"/>' +
    '<ellipse cx="30" cy="33" rx="17" ry="15" fill="' + C.pug + '"/>' +
    '<path d="M13 24 Q10 34 17 36 Q19 28 19 22 Z" fill="' + C.pugDark + '"/>' +
    '<path d="M47 24 Q50 34 43 36 Q41 28 41 22 Z" fill="' + C.pugDark + '"/>' +
    '<ellipse cx="30" cy="39" rx="9" ry="7" fill="' + C.pugDark + '"/>' +
    '<circle cx="23" cy="30" r="3" fill="#2E2229"/><circle cx="37" cy="30" r="3" fill="#2E2229"/>' +
    '<circle cx="24" cy="29" r="1" fill="#fff"/><circle cx="38" cy="29" r="1" fill="#fff"/>' +
    '<ellipse cx="30" cy="36" rx="3" ry="2" fill="#2E2229"/>' +
    '<path d="M28 43 q2 5 4 0 z" fill="' + C.pink + '"/>');

  // ---------- Sammelobjekte & Hindernisse ----------
  const tomato = svg(40, 40,
    '<circle cx="20" cy="23" r="14" fill="' + C.tomato + '"/>' +
    '<ellipse cx="14" cy="18" rx="3.5" ry="5" fill="#fff" opacity=".35"/>' +
    '<path d="M20 10 l-7 -3 l4 5 l-6 1 l7 2 l2 5 l2 -5 l7 -2 l-6 -1 l4 -5 z" fill="' + C.leaf + '"/>');
  const ladybug = svg(40, 40,
    '<path d="M10 9 L14 14 M30 9 L26 14" stroke="' + C.dot + '" stroke-width="2" stroke-linecap="round"/>' +
    '<circle cx="20" cy="14" r="6" fill="' + C.dot + '"/>' +
    '<path d="M6 24 a14 13 0 0 1 28 0 a14 13 0 0 1 -28 0 Z" fill="' + C.lady + '"/>' +
    '<path d="M20 12 L20 37" stroke="' + C.dot + '" stroke-width="2"/>' +
    '<circle cx="13" cy="21" r="2.8" fill="' + C.dot + '"/><circle cx="27" cy="21" r="2.8" fill="' + C.dot + '"/>' +
    '<circle cx="12" cy="30" r="2.4" fill="' + C.dot + '"/><circle cx="28" cy="30" r="2.4" fill="' + C.dot + '"/>');
  const giraffe = svg(40, 40,
    '<rect x="12" y="30" width="4" height="8" rx="2" fill="' + C.butterDark + '"/><rect x="24" y="30" width="4" height="8" rx="2" fill="' + C.butterDark + '"/>' +
    '<ellipse cx="20" cy="28" rx="11" ry="7" fill="' + C.butter + '"/>' +
    '<path d="M25 26 L28 10" stroke="' + C.butter + '" stroke-width="6" stroke-linecap="round"/>' +
    '<ellipse cx="30" cy="9" rx="6" ry="4.5" fill="' + C.butter + '"/>' +
    '<path d="M28 4 l0 -3 M32 4 l1 -3" stroke="#B8935C" stroke-width="1.6" stroke-linecap="round"/>' +
    '<circle cx="31" cy="8" r="1.1" fill="' + C.ink + '"/>' +
    '<circle cx="16" cy="27" r="2" fill="#D9A55A"/><circle cx="22" cy="30" r="1.6" fill="#D9A55A"/>' +
    '<circle cx="26" cy="18" r="1.4" fill="#D9A55A"/><circle cx="12" cy="31" r="1.4" fill="#D9A55A"/>');

  function block(letter, color) {
    return svg(40, 40,
      '<rect x="4" y="6" width="32" height="32" rx="6" fill="' + color + '"/>' +
      '<rect x="4" y="6" width="32" height="7" rx="3.5" fill="#fff" opacity=".25"/>' +
      '<text x="20" y="31" text-anchor="middle" font-family="' + FONT + '" font-weight="700" font-size="20" fill="#fff">' + letter + '</text>');
  }
  const blocks = [block('E', C.sky), block('L', C.butter), block('L', C.mint), block('I', C.pink)];

  const rug = svg(120, 20,
    '<rect x="0" y="4" width="120" height="12" rx="6" fill="#E9A6C0"/>' +
    '<path d="M6 10 H114" stroke="#fff" stroke-width="2" stroke-dasharray="6 5" opacity=".7"/>');

  const heart = svg(20, 18, '<path d="M10 17 C-6 7 3 -4 10 4 C17 -4 26 7 10 17 Z" fill="' + C.pink + '"/>');

  // ---------- Hintergrund ----------
  const plant = svg(50, 90,
    '<path d="M25 60 Q10 40 12 20 Q22 34 25 60 Q28 30 38 14 Q42 40 25 60 Q34 44 46 40 Q40 58 25 62" fill="' + C.leaf + '"/>' +
    '<path d="M12 60 L38 60 L34 88 L16 88 Z" fill="' + C.lady + '"/>');
  const sofa = svg(220, 110,
    '<rect x="10" y="20" width="200" height="60" rx="22" fill="#C9B8E8"/>' +
    '<rect x="0" y="48" width="40" height="52" rx="16" fill="#B9A6DD"/>' +
    '<rect x="180" y="48" width="40" height="52" rx="16" fill="#B9A6DD"/>' +
    '<rect x="30" y="62" width="160" height="34" rx="12" fill="#D6C8EF"/>' +
    '<rect x="40" y="98" width="10" height="12" rx="3" fill="#9C86C4"/><rect x="170" y="98" width="10" height="12" rx="3" fill="#9C86C4"/>' +
    '<rect x="58" y="36" width="44" height="30" rx="10" fill="' + C.butter + '"/>' +
    '<rect x="118" y="36" width="44" height="30" rx="10" fill="' + C.mint + '"/>');
  const shelf = svg(120, 140,
    '<rect x="0" y="0" width="120" height="140" rx="8" fill="#F1D3B0"/>' +
    '<rect x="8" y="8" width="104" height="58" rx="4" fill="#FBE8D2"/><rect x="8" y="74" width="104" height="58" rx="4" fill="#FBE8D2"/>' +
    '<rect x="16" y="34" width="20" height="32" rx="3" fill="' + C.sky + '"/><rect x="38" y="28" width="14" height="38" rx="3" fill="' + C.pink + '"/>' +
    '<circle cx="84" cy="50" r="14" fill="' + C.butter + '"/><circle cx="80" cy="46" r="3" fill="#fff" opacity=".5"/>' +
    '<rect x="18" y="104" width="26" height="26" rx="5" fill="' + C.mint + '"/><rect x="48" y="110" width="20" height="20" rx="4" fill="' + C.lady + '"/>' +
    '<path d="M84 130 L84 100 L102 92 L102 130 Z" fill="' + C.sky + '"/>');
  const windowImg = svg(130, 150,
    '<rect x="10" y="10" width="110" height="120" rx="12" fill="#CFE5FA"/>' +
    '<circle cx="90" cy="44" r="14" fill="#FFE7A3"/>' +
    '<ellipse cx="44" cy="96" rx="30" ry="12" fill="#fff" opacity=".9"/><ellipse cx="62" cy="90" rx="22" ry="12" fill="#fff" opacity=".9"/>' +
    '<path d="M65 10 V130 M10 70 H120" stroke="#fff" stroke-width="6"/>' +
    '<rect x="10" y="10" width="110" height="120" rx="12" fill="none" stroke="#fff" stroke-width="6"/>' +
    '<path d="M0 4 Q22 70 6 142 L0 142 Z" fill="' + C.pink + '" opacity=".85"/>' +
    '<path d="M130 4 Q108 70 124 142 L130 142 Z" fill="' + C.pink + '" opacity=".85"/>' +
    '<rect x="0" y="0" width="130" height="8" rx="4" fill="#D9A0BD"/>');
  const frameSun = svg(70, 80,
    '<rect x="2" y="2" width="66" height="76" rx="6" fill="#fff"/><rect x="9" y="9" width="52" height="62" rx="3" fill="#FFF3D1"/>' +
    '<circle cx="35" cy="40" r="11" fill="' + C.butter + '"/>' +
    '<path d="M35 18 V24 M35 56 V62 M13 40 H19 M51 40 H57 M20 25 L24 29 M46 51 L50 55 M50 25 L46 29 M24 51 L20 55" stroke="' + C.butterDark + '" stroke-width="3" stroke-linecap="round"/>');
  const frameHeart = svg(70, 80,
    '<rect x="2" y="2" width="66" height="76" rx="6" fill="#fff"/><rect x="9" y="9" width="52" height="62" rx="3" fill="#FDE4EC"/>' +
    '<path d="M35 58 C12 44 22 22 35 34 C48 22 58 44 35 58 Z" fill="' + C.pink + '"/>');
  const frameOne = svg(70, 80,
    '<rect x="2" y="2" width="66" height="76" rx="6" fill="#fff"/><rect x="9" y="9" width="52" height="62" rx="3" fill="#E4F5EE"/>' +
    '<text x="35" y="57" text-anchor="middle" font-family="' + FONT + '" font-weight="700" font-size="38" fill="' + C.lady + '">1</text>');
  function balloon(color) {
    return svg(40, 80,
      '<path d="M20 46 Q16 60 22 78" fill="none" stroke="#9C8AA8" stroke-width="1.5"/>' +
      '<ellipse cx="20" cy="22" rx="16" ry="20" fill="' + color + '"/>' +
      '<path d="M17 42 l3 5 l3 -5 z" fill="' + color + '"/>' +
      '<ellipse cx="14" cy="14" rx="4" ry="6" fill="#fff" opacity=".45"/>');
  }
  const balloons = [balloon(C.pink), balloon(C.butter), balloon(C.sky), balloon(C.mint)];

  // ---------- Laden ----------
  function load(str) {
    const img = new Image();
    img.decoding = 'async';
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(str);
    return img;
  }

  const sources = {
    elliUpper, elliUpperWorried, elliFull, elliSit,
    mamaFull, papaFull, rubyFull, trudeA, trudeB,
    avMama, avPapa, avRuby, avTrude,
    tomato, ladybug, giraffe, rug, heart,
    plant, sofa, shelf, windowImg, frameSun, frameHeart, frameOne
  };

  const IMG = {};
  Object.keys(sources).forEach(function (k) { IMG[k] = load(sources[k]); });
  IMG.blocks = blocks.map(load);
  IMG.balloons = balloons.map(load);

  function ready() {
    const all = [];
    Object.keys(IMG).forEach(function (k) {
      const v = IMG[k];
      (Array.isArray(v) ? v : [v]).forEach(function (img) {
        all.push(img.complete ? Promise.resolve() : new Promise(function (res) {
          img.onload = img.onerror = function () { res(); };
        }));
      });
    });
    return Promise.all(all);
  }

  function dataUri(key) { return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(sources[key]); }

  window.ELLI_ART = { C: C, IMG: IMG, ready: ready, dataUri: dataUri };
})();
