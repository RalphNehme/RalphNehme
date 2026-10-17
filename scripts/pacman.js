// Themed Pac-Man contribution graph, rebuilt daily by .github/workflows/pacman.yml.
// Usage: node pacman.js <contrib.json> <out.svg>
// contrib.json is the GraphQL response for user.contributionsCollection.contributionCalendar.
const fs = require('fs');
const [, , src, out] = process.argv;
const MONO = "'Cascadia Code', Consolas, 'SF Mono', Menlo, monospace";

const cal = JSON.parse(fs.readFileSync(src, 'utf8')).data.user.contributionsCollection.contributionCalendar;
const weeks = cal.weeks.map(w => w.contributionDays.map(d => d.contributionCount));
const total = cal.totalContributions;

const CELL = 14, GAP = 3, STEP = CELL + GAP, X0 = 24, Y0 = 46;
const cols = weeks.length, W = X0 * 2 + cols * STEP - GAP, H = Y0 + 7 * STEP + 40;
const level = n => (n === 0 ? 0 : n < 3 ? 1 : n < 6 ? 2 : n < 10 ? 3 : 4);
const COLORS = ['#161b2e', '#4c1d95', '#7c3aed', '#a855f7', '#f472b6'];

// Pac-Man snakes down one column and up the next.
const pathPts = [];
for (let c = 0; c < cols; c++) {
  const rows = [...Array(7).keys()];
  if (c % 2) rows.reverse();
  for (const r of rows) pathPts.push([c, r]);
}
const SPEED = 0.045, PAUSE = 2;
const travel = (pathPts.length - 1) * SPEED, DUR = travel + PAUSE;
const cx = c => X0 + c * STEP + CELL / 2, cy = r => Y0 + r * STEP + CELL / 2;
const motion = 'M' + pathPts.map(([c, r]) => `${cx(c)} ${cy(r)}`).join(' L');
const kt = t => (t / DUR).toFixed(5);

// Squares are static; one masked overlay (revealed along Pac-Man's path) hides the eaten ones.
let cells = "", eaten = "";
pathPts.forEach(([c, r]) => {
  const n = (weeks[c] || [])[r];
  if (n === undefined) return;
  const lv = level(n), x = X0 + c * STEP, y = Y0 + r * STEP;
  cells += `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="3" fill="${COLORS[lv]}"/>`;
  if (lv > 0) eaten += `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="3"/>`;
});
const LEN = (pathPts.length - 1) * STEP;
const trail = `<mask id="m" maskUnits="userSpaceOnUse"><path d="${motion}" fill="none" stroke="#fff" stroke-width="${STEP}" stroke-linecap="square" stroke-dasharray="${LEN} ${LEN + 50}" stroke-dashoffset="${LEN}"><animate attributeName="stroke-dashoffset" values="${LEN};0;0" keyTimes="0;${kt(travel)};1" dur="${DUR}s" repeatCount="indefinite"/></path></mask>`;
const overlay = `<defs>${trail}</defs><g mask="url(#m)" fill="${COLORS[0]}">${eaten}</g>`;

// Mouth: two pre-drawn frames toggled discretely instead of morphing the path.
const pac = `
  <g>
    <path d="M0 0L6.6 -4.6A8 8 0 1 0 6.6 4.6Z" fill="#fbbf24"><animate attributeName="visibility" values="visible;hidden" dur="0.3s" calcMode="discrete" repeatCount="indefinite"/></path>
    <circle r="8" fill="#fbbf24" visibility="hidden"><animate attributeName="visibility" values="hidden;visible" dur="0.3s" calcMode="discrete" repeatCount="indefinite"/></circle>
    <animateMotion dur="${DUR}s" repeatCount="indefinite" rotate="auto" path="${motion}" keyPoints="0;1;1" keyTimes="0;${kt(travel)};1" calcMode="linear"/>
  </g>`;
const ghost = (color, delay) => `
  <g>
    <path d="M-7 7V-1a7 7 0 0 1 14 0V7l-2.3 -2.3L9.4 7l-2.3 -2.3L5 7l-2.3 -2.3L0.4 7z" transform="translate(0 -1)" fill="${color}"/>
    <circle cx="-2.6" cy="-2" r="2.2" fill="#fff"/><circle cx="2.6" cy="-2" r="2.2" fill="#fff"/>
    <circle cx="-2" cy="-2" r="1.1" fill="#1e3a8a"/><circle cx="3.2" cy="-2" r="1.1" fill="#1e3a8a"/>
    <animateMotion dur="${DUR}s" begin="${delay}s" repeatCount="indefinite" path="${motion}" keyPoints="0;1;1" keyTimes="0;${kt(travel)};1" calcMode="linear"/>
  </g>`;

const label = `${total} contributions in the last year`;
fs.writeFileSync(out, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Pac-Man eating ${label}">
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="16" fill="#0b0f19" stroke="#1e293b" stroke-width="2"/>
  <text x="${X0}" y="30" font-family="${MONO}" font-size="13" fill="#94a3b8"><tspan fill="#fbbf24">●</tspan> ${label}</text>
  ${cells}
  ${overlay}
  ${ghost('#f472b6', -0.6)}
  ${ghost('#22d3ee', -1.2)}
  ${pac}
  <g font-family="${MONO}" font-size="11" fill="#64748b">
    <text x="${W - X0 - 150}" y="${H - 14}">less</text>
    ${COLORS.map((c, i) => `<rect x="${W - X0 - 118 + i * 17}" y="${H - 25}" width="12" height="12" rx="3" fill="${c}"/>`).join('')}
    <text x="${W - X0 - 30}" y="${H - 14}">more</text>
  </g>
</svg>
`);
console.log('wrote', out, 'duration', DUR.toFixed(1) + 's');
