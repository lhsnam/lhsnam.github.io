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
  o += `<rect x="${vx - 9}" y="24" width="18" height="214" fill="#8F1D2C" opacity=".18"/>`;
  const cols = ['#5b6270', '#4d5a6b', '#566170'];
  for (let row = 0; row < 18; row++) {
    let x = -r() * 80; const y = 28 + row * 11.5;
    while (x < W) {
      const len = 70 + r() * 90, x2 = Math.min(W, x + len), x0 = Math.max(0, x);
      o += `<rect x="${x0.toFixed(1)}" y="${y}" width="${Math.max(1, x2 - x0 - 3).toFixed(1)}" height="7" rx="3.5" fill="${cols[row % 3]}"/>`;
      if (r() < 0.55) { const nx = x + 10 + r() * (len - 20); if (Math.abs(nx - vx) > 14 && nx < W - 4) o += `<rect x="${nx.toFixed(1)}" y="${y}" width="4" height="7" fill="#d9a441" opacity=".85"/>`; }
      if (x < vx && x2 > vx && row % 3 !== 2) o += `<rect x="${(vx - 2).toFixed(1)}" y="${y}" width="5" height="7" fill="#ff5a6e"/>`;
      x = x2 + 4;
    }
  }
  o += `<text x="${vx + 14}" y="246" fill="#ff8a98" font-size="10" font-family="monospace">${esc(ui.legendVariant)}</text><text x="12" y="246" fill="#d9a441" font-size="10" font-family="monospace">${esc(ui.legendNoise)}</text>`;
  return `<svg viewBox="0 0 ${W} 252" role="img" aria-label="Illustration of sequencing reads with one true variant highlighted">${o}</svg>`;
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
<script src="/app.js" defer></script>
</body></html>`;
}

// ---------- pages ----------
function home(lang, notes) {
  const ui = site.ui[lang], b = base(lang);
  const work = site.work.map((w) => `<article class="card"><div class="tp">${esc(tr(w.meta, lang))}</div><h3>${esc(tr(w.title, lang))}</h3><p>${esc(tr(w.text, lang))}</p><div class="big">${w.big.map(([n, l]) => `<div><b>${esc(n)}</b>${esc(tr(l, lang))}</div>`).join('')}</div><div class="stack">${esc(w.stack)}</div></article>`).join('');
  const exp = site.experience.map((j) => `<div class="job${j.now ? ' now' : ''}"><div class="when">${esc(tr(j.when, lang))}</div><div><h4>${esc(tr(j.role, lang))}</h4><div class="org">${esc(tr(j.org, lang))}</div>${j.items.length ? `<ul>${j.items.map((it) => `<li>${esc(tr(it, lang))}</li>`).join('')}</ul>` : ''}</div></div>`).join('');
  const edu = site.education.map((e) => `<div class="e"><div class="w">${esc(tr(e.when, lang))}</div><h4>${esc(tr(e.title, lang))}</h4><p>${esc(tr(e.org, lang))}</p>${tr(e.text, lang) ? `<p>${esc(tr(e.text, lang))}</p>` : ''}</div>`).join('');
  const pubs = site.publications.map((p) => {
    const n = paperCites(p);
    const badge = n != null ? `<a class="c" href="${site.links.scholar}" rel="noopener">${esc(ui.citedBy)} ${n}</a>` : '';
    return `<div class="pub"><div class="y">${p.year}${p.status ? ` · ${esc(tr(p.status, lang))}` : ''}</div><div class="t">${esc(p.title)}</div><div class="j"><span>${esc(tr(p.venue, lang))}</span>${badge}</div></div>`;
  }).join('');
  const talks = site.talks.map((t) => `<div class="talk"><div class="d">${esc(tr(t.when, lang))}</div><div><div class="t">${esc(t.title)}</div><div class="w">${esc(tr(t.where, lang))}</div></div></div>`).join('');
  const recent = (notes[lang] || []).slice(0, 3).map((n) => noteCard(n, lang, ui)).join('');
  const notesSec = recent ? `<section class="blk" id="notes"><div class="wrap"><div class="sh"><span class="no">04</span><h2>${esc(ui.sNotes)}</h2></div><div class="notes">${recent}</div><a class="all" href="${b}/notes/">${esc(ui.allNotes)}</a></div></section>` : '';
  const groups = site.toolkit.map((g, i) => `<div class="tool"><h5>${esc(ui.toolGroups[i])}</h5><div class="chips">${g.map((c) => `<span class="chip">${esc(tr(c, lang))}</span>`).join('')}</div></div>`).join('');
  const body = `
<div class="wrap hero">
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
  return `<a class="note" href="${b}/notes/${n.slug}/"><div class="m">${esc(n.tags[0] || '')}${n.draft ? `<span class="draftb">${esc(ui.draft)}</span>` : ''}</div><h3>${esc(n.title)}</h3><p>${esc(n.summary || '')}</p><div class="r">${esc(n.date)}${n.minutes ? ` · ${esc(n.minutes)} ${esc(ui.minRead)}` : ''}</div></a>`;
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
