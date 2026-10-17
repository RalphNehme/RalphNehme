// Generates the themed SVG assets for the profile README, in dark and light variants.
// Usage: node scripts/gen-assets.js   (run from the repo root)
// assets/hero.svg is hand-written; its light variant is derived from it below.
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, '..', 'assets') + '/';
const SANS = "'Segoe UI', Inter, Helvetica, Arial, sans-serif";
const MONO = "'Cascadia Code', Consolas, 'SF Mono', Menlo, monospace";
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const THEMES = {
  dark: {
    suffix: '', bg: '#0b0f19', panel: '#0f172a', border: '#1e293b', title: '#f8fafc', body: '#94a3b8', chip: '#e2e8f0',
    cyan: '#22d3ee', purple: '#a855f7', pink: '#f472b6', green: '#34d399', amber: '#fbbf24', muted: '#475569',
    shine: '#ffffff', shineOpacity: 0.18, glow: 0.18,
  },
  light: {
    suffix: '-light', bg: '#ffffff', panel: '#ffffff', border: '#d0d7de', title: '#0f172a', body: '#475569', chip: '#1e293b',
    cyan: '#0891b2', purple: '#7c3aed', pink: '#db2777', green: '#059669', amber: '#d97706', muted: '#94a3b8',
    shine: '#7c3aed', shineOpacity: 0.12, glow: 0.10,
  },
};

for (const T of Object.values(THEMES)) {
  const write = (name, svg) => fs.writeFileSync(OUT + name + T.suffix + '.svg', svg.trim() + '\n');

  // ---------- buttons ----------
  const button = (name, label, icon, w) => write(name, `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} 52" width="${w}" height="52" role="img" aria-label="${label}">
  <defs>
    <linearGradient id="b" x1="0" x2="1"><stop offset="0" stop-color="${T.cyan}"/><stop offset="1" stop-color="${T.purple}"/></linearGradient>
    <linearGradient id="shine" x1="0" x2="1"><stop offset="0" stop-color="${T.shine}" stop-opacity="0"/><stop offset="0.5" stop-color="${T.shine}" stop-opacity="${T.shineOpacity}"/><stop offset="1" stop-color="${T.shine}" stop-opacity="0"/></linearGradient>
    <clipPath id="c"><rect x="2" y="2" width="${w - 4}" height="48" rx="24"/></clipPath>
  </defs>
  <rect x="2" y="2" width="${w - 4}" height="48" rx="24" fill="${T.panel}" stroke="url(#b)" stroke-width="2"/>
  <g clip-path="url(#c)">
    <rect x="-80" y="0" width="60" height="52" fill="url(#shine)" transform="skewX(-20)">
      <animate attributeName="x" values="-80;-80;${w + 40}" keyTimes="0;0.6;1" dur="4s" repeatCount="indefinite"/>
    </rect>
  </g>
  ${icon}
  <text x="62" y="32" font-family="${SANS}" font-size="17" font-weight="600" fill="${T.title}">${label}</text>
</svg>`);
  button('btn-linkedin', 'LinkedIn',
    `<rect x="24" y="14" width="24" height="24" rx="5" fill="#0a66c2"/><text x="36" y="32" text-anchor="middle" font-family="${SANS}" font-size="15" font-weight="800" fill="#fff">in</text>`, 168);
  button('btn-email', 'Email',
    `<rect x="23" y="16" width="26" height="20" rx="4" fill="none" stroke="${T.cyan}" stroke-width="2.2"/><path d="M24 18l12 9l12 -9" fill="none" stroke="${T.cyan}" stroke-width="2.2" stroke-linejoin="round"/>`, 148);

  // ---------- section headers ----------
  const header = (name, title) => write(name, `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 60" width="1200" height="60" role="img" aria-label="${title}">
  <defs><linearGradient id="l" x1="0" x2="1"><stop offset="0" stop-color="${T.purple}"/><stop offset="1" stop-color="${T.cyan}" stop-opacity="0"/></linearGradient></defs>
  <rect x="2" y="6" width="${66 + title.length * 14.5}" height="48" rx="12" fill="${T.panel}" stroke="${T.border}" stroke-width="2"/>
  <text x="22" y="38" font-family="${MONO}" font-size="22" font-weight="700"><tspan fill="${T.purple}">//</tspan><tspan fill="${T.cyan}"> ${title}</tspan></text>
  <rect x="${82 + title.length * 14.5}" y="29" width="${1196 - 82 - title.length * 14.5}" height="2" fill="url(#l)"/>
</svg>`);
  header('h-projects', 'projects');
  header('h-experience', 'experience');
  header('h-activity', 'activity');

  // ---------- project cards ----------
  const card = (name, o) => {
    const W = 400, H = 250, accent = T[o.accent], accent2 = T[o.accent2];
    let y = 46;
    const label = `<text x="26" y="${y}" font-family="${MONO}" font-size="12" letter-spacing="2" fill="${accent}">${esc(o.label)}</text>`;
    y += 34;
    const title = o.title.map((t, i) => `<text x="26" y="${y + i * 27}" font-family="${SANS}" font-size="22" font-weight="700" fill="${T.title}">${esc(t)}</text>`).join('\n  ');
    y += (o.title.length - 1) * 27 + 32;
    const desc = o.desc.map((t, i) => `<text x="26" y="${y + i * 21}" font-family="${SANS}" font-size="15" fill="${T.body}">${esc(t)}</text>`).join('\n  ');
    let x = 26;
    const chips = o.chips.map(c => {
      const w = c.length * 8.2 + 22;
      const s = `<rect x="${x}" y="${H - 50}" width="${w}" height="26" rx="13" fill="${accent}" fill-opacity="0.12" stroke="${accent}" stroke-opacity="0.45"/><text x="${x + w / 2}" y="${H - 32}" text-anchor="middle" font-family="${MONO}" font-size="12.5" fill="${T.chip}">${esc(c)}</text>`;
      x += w + 8;
      return s;
    }).join('\n  ');
    const corner = o.live
      ? `<circle cx="${W - 36}" cy="41" r="5" fill="${T.green}"><animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite"/></circle><circle cx="${W - 36}" cy="41" r="5" fill="none" stroke="${T.green}" stroke-width="2"><animate attributeName="r" values="5;13" dur="1.6s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.8;0" dur="1.6s" repeatCount="indefinite"/></circle><text x="${W - 50}" y="46" text-anchor="end" font-family="${MONO}" font-size="12" fill="${T.green}">in progress</text>`
      : `<text x="${W - 26}" y="48" text-anchor="end" font-family="${SANS}" font-size="20" fill="${accent}">↗</text>`;
    write(name, `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(o.title.join(' '))}: ${esc(o.desc.join(' '))}">
  <defs>
    <linearGradient id="bar" x1="0" x2="1"><stop offset="0" stop-color="${accent}"/><stop offset="1" stop-color="${accent2}"/></linearGradient>
    <radialGradient id="g" cx="1" cy="0" r="1"><stop offset="0" stop-color="${accent}" stop-opacity="${T.glow}"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
    <clipPath id="c"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="16"/></clipPath>
  </defs>
  <g clip-path="url(#c)">
    <rect width="${W}" height="${H}" fill="${T.panel}"/>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <rect width="${W}" height="5" fill="url(#bar)"/>
  </g>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="16" fill="none" stroke="${T.border}" stroke-width="2"/>
  ${label}
  ${corner}
  ${title}
  ${desc}
  ${chips}
</svg>`);
  };
  card('card-ai', {
    label: "MASTER'S · YEAR 1", accent: 'pink', accent2: 'purple', live: true,
    title: ['Does the AI Know When', "It Doesn't Know?"],
    desc: ['Testing whether LLMs can spot the limits', 'of their knowledge, and how confidence', 'compares with actual correctness.'],
    chips: ['Python', 'LLM APIs'],
  });
  card('card-spam', {
    label: 'UNDERGRAD · SENIOR YEAR', accent: 'cyan', accent2: 'green',
    title: ['Email Spam Detection'],
    desc: ['Machine learning classifier built with', 'text preprocessing and feature', 'engineering.'],
    chips: ['Python', 'scikit-learn'],
  });
  card('card-tictactoe', {
    label: 'UNDERGRAD · JUNIOR YEAR', accent: 'purple', accent2: 'cyan',
    title: ['TicTacToe with AI'],
    desc: ["An opponent you can't beat, powered", 'by the minimax algorithm.'],
    chips: ['JavaScript', 'HTML', 'CSS'],
  });

  // ---------- experience timeline ----------
  const jobs = [
    { x: 200, year: '2023', co: 'Micron Technology', role: 'Data Analyst Intern', tags: [['SAP automation', 'data analysis'], ['supply-chain data']], c: T.cyan },
    { x: 600, year: '2024', co: 'Collins Aerospace (RTX)', role: 'Software Engineer Intern', tags: [['data-transfer automation'], ['C# dashboard', 'Postman API testing']], c: T.purple },
    { x: 1000, year: '2025 – now', co: 'KCIC', role: 'Database Developer', tags: [['AI workflow automation'], ['data pipelines', 'SQL tuning'], ['Power BI dashboards']], c: T.pink, now: true },
  ];
  const tagRow = (j, row, y) => {
    const ws = row.map(t => t.length * 8 + 24), total = ws.reduce((p, w) => p + w, 0) + (row.length - 1) * 8;
    let x = j.x - total / 2;
    return row.map((t, i) => {
      const w = ws[i], out = `<rect x="${x}" y="${y}" width="${w}" height="26" rx="13" fill="${j.c}" fill-opacity="0.12" stroke="${j.c}" stroke-opacity="0.5"/><text x="${x + w / 2}" y="${y + 18}" text-anchor="middle" font-family="${MONO}" font-size="13" fill="${T.chip}">${esc(t)}</text>`;
      x += w + 8;
      return out;
    }).join('');
  };
  const nodes = jobs.map(j => `
  <text x="${j.x}" y="56" text-anchor="middle" font-family="${MONO}" font-size="15" fill="${j.c}">${esc(j.year)}</text>
  ${j.now ? `<circle cx="${j.x}" cy="90" r="11" fill="none" stroke="${j.c}" stroke-width="2"><animate attributeName="r" values="11;24" dur="1.8s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.9;0" dur="1.8s" repeatCount="indefinite"/></circle>` : ''}
  <circle cx="${j.x}" cy="90" r="11" fill="${T.panel}" stroke="${j.c}" stroke-width="3"/>
  <circle cx="${j.x}" cy="90" r="4.5" fill="${j.c}"/>
  <text x="${j.x}" y="140" text-anchor="middle" font-family="${SANS}" font-size="21" font-weight="700" fill="${T.title}">${esc(j.co)}</text>
  <text x="${j.x}" y="166" text-anchor="middle" font-family="${SANS}" font-size="15" font-weight="600" fill="${j.c}">${esc(j.role)}</text>
  ${j.tags.map((row, i) => tagRow(j, row, 186 + i * 34)).join('\n  ')}`).join('\n');
  write('timeline', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 300" width="1200" height="300" role="img" aria-label="Experience: Micron Technology, Data Analyst Intern, 2023: SAP automation, data analysis, supply-chain data. Collins Aerospace (RTX), Software Engineer Intern, 2024: data-transfer automation, C# dashboard, Postman API testing. KCIC, Database Developer, 2025 to now: AI workflow automation, data pipelines, SQL tuning, Power BI dashboards.">
  <defs>
    <linearGradient id="line" x1="0" x2="1"><stop offset="0" stop-color="${T.cyan}"/><stop offset="0.5" stop-color="${T.purple}"/><stop offset="1" stop-color="${T.pink}"/></linearGradient>
    <radialGradient id="dot"><stop offset="0" stop-color="#fff"/><stop offset="0.4" stop-color="${T.cyan}"/><stop offset="1" stop-color="${T.cyan}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect x="1" y="1" width="1198" height="298" rx="18" fill="${T.panel}" stroke="${T.border}" stroke-width="2"/>
  <rect x="90" y="88.5" width="1020" height="3" rx="1.5" fill="url(#line)" opacity="0.8"/>
  <circle cx="90" cy="90" r="9" fill="url(#dot)">
    <animate attributeName="cx" values="90;1110" dur="5s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="5s" repeatCount="indefinite"/>
  </circle>
  ${nodes}
</svg>`);

  // ---------- footer (links to email in the README) ----------
  write('footer', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 90" width="1200" height="90" role="img" aria-label="Thanks for stopping by. Say hi by email.">
  <defs><linearGradient id="l" x1="0" x2="1"><stop offset="0" stop-color="${T.cyan}" stop-opacity="0"/><stop offset="0.5" stop-color="${T.purple}"/><stop offset="1" stop-color="${T.pink}" stop-opacity="0"/></linearGradient></defs>
  <rect x="100" y="20" width="1000" height="2" fill="url(#l)"/>
  <rect x="350" y="36" width="500" height="40" rx="20" fill="${T.panel}" stroke="${T.border}" stroke-width="2"/>
  <text x="600" y="62" text-anchor="middle" font-family="${MONO}" font-size="17" fill="${T.body}"><tspan fill="${T.green}">$</tspan> ./say-hi.sh <tspan fill="${T.muted}">#</tspan> thanks for stopping by <tspan fill="${T.amber}">✦</tspan></text>
</svg>`);
}

// ---------- hero, light variant ----------
// The terminal and monitor stay dark in both themes; only the page around them changes.
const hero = fs.readFileSync(OUT + 'hero.svg', 'utf8');
const swaps = [
  ['<rect width="1200" height="460" fill="#0b0f19"/>', '<rect width="1200" height="460" fill="#f8fafc"/>'],
  ['stroke="#ffffff" stroke-opacity="0.04"', 'stroke="#0f172a" stroke-opacity="0.06"'],
  ['stop-color="#7c3aed" stop-opacity="0.55"', 'stop-color="#a78bfa" stop-opacity="0.30"'],
  ['stop-color="#06b6d4" stop-opacity="0.40"', 'stop-color="#67e8f9" stop-opacity="0.30"'],
  ['<stop offset="0" stop-color="#22d3ee"/>\n      <stop offset="0.55" stop-color="#a855f7"/>\n      <stop offset="1" stop-color="#f472b6"/>',
   '<stop offset="0" stop-color="#0891b2"/>\n      <stop offset="0.55" stop-color="#7c3aed"/>\n      <stop offset="1" stop-color="#db2777"/>'],
  ['letter-spacing="5" fill="#22d3ee"', 'letter-spacing="5" fill="#0891b2"'],
  ['font-size="21" fill="#cbd5e1"', 'font-size="21" fill="#334155"'],
  ['<rect x="740" y="328" width="420" height="12" rx="6" fill="#1e293b"/>', '<rect x="740" y="328" width="420" height="12" rx="6" fill="#cbd5e1"/>'],
  ['stroke="#22d3ee" stroke-opacity="0.28"', 'stroke="#0891b2" stroke-opacity="0.35"'],
  ['stroke="#a855f7" stroke-opacity="0.22"', 'stroke="#7c3aed" stroke-opacity="0.28"'],
];
let heroLight = hero.replace(/\r\n/g, '\n');
for (const [from, to] of swaps) {
  if (!heroLight.includes(from)) throw new Error('hero.svg changed; light swap not found: ' + from.slice(0, 60));
  heroLight = heroLight.replace(from, to);
}
fs.writeFileSync(OUT + 'hero-light.svg', heroLight);

console.log('done');
