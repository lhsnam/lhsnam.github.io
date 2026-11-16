// Zero-dependency static site builder.  Usage: node build.mjs  ->  ./dist
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

const ROOT = dirname(new URL(import.meta.url).pathname);
const OUT = join(ROOT, 'dist');
const site = JSON.parse(readFileSync(join(ROOT, 'content/site.json'), 'utf8'));
const scholar = existsSync(join(ROOT, 'data/scholar.json')) ? JSON.parse(readFileSync(join(ROOT, 'data/scholar.json'), 'utf8')) : null;
const SHOW_DRAFTS = process.env.BUILD_DRAFTS === '1';
const LANGS = ['en', 'vi'];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const tr = (x, lang) => (x && typeof x === 'object' && !Array.isArray(x) ? x[lang] ?? x.en : x);
const base = (lang) => (lang === 'en' ? '' : '/vi');
const other = (lang) => (lang === 'en' ? 'vi' : 'en');
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const write = (path, content) => { const full = join(OUT, path); mkdirSync(dirname(full), { recursive: true }); writeFileSync(full, content); };

// ---------- markdown (small subset) ----------
function inline(s) {
  s = esc(s);
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
  return s;
}
function markdown(md) {
  const lines = md.replace(/\r/g, '').split('\n');
  const out = []; let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (/^```/.test(l)) {
      const buf = []; i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++; out.push(`<pre><code>${esc(buf.join('\n'))}</code></pre>`); continue;
    }
    const h = l.match(/^(#{2,3})\s+(.*)$/);
    if (h) { out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); i++; continue; }
    if (/^\s*[-*]\s+/.test(l)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) items.push(`<li>${inline(lines[i++].replace(/^\s*[-*]\s+/, ''))}</li>`);
      out.push(`<ul>${items.join('')}</ul>`); continue;
    }
    if (/^\s*\d+\.\s+/.test(l)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) items.push(`<li>${inline(lines[i++].replace(/^\s*\d+\.\s+/, ''))}</li>`);
      out.push(`<ol>${items.join('')}</ol>`); continue;
    }
    if (/^>\s?/.test(l)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
      out.push(`<blockquote><p>${inline(buf.join(' '))}</p></blockquote>`); continue;
    }
    if (!l.trim()) { i++; continue; }
    const buf = [];
    while (i < lines.length && lines[i].trim() && !/^(```|#{2,3}\s|\s*[-*]\s|\s*\d+\.\s|>)/.test(lines[i])) buf.push(lines[i++]);
    out.push(`<p>${inline(buf.join(' '))}</p>`);
  }
  return out.join('\n');
}
function parseNote(file) {
  const raw = readFileSync(file, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const meta = {}; if (m) for (const line of m[1].split('\n')) { const k = line.match(/^(\w+):\s*(.*)$/); if (k) meta[k[1]] = k[2].trim(); }
  return { meta, body: m ? m[2] : raw };
}
function loadNotes() {
  const dir = join(ROOT, 'content/notes'); const notes = {};
  if (!existsSync(dir)) return notes;
  for (const f of readdirSync(dir)) {
    const m = f.match(/^(.+)\.(en|vi)\.md$/); if (!m) continue;
    const { meta, body } = parseNote(join(dir, f));
    if (meta.draft === 'true' && !SHOW_DRAFTS) continue;
    const [, slug, lang] = m;
    (notes[lang] ||= []).push({ slug, lang, ...meta, tags: (meta.tags || '').split(',').map((t) => t.trim()).filter(Boolean), html: markdown(body), draft: meta.draft === 'true' });
  }
  for (const l of LANGS) (notes[l] ||= []).sort((a, b) => (a.date < b.date ? 1 : -1));
  return notes;
}

// ---------- fragments ----------
const AVATAR = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 84 84" role="img" aria-label="Cartoon avatar"><clipPath id="av${size}"><circle cx="42" cy="42" r="42"/></clipPath><g clip-path="url(#av${size})"><path d="M8 90c2-20 16-28 34-28s32 8 34 28z" fill="#F4F1EA"/><path d="M34 62l8 14 8-14z" fill="#8F1D2C"/><path d="M42 62v28" stroke="#d9d3c7" stroke-width="1.5"/><rect x="36" y="50" width="12" height="14" rx="4" fill="#E8B88F"/><ellipse cx="42" cy="37" rx="17" ry="19" fill="#F1C79F"/><path d="M24 34c0-14 8-20 19-20 12 0 18 7 17 20-3-7-8-10-17-10s-15 3-19 10z" fill="#1B1A1A"/><g fill="none" stroke="#1B1A1A" stroke-width="2"><circle cx="35" cy="38" r="5.5"/><circle cx="49" cy="38" r="5.5"/><path d="M40.5 38h3"/></g><circle cx="35" cy="38" r="1.8" fill="#1B1A1A"/><circle cx="49" cy="38" r="1.8" fill="#1B1A1A"/><path d="M36 48c3 3 9 3 12 0" stroke="#7a3b2e" stroke-width="2" fill="none" stroke-linecap="round"/></g></svg>`;

function readsSvg(ui) {
  let s = 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const W = 516, vx = W * 0.54; let o = '';
  for (let i = 0; i <= 8; i++) { const x = i * W / 8; o += `<line x1="${x}" y1="14" x2="${x}" y2="20" stroke="#3a3d46"/><text x="${x + 3}" y="12" fill="#6d727e" font-size="9" font-family="monospace">${1200 + i * 40}</text>`; }
  o += `<rect class="vb" x="${vx - 9}" y="24" width="18" height="214" fill="#8F1D2C"/>`;
  const cols = ['#5b6270', '#4d5a6b', '#566170'];
  for (let row = 0; row < 18; row++) {
    let x = -r() * 80; const y = 28 + row * 11.5;
    while (x < W) {
      const len = 70 + r() * 90, x2 = Math.min(W, x + len), x0 = Math.max(0, x);
      o += `<rect class="rd r${row % 2}" x="${x0.toFixed(1)}" y="${y}" width="${Math.max(1, x2 - x0 - 3).toFixed(1)}" height="7" rx="3.5" fill="${cols[row % 3]}"/>`;
      if (r() < 0.55) { const nx = x + 10 + r() * (len - 20); if (Math.abs(nx - vx) > 14 && nx < W - 4) o += `<rect class="nz r${row % 2}" x="${nx.toFixed(1)}" y="${y}" width="4" height="7" fill="#d9a441"/>`; }
      if (x < vx && x2 > vx && row % 3 !== 2) o += `<rect class="vr" x="${(vx - 2).toFixed(1)}" y="${y}" width="5" height="7" fill="#ff5a6e"/>`;
      x = x2 + 4;
    }
  }
  o += `<text x="${vx + 14}" y="246" fill="#ff8a98" font-size="10" font-family="monospace">${esc(ui.legendVariant)}</text><text class="nzl" x="12" y="246" fill="#d9a441" font-size="10" font-family="monospace">${esc(ui.legendNoise)}</text>`;
  return `<svg viewBox="0 0 ${W} 252" role="img" aria-label="Illustration of sequencing reads with one true variant highlighted">${o}</svg>`;
}


// Abstract, hand-drawn style figures for the work cards. Illustrative only, no real data.
function figSvg(kind, ui) {
  const T = (x, y, t, st = '') => `<text x="${x}" y="${y}" font-size="9" style="fill:var(--mut);${st}">${esc(t)}</text>`;
  let s = 11; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  let o = '';
  if (kind === 'pipeline') {
    const names = ['align', 'call', 'filter', 'report'];
    names.forEach((n, i) => { const x = 6 + i * 74; const hot = i === 3; o += `<g class="px" style="--i:${i}"><rect x="${x}" y="8" width="52" height="26" rx="6" fill="none" style="stroke:var(${hot ? '--red' : '--ink'})" stroke-width="1.3"/><text x="${x + 26}" y="25" text-anchor="middle" font-size="9.5" style="fill:var(${hot ? '--red' : '--ink'})">${n}</text></g>`; if (i < 3) o += `<path class="pl" pathLength="1" d="M${x + 52} 21H${x + 74}" fill="none" style="stroke:var(--mut);--i:${i}" stroke-width="1.2"/>`; });
    o += T(6, 70, ui.figBefore) + `<rect x="6" y="76" width="288" height="8" rx="4" style="fill:var(--line)"/>`;
    o += T(6, 108, ui.figAfter) + `<rect class="pb" x="6" y="114" width="144" height="8" rx="4" style="fill:var(--red)"/>` + `<text class="pt" x="158" y="122" font-size="9.5" style="fill:var(--red)">${esc(ui.figHalf)}</text>`;
  } else if (kind === 'scatter') {
    o += `<path d="M10 140H292M10 140V6" fill="none" style="stroke:var(--line)"/>`;
    o += `<path class="pf" d="M56 140C118 136 170 100 250 18" fill="none" style="stroke:var(--teal)" stroke-width="1.2" stroke-dasharray="4 4"/>`;
    for (let i = 0; i < 40; i++) { const x = 22 + r() * 150, y = 82 + r() * 52, dx = (r() - .5) * 90, dy = (r() - 1) * 60; o += `<circle class="dt" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.3" style="fill:#d9a441;--dx:${dx.toFixed(0)}px;--dy:${dy.toFixed(0)}px"/>`; }
    for (let i = 0; i < 8; i++) { const x = 176 + r() * 100, y = 16 + r() * 64, dx = -(40 + r() * 80), dy = 50 + r() * 50; o += `<circle class="dt v" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.3" style="--dx:${dx.toFixed(0)}px;--dy:${dy.toFixed(0)}px"/>`; }
    o += T(14, 152, ui.figNoise) + T(216, 98, ui.figVariant, 'fill:var(--red)') + T(196, 12, ui.figThreshold, 'fill:var(--teal)');
  } else {
    const cols = ['--teal', '--teal', '--teal', '--red'], ops = [1, .6, .35, .9];
    for (let i = 0; i < 9; i++) { let y = 134; const x = 10 + i * 31; [34 + r() * 26, 24 + r() * 20, 14 + r() * 14, 7 + r() * 9].forEach((h, k) => { y -= h; o += `<rect class="sg" x="${x}" y="${y.toFixed(1)}" width="21" height="${h.toFixed(1)}" style="fill:var(${cols[k]});opacity:${i === 5 ? 1 : ops[k] * .75};--i:${i}"/>`; }); }
    o += `<g class="mk"><path d="M178 34V12" style="stroke:var(--red)" stroke-width="1.2"/><circle cx="178" cy="10" r="3" style="fill:var(--red)"/>${T(170, 13, ui.figSample, 'fill:var(--red);text-anchor:end')}</g>`;
    o += `<path d="M6 134H294" style="stroke:var(--line)"/>` + T(8, 148, ui.figTaxa);
  }
  return `<svg class="fig" viewBox="0 0 300 156" aria-hidden="true">${o}</svg>`;
}

function citeTip(lang, ui) {
  if (!scholar) return '';
  const st = scholar.stats, years = Object.entries(scholar.years || {}).sort();
  const max = Math.max(1, ...years.map(([, v]) => v));
  const bw = 30, gap = 20, H = 70;
  const bars = years.map(([y, v], i) => { const h = Math.max(1.5, (v / max) * H); const x = 12 + i * (bw + gap); return `<rect x="${x}" y="${H + 4 - h}" width="${bw}" height="${h.toFixed(1)}" fill="#8F1D2C" opacity=".85"><title>${y}: ${v}</title></rect><text x="${x + bw / 2}" y="${H + 18}" fill="currentColor" opacity=".6" font-size="9" font-family="monospace" text-anchor="middle">${y}</text>`; }).join('');
  const row = (label, o) => `<tr><td>${label}</td><td class="v">${o.all}</td><td class="v">${o.since2021}</td></tr>`;
  const w = 12 * 2 + years.length * bw + (years.length - 1) * gap;
  return `<span class="cite"><button class="i" type="button" aria-label="${esc(ui.metricsLabel)}" aria-describedby="cite-tip">i</button><div class="tip" role="tooltip" id="cite-tip"><h6>${esc(ui.citedBy)} <span class="mono">Google Scholar</span></h6><table><tr><th></th><th>${esc(ui.citedAll)}</th><th>${esc(ui.citedSince)}</th></tr>${row(esc(ui.citations), st.citations)}${row('h-index', st.h)}${row('i10-index', st.i10)}</table><svg viewBox="0 0 ${w} ${H + 24}" role="img" aria-label="${esc(ui.citations)} per year">${bars}</svg><div class="foot mono"><span>${esc(ui.updated)} ${esc(scholar.updated)}</span><a href="${site.links.scholar}" rel="noopener">${esc(ui.viewProfile)}</a></div></div></span>`;
}

function paperCites(pub) {
  if (!scholar || !scholar.papers) return null;
  for (const [title, n] of Object.entries(scholar.papers)) if (norm(title).includes(pub.match)) return n;
  return null;
}

function layout({ lang, title, desc, body, path, altPath, isHome, ui }) {
  const canon = site.url + path;
  const alts = LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${site.url}${l === lang ? path : altPath}">`).join('');
  const redirect = isHome && lang === 'en' ? `<script>try{if(localStorage.getItem('lang')==='vi'&&!document.referrer.startsWith(location.origin))location.replace('/vi/')}catch(e){}</script>` : '';
  const jsonld = isHome ? `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'Person', name: site.name, url: site.url, jobTitle: 'Senior Bioinformatician', address: { '@type': 'PostalAddress', addressLocality: 'Ho Chi Minh City', addressCountry: 'VN' }, sameAs: [site.links.github, site.links.linkedin, site.links.scholar], alumniOf: 'International University, Vietnam National University Ho Chi Minh City', worksFor: { '@type': 'Organization', name: 'Gene Solutions' } })}</script>` : '';
  const b = base(lang);
  return `<!DOCTYPE html>
<html lang="${lang}" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canon}">${alts}
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="website"><meta property="og:url" content="${canon}">
<meta name="theme-color" content="#FAF7F2">
<link rel="alternate" type="application/rss+xml" title="Notes (${lang})" href="${b}/feed.xml">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&family=Lora:ital,wght@0,500;0,700;1,500;1,700&display=swap" rel="stylesheet">
<script>try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('fx')}catch(e){}</script>
<script>try{var t=localStorage.getItem('theme');if(!t)t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t}catch(e){}</script>${redirect}
<link rel="stylesheet" href="/style.css">${jsonld}
</head>
<body>
<a class="skip" href="#main">${esc(ui.skip)}</a>
<header class="nav"><div class="wrap">
  <a class="logo" href="${b}/">${AVATAR(34)}<b>Le Hong Son Nam<span>.</span></b></a>
  <nav aria-label="Main"><ul>
    <li><a href="${b}/#work">${esc(ui.nav.work)}</a></li><li><a href="${b}/#experience">${esc(ui.nav.experience)}</a></li><li><a href="${b}/#research">${esc(ui.nav.research)}</a></li><li><a href="${b}/notes/">${esc(ui.nav.notes)}</a></li><li><a href="#contact">${esc(ui.nav.contact)}</a></li>
  </ul></nav>
  <div class="right"><button class="theme" id="theme-toggle" type="button" aria-label="${esc(ui.toggleTheme)}">☾</button>
  <div class="lang" aria-label="Language">${LANGS.map((l) => (l === lang ? `<b aria-current="true">${l.toUpperCase()}</b>` : `<a href="${altPath}" hreflang="${l}" lang="${l}">${l.toUpperCase()}</a>`)).join('')}</div></div>
</div></header>
<main id="main">
${body}
</main>
<footer id="contact"><div class="wrap">
  <div class="row"><h2>${ui.contactH}</h2>
  <div class="links"><a href="#" data-u="${site.links.emailUser}" data-d="${site.links.emailDomain}" rel="noopener">${esc(ui.email)}</a><a href="${site.links.scholar}" rel="noopener">Google Scholar</a><a href="${site.links.linkedin}" rel="noopener">LinkedIn</a><a href="${site.links.github}" rel="noopener">GitHub</a></div></div>
  <div class="cp"><span>${esc(ui.rights)}</span><span>${esc(ui.location)}</span></div>
</div></footer>
<div id="dna" aria-hidden="true" data-top="${esc(site.name)}"><div class="nm"></div><svg></svg></div>
<script src="/app.js" defer></script>
</body></html>`;
}

// ---------- pages ----------
function home(lang, notes) {
  const ui = site.ui[lang], b = base(lang);
  const work = site.work.map((w, i) => `<article class="card rv" style="--i:${i}"><div class="tp">${esc(tr(w.meta, lang))}</div><h3>${esc(tr(w.title, lang))}</h3><p>${esc(tr(w.text, lang))}</p>${w.fig ? figSvg(w.fig, ui) : ''}<div class="big">${w.big.map(([n, l]) => `<div><b>${esc(n)}</b>${esc(tr(l, lang))}</div>`).join('')}</div><div class="stack">${esc(w.stack)}</div></article>`).join('');
  const exp = site.experience.map((j) => `<div class="job${j.now ? ' now' : ''}"><div class="when">${esc(tr(j.when, lang))}</div><div><h4>${esc(tr(j.role, lang))}</h4><div class="org">${esc(tr(j.org, lang))}</div>${j.items.length ? `<ul>${j.items.map((it) => `<li>${esc(tr(it, lang))}</li>`).join('')}</ul>` : ''}</div></div>`).join('');
  const edu = site.education.map((e) => `<div class="e rv"><div class="w">${esc(tr(e.when, lang))}</div><h4>${esc(tr(e.title, lang))}</h4><p>${esc(tr(e.org, lang))}</p>${tr(e.text, lang) ? `<p>${esc(tr(e.text, lang))}</p>` : ''}</div>`).join('');
  const pubs = site.publications.map((p) => {
    const n = paperCites(p);
    const badge = n != null ? `<a class="c" href="${site.links.scholar}" rel="noopener">${esc(ui.citedBy)} ${n}</a>` : '';
    return `<div class="pub rv"><div class="y">${p.year}${p.status ? ` · ${esc(tr(p.status, lang))}` : ''}</div><div class="t">${p.url ? `<a href="${esc(p.url)}" rel="noopener">${esc(p.title)}</a>` : esc(p.title)}</div><div class="j"><span>${esc(tr(p.venue, lang))}</span>${badge}</div></div>`;
  }).join('');
  const talks = site.talks.map((t) => `<div class="talk rv"><div class="d">${esc(tr(t.when, lang))}</div><div><div class="t">${esc(t.title)}</div><div class="w">${esc(tr(t.where, lang))}</div></div></div>`).join('');
  const recent = (notes[lang] || []).slice(0, 3).map((n) => noteCard(n, lang, ui)).join('');
  const notesSec = recent ? `<section class="blk" id="notes"><div class="wrap"><div class="sh"><span class="no">04</span><h2>${esc(ui.sNotes)}</h2></div><div class="notes">${recent}</div><a class="all" href="${b}/notes/">${esc(ui.allNotes)}</a></div></section>` : '';
  const groups = site.toolkit.map((g, i) => `<div class="tool rv"><h5>${esc(ui.toolGroups[i])}</h5><div class="chips">${g.map((c) => `<span class="chip">${esc(tr(c, lang))}</span>`).join('')}</div></div>`).join('');
  const body = `
<div class="wrap hero" id="hero">
  <div>
    <div class="who">${AVATAR(84)}<div class="kicker">${esc(ui.kicker)}</div></div>
    <h1>${ui.h1}</h1>
    <p class="sub">${esc(ui.sub)}</p>
    <div class="cta"><a class="btn p" href="#work">${esc(ui.ctaWork)}</a><a class="btn" href="/CV.pdf">${esc(ui.ctaCv)}</a><a class="btn" href="${site.links.scholar}" rel="noopener">${esc(ui.ctaScholar)}</a></div>
    <div class="tags">${ui.tags.map(([t, k]) => `<span class="tag${k === 't' ? ' t' : ''}">${esc(t)}</span>`).join('')}</div>
  </div>
  <div class="track"><div class="hd mono"><div class="dots"><i></i><i></i><i></i></div><span>${esc(ui.trackTitle)}</span></div>${readsSvg(ui)}<div class="ft mono"><span>${ui.trackLeft}</span><span>${esc(ui.trackRight)}</span></div></div>
</div>
<section class="blk" id="work"><div class="wrap"><div class="sh"><span class="no">01</span><h2>${esc(ui.sWork)}</h2></div><div class="cards">${work}</div></div></section>
<section class="blk" id="experience"><div class="wrap"><div class="sh"><span class="no">02</span><h2>${esc(ui.sExp)}</h2></div><div class="tl">${exp}</div><div class="sh" style="margin-top:56px"><h2 style="font-size:24px">${esc(ui.education)}</h2></div><div class="edu">${edu}</div></div></section>
<section class="blk" id="research"><div class="wrap"><div class="sh"><span class="no">03</span><h2>${esc(ui.sRes)}</h2>${citeTip(lang, ui)}</div><div class="two"><div class="col"><h3>${esc(ui.pubs)}</h3>${pubs}</div><div class="col"><h3>${esc(ui.talks)}</h3>${talks}</div></div></div></section>
${notesSec}
<section class="blk" id="toolkit"><div class="wrap"><div class="sh"><span class="no">05</span><h2>${esc(ui.sTool)}</h2></div><div class="tools">${groups}</div><p class="langline">${esc(ui.langLine)}</p></div></section>`;
  return layout({ lang, title: `${site.name} · ${ui.kicker.split(' · ')[0]}`, desc: ui.homeDesc, body, path: `${b}/`, altPath: `${base(other(lang))}/`, isHome: true, ui });
}

function noteCard(n, lang, ui) {
  const b = base(lang);
  return `<a class="note rv" href="${b}/notes/${n.slug}/"><div class="m">${esc(n.tags[0] || '')}${n.draft ? `<span class="draftb">${esc(ui.draft)}</span>` : ''}</div><h3>${esc(n.title)}</h3><p>${esc(n.summary || '')}</p><div class="r">${esc(n.date)}${n.minutes ? ` · ${esc(n.minutes)} ${esc(ui.minRead)}` : ''}</div></a>`;
}

function notesIndex(lang, notes) {
  const ui = site.ui[lang], b = base(lang), list = notes[lang] || [];
  const body = `<div class="wrap page"><div class="kicker">${esc(ui.sNotes)}</div><h1 style="margin-top:10px">${esc(ui.sNotes)}</h1><p class="sub">${esc(ui.notesIntro)}</p><div class="list" style="margin-top:40px">${list.length ? list.map((n) => noteCard(n, lang, ui)).join('') : `<p>${esc(ui.noNotes)}</p>`}</div></div>`;
  return layout({ lang, title: `${ui.sNotes} · ${site.name}`, desc: ui.notesDesc, body, path: `${b}/notes/`, altPath: `${base(other(lang))}/notes/`, ui });
}

function notePage(n, lang, notes) {
  const ui = site.ui[lang], b = base(lang);
  const hasAlt = (notes[other(lang)] || []).some((x) => x.slug === n.slug);
  const body = `<article class="wrap page"><a class="back" href="${b}/notes/">${esc(ui.backNotes)}</a><h1>${esc(n.title)}${n.draft ? `<span class="draftb">${esc(ui.draft)}</span>` : ''}</h1><div class="meta"><span>${esc(n.date)}</span>${n.minutes ? `<span>${esc(n.minutes)} ${esc(ui.minRead)}</span>` : ''}${n.tags.map((t) => `<span>#${esc(t)}</span>`).join('')}</div><div class="prose">${n.html}</div></article>`;
  return layout({ lang, title: `${n.title} · ${site.name}`, desc: n.summary || ui.notesDesc, body, path: `${b}/notes/${n.slug}/`, altPath: hasAlt ? `${base(other(lang))}/notes/${n.slug}/` : `${base(other(lang))}/notes/`, ui });
}

function feed(lang, notes) {
  const b = base(lang), ui = site.ui[lang];
  const items = (notes[lang] || []).map((n) => `<item><title>${esc(n.title)}</title><link>${site.url}${b}/notes/${n.slug}/</link><guid>${site.url}${b}/notes/${n.slug}/</guid><pubDate>${new Date(n.date).toUTCString()}</pubDate><description>${esc(n.summary || '')}</description></item>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${esc(site.name)} · ${esc(ui.sNotes)}</title><link>${site.url}${b}/notes/</link><description>${esc(ui.notesDesc)}</description><language>${lang}</language>${items}</channel></rss>`;
}

// ---------- build ----------
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync(join(ROOT, 'src/style.css'), join(OUT, 'style.css'));
cpSync(join(ROOT, 'src/app.js'), join(OUT, 'app.js'));
if (existsSync(join(ROOT, 'public'))) cpSync(join(ROOT, 'public'), OUT, { recursive: true });

const notes = loadNotes();
const urls = [];
for (const lang of LANGS) {
  const b = base(lang);
  write(`${b}/index.html`, home(lang, notes)); urls.push(`${b}/`);
  write(`${b}/notes/index.html`, notesIndex(lang, notes)); urls.push(`${b}/notes/`);
  for (const n of notes[lang]) { write(`${b}/notes/${n.slug}/index.html`, notePage(n, lang, notes)); urls.push(`${b}/notes/${n.slug}/`); }
  write(`${b}/feed.xml`, feed(lang, notes));
}
write('404.html', layout({ lang: 'en', title: 'Not found · Le Hong Son Nam', desc: 'Page not found', body: `<div class="wrap page"><h1>404</h1><p class="sub">This page does not exist.</p><p style="margin-top:24px"><a class="all" href="/">← Home</a></p></div>`, path: '/404.html', altPath: '/vi/', ui: site.ui.en }));
write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>${site.url}${u}</loc></url>`).join('')}</urlset>`);
console.log(`Built ${urls.length} pages -> dist/`);
