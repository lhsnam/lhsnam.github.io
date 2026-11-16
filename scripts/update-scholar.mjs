// Fetches citation metrics from the public Google Scholar profile and writes data/scholar.json.
// Never fails the build: if Scholar blocks the request or the page layout changes, the previous file is kept.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const USER = process.env.SCHOLAR_USER || 'j6MKfFMAAAAJ';
const FILE = join(dirname(fileURLToPath(import.meta.url)), '../data/scholar.json');

const decode = (s) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').trim();

export function parse(html) {
  const std = [...html.matchAll(/<td class="gsc_rsb_std">(\d+)<\/td>/g)].map((m) => +m[1]);
  if (std.length < 6) return null;
  const yearsT = [...html.matchAll(/<span class="gsc_g_t"[^>]*>(\d{4})<\/span>/g)].map((m) => m[1]);
  const counts = [...html.matchAll(/<span class="gsc_g_al">(\d+)<\/span>/g)].map((m) => +m[1]);
  const years = {}; yearsT.forEach((y, i) => { if (counts[i] != null) years[y] = counts[i]; });
  const papers = {};
  for (const row of html.split('<tr class="gsc_a_tr">').slice(1)) {
    const t = row.match(/class="gsc_a_at"[^>]*>([\s\S]*?)<\/a>/);
    const c = row.match(/class="gsc_a_ac[^"]*"[^>]*>(\d*)<\/a>/);
    if (t) papers[decode(t[1])] = c && c[1] ? +c[1] : 0;
  }
  return {
    updated: new Date().toISOString().slice(0, 10), source: 'google-scholar',
    stats: { citations: { all: std[0], since2021: std[1] }, h: { all: std[2], since2021: std[3] }, i10: { all: std[4], since2021: std[5] } },
    years, papers,
  };
}

async function main() {
  const url = `https://scholar.google.com/citations?user=${USER}&hl=en&cstart=0&pagesize=100`;
  try {
    const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36', 'accept-language': 'en-US,en;q=0.9' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = parse(await res.text());
    if (!data) throw new Error('could not parse profile (blocked or layout changed)');
    writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n');
    console.log(`Scholar updated: ${data.stats.citations.all} citations, ${Object.keys(data.papers).length} papers`);
  } catch (e) {
    console.warn(`::warning::Scholar update skipped, keeping previous data (${e.message})`);
  }
}
if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
