// Themed Pac-Man contribution graph, rebuilt daily by .github/workflows/pacman.yml.
// Usage: node pacman.js <contrib.json> <out-dir> [seed]
// contrib.json is the GraphQL response for user.contributionsCollection.contributionCalendar.
// Writes pacman.svg (dark) and pacman-light.svg. The route is random but fixed per day (seed = today's date).
const fs = require('fs');
const path = require('path');
const [, , src, outDir, seedArg] = process.argv;
const MONO = "'Cascadia Code', Consolas, 'SF Mono', Menlo, monospace";

const cal = JSON.parse(fs.readFileSync(src, 'utf8')).data.user.contributionsCollection.contributionCalendar;
const weeks = cal.weeks.map(w => w.contributionDays.map(d => d.contributionCount));
const total = cal.totalContributions;

const THEMES = {
  '': { bg: '#0b0f19', border: '#1e293b', text: '#94a3b8', legend: '#64748b', pac: '#fbbf24',
        cells: ['#161b2e', '#4c1d95', '#7c3aed', '#a855f7', '#f472b6'], ghosts: ['#f472b6', '#22d3ee'] },
  '-light': { bg: '#ffffff', border: '#d0d7de', text: '#475569', legend: '#64748b', pac: '#f59e0b',
        cells: ['#ebedf0', '#ddd6fe', '#a78bfa', '#7c3aed', '#db2777'], ghosts: ['#db2777', '#0891b2'] },
};

const CELL = 14, GAP = 3, STEP = CELL + GAP, X0 = 24, Y0 = 46;
const cols = weeks.length, W = X0 * 2 + cols * STEP - GAP, H = Y0 + 7 * STEP + 40;
const level = n => (n === 0 ? 0 : n < 3 ? 1 : n < 6 ? 2 : n < 10 ? 3 : 4);
const exists = (c, r) => c >= 0 && c < cols && r >= 0 && r < 7 && weeks[c][r] !== undefined;

// Seeded random so a given day always produces the same route.
let seed = [...(seedArg || new Date().toISOString().slice(0, 10))].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) % 2147483647, 7) || 1;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const pick = n => Math.floor(rnd() * n);

// Route: visit every contribution plus a dozen random waypoints, always heading to the nearest one,
// moving one square at a time in a randomly mixed order of horizontal and vertical steps.
const targets = [];
weeks.forEach((w, c) => w.forEach((n, r) => n > 0 && targets.push([c, r])));
for (let i = 0; i < 12; i++) {
  let c, r;
  do { c = pick(cols); r = pick(7); } while (!exists(c, r));
  targets.push([c, r]);
}
let pos = [0, pick(7)];
const pts = [pos];
while (targets.length) {
  let best = 0, bestD = Infinity;
  targets.forEach(([c, r], i) => {
    const d = Math.abs(c - pos[0]) + Math.abs(r - pos[1]) + rnd() * 3;
    if (d < bestD) { bestD = d; best = i; }
  });
  const [tc, tr] = targets.splice(best, 1)[0];
  while (pos[0] !== tc || pos[1] !== tr) {
    const moves = [];
    if (pos[0] !== tc) moves.push([Math.sign(tc - pos[0]), 0]);
    if (pos[1] !== tr) moves.push([0, Math.sign(tr - pos[1])]);
    const ok = moves.filter(([dc, dr]) => exists(pos[0] + dc, pos[1] + dr));
    const [dc, dr] = (ok.length ? ok : moves)[pick((ok.length ? ok : moves).length)];
    pos = [pos[0] + dc, pos[1] + dr];
    pts.push(pos);
  }
}

const steps = pts.length - 1;
const SPEED = Math.min(0.09, Math.max(0.05, 24 / steps)), PAUSE = 2;
const travel = steps * SPEED, DUR = travel + PAUSE;
const cx = c => X0 + c * STEP + CELL / 2, cy = r => Y0 + r * STEP + CELL / 2;
const motion = 'M' + pts.map(([c, r]) => `${cx(c)} ${cy(r)}`).join(' L');
const kt = t => (t / DUR).toFixed(5);
const LEN = steps * STEP;
const label = `${total} contributions in the last year`;

for (const [suffix, T] of Object.entries(THEMES)) {
  // Squares are static; one masked overlay (revealed along Pac-Man's path) hides the eaten ones.
  // The trail is 20px wide with round joins so U-turns still cover the whole 14px square (corner radius 9.9).
  let cells = '', eaten = '';
  weeks.forEach((w, c) => w.forEach((n, r) => {
    const lv = level(n), x = X0 + c * STEP, y = Y0 + r * STEP;
    cells += `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="3" fill="${T.cells[lv]}"/>`;
    if (lv > 0) eaten += `<rect x="${x - 0.5}" y="${y - 0.5}" width="${CELL + 1}" height="${CELL + 1}" rx="3.5"/>`;
  }));
  const trail = `<mask id="m" maskUnits="userSpaceOnUse"><path d="${motion}" fill="none" stroke="#fff" stroke-width="20" stroke-linecap="square" stroke-linejoin="round" stroke-dasharray="${LEN} ${LEN + 50}" stroke-dashoffset="${LEN}"><animate attributeName="stroke-dashoffset" values="${LEN};0;0" keyTimes="0;${kt(travel)};1" dur="${DUR}s" repeatCount="indefinite"/></path></mask>`;
  const overlay = `<defs>${trail}</defs><g mask="url(#m)" fill="${T.cells[0]}">${eaten}</g>`;

  // Mouth: two pre-drawn frames toggled discretely instead of morphing the path.
  const pac = `
  <g>
    <path d="M0 0L6.6 -4.6A8 8 0 1 0 6.6 4.6Z" fill="${T.pac}"><animate attributeName="visibility" values="visible;hidden" dur="0.3s" calcMode="discrete" repeatCount="indefinite"/></path>
    <circle r="8" fill="${T.pac}" visibility="hidden"><animate attributeName="visibility" values="hidden;visible" dur="0.3s" calcMode="discrete" repeatCount="indefinite"/></circle>
    <animateMotion dur="${DUR}s" repeatCount="indefinite" rotate="auto" path="${motion}" keyPoints="0;1;1" keyTimes="0;${kt(travel)};1" calcMode="linear"/>
  </g>`;
  const ghost = (color, delay) => `
  <g>
    <path d="M-7 7V-1a7 7 0 0 1 14 0V7l-2.3 -2.3L9.4 7l-2.3 -2.3L5 7l-2.3 -2.3L0.4 7z" transform="translate(0 -1)" fill="${color}"/>
    <circle cx="-2.6" cy="-2" r="2.2" fill="#fff"/><circle cx="2.6" cy="-2" r="2.2" fill="#fff"/>
    <circle cx="-2" cy="-2" r="1.1" fill="#1e3a8a"/><circle cx="3.2" cy="-2" r="1.1" fill="#1e3a8a"/>
    <animateMotion dur="${DUR}s" begin="${delay}s" repeatCount="indefinite" path="${motion}" keyPoints="0;1;1" keyTimes="0;${kt(travel)};1" calcMode="linear"/>
  </g>`;

  const out = path.join(outDir, `pacman${suffix}.svg`);
  fs.writeFileSync(out, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Pac-Man eating ${label}">
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="16" fill="${T.bg}" stroke="${T.border}" stroke-width="2"/>
  <text x="${X0}" y="30" font-family="${MONO}" font-size="13" fill="${T.text}"><tspan fill="${T.pac}">●</tspan> ${label}</text>
  ${cells}
  ${overlay}
  ${ghost(T.ghosts[0], -0.6)}
  ${ghost(T.ghosts[1], -1.2)}
  ${pac}
  <g font-family="${MONO}" font-size="11" fill="${T.legend}">
    <text x="${W - X0 - 150}" y="${H - 14}">less</text>
    ${T.cells.map((c, i) => `<rect x="${W - X0 - 118 + i * 17}" y="${H - 25}" width="12" height="12" rx="3" fill="${c}"/>`).join('')}
    <text x="${W - X0 - 30}" y="${H - 14}">more</text>
  </g>
</svg>
`);
  console.log('wrote', out);
}
console.log(`route: ${steps} steps, ${DUR.toFixed(1)}s loop`);
