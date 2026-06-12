/**
 * Generate dummy frame PNG files for public/frame/
 * Each frame is 800x600 (landscape 4:3) with a transparent center hole
 * so the guest photo shows through.
 *
 * Run: node scripts/gen-frames.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'public', 'frame');

const W = 800;
const H = 600;
const BORDER = 48; // thickness of frame border

// Each frame: { id, label, svgContent }
const frames = [
  // ── 1. Minimal White ──────────────────────────────────────────
  {
    id: 'frame-minimal',
    label: 'Minimal White',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <mask id="hole">
      <rect width="${W}" height="${H}" fill="white"/>
      <rect x="${BORDER}" y="${BORDER}" width="${W - BORDER * 2}" height="${H - BORDER * 2}" fill="black"/>
    </mask>
  </defs>
  <!-- Frame body -->
  <rect width="${W}" height="${H}" fill="white" mask="url(#hole)"/>
  <!-- Inner shadow line -->
  <rect x="${BORDER}" y="${BORDER}" width="${W - BORDER * 2}" height="${H - BORDER * 2}"
    fill="none" stroke="#e5e5e5" stroke-width="1.5"/>
  <!-- Outer border -->
  <rect x="2" y="2" width="${W - 4}" height="${H - 4}"
    fill="none" stroke="#d4d4d4" stroke-width="2"/>
  <!-- Corner accents -->
  <line x1="2" y1="2" x2="28" y2="2" stroke="#aaa" stroke-width="2"/>
  <line x1="2" y1="2" x2="2" y2="28" stroke="#aaa" stroke-width="2"/>
  <line x1="${W - 2}" y1="2" x2="${W - 28}" y2="2" stroke="#aaa" stroke-width="2"/>
  <line x1="${W - 2}" y1="2" x2="${W - 2}" y2="28" stroke="#aaa" stroke-width="2"/>
  <line x1="2" y1="${H - 2}" x2="28" y2="${H - 2}" stroke="#aaa" stroke-width="2"/>
  <line x1="2" y1="${H - 2}" x2="2" y2="${H - 28}" stroke="#aaa" stroke-width="2"/>
  <line x1="${W - 2}" y1="${H - 2}" x2="${W - 28}" y2="${H - 2}" stroke="#aaa" stroke-width="2"/>
  <line x1="${W - 2}" y1="${H - 2}" x2="${W - 2}" y2="${H - 28}" stroke="#aaa" stroke-width="2"/>
  <!-- Label -->
  <text x="${W / 2}" y="${H - 14}" text-anchor="middle"
    font-family="Georgia, serif" font-size="11" fill="#bbb" letter-spacing="3">MEMOIRE</text>
</svg>`,
  },

  // ── 2. Polaroid ───────────────────────────────────────────────
  {
    id: 'frame-polaroid',
    label: 'Retro Polaroid',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <mask id="hole2">
      <rect width="${W}" height="${H}" fill="white"/>
      <rect x="${BORDER}" y="${BORDER}" width="${W - BORDER * 2}" height="${H - BORDER * 2 - 40}" fill="black"/>
    </mask>
    <filter id="shadow">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#00000022"/>
    </filter>
  </defs>
  <!-- Cream background -->
  <rect width="${W}" height="${H}" fill="#fdfaf5" mask="url(#hole2)" filter="url(#shadow)"/>
  <!-- Bottom white strip (polaroid caption area) -->
  <rect x="${BORDER}" y="${H - BORDER - 40}" width="${W - BORDER * 2}" height="40 + ${BORDER}" fill="#fdfaf5"/>
  <!-- Outer border -->
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" fill="none" stroke="#e8e0d0" stroke-width="2"/>
  <!-- Tape strip top center -->
  <rect x="${W / 2 - 40}" y="0" width="80" height="18" rx="2" fill="rgba(255,220,180,0.55)" stroke="#e0c090" stroke-width="1"/>
  <!-- Caption line -->
  <line x1="${W / 2 - 80}" y1="${H - 28}" x2="${W / 2 + 80}" y2="${H - 28}" stroke="#d0c8b0" stroke-width="1" stroke-dasharray="4 4"/>
  <!-- Label -->
  <text x="${W / 2}" y="${H - 12}" text-anchor="middle"
    font-family="Georgia, serif" font-style="italic" font-size="13" fill="#c0b090" letter-spacing="2">Memoire</text>
</svg>`,
  },

  // ── 3. Dark Cinematic ─────────────────────────────────────────
  {
    id: 'frame-dark',
    label: 'Dark Cinematic',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <mask id="hole3">
      <rect width="${W}" height="${H}" fill="white"/>
      <rect x="${BORDER}" y="${BORDER}" width="${W - BORDER * 2}" height="${H - BORDER * 2}" fill="black"/>
    </mask>
    <linearGradient id="darkGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0a0a"/>
      <stop offset="100%" stop-color="#1a1a1a"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#darkGrad)" mask="url(#hole3)"/>
  <!-- Gold inner border -->
  <rect x="${BORDER - 1}" y="${BORDER - 1}" width="${W - BORDER * 2 + 2}" height="${H - BORDER * 2 + 2}"
    fill="none" stroke="#b8960c" stroke-width="1" opacity="0.6"/>
  <!-- Outer border -->
  <rect x="3" y="3" width="${W - 6}" height="${H - 6}"
    fill="none" stroke="#333" stroke-width="2"/>
  <!-- Sprocket dots on top and bottom (cinematic feel) -->
  ${Array.from({ length: 10 }).map((_, i) => {
    const x = 20 + i * ((W - 40) / 9);
    return `<circle cx="${x}" cy="18" r="5" fill="#1a1a1a" stroke="#333" stroke-width="1"/>
    <circle cx="${x}" cy="${H - 18}" r="5" fill="#1a1a1a" stroke="#333" stroke-width="1"/>`;
  }).join('\n  ')}
  <!-- Label -->
  <text x="${W / 2}" y="${H - 10}" text-anchor="middle"
    font-family="Courier New, monospace" font-size="9" fill="#555" letter-spacing="6" text-transform="uppercase">MEMOIRE · WEDDING</text>
</svg>`,
  },

  // ── 4. Rustic Botanical ───────────────────────────────────────
  {
    id: 'frame-rustic',
    label: 'Rustic Botanical',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <mask id="hole4">
      <rect width="${W}" height="${H}" fill="white"/>
      <rect x="${BORDER}" y="${BORDER}" width="${W - BORDER * 2}" height="${H - BORDER * 2}" fill="black"/>
    </mask>
  </defs>
  <!-- Stone background -->
  <rect width="${W}" height="${H}" fill="#e8e0d5" mask="url(#hole4)"/>
  <!-- Inner border double line -->
  <rect x="${BORDER - 4}" y="${BORDER - 4}" width="${W - BORDER * 2 + 8}" height="${H - BORDER * 2 + 8}"
    fill="none" stroke="#b5a898" stroke-width="1.5"/>
  <rect x="${BORDER + 4}" y="${BORDER + 4}" width="${W - BORDER * 2 - 8}" height="${H - BORDER * 2 - 8}"
    fill="none" stroke="#b5a898" stroke-width="1" stroke-dasharray="6 3"/>
  <!-- Outer border -->
  <rect x="4" y="4" width="${W - 8}" height="${H - 8}" fill="none" stroke="#c4b8a8" stroke-width="4" rx="3"/>
  <!-- Corner leaf accents (simple) -->
  <ellipse cx="28" cy="28" rx="14" ry="7" fill="#8a9e7a" opacity="0.7" transform="rotate(-45 28 28)"/>
  <ellipse cx="${W - 28}" cy="28" rx="14" ry="7" fill="#8a9e7a" opacity="0.7" transform="rotate(45 ${W - 28} 28)"/>
  <ellipse cx="28" cy="${H - 28}" rx="14" ry="7" fill="#8a9e7a" opacity="0.7" transform="rotate(45 28 ${H - 28})"/>
  <ellipse cx="${W - 28}" cy="${H - 28}" rx="14" ry="7" fill="#8a9e7a" opacity="0.7" transform="rotate(-45 ${W - 28} ${H - 28})"/>
  <!-- Small berries -->
  <circle cx="24" cy="38" r="3" fill="#c0645a" opacity="0.8"/>
  <circle cx="${W - 24}" cy="38" r="3" fill="#c0645a" opacity="0.8"/>
  <circle cx="24" cy="${H - 38}" r="3" fill="#c0645a" opacity="0.8"/>
  <circle cx="${W - 24}" cy="${H - 38}" r="3" fill="#c0645a" opacity="0.8"/>
  <!-- Label -->
  <text x="${W / 2}" y="${H - 14}" text-anchor="middle"
    font-family="Georgia, serif" font-size="11" fill="#a09080" letter-spacing="3">✦ MEMOIRE ✦</text>
</svg>`,
  },

  // ── 5. Floral Gold ────────────────────────────────────────────
  {
    id: 'frame-floral',
    label: 'Floral Gold',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <mask id="hole5">
      <rect width="${W}" height="${H}" fill="white"/>
      <rect x="${BORDER}" y="${BORDER}" width="${W - BORDER * 2}" height="${H - BORDER * 2}" fill="black"/>
    </mask>
    <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f5e6a3"/>
      <stop offset="40%" stop-color="#d4a853"/>
      <stop offset="100%" stop-color="#b8860b"/>
    </linearGradient>
  </defs>
  <!-- Gold base -->
  <rect width="${W}" height="${H}" fill="url(#goldGrad)" mask="url(#hole5)"/>
  <!-- Inner filigree line -->
  <rect x="${BORDER - 2}" y="${BORDER - 2}" width="${W - BORDER * 2 + 4}" height="${H - BORDER * 2 + 4}"
    fill="none" stroke="#fff8e0" stroke-width="1.5" opacity="0.6"/>
  <!-- Outer border -->
  <rect x="2" y="2" width="${W - 4}" height="${H - 4}"
    fill="none" stroke="#c9940a" stroke-width="3"/>
  <!-- Corner floral diamond -->
  ${[[20, 20], [W - 20, 20], [20, H - 20], [W - 20, H - 20]].map(([cx, cy]) =>
    `<polygon points="${cx},${cy - 14} ${cx + 10},${cy} ${cx},${cy + 14} ${cx - 10},${cy}"
      fill="#fff8e0" opacity="0.7"/>
    <circle cx="${cx}" cy="${cy}" r="3.5" fill="#b8860b"/>`
  ).join('\n  ')}
  <!-- Top center ornament -->
  <polygon points="${W / 2},6 ${W / 2 + 8},18 ${W / 2 - 8},18" fill="#fff8e0" opacity="0.6"/>
  <!-- Bottom center ornament -->
  <polygon points="${W / 2},${H - 6} ${W / 2 + 8},${H - 18} ${W / 2 - 8},${H - 18}" fill="#fff8e0" opacity="0.6"/>
  <!-- Label -->
  <text x="${W / 2}" y="${H - 12}" text-anchor="middle"
    font-family="Georgia, serif" font-style="italic" font-size="12" fill="#fff8e0" letter-spacing="3" opacity="0.85">Memoire</text>
</svg>`,
  },
];

// Write each SVG directly as .svg file (PNG requires canvas, SVG works natively in browsers)
frames.forEach(({ id, svg }) => {
  const outPath = path.join(OUT_DIR, `${id}.svg`);
  fs.writeFileSync(outPath, svg, 'utf-8');
  console.log(`✓ Written: public/frame/${id}.svg`);
});

console.log('\nDone! 5 frame SVGs generated in public/frame/');
console.log('These are transparent-center overlay frames (800×600, 4:3).');
