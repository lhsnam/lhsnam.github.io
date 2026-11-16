// Inline SVG figures for the data-visualisation note. Each figure is a before/after pair.
// Text is localised via L[lang]. Data are illustrative.
const e = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const INK = 'var(--ink)', MUT = 'var(--mut)', LINE = 'var(--line)', HI = 'var(--red)';
const T = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.size || 11}" font-weight="${o.w || 400}" fill="${o.fill || MUT}" text-anchor="${o.a || 'start'}"${o.style ? ` style="${o.style}"` : ''}>${e(s)}</text>`;
const lum = (h) => { const n = parseInt(h.slice(1), 16); return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255); };
const grey = (h) => { const v = Math.round(lum(h)).toString(16).padStart(2, '0'); return `#${v}${v}${v}`; };
const mix = (a, b, t) => { const p = (h) => [h.slice(1, 3), h.slice(3, 5), h.slice(5, 7)].map((x) => parseInt(x, 16)); const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };

const L = {
  en: {
    before: 'Before', after: 'After',
    f1: { t1: ['Abundance of Prevotella', 'over eight weeks'], t2: ['Prevotella tripled once the', 'antibiotic course ended'], cap: 'Same data, different headline. A topic title says what the chart is about; a message title tells readers what to look for.' },
    f2: { t: ['Top genera, share of reads (%)'], t2: ['Bacteroides leads the community'], names: ['Bacteroides', 'Prevotella', 'Faecalibacterium', 'Blautia', 'Akkermansia', 'Escherichia'], cap: 'Six colours for six bars carry no information. Grey for the context and one accent for the point makes the answer visible at a glance.' },
    f3: { s: ['Gut', 'Oral', 'Skin', 'Nasal'], t: 'Shannon diversity by body site', cap: 'A legend forces the eye to travel back and forth. Labels at the end of each line remove the lookup, and the accent shows which line matters.' },
    f4: { t: 'Prevotella abundance', a1: 'Antibiotic course', a2: 'Rises from week 4', cap: 'Annotations answer the "why" that the data alone cannot. Two text levels, bold for the point and grey for the detail, are enough.' },
    f5: { low: 'low', high: 'high', rb: 'Rainbow scale', sh: 'One hue, light to dark', g: 'same scales in greyscale', cap: 'If the greyscale version loses the order, readers lose it too. Let lightness carry low to high.' },
    f6: { a: 'Red and green', b: 'Blue and orange', gr: 'in greyscale', cap: 'Pairs that look different in colour can collapse into the same grey, which is close to what many colourblind readers see. Differ in lightness, not only in hue.' },
    f7: { h: 'Sample', h2: 'Reads (M)', cap: 'Tabular figures give every digit the same width, so numbers line up in a column and are easy to compare. Proportional digits drift.' },
  },
  vi: {
    before: 'Trước', after: 'Sau',
    f1: { t1: ['Độ phong phú của Prevotella', 'trong tám tuần'], t2: ['Prevotella tăng gấp ba sau', 'khi kết thúc đợt kháng sinh'], cap: 'Cùng dữ liệu, khác tiêu đề. Tiêu đề chủ đề cho biết biểu đồ nói về cái gì; tiêu đề thông điệp cho người đọc biết cần nhìn vào đâu.' },
    f2: { t: ['Các chi hàng đầu, tỷ lệ reads (%)'], t2: ['Bacteroides chiếm ưu thế'], names: ['Bacteroides', 'Prevotella', 'Faecalibacterium', 'Blautia', 'Akkermansia', 'Escherichia'], cap: 'Sáu màu cho sáu cột không mang thêm thông tin. Dùng xám cho bối cảnh và một màu nhấn cho ý chính giúp thấy câu trả lời ngay.' },
    f3: { s: ['Ruột', 'Miệng', 'Da', 'Mũi'], t: 'Đa dạng Shannon theo vị trí cơ thể', cap: 'Chú giải buộc mắt phải đi đi lại lại. Nhãn ở cuối mỗi đường bỏ bước tra cứu, còn màu nhấn chỉ ra đường nào quan trọng.' },
    f4: { t: 'Độ phong phú của Prevotella', a1: 'Đợt kháng sinh', a2: 'Tăng từ tuần 4', cap: 'Chú thích trả lời câu "tại sao" mà dữ liệu một mình không nói được. Hai cấp chữ, đậm cho ý chính và xám cho chi tiết, là đủ.' },
    f5: { low: 'thấp', high: 'cao', rb: 'Thang cầu vồng', sh: 'Một màu, nhạt đến đậm', g: 'cùng thang ở dạng thang xám', cap: 'Nếu bản thang xám làm mất thứ tự thì người đọc cũng mất thứ tự. Hãy để độ sáng thể hiện thấp đến cao.' },
    f6: { a: 'Đỏ và xanh lá', b: 'Xanh dương và cam', gr: 'ở dạng thang xám', cap: 'Hai màu khác nhau có thể thành cùng một mức xám, gần với những gì nhiều người mù màu nhìn thấy. Hãy khác nhau về độ sáng, không chỉ về sắc.' },
    f7: { h: 'Mẫu', h2: 'Reads (M)', cap: 'Chữ số đồng độ rộng giúp các số thẳng cột và dễ so sánh. Chữ số tỷ lệ thì bị lệch.' },
  },
};

const panel = (label, kind, svg) => `<div class="dvp1"><span class="dvt ${kind}">${e(label)}</span><svg viewBox="0 0 300 200" role="presentation" aria-hidden="true">${svg}</svg></div>`;
const fig = (u, ps, cap) => `<figure class="dv"><div class="dvp">${ps.join('')}</div><figcaption>${e(cap)}</figcaption></figure>`;
const pts = (a, X, Y) => a.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join('');

function f1(l, u) {
  const d = [10, 11, 10, 12, 11, 24, 31, 33, 34], X = (i) => 28 + i * 31, Y = (v) => 170 - v * 3.2;
  const base = (title) => `${title.map((s, i) => T(14, 26 + i * 15, s, { size: 12.5, w: 600, fill: INK })).join('')}
    <path d="M28 170H276" stroke="${LINE}"/><path d="M28 106H276" stroke="${LINE}" stroke-dasharray="2 3"/>`;
  return fig(u, [
    panel(u.before, 'bad', `${base(l.t1)}<path d="${pts(d, X, Y)}" fill="none" stroke="${INK}" stroke-width="2"/>`),
    panel(u.after, 'good', `${base(l.t2)}<path d="${pts(d, X, Y)}" fill="none" stroke="${MUT}" stroke-width="2" opacity=".5"/><path d="${pts(d.slice(4), (i) => X(i + 4), Y)}" fill="none" stroke="${HI}" stroke-width="2.6"/><circle cx="${X(8)}" cy="${Y(34)}" r="3.6" fill="${HI}"/>`),
  ], l.cap);
}

function f2(l, u) {
  const v = [38, 31, 27, 22, 15, 9], rb = ['#e6194b', '#f58231', '#d4b800', '#3cb44b', '#4363d8', '#911eb4'];
  const bars = (colors, title, vals) => `${title.map((s, i) => T(10, 24 + i * 15, s, { size: 12, w: 600, fill: INK })).join('')}` + v.map((x, i) => {
    const y = 52 + i * 23;
    return `${T(98, y + 12, l.names[i], { size: 10.5, a: 'end', fill: i === 0 && vals ? INK : MUT, w: i === 0 && vals ? 600 : 400 })}<rect x="104" y="${y}" width="${x * 4.2}" height="16" rx="2" fill="${colors[i]}"/>${T(108 + x * 4.2, y + 12, x, { size: 10.5, fill: i === 0 && vals ? HI : MUT, w: i === 0 && vals ? 700 : 400 })}`;
  }).join('');
  const greys = v.map((_, i) => (i === 0 ? HI : 'var(--mut)'));
  const after = bars(greys, l.t2, true).replace(/<rect x="104"([^>]*?)fill="var\(--mut\)"/g, '<rect x="104"$1fill="var(--mut)" opacity=".4"');
  return fig(u, [panel(u.before, 'bad', bars(rb, l.t, false)), panel(u.after, 'good', after)], l.cap);
}

function f3(l, u) {
  const S = [[3.2, 3.4, 3.3, 3.9, 4.3, 4.6], [3.0, 3.1, 3.0, 3.1, 3.0, 3.1], [2.4, 2.5, 2.3, 2.4, 2.5, 2.4], [1.6, 1.7, 1.5, 1.7, 1.6, 1.7]];
  const col = ['#4363d8', '#f58231', '#3cb44b', '#911eb4'], Y = (v) => 176 - (v - 1) * 25;
  const Xb = (i) => 18 + i * 53, Xa = (i) => 14 + i * 42;
  const before = `${T(14, 20, l.t, { size: 12, w: 600, fill: INK })}` + l.s.map((n, i) => `<rect x="${14 + i * 70}" y="32" width="9" height="9" fill="${col[i]}"/>${T(27 + i * 70, 40, n, { size: 10.5 })}`).join('') +
    `<path d="M18 176H284" stroke="${LINE}"/>` + S.map((s, i) => `<path d="${pts(s, Xb, Y)}" fill="none" stroke="${col[i]}" stroke-width="2"/>`).join('');
  const after = `${T(14, 20, l.t, { size: 12, w: 600, fill: INK })}<path d="M14 176H224" stroke="${LINE}"/>` +
    S.map((s, i) => `<path d="${pts(s, Xa, Y)}" fill="none" stroke="${i === 0 ? HI : MUT}" stroke-width="${i === 0 ? 2.8 : 2}" opacity="${i === 0 ? 1 : 0.45}"/>${T(230, Y(s[5]) + 4, l.s[i], { size: 11, fill: i === 0 ? HI : MUT, w: i === 0 ? 700 : 400 })}`).join('');
  return fig(u, [panel(u.before, 'bad', before), panel(u.after, 'good', after)], l.cap);
}

function f4(l, u) {
  const d = [10, 11, 10, 12, 11, 24, 31, 33, 34], X = (i) => 28 + i * 31, Y = (v) => 175 - v * 3.2;
  const base = `${T(14, 24, l.t, { size: 12, w: 600, fill: INK })}<path d="M28 175H276" stroke="${LINE}"/><path d="${pts(d, X, Y)}" fill="none" stroke="${INK}" stroke-width="2"/>`;
  const note = `<rect x="${X(0)}" y="52" width="${X(4) - X(0)}" height="123" fill="${MUT}" opacity=".12"/>${T(X(0) + 6, 72, l.a1, { size: 11, w: 700, fill: INK })}${T(X(0) + 6, 88, l.a2, { size: 10.5, fill: MUT })}`;
  return fig(u, [panel(u.before, 'bad', base), panel(u.after, 'good', base + note)], l.cap);
}

function f5(l, u) {
  const rb = ['#3b0f70', '#2b4cc8', '#1fb2e3', '#27d17f', '#f3e51c', '#f58a1f', '#d7191c'];
  const one = Array.from({ length: 7 }, (_, i) => mix('#e6f2f1', '#0e3a38', i / 6));
  const strip = (cols, title) => `${T(14, 24, title, { size: 12, w: 600, fill: INK })}` + cols.map((c, i) => `<rect x="${14 + i * 38}" y="46" width="38" height="34" fill="${c}"/>`).join('') +
    T(14, 98, l.low, { size: 10.5 }) + T(280, 98, l.high, { size: 10.5, a: 'end' }) +
    T(14, 126, l.g, { size: 10.5 }) + cols.map((c, i) => `<rect x="${14 + i * 38}" y="136" width="38" height="34" fill="${grey(c)}"/>`).join('');
  return fig(u, [panel(u.before, 'bad', strip(rb, l.rb)), panel(u.after, 'good', strip(one, l.sh))], l.cap);
}

function f6(l, u) {
  const pair = (c1, c2, title) => `${T(14, 24, title, { size: 12, w: 600, fill: INK })}<rect x="14" y="46" width="128" height="52" rx="4" fill="${c1}"/><rect x="158" y="46" width="128" height="52" rx="4" fill="${c2}"/>` +
    T(14, 126, l.gr, { size: 10.5 }) + `<rect x="14" y="136" width="128" height="34" rx="4" fill="${grey(c1)}"/><rect x="158" y="136" width="128" height="34" rx="4" fill="${grey(c2)}"/>`;
  return fig(u, [panel(u.before, 'bad', pair('#c0392b', '#27853f', l.a)), panel(u.after, 'good', pair('#1b4f9c', '#f2a33a', l.b))], l.cap);
}

function f7(l, u) {
  const rows = [['S1', '1,111.1'], ['S2', '8,888.8'], ['S3', '1,181.8'], ['S4', '8,118.1'], ['S5', '1,888.1']];
  const tbl = (style) => `${T(14, 26, l.h, { size: 11, w: 600, fill: INK })}${T(250, 26, l.h2, { size: 11, w: 600, fill: INK, a: 'end' })}<path d="M14 36H250" stroke="${LINE}"/>` +
    rows.map(([n, v], i) => `${T(14, 62 + i * 26, n, { size: 13 })}${T(250, 62 + i * 26, v, { size: 14, fill: INK, a: 'end', style })}`).join('');
  return fig(u, [panel(u.before, 'bad', tbl('font-variant-numeric:proportional-nums;font-feature-settings:\'tnum\' 0')), panel(u.after, 'good', tbl('font-variant-numeric:tabular-nums;font-feature-settings:\'tnum\' 1'))], l.cap);
}

const F = { f1, f2, f3, f4, f5, f6, f7 };
export function dvFigure(id, lang) { const f = F[id]; if (!f) throw new Error('unknown figure ' + id); return f(L[lang][id], L[lang]); }
