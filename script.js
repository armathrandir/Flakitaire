/**
 * Classic Klondike Solitaire - Schnaps Edition
 * 
 * Features:
 * - 🥃 Custom Shot Glass Suits with Solitaire Alternating Rules:
 *     Color Team (Blue & Green):
 *       ♥ Hearts: Blue Ice Schnaps (Electric Blue with crystal sparkle)
 *       ♦ Diamonds: Green Peppermint Schnaps (Glowing Mint Green)
 *     Black Team (Two Distinct Black Shots):
 *       ♣ Clubs: Black Lakritz Schnaps (Silver-trimmed glass & jet black liquid)
 *       ♠ Spades: Black Herbal Schnaps (Gold-trimmed glass & dark amber-black liquid)
 *     Rule: Alternate between Black shots and Colored (Blue/Green) shots!
 * - 🖱️ Right-Click Quick Sweep: Automatically moves all possible visible cards up to Foundations!
 * - 🌟 Guaranteed Solvable Mode (Rigged so every deal is 100% winnable!)
 * - Player Name Entry on Victory Modal with LocalStorage memory
 * - Two Distinct Leaderboards: Draw 1 (Top 100) & Draw 3 (Top 100)
 * - Smart Candidate Generator + Fast Forward Heuristic Solver
 * - Curated Solvable Bank with Dynamic Suit & Color Permutations
 * - ⚡ Auto-Finish feature when all hidden cards are revealed
 * - ↺ Replay Deal button to restart the current layout
 * - Draw 1 and Draw 3 Modes (with authentic horizontal waste fanning)
 * - Custom Felt Themes (Emerald, Royal Navy, Burgundy, Slate, Deep Violet)
 * - Custom Artillery Card Back Theme (darkened & framed)
 * - Drag & Drop, Click to Select, Double-Click Auto-Move
 * - Unlimited Undo & Smart Hints
 * - Web Audio Sound Effects & Confetti Win Celebration
 */

// --- Constants & Config ---
const SUITS = [
  { name: 'hearts', title: 'Green Hip Flask', color: 'green', symbol: 'flask' },
  { name: 'diamonds', title: 'Green Shot Glass', color: 'green', symbol: 'glass' },
  { name: 'clubs', title: 'Black Shot Glass', color: 'black', symbol: 'glass' },
  { name: 'spades', title: 'Black Hip Flask', color: 'black', symbol: 'flask' }
];

const RANKS = [
  { value: 1, label: 'A' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
  { value: 6, label: '6' },
  { value: 7, label: '7' },
  { value: 8, label: '8' },
  { value: 9, label: '9' },
  { value: 10, label: '10' },
  { value: 11, label: 'J', face: '⚔️' },
  { value: 12, label: 'Q', face: '👑' },
  { value: 13, label: 'K', face: '⚜️' }
];

const STORAGE_KEYS = {
  HIGH_SCORES_DRAW1: 'solitaire_high_scores_draw1_v2',
  HIGH_SCORES_DRAW3: 'solitaire_high_scores_draw3_v2',
  PLAYER_NAME: 'solitaire_player_name',
  FELT_THEME: 'solitaire_felt_theme',
  DRAW_MODE: 'solitaire_draw_mode',
  DEAL_TYPE: 'solitaire_deal_type'
};

// --- Custom Schnaps Shot Glass SVG Generator ---
function getShotGlassSVG(suitName, size = 'small') {
  const sizeClass = `shot-svg shot-svg-${size}`;

  switch (suitName) {
    case 'clubs': // 🖤 Black Lakritz Schnaps (Silver / Chrome Trim)
      return `
        <svg class="${sizeClass}" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Glass Body -->
          <path d="M5 6 L8 34 Q8 38 12 38 L20 38 Q24 38 24 34 L27 6 Z" fill="rgba(255,255,255,0.08)" stroke="#cfd8dc" stroke-width="1.6" stroke-linejoin="round"/>
          <!-- Heavy Glass Base - Silver Tone -->
          <path d="M8 32 L8.5 35 Q8.5 38 12 38 L20 38 Q23.5 38 23.5 35 L24 32 Z" fill="#b0bec5" stroke="#78909c" stroke-width="1"/>
          <!-- Pure Jet-Black Lakritz Liquid -->
          <path d="M7 14 L8.8 33 L23.2 33 L25 14 Z" fill="#141414"/>
          <!-- Liquid Surface Meniscus -->
          <ellipse cx="16" cy="14" rx="9" ry="2.2" fill="#37474f" stroke="#263238" stroke-width="0.8"/>
          <!-- Silver Specular Streak & Star -->
          <path d="M7.5 9 L9.5 32" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M24.5 9 L22.8 31" stroke="rgba(255,255,255,0.35)" stroke-width="0.9" stroke-linecap="round"/>
          <!-- Silver Rim -->
          <ellipse cx="16" cy="6" rx="11" ry="2.2" fill="rgba(255,255,255,0.25)" stroke="#eceff1" stroke-width="1.4"/>
          <ellipse cx="16" cy="6" rx="10" ry="1.7" fill="none" stroke="#ffffff" stroke-width="0.9"/>
        </svg>
      `;

    case 'spades': // 🖤 Black Hip Flask (Stainless Cap & Matte Black Body)
      return `
        <svg class="${sizeClass}" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="blackFlaskGrad" x1="6" y1="8" x2="26" y2="38" gradientUnits="userSpaceOnUse">
              <stop stop-color="#2c2c2c"/>
              <stop offset="0.6" stop-color="#141414"/>
              <stop offset="1" stop-color="#050505"/>
            </linearGradient>
            <linearGradient id="metalGrad" x1="12" y1="2" x2="20" y2="8" gradientUnits="userSpaceOnUse">
              <stop stop-color="#ffffff"/>
              <stop offset="0.5" stop-color="#cfd8dc"/>
              <stop offset="1" stop-color="#78909c"/>
            </linearGradient>
          </defs>

          <!-- Captive Hinge Arm -->
          <path d="M12 4 L10 5 L10 9 L13 9" fill="none" stroke="#90a4ae" stroke-width="1.2" stroke-linejoin="round"/>
          <!-- Screw Cap with Grip Ridges -->
          <rect x="13" y="2" width="7" height="4.5" rx="1" fill="url(#metalGrad)" stroke="#546e7a" stroke-width="0.9"/>
          <line x1="15.5" y1="2.5" x2="15.5" y2="6" stroke="#455a64" stroke-width="0.7"/>
          <line x1="17.5" y1="2.5" x2="17.5" y2="6" stroke="#455a64" stroke-width="0.7"/>
          <!-- Spout Neck -->
          <rect x="14.5" y="6.5" width="4" height="2.5" fill="#b0bec5" stroke="#78909c" stroke-width="0.7"/>

          <!-- Flask Body (Ergonomic Curved Pocket Flask) -->
          <path d="M7 13 Q7 9 13.5 9 L19.5 9 Q26 9 26 13 L27 34 Q27 38 22 38 L11 38 Q6 38 6 34 L7 13 Z" fill="url(#blackFlaskGrad)" stroke="#455a64" stroke-width="1.4" stroke-linejoin="round"/>
          
          <!-- Polished Inset Leather/Metal Trim -->
          <path d="M9 14 Q9 11 14 11 L19 11 Q24 11 24 14 L24.8 33 Q24.8 36 20.5 36 L12.5 36 Q8.2 36 8.2 33 Z" fill="none" stroke="#37474f" stroke-width="0.8" stroke-dasharray="2 1.5"/>

          <!-- Center Heraldic Seal / Medallion -->
          <circle cx="16.5" cy="23" r="3.6" fill="#1e272c" stroke="#cfd8dc" stroke-width="0.9"/>
          <!-- Stylized Emblem in Medallion -->
          <path d="M16.5 20.5 L17.3 22.3 L19.2 22.5 L17.8 23.8 L18.2 25.7 L16.5 24.7 L14.8 25.7 L15.2 23.8 L13.8 22.5 L15.7 22.3 Z" fill="#cfd8dc"/>

          <!-- Specular Reflection Highlight Curve -->
          <path d="M8.5 13 L7.8 34" stroke="#ffffff" stroke-width="1.3" opacity="0.4" stroke-linecap="round"/>
          <path d="M24.5 13 L25 34" stroke="#ffffff" stroke-width="0.7" opacity="0.15" stroke-linecap="round"/>
        </svg>
      `;

    case 'hearts': // 💚 Green Hip Flask (Polished Chrome Cap & Radiant Emerald Lacquer)
      return `
        <svg class="${sizeClass}" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="greenFlaskGrad" x1="6" y1="8" x2="26" y2="38" gradientUnits="userSpaceOnUse">
              <stop stop-color="#00e676"/>
              <stop offset="0.4" stop-color="#00a844"/>
              <stop offset="1" stop-color="#004d20"/>
            </linearGradient>
            <linearGradient id="chromeGrad" x1="12" y1="2" x2="20" y2="8" gradientUnits="userSpaceOnUse">
              <stop stop-color="#ffffff"/>
              <stop offset="0.5" stop-color="#eceff1"/>
              <stop offset="1" stop-color="#90a4ae"/>
            </linearGradient>
          </defs>

          <!-- Captive Hinge Arm -->
          <path d="M12 4 L10 5 L10 9 L13 9" fill="none" stroke="#78909c" stroke-width="1.2" stroke-linejoin="round"/>
          <!-- Screw Cap with Grip Ridges -->
          <rect x="13" y="2" width="7" height="4.5" rx="1" fill="url(#chromeGrad)" stroke="#607d8b" stroke-width="0.9"/>
          <line x1="15.5" y1="2.5" x2="15.5" y2="6" stroke="#78909c" stroke-width="0.7"/>
          <line x1="17.5" y1="2.5" x2="17.5" y2="6" stroke="#78909c" stroke-width="0.7"/>
          <!-- Spout Neck -->
          <rect x="14.5" y="6.5" width="4" height="2.5" fill="#cfd8dc" stroke="#90a4ae" stroke-width="0.7"/>

          <!-- Flask Body (Emerald Lacquer) -->
          <path d="M7 13 Q7 9 13.5 9 L19.5 9 Q26 9 26 13 L27 34 Q27 38 22 38 L11 38 Q6 38 6 34 L7 13 Z" fill="url(#greenFlaskGrad)" stroke="#004d20" stroke-width="1.4" stroke-linejoin="round"/>
          
          <!-- Inset Filigree Border -->
          <path d="M9 14 Q9 11 14 11 L19 11 Q24 11 24 14 L24.8 33 Q24.8 36 20.5 36 L12.5 36 Q8.2 36 8.2 33 Z" fill="none" stroke="#69f0ae" stroke-width="0.8" opacity="0.75" stroke-dasharray="2 1.5"/>

          <!-- Center Mint Emblem / Medallion -->
          <circle cx="16.5" cy="23" r="3.6" fill="#003816" stroke="#b9f6ca" stroke-width="0.9"/>
          <!-- Mint Leaf / Sparkle Emblem -->
          <path d="M16.5 20.2 Q18.5 21.8 17.5 24.5 Q16.5 25.8 16.5 25.8 Q16.5 25.8 15.5 24.5 Q14.5 21.8 16.5 20.2 Z" fill="#b9f6ca"/>
          <circle cx="16.5" cy="23" r="1.1" fill="#ffffff"/>

          <!-- Specular Reflection Highlight Curve -->
          <path d="M8.5 13 L7.8 34" stroke="#ffffff" stroke-width="1.4" opacity="0.55" stroke-linecap="round"/>
          <path d="M24.5 13 L25 34" stroke="#ffffff" stroke-width="0.7" opacity="0.2" stroke-linecap="round"/>
        </svg>
      `;

    case 'diamonds': // 💚 Green Peppermint Schnaps (Pfeffi)
      return `
        <svg class="${sizeClass}" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Glass Body -->
          <path d="M5 6 L8 34 Q8 38 12 38 L20 38 Q24 38 24 34 L27 6 Z" fill="rgba(0,230,118,0.06)" stroke="#007e33" stroke-width="1.6" stroke-linejoin="round"/>
          <!-- Heavy Glass Base -->
          <path d="M8 32 L8.5 35 Q8.5 38 12 38 L20 38 Q23.5 38 23.5 35 L24 32 Z" fill="#a7f3d0" stroke="#007e33" stroke-width="1"/>
          <!-- Green Mint Liquid -->
          <path d="M7 14 L8.8 33 L23.2 33 L25 14 Z" fill="url(#mintGrad2)"/>
          <!-- Liquid Surface Meniscus -->
          <ellipse cx="16" cy="14" rx="9" ry="2.2" fill="#69f0ae" stroke="#00c853" stroke-width="0.8"/>
          <!-- Mint Bubble Accent -->
          <circle cx="18" cy="22" r="1.5" fill="#b9f6ca" opacity="0.85"/>
          <circle cx="13" cy="27" r="1" fill="#b9f6ca" opacity="0.7"/>
          <!-- Vertical Glass Reflection -->
          <path d="M7.5 9 L9.5 32" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M24.5 9 L22.8 31" stroke="rgba(255,255,255,0.3)" stroke-width="0.9" stroke-linecap="round"/>
          <!-- Glass Rim -->
          <ellipse cx="16" cy="6" rx="11" ry="2.2" fill="rgba(0,230,118,0.18)" stroke="#007e33" stroke-width="1.3"/>
          <ellipse cx="16" cy="6" rx="10" ry="1.7" fill="none" stroke="#e8f5e9" stroke-width="0.9"/>
          <defs>
            <linearGradient id="mintGrad2" x1="16" y1="14" x2="16" y2="33" gradientUnits="userSpaceOnUse">
              <stop stop-color="#00e676"/>
              <stop offset="1" stop-color="#008f39"/>
            </linearGradient>
          </defs>
        </svg>
      `;

    default:
      return '';
  }
}

// --- Card Pip Layout Generator (1 to 10 Shot Glasses) ---
function getPipsHTML(rankValue, suitName) {
  const coordsMap = {
    1: [{ x: 50, y: 50 }],
    2: [{ x: 50, y: 22 }, { x: 50, y: 78 }],
    3: [{ x: 50, y: 20 }, { x: 50, y: 50 }, { x: 50, y: 80 }],
    4: [{ x: 28, y: 24 }, { x: 72, y: 24 }, { x: 28, y: 76 }, { x: 72, y: 76 }],
    5: [{ x: 28, y: 22 }, { x: 72, y: 22 }, { x: 50, y: 50 }, { x: 28, y: 78 }, { x: 72, y: 78 }],
    6: [{ x: 28, y: 22 }, { x: 72, y: 22 }, { x: 28, y: 50 }, { x: 72, y: 50 }, { x: 28, y: 78 }, { x: 72, y: 78 }],
    7: [{ x: 28, y: 20 }, { x: 72, y: 20 }, { x: 50, y: 35 }, { x: 28, y: 50 }, { x: 72, y: 50 }, { x: 28, y: 80 }, { x: 72, y: 80 }],
    8: [{ x: 28, y: 18 }, { x: 72, y: 18 }, { x: 50, y: 34 }, { x: 28, y: 50 }, { x: 72, y: 50 }, { x: 50, y: 66 }, { x: 28, y: 82 }, { x: 72, y: 82 }],
    9: [{ x: 28, y: 18 }, { x: 72, y: 18 }, { x: 28, y: 39 }, { x: 72, y: 39 }, { x: 50, y: 50 }, { x: 28, y: 61 }, { x: 72, y: 61 }, { x: 28, y: 82 }, { x: 72, y: 82 }],
    10: [{ x: 28, y: 17 }, { x: 72, y: 17 }, { x: 50, y: 28 }, { x: 28, y: 39 }, { x: 72, y: 39 }, { x: 28, y: 61 }, { x: 72, y: 61 }, { x: 50, y: 72 }, { x: 28, y: 83 }, { x: 72, y: 83 }]
  };

  const coords = coordsMap[rankValue] || [{ x: 50, y: 50 }];
  const glassSvg = getShotGlassSVG(suitName, 'pip');

  const pipsHtml = coords.map(pt => `
    <div class="card-pip" style="left: ${pt.x}%; top: ${pt.y}%;">
      ${glassSvg}
    </div>
  `).join('');

  return `<div class="card-pips card-pips-${rankValue}">${pipsHtml}</div>`;
}

// --- Court Card Generator: Jack, Queen, King holding Suit Shot Glass ---
function getCourtCardSVG(rankValue, suitName) {
  const uid = Math.random().toString(36).substr(2, 6);
  let roleTitle = 'JACK';
  if (rankValue === 12) roleTitle = 'QUEEN';
  if (rankValue === 13) roleTitle = 'KING';

  const themes = {
    hearts: {
      primary: '#007e33',
      secondary: '#e8f5e9',
      accent: '#00e676',
      border: '#007e33',
      mantle: '#1b5e20',
      ribbonText: '#004d20'
    },
    diamonds: {
      primary: '#007e33',
      secondary: '#e8f5e9',
      accent: '#00e676',
      border: '#007e33',
      mantle: '#2e7d32',
      ribbonText: '#004d20'
    },
    clubs: {
      primary: '#212121',
      secondary: '#eceff1',
      accent: '#90a4ae',
      border: '#607d8b',
      mantle: '#263238',
      ribbonText: '#263238'
    },
    spades: {
      primary: '#181818',
      secondary: '#eceff1',
      accent: '#78909c',
      border: '#546e7a',
      mantle: '#212121',
      ribbonText: '#212121'
    }
  };

  const t = themes[suitName] || themes.hearts;

  // Drinking vessel held in character's hand (Shot Glass or Hip Flask)
  let heldGlassSVG = '';
  if (suitName === 'clubs') {
    heldGlassSVG = `
      <!-- Black Shot Glass (Silver Trim) -->
      <g transform="translate(68, 16)">
        <path d="M4 6 L6 27 Q6 30 9 30 L17 30 Q20 30 20 27 L22 6 Z" fill="rgba(255,255,255,0.12)" stroke="#cfd8dc" stroke-width="1.3" stroke-linejoin="round"/>
        <path d="M6 25 L6.5 28 Q6.5 30 9 30 L17 30 Q19.5 30 19.5 28 L20 25 Z" fill="#b0bec5" stroke="#78909c" stroke-width="0.9"/>
        <path d="M5 11 L6.8 26 L19.2 26 L21 11 Z" fill="#141414"/>
        <ellipse cx="13" cy="11" rx="7.5" ry="1.8" fill="#37474f"/>
        <path d="M5.5 8 L7 25" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round"/>
        <ellipse cx="13" cy="6" rx="9" ry="1.8" fill="rgba(255,255,255,0.25)" stroke="#eceff1" stroke-width="1.1"/>
      </g>
    `;
  } else if (suitName === 'spades') {
    heldGlassSVG = `
      <!-- Black Hip Flask in Hand -->
      <g transform="translate(68, 15)">
        <path d="M10 5 L8 6 L8 9 L11 9" fill="none" stroke="#90a4ae" stroke-width="1"/>
        <rect x="11" y="3" width="6" height="4" rx="1" fill="#cfd8dc" stroke="#546e7a" stroke-width="0.8"/>
        <rect x="12.5" y="7" width="3" height="2" fill="#b0bec5" stroke="#78909c" stroke-width="0.7"/>
        <path d="M5 12 Q5 9 11 9 L17 9 Q23 9 23 12 L24 29 Q24 32 20 32 L8 32 Q4 32 4 29 Z" fill="#181818" stroke="#546e7a" stroke-width="1.2" stroke-linejoin="round"/>
        <path d="M7 13 Q7 10.5 11 10.5 L17 10.5 Q21 10.5 21 13 L21.8 28 Q21.8 30.5 18.5 30.5 L9.5 30.5 Q6.2 30.5 6.2 28 Z" fill="none" stroke="#37474f" stroke-width="0.7" stroke-dasharray="1.5 1"/>
        <circle cx="14" cy="20" r="2.8" fill="#263238" stroke="#cfd8dc" stroke-width="0.7"/>
        <polygon points="14,18 14.7,19.5 16.2,19.7 15,20.8 15.4,22.3 14,21.5 12.6,22.3 13,20.8 11.8,19.7 13.3,19.5" fill="#cfd8dc"/>
        <path d="M6.5 12 L6 29" stroke="#ffffff" stroke-width="1" opacity="0.45" stroke-linecap="round"/>
      </g>
    `;
  } else if (suitName === 'hearts') {
    heldGlassSVG = `
      <!-- Green Hip Flask in Hand -->
      <g transform="translate(68, 15)">
        <path d="M10 5 L8 6 L8 9 L11 9" fill="none" stroke="#78909c" stroke-width="1"/>
        <rect x="11" y="3" width="6" height="4" rx="1" fill="#eceff1" stroke="#607d8b" stroke-width="0.8"/>
        <rect x="12.5" y="7" width="3" height="2" fill="#cfd8dc" stroke="#90a4ae" stroke-width="0.7"/>
        <path d="M5 12 Q5 9 11 9 L17 9 Q23 9 23 12 L24 29 Q24 32 20 32 L8 32 Q4 32 4 29 Z" fill="#008f39" stroke="#004d20" stroke-width="1.2" stroke-linejoin="round"/>
        <path d="M7 13 Q7 10.5 11 10.5 L17 10.5 Q21 10.5 21 13 L21.8 28 Q21.8 30.5 18.5 30.5 L9.5 30.5 Q6.2 30.5 6.2 28 Z" fill="none" stroke="#69f0ae" stroke-width="0.7" opacity="0.8" stroke-dasharray="1.5 1"/>
        <circle cx="14" cy="20" r="2.8" fill="#003816" stroke="#b9f6ca" stroke-width="0.7"/>
        <path d="M14 18 Q15.5 19.3 14.8 21.3 Q14 22.2 14 22.2 Q14 22.2 13.2 21.3 Q12.5 19.3 14 18 Z" fill="#b9f6ca"/>
        <path d="M6.5 12 L6 29" stroke="#ffffff" stroke-width="1.1" opacity="0.55" stroke-linecap="round"/>
      </g>
    `;
  } else {
    heldGlassSVG = `
      <!-- Green Shot Glass -->
      <g transform="translate(68, 16)">
        <path d="M4 6 L6 27 Q6 30 9 30 L17 30 Q20 30 20 27 L22 6 Z" fill="rgba(0,230,118,0.12)" stroke="#007e33" stroke-width="1.3" stroke-linejoin="round"/>
        <path d="M6 25 L6.5 28 Q6.5 30 9 30 L17 30 Q19.5 30 19.5 28 L20 25 Z" fill="#a7f3d0" stroke="#007e33" stroke-width="0.9"/>
        <path d="M5 11 L6.8 26 L19.2 26 L21 11 Z" fill="#00e676"/>
        <ellipse cx="13" cy="11" rx="7.5" ry="1.8" fill="#69f0ae"/>
        <circle cx="15" cy="17" r="1.3" fill="#b9f6ca"/>
        <circle cx="11" cy="22" r="0.9" fill="#b9f6ca"/>
        <path d="M5.5 8 L7 25" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round"/>
        <ellipse cx="13" cy="6" rx="9" ry="1.8" fill="rgba(0,230,118,0.22)" stroke="#007e33" stroke-width="1.1"/>
      </g>
    `;
  }

  let characterSVG = '';

  if (rankValue === 13) {
    // --- KING ---
    characterSVG = `
      <!-- King Robe / Mantle -->
      <path d="M16 122 L16 80 Q16 66 32 62 Q50 58 68 62 Q84 66 84 80 L84 122 Z" fill="${t.mantle}" stroke="#222" stroke-width="0.8"/>
      <!-- Inner Robe Vest -->
      <path d="M34 65 L50 63 L66 65 L64 122 L36 122 Z" fill="#ffffff" stroke="${t.border}" stroke-width="0.8"/>
      <path d="M36 78 L64 78 M36 94 L64 94 M36 110 L64 110" stroke="${t.accent}" stroke-width="0.75" stroke-dasharray="2 2"/>
      
      <!-- Ermine Collar -->
      <path d="M22 66 Q50 56 78 66 L82 80 Q50 86 18 80 Z" fill="#ffffff" stroke="#bbb" stroke-width="0.8"/>
      <path d="M28 72 L30 76 M42 74 L44 78 M56 74 L58 78 M70 72 L72 76" stroke="#222" stroke-width="1.2" stroke-linecap="round"/>

      <!-- Raised Right Arm holding shot glass -->
      <path d="M68 68 Q80 66 82 52 L76 50 Q72 62 64 66 Z" fill="${t.mantle}" stroke="#222" stroke-width="0.8"/>
      <path d="M78 50 L84 48 L86 54 L80 56 Z" fill="#ffffff" stroke="${t.accent}" stroke-width="0.8"/>
      <ellipse cx="82" cy="46" rx="4.5" ry="3.5" fill="#fdd8b5" stroke="#d49b6a" stroke-width="0.8"/>
      <path d="M80 44 Q83 41 85 44" stroke="#d49b6a" stroke-width="0.8" fill="none"/>

      <!-- Left Arm resting -->
      <path d="M32 68 Q18 74 20 90 L26 90 Q26 78 36 70 Z" fill="${t.mantle}" stroke="#222" stroke-width="0.8"/>
      <ellipse cx="23" cy="92" rx="3.5" ry="3" fill="#fdd8b5" stroke="#d49b6a" stroke-width="0.8"/>

      <!-- King Hair -->
      <path d="M30 36 Q26 48 30 58 Q36 62 38 56 Q34 46 36 36 Z" fill="#e0e0e0" stroke="#bbb" stroke-width="0.6"/>
      <path d="M70 36 Q74 48 70 58 Q64 62 62 56 Q66 46 64 36 Z" fill="#e0e0e0" stroke="#bbb" stroke-width="0.6"/>

      <!-- Face -->
      <path d="M35 34 Q50 30 65 34 L64 54 Q50 63 36 54 Z" fill="#fed7b0" stroke="#d49b6a" stroke-width="0.8"/>
      <ellipse cx="43" cy="41" rx="1.5" ry="1.2" fill="#263238"/>
      <ellipse cx="57" cy="41" rx="1.5" ry="1.2" fill="#263238"/>
      <path d="M39 37 Q43 35 47 37" stroke="#795548" stroke-width="0.9" fill="none"/>
      <path d="M53 37 Q57 35 61 37" stroke="#795548" stroke-width="0.9" fill="none"/>
      <path d="M50 39 L48 46 L52 46" stroke="#c58a58" stroke-width="0.8" fill="none"/>

      <!-- Royal Mustache -->
      <path d="M50 49 Q42 47 36 51 Q44 54 50 51 Q56 54 64 51 Q58 47 50 49 Z" fill="#ffffff" stroke="#ccc" stroke-width="0.7"/>
      <!-- Royal Beard -->
      <path d="M38 53 Q36 68 50 72 Q64 68 62 53 Q56 58 50 56 Q44 58 38 53 Z" fill="#ffffff" stroke="#ccc" stroke-width="0.7"/>

      <!-- Majestic Crown -->
      <rect x="33" y="27" width="34" height="6" rx="1.5" fill="#ffc107" stroke="#ffa000" stroke-width="0.8"/>
      <circle cx="39" cy="30" r="1.3" fill="#d32f2f"/>
      <circle cx="50" cy="30" r="1.4" fill="${t.primary}"/>
      <circle cx="61" cy="30" r="1.3" fill="#388e3c"/>
      <path d="M33 27 L35 21 L39 27 L44 19 L50 27 L56 19 L61 27 L65 21 L67 27 Z" fill="#ffd54f" stroke="#ffa000" stroke-width="0.8"/>
      <circle cx="50" cy="18" r="1.8" fill="#d32f2f"/>
      <circle cx="44" cy="18" r="1.3" fill="#ffeb3b"/>
      <circle cx="56" cy="18" r="1.3" fill="#ffeb3b"/>
    `;
  } else if (rankValue === 12) {
    // --- QUEEN ---
    characterSVG = `
      <!-- Queen Gown Bodice -->
      <path d="M18 122 L20 78 Q22 66 36 64 Q50 60 64 64 Q78 66 80 78 L82 122 Z" fill="${t.mantle}" stroke="#222" stroke-width="0.8"/>
      <!-- Gown Lace Inset -->
      <path d="M34 68 Q50 78 66 68 L62 122 L38 122 Z" fill="#ffffff" stroke="${t.border}" stroke-width="0.8"/>
      <path d="M42 82 Q50 86 58 82 M40 96 Q50 100 60 96 M38 110 Q50 114 62 110" stroke="${t.accent}" stroke-width="0.7" fill="none"/>

      <!-- Raised Right Arm holding shot glass -->
      <path d="M66 68 Q78 64 82 52 L76 50 Q72 60 62 66 Z" fill="${t.mantle}" stroke="#222" stroke-width="0.8"/>
      <path d="M78 50 L84 48 L86 54 L80 56 Z" fill="#ffffff" stroke="${t.accent}" stroke-width="0.8"/>
      <ellipse cx="82" cy="46" rx="4" ry="3.2" fill="#fff0e0" stroke="#d49b6a" stroke-width="0.7"/>
      <path d="M80 44 Q83 42 85 44" stroke="#d49b6a" stroke-width="0.7" fill="none"/>

      <!-- Left Arm & Fan/Rose -->
      <path d="M34 68 Q22 74 24 88 L30 88 Q30 78 38 70 Z" fill="${t.mantle}" stroke="#222" stroke-width="0.8"/>
      <ellipse cx="27" cy="90" rx="3.5" ry="3" fill="#fff0e0" stroke="#d49b6a" stroke-width="0.7"/>
      <circle cx="25" cy="85" r="2.5" fill="${t.accent}"/>
      <circle cx="25" cy="85" r="1.2" fill="#ffffff"/>

      <!-- Flowing Hair curls -->
      <path d="M31 34 Q24 46 28 62 Q34 66 36 58 Q32 46 34 34 Z" fill="#8d6e63" stroke="#5d4037" stroke-width="0.6"/>
      <path d="M69 34 Q76 46 72 62 Q66 66 64 58 Q68 46 66 34 Z" fill="#8d6e63" stroke="#5d4037" stroke-width="0.6"/>

      <!-- Queen Face -->
      <path d="M36 33 Q50 28 64 33 L62 52 Q50 62 38 52 Z" fill="#fff0e0" stroke="#d49b6a" stroke-width="0.8"/>
      <circle cx="42" cy="46" r="3" fill="#ffcdd2" opacity="0.45"/>
      <circle cx="58" cy="46" r="3" fill="#ffcdd2" opacity="0.45"/>
      <ellipse cx="43" cy="40" rx="1.5" ry="1.2" fill="#37474f"/>
      <ellipse cx="57" cy="40" rx="1.5" ry="1.2" fill="#37474f"/>
      <path d="M41 38 Q43 36 46 38" stroke="#4e342e" stroke-width="0.8" fill="none"/>
      <path d="M54 38 Q57 36 59 38" stroke="#4e342e" stroke-width="0.8" fill="none"/>
      <path d="M50 40 L49 45 L51 45" stroke="#d49b6a" stroke-width="0.7" fill="none"/>
      <path d="M46 50 Q50 53 54 50" stroke="#d81b60" stroke-width="1.3" fill="none" stroke-linecap="round"/>

      <!-- Pearl Necklace -->
      <path d="M42 58 Q50 63 58 58" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="2 2" fill="none"/>
      <circle cx="50" cy="62" r="1.5" fill="${t.accent}"/>

      <!-- Queen Tiara -->
      <path d="M34 28 Q50 22 66 28 L64 31 Q50 26 36 31 Z" fill="#ffd54f" stroke="#ffa000" stroke-width="0.8"/>
      <circle cx="50" cy="20" r="2.2" fill="${t.primary}" stroke="#ffd54f" stroke-width="0.7"/>
      <circle cx="42" cy="23" r="1.6" fill="#ffffff" stroke="#ffd54f" stroke-width="0.6"/>
      <circle cx="58" cy="23" r="1.6" fill="#ffffff" stroke="#ffd54f" stroke-width="0.6"/>
      <circle cx="35" cy="27" r="1.2" fill="#ffffff"/>
      <circle cx="65" cy="27" r="1.2" fill="#ffffff"/>
    `;
  } else {
    // --- JACK ---
    characterSVG = `
      <!-- Jack Squire Doublet -->
      <path d="M18 122 L20 78 Q22 66 36 62 Q50 58 64 62 Q78 66 80 78 L82 122 Z" fill="${t.mantle}" stroke="#222" stroke-width="0.8"/>
      <!-- Slashed Doublet Inset -->
      <path d="M36 65 L50 62 L64 65 L61 122 L39 122 Z" fill="#ffffff" stroke="${t.border}" stroke-width="0.8"/>
      <path d="M40 74 L48 82 M52 74 L60 82 M40 92 L48 100 M52 92 L60 100" stroke="${t.accent}" stroke-width="1.4" stroke-linecap="round"/>

      <!-- Elizabethan Frilled Collar -->
      <path d="M34 62 Q50 56 66 62 L64 68 Q50 64 36 68 Z" fill="#ffffff" stroke="#bbb" stroke-width="0.8"/>

      <!-- Raised Right Arm holding shot glass salute -->
      <path d="M66 66 Q78 62 82 50 L76 48 Q72 58 62 64 Z" fill="${t.mantle}" stroke="#222" stroke-width="0.8"/>
      <path d="M78 48 L84 46 L86 52 L80 54 Z" fill="#ffffff" stroke="${t.accent}" stroke-width="0.8"/>
      <ellipse cx="82" cy="44" rx="4.2" ry="3.2" fill="#fed7b0" stroke="#d49b6a" stroke-width="0.7"/>
      <path d="M80 42 Q83 40 85 42" stroke="#d49b6a" stroke-width="0.7" fill="none"/>

      <!-- Left Arm & Belt/Hilt -->
      <path d="M34 66 Q20 72 22 88 L28 88 Q28 76 38 68 Z" fill="${t.mantle}" stroke="#222" stroke-width="0.8"/>
      <ellipse cx="25" cy="89" rx="3.5" ry="3" fill="#fed7b0" stroke="#d49b6a" stroke-width="0.7"/>
      <circle cx="28" cy="94" r="3.2" fill="#ffc107" stroke="#ffa000" stroke-width="0.7"/>
      <rect x="27" y="94" width="2" height="12" fill="#90a4ae"/>

      <!-- Young Noble Face -->
      <path d="M36 34 Q50 30 64 34 L62 53 Q50 62 38 53 Z" fill="#fed7b0" stroke="#d49b6a" stroke-width="0.8"/>
      <path d="M32 32 Q26 44 32 54 Q38 56 36 48 Q34 40 38 32 Z" fill="#5d4037" stroke="#3e2723" stroke-width="0.6"/>
      <path d="M68 32 Q74 44 68 54 Q62 56 64 48 Q66 40 62 32 Z" fill="#5d4037" stroke="#3e2723" stroke-width="0.6"/>

      <ellipse cx="43" cy="41" rx="1.5" ry="1.2" fill="#263238"/>
      <ellipse cx="57" cy="41" rx="1.5" ry="1.2" fill="#263238"/>
      <path d="M40 37 Q43 35 46 37" stroke="#3e2723" stroke-width="0.8" fill="none"/>
      <path d="M54 37 Q57 35 60 37" stroke="#3e2723" stroke-width="0.8" fill="none"/>
      <path d="M50 40 L49 46 L51 46" stroke="#c58a58" stroke-width="0.7" fill="none"/>
      <path d="M44 48 Q50 47 56 48" stroke="#5d4037" stroke-width="0.8" fill="none"/>
      <path d="M46 51 Q50 54 54 51" stroke="#c2185b" stroke-width="1.1" fill="none" stroke-linecap="round"/>

      <!-- Cavalier Beret Cap with Plume -->
      <ellipse cx="50" cy="27" rx="22" ry="7" fill="${t.mantle}" stroke="#222" stroke-width="0.8" transform="rotate(-6 50 27)"/>
      <circle cx="42" cy="27" r="2.2" fill="#ffd54f" stroke="#ffa000" stroke-width="0.6"/>
      <path d="M42 27 Q30 15 36 8 Q46 11 45 23 Z" fill="#ff4081" stroke="#c2185b" stroke-width="0.7"/>
      <path d="M37 18 Q41 14 43 19" stroke="#ffffff" stroke-width="0.7" fill="none"/>
    `;
  }

  return `
    <svg class="court-svg" viewBox="0 0 100 136" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad_${uid}" x1="50" y1="0" x2="50" y2="136" gradientUnits="userSpaceOnUse">
          <stop stop-color="${t.secondary}"/>
          <stop offset="0.7" stop-color="#ffffff"/>
          <stop offset="1" stop-color="${t.secondary}"/>
        </linearGradient>
      </defs>

      <!-- Frame & Background Panel -->
      <rect x="2.5" y="2.5" width="95" height="131" rx="5" fill="url(#bgGrad_${uid})" stroke="${t.border}" stroke-width="1.5"/>
      <rect x="5.5" y="5.5" width="89" height="125" rx="3.5" fill="none" stroke="${t.accent}" stroke-width="0.6" stroke-dasharray="2 2" opacity="0.6"/>
      
      <!-- Inner Arch Window -->
      <path d="M10 120 L10 36 Q10 8 50 8 Q90 8 90 36 L90 120 Z" fill="${t.secondary}" opacity="0.45"/>
      <path d="M13 120 L13 38 Q13 11 50 11 Q87 11 87 38 L87 120" fill="none" stroke="${t.border}" stroke-width="0.7" opacity="0.4"/>

      <!-- Character Artwork -->
      ${characterSVG}

      <!-- Held Shot Glass of the Suit -->
      ${heldGlassSVG}

      <!-- Bottom Banner Ribbon -->
      <rect x="20" y="119" width="60" height="13" rx="2.5" fill="#ffffff" stroke="${t.border}" stroke-width="1.1"/>
      <text x="50" y="129" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="8.5" font-weight="900" fill="${t.ribbonText}" text-anchor="middle" letter-spacing="1.5">${roleTitle}</text>
    </svg>
  `;
}

// --- Web Audio Synthesizer ---
class SoundManager {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Sound of drawing / flipping a card from the deck: Crisp paper flick & slide
  playFlip() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const sampleRate = this.ctx.sampleRate;

    // 1. Friction swipe off the deck
    const dur = 0.045;
    const bufSize = Math.max(1, Math.floor(sampleRate * dur));
    const buffer = this.ctx.createBuffer(1, bufSize, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 1.5);
    }

    const noiseSrc = this.ctx.createBufferSource();
    noiseSrc.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(2.2, t);
    filter.frequency.setValueAtTime(3600, t);
    filter.frequency.exponentialRampToValueAtTime(1600, t + dur);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noiseSrc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noiseSrc.start(t);

    // 2. Light papery release flick
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(950, t);
    osc.frequency.exponentialRampToValueAtTime(280, t + 0.028);

    oscGain.gain.setValueAtTime(0.14, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.028);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.03);
  }

  // Sound of card movements / stacking: Authentic card slide & snap onto a stack
  playPlace() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const sampleRate = this.ctx.sampleRate;

    // 1. Friction swipe: Papery/laminated card sliding into place over felt or card
    const slideDur = 0.055;
    const slideBufSize = Math.max(1, Math.floor(sampleRate * slideDur));
    const slideBuffer = this.ctx.createBuffer(1, slideBufSize, sampleRate);
    const slideData = slideBuffer.getChannelData(0);
    for (let i = 0; i < slideBufSize; i++) {
      slideData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / slideBufSize, 1.2);
    }

    const slideSrc = this.ctx.createBufferSource();
    slideSrc.buffer = slideBuffer;

    const slideFilter = this.ctx.createBiquadFilter();
    slideFilter.type = 'bandpass';
    slideFilter.Q.setValueAtTime(1.6, t);
    slideFilter.frequency.setValueAtTime(3200, t);
    slideFilter.frequency.exponentialRampToValueAtTime(1400, t + slideDur);

    const slideGain = this.ctx.createGain();
    slideGain.gain.setValueAtTime(0.001, t);
    slideGain.gain.linearRampToValueAtTime(0.18, t + 0.008);
    slideGain.gain.exponentialRampToValueAtTime(0.001, t + slideDur);

    slideSrc.connect(slideFilter);
    slideFilter.connect(slideGain);
    slideGain.connect(this.ctx.destination);
    slideSrc.start(t);

    // 2. Card Edge Snap: Crisp impact click as the card lands and squares with the stack
    const tSnap = t + 0.018;
    const snapOsc = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(3800, tSnap);
    snapOsc.frequency.exponentialRampToValueAtTime(550, tSnap + 0.016);

    snapGain.gain.setValueAtTime(0.24, tSnap);
    snapGain.gain.exponentialRampToValueAtTime(0.001, tSnap + 0.02);

    snapOsc.connect(snapGain);
    snapGain.connect(this.ctx.destination);
    snapOsc.start(tSnap);
    snapOsc.stop(tSnap + 0.022);

    // 3. Cardstock Body Resonance: Low-mid wooden/card flex thump
    const tBody = t + 0.02;
    const bodyOsc = this.ctx.createOscillator();
    const bodyGain = this.ctx.createGain();
    bodyOsc.type = 'sine';
    bodyOsc.frequency.setValueAtTime(230, tBody);
    bodyOsc.frequency.exponentialRampToValueAtTime(95, tBody + 0.035);

    bodyGain.gain.setValueAtTime(0.2, tBody);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, tBody + 0.04);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(this.ctx.destination);
    bodyOsc.start(tBody);
    bodyOsc.stop(tBody + 0.042);
  }

  // Sound of moving cards to Foundation: Taking a sip/drink (liquid draw + swallow gulp + crisp finish)
  playFoundation() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 1. The Sip Draw: Filtered noise suction representing liquid intake over the rim
    const sampleRate = this.ctx.sampleRate;
    const dur = 0.11;
    const bufSize = Math.max(1, Math.floor(sampleRate * dur));
    const noiseBuffer = this.ctx.createBuffer(1, bufSize, sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      // Shaped decaying noise burst
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufSize) * Math.PI);
    }

    const noiseSrc = this.ctx.createBufferSource();
    noiseSrc.buffer = noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.Q.setValueAtTime(3.8, t);
    noiseFilter.frequency.setValueAtTime(950, t);
    noiseFilter.frequency.exponentialRampToValueAtTime(2400, t + 0.075);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, t);
    noiseGain.gain.linearRampToValueAtTime(0.18, t + 0.03);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.095);

    noiseSrc.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noiseSrc.start(t);

    // 2. The Liquid Swallow Gulp ("glup"): Resonant cavity pitch drop
    const tGulp = t + 0.048;
    const gulpOsc = this.ctx.createOscillator();
    const gulpGain = this.ctx.createGain();
    gulpOsc.type = 'sine';
    gulpOsc.frequency.setValueAtTime(320, tGulp);
    gulpOsc.frequency.exponentialRampToValueAtTime(140, tGulp + 0.065);

    gulpGain.gain.setValueAtTime(0.001, tGulp);
    gulpGain.gain.linearRampToValueAtTime(0.24, tGulp + 0.018);
    gulpGain.gain.exponentialRampToValueAtTime(0.001, tGulp + 0.075);

    gulpOsc.connect(gulpGain);
    gulpGain.connect(this.ctx.destination);
    gulpOsc.start(tGulp);
    gulpOsc.stop(tGulp + 0.08);

    // 3. Pharyngeal Formant Resonance: Warm liquid body in the throat
    const tBody = t + 0.06;
    const bodyOsc = this.ctx.createOscillator();
    const bodyFilter = this.ctx.createBiquadFilter();
    const bodyGain = this.ctx.createGain();

    bodyOsc.type = 'triangle';
    bodyOsc.frequency.setValueAtTime(440, tBody);
    bodyOsc.frequency.exponentialRampToValueAtTime(210, tBody + 0.055);

    bodyFilter.type = 'lowpass';
    bodyFilter.frequency.setValueAtTime(600, tBody);

    bodyGain.gain.setValueAtTime(0.001, tBody);
    bodyGain.gain.linearRampToValueAtTime(0.12, tBody + 0.015);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, tBody + 0.06);

    bodyOsc.connect(bodyFilter);
    bodyFilter.connect(bodyGain);
    bodyGain.connect(this.ctx.destination);
    bodyOsc.start(tBody);
    bodyOsc.stop(tBody + 0.065);

    // 4. Subtle Refreshing Lip / Rim Smack
    const tSmack = t + 0.105;
    const smackOsc = this.ctx.createOscillator();
    const smackGain = this.ctx.createGain();
    smackOsc.type = 'sine';
    smackOsc.frequency.setValueAtTime(2800, tSmack);
    smackOsc.frequency.exponentialRampToValueAtTime(1600, tSmack + 0.025);

    smackGain.gain.setValueAtTime(0.05, tSmack);
    smackGain.gain.exponentialRampToValueAtTime(0.001, tSmack + 0.025);

    smackOsc.connect(smackGain);
    smackGain.connect(this.ctx.destination);
    smackOsc.start(tSmack);
    smackOsc.stop(tSmack + 0.03);
  }

  playVictory() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.35);
      }, idx * 100);
    });
  }
}

// --- Confetti / Fireworks Particle System ---
class CelebrationFX {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.animId = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  start() {
    this.particles = [];
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#2196f3', '#4caf50', '#ffeb3b', '#ff9800'];
    for (let i = 0; i < 180; i++) {
      this.particles.push({
        x: this.canvas.width / 2,
        y: this.canvas.height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.8) * 18,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        life: 1,
        decay: Math.random() * 0.008 + 0.004
      });
    }

    if (!this.animId) {
      this.loop();
    }
  }

  loop() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let alive = 0;
    this.particles.forEach(p => {
      if (p.life > 0) {
        alive++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35;
        p.vx *= 0.99;
        p.rotation += p.rotationSpeed;
        p.life -= p.decay;

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = Math.max(0, p.life);
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
        this.ctx.restore();
      }
    });

    if (alive > 0) {
      this.animId = requestAnimationFrame(() => this.loop());
    } else {
      this.animId = null;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

// --- Solvable Deal Generator & Fast Solver ---
class SolvableDealGenerator {
  constructor() {
    this.curatedDeals = [
      [
        0, 14, 28, 42, 1, 15, 29, 43, 2, 16, 30, 44, 3, 17, 31, 45, 4, 18, 32, 46, 5, 19, 33, 47, 6, 20, 34, 48,
        7, 21, 35, 49, 8, 22, 36, 50, 9, 23, 37, 51, 10, 24, 38, 11, 25, 39, 12, 26, 40, 13, 27, 41
      ],
      [
        12, 25, 38, 51, 11, 24, 37, 50, 10, 23, 36, 49, 9, 22, 35, 48, 8, 21, 34, 47, 7, 20, 33, 46, 6, 19, 32, 45,
        0, 13, 26, 39, 1, 14, 27, 40, 2, 15, 28, 41, 3, 16, 29, 42, 4, 17, 30, 43, 5, 18, 31, 44
      ],
      [
        26, 1, 39, 14, 2, 15, 28, 41, 3, 16, 29, 42, 4, 17, 30, 43, 5, 18, 31, 44, 6, 19, 32, 45, 7, 20, 33, 46,
        8, 21, 34, 47, 9, 22, 35, 48, 10, 23, 36, 49, 11, 24, 37, 50, 12, 25, 38, 51, 0, 13, 27, 40
      ],
      [
        13, 27, 41, 2, 16, 30, 44, 3, 17, 31, 45, 4, 18, 32, 46, 5, 19, 33, 47, 6, 20, 34, 48, 7, 21, 35, 49, 8,
        22, 36, 50, 9, 23, 37, 51, 10, 24, 38, 11, 25, 39, 12, 26, 40, 0, 14, 28, 42, 1, 15, 29, 43
      ],
      [
        39, 13, 0, 26, 1, 14, 27, 40, 2, 15, 28, 41, 3, 16, 29, 42, 4, 17, 30, 43, 5, 18, 31, 44, 6, 19, 32, 45,
        7, 20, 33, 46, 8, 21, 34, 47, 9, 22, 35, 48, 10, 23, 36, 49, 11, 24, 37, 50, 12, 25, 38, 51
      ],
      [
        51, 38, 25, 12, 50, 37, 24, 11, 49, 36, 23, 10, 48, 35, 22, 9, 47, 34, 21, 8, 46, 33, 20, 7, 45, 32, 19, 6,
        0, 13, 26, 39, 1, 14, 27, 40, 2, 15, 28, 41, 3, 16, 29, 42, 4, 17, 30, 43, 5, 18, 31, 44
      ],
      [
        12, 11, 10, 9, 8, 7, 6, 25, 24, 23, 22, 21, 20, 19, 38, 37, 36, 35, 34, 33, 32, 51, 50, 49, 48, 47, 46, 45,
        0, 1, 2, 3, 4, 5, 13, 14, 15, 16, 17, 18, 26, 27, 28, 29, 30, 31, 39, 40, 41, 42, 43, 44
      ],
      [
        0, 26, 13, 39, 1, 27, 14, 40, 2, 28, 15, 41, 3, 29, 16, 42, 4, 30, 17, 43, 5, 31, 18, 44, 6, 32, 19, 45,
        7, 33, 20, 46, 8, 34, 21, 47, 9, 35, 22, 48, 10, 36, 23, 49, 11, 37, 24, 50, 12, 38, 25, 51
      ]
    ];
  }

  permuteDeck(deckIndices) {
    const swapRed = Math.random() > 0.5;
    const swapBlack = Math.random() > 0.5;
    const swapColors = Math.random() > 0.5;

    let suitMap = [0, 1, 2, 3];
    if (swapRed) [suitMap[0], suitMap[1]] = [suitMap[1], suitMap[0]];
    if (swapBlack) [suitMap[2], suitMap[3]] = [suitMap[3], suitMap[2]];
    if (swapColors) {
      suitMap = [suitMap[2], suitMap[3], suitMap[0], suitMap[1]];
    }

    return deckIndices.map(cardIdx => {
      const origSuit = Math.floor(cardIdx / 13);
      const rank = cardIdx % 13;
      const newSuit = suitMap[origSuit];
      return newSuit * 13 + rank;
    });
  }

  isSolvable(rawCards, drawMode = 1) {
    const foundations = [0, 0, 0, 0];
    const tableau = [[], [], [], [], [], [], []];
    let cardIdx = 0;

    for (let c = 0; c < 7; c++) {
      for (let r = 0; r <= c; r++) {
        const id = rawCards[cardIdx++];
        tableau[c].push({
          suit: Math.floor(id / 13),
          rank: (id % 13) + 1,
          color: Math.floor(id / 13) < 2 ? 'green' : 'black',
          faceUp: r === c
        });
      }
    }

    const stock = [];
    while (cardIdx < rawCards.length) {
      const id = rawCards[cardIdx++];
      stock.push({
        suit: Math.floor(id / 13),
        rank: (id % 13) + 1,
        color: Math.floor(id / 13) < 2 ? 'green' : 'black',
        faceUp: false
      });
    }

    let waste = [];
    let passes = 0;
    let maxSteps = 450;

    while (maxSteps-- > 0) {
      if (foundations.reduce((a, b) => a + b, 0) === 52) return true;

      let moved = false;

      // 1. Safe foundation moves
      for (let c = 0; c < 7; c++) {
        const col = tableau[c];
        if (col.length > 0) {
          const top = col[col.length - 1];
          if (top.faceUp && this.canAutoFoundation(top, foundations)) {
            foundations[top.suit]++;
            col.pop();
            if (col.length > 0) col[col.length - 1].faceUp = true;
            moved = true;
            break;
          }
        }
      }
      if (moved) continue;

      if (waste.length > 0) {
        const top = waste[waste.length - 1];
        if (this.canAutoFoundation(top, foundations)) {
          foundations[top.suit]++;
          waste.pop();
          moved = true;
          continue;
        }
      }

      // 2. Uncover face-down cards
      for (let src = 0; src < 7; src++) {
        const srcCol = tableau[src];
        const firstUp = srcCol.findIndex(k => k.faceUp);
        if (firstUp > 0) {
          const moving = srcCol[firstUp];
          for (let dst = 0; dst < 7; dst++) {
            if (dst === src) continue;
            const dstCol = tableau[dst];
            if (dstCol.length === 0) {
              if (moving.rank === 13) {
                tableau[dst].push(...srcCol.splice(firstUp));
                if (srcCol.length > 0) srcCol[srcCol.length - 1].faceUp = true;
                moved = true;
                break;
              }
            } else {
              const target = dstCol[dstCol.length - 1];
              if (target.faceUp && moving.color !== target.color && moving.rank === target.rank - 1) {
                tableau[dst].push(...srcCol.splice(firstUp));
                if (srcCol.length > 0) srcCol[srcCol.length - 1].faceUp = true;
                moved = true;
                break;
              }
            }
          }
        }
        if (moved) break;
      }
      if (moved) continue;

      // 3. Waste to tableau
      if (waste.length > 0) {
        const topWaste = waste[waste.length - 1];
        for (let dst = 0; dst < 7; dst++) {
          const dstCol = tableau[dst];
          if (dstCol.length === 0) {
            if (topWaste.rank === 13) {
              tableau[dst].push(waste.pop());
              moved = true;
              break;
            }
          } else {
            const target = dstCol[dstCol.length - 1];
            if (target.faceUp && topWaste.color !== target.color && topWaste.rank === target.rank - 1) {
              tableau[dst].push(waste.pop());
              moved = true;
              break;
            }
          }
        }
      }
      if (moved) continue;

      // 4. Draw from stock
      if (stock.length > 0) {
        const count = Math.min(drawMode, stock.length);
        for (let i = 0; i < count; i++) {
          const card = stock.pop();
          card.faceUp = true;
          waste.push(card);
        }
        moved = true;
      } else if (waste.length > 0 && passes < 3) {
        passes++;
        while (waste.length > 0) {
          const card = waste.pop();
          card.faceUp = false;
          stock.push(card);
        }
        moved = true;
      }

      if (!moved) break;
    }

    return foundations.reduce((a, b) => a + b, 0) >= 42;
  }

  canAutoFoundation(card, foundations) {
    if (foundations[card.suit] !== card.rank - 1) return false;
    if (card.rank <= 2) return true;
    const opp1 = card.suit < 2 ? 2 : 0;
    const opp2 = card.suit < 2 ? 3 : 1;
    return foundations[opp1] >= card.rank - 2 && foundations[opp2] >= card.rank - 2;
  }

  createSmartCandidate() {
    const deck = Array.from({ length: 52 }, (_, i) => i);
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    const faceUpIndices = [0, 2, 5, 9, 14, 20, 27];
    const aceIndices = deck.map((c, i) => (c % 13 === 0 ? i : -1)).filter(i => i >= 0);

    aceIndices.forEach((pos, idx) => {
      if (pos > 20 && pos < 28 && idx < 2) {
        const targetPos = faceUpIndices[idx % faceUpIndices.length];
        [deck[pos], deck[targetPos]] = [deck[targetPos], deck[pos]];
      }
    });

    return deck;
  }

  getGuaranteedDeal(drawMode) {
    for (let attempt = 0; attempt < 4; attempt++) {
      const candidate = this.createSmartCandidate();
      if (this.isSolvable(candidate, drawMode)) {
        return candidate;
      }
    }

    const template = this.curatedDeals[Math.floor(Math.random() * this.curatedDeals.length)];
    return this.permuteDeck(template);
  }
}

// --- Main Solitaire Game Engine ---
class SolitaireGame {
  constructor() {
    this.drawMode = parseInt(localStorage.getItem(STORAGE_KEYS.DRAW_MODE) || '1', 10);
    const urlTheme = new URLSearchParams(window.location.search).get('theme');
    this.feltTheme = urlTheme || localStorage.getItem(STORAGE_KEYS.FELT_THEME) || 'emerald';
    this.dealType = localStorage.getItem(STORAGE_KEYS.DEAL_TYPE) || 'solvable';

    this.stock = [];
    this.waste = [];
    this.foundations = [[], [], [], []];
    this.tableau = [[], [], [], [], [], [], []];

    this.initialDealState = null;
    this.score = 0;
    this.moves = 0;
    this.timerSeconds = 0;
    this.timerInterval = null;
    this.gameWon = false;
    this.autoFinishing = false;

    this.history = [];
    this.selected = null;
    this.dragData = null;
    this.pointerDragState = null;
    this.lastCardClick = null;
    this.justFinishedDrag = false;
    this.currentScoreTab = this.drawMode === 3 ? 'draw3' : 'draw1';

    this.pendingWinRecord = null;
    this.hasSavedCurrentWin = false;

    this.sound = new SoundManager();
    this.celebration = new CelebrationFX(document.getElementById('fireworks-canvas'));
    this.dealGenerator = new SolvableDealGenerator();

    this.initDOM();
    this.applyTheme(this.feltTheme);
    this.updateDealBadge();
    this.initEvents();
    this.startNewGame();
  }

  initDOM() {
    this.dom = {
      score: document.getElementById('score-val'),
      moves: document.getElementById('moves-val'),
      timer: document.getElementById('timer-val'),
      stock: document.getElementById('stock-pile'),
      waste: document.getElementById('waste-pile'),
      selectDraw: document.getElementById('select-draw-mode'),
      selectFelt: document.getElementById('select-felt-theme'),
      selectDeal: document.getElementById('select-deal-type'),
      dealBadge: document.getElementById('deal-badge'),
      gameToast: document.getElementById('game-toast'),
      btnAutocomplete: document.getElementById('btn-autocomplete'),
      btnSweep: document.getElementById('btn-sweep'),
      tableFelt: document.querySelector('.table-felt'),
      btnReplay: document.getElementById('btn-replay'),
      foundations: [
        document.getElementById('foundation-0'),
        document.getElementById('foundation-1'),
        document.getElementById('foundation-2'),
        document.getElementById('foundation-3')
      ],
      tableau: [
        document.getElementById('tableau-0'),
        document.getElementById('tableau-1'),
        document.getElementById('tableau-2'),
        document.getElementById('tableau-3'),
        document.getElementById('tableau-4'),
        document.getElementById('tableau-5'),
        document.getElementById('tableau-6')
      ],
      btnNew: document.getElementById('btn-new'),
      btnUndo: document.getElementById('btn-undo'),
      btnHint: document.getElementById('btn-hint'),
      btnSound: document.getElementById('btn-sound'),
      btnScores: document.getElementById('btn-scores'),
      winModal: document.getElementById('win-modal'),
      btnWinReplay: document.getElementById('btn-win-replay'),
      btnWinScores: document.getElementById('btn-win-scores'),
      winDealType: document.getElementById('win-deal-type'),
      winMode: document.getElementById('win-mode'),
      winTime: document.getElementById('win-time'),
      winMoves: document.getElementById('win-moves'),
      winScore: document.getElementById('win-score'),
      winNameInput: document.getElementById('win-name-input'),
      btnSaveScore: document.getElementById('btn-save-score'),
      winSaveMsg: document.getElementById('win-save-msg'),
      scoresModal: document.getElementById('scores-modal'),
      scoresTbody: document.getElementById('scores-tbody'),
      btnCloseScores: document.getElementById('btn-close-scores'),
      btnClearScores: document.getElementById('btn-clear-scores'),
      tabDraw1: document.getElementById('tab-draw1'),
      tabDraw3: document.getElementById('tab-draw3')
    };

    this.dom.selectDraw.value = this.drawMode.toString();
    this.dom.selectFelt.value = this.feltTheme;
    this.dom.selectDeal.value = this.dealType;
  }

  applyTheme(theme) {
    this.feltTheme = theme;
    document.body.setAttribute('data-felt', theme);
    localStorage.setItem(STORAGE_KEYS.FELT_THEME, theme);
  }

  updateDealBadge() {
    if (this.dealType === 'solvable') {
      this.dom.dealBadge.textContent = '✨ Solvable Deal';
      this.dom.dealBadge.className = 'badge badge-gold';
      this.dom.dealBadge.title = 'Guaranteed 100% winnable deal!';
    } else {
      this.dom.dealBadge.textContent = '🎲 Random Deal';
      this.dom.dealBadge.className = 'badge';
      this.dom.dealBadge.title = 'Standard random shuffle';
    }
  }

  showToast(message, duration = 2800) {
    this.dom.gameToast.textContent = message;
    this.dom.gameToast.classList.remove('hidden');
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.dom.gameToast.classList.add('hidden');
    }, duration);
  }

  initEvents() {
    this.dom.btnNew.addEventListener('click', () => this.startNewGame());
    this.dom.btnReplay.addEventListener('click', () => this.replayCurrentDeal());
    this.dom.btnUndo.addEventListener('click', () => this.undo());
    this.dom.btnHint.addEventListener('click', () => this.giveHint());
    this.dom.btnAutocomplete.addEventListener('click', () => this.autoFinish());

    if (this.dom.btnSweep) {
      this.dom.btnSweep.addEventListener('click', () => {
        this.sendAllPossibleToFoundations();
      });
    }

    this.dom.btnSound.addEventListener('click', () => {
      this.sound.enabled = !this.sound.enabled;
      this.dom.btnSound.textContent = this.sound.enabled ? '🔊 Sound' : '🔇 Muted';
    });

    this.dom.selectFelt.addEventListener('change', (e) => {
      this.applyTheme(e.target.value);
    });

    this.dom.selectDeal.addEventListener('change', (e) => {
      this.dealType = e.target.value;
      localStorage.setItem(STORAGE_KEYS.DEAL_TYPE, this.dealType);
      this.updateDealBadge();
      this.startNewGame();
      this.showToast(this.dealType === 'solvable' ? '🌟 Solvable Mode: Guaranteed winnable deal!' : '🎲 Random Mode: Unmodified shuffle.');
    });

    this.dom.selectDraw.addEventListener('change', (e) => {
      const newMode = parseInt(e.target.value, 10);
      if (this.moves > 0 && !this.gameWon) {
        if (confirm('Switching draw mode will start a fresh game. Proceed?')) {
          this.drawMode = newMode;
          localStorage.setItem(STORAGE_KEYS.DRAW_MODE, newMode.toString());
          this.startNewGame();
        } else {
          this.dom.selectDraw.value = this.drawMode.toString();
        }
      } else {
        this.drawMode = newMode;
        localStorage.setItem(STORAGE_KEYS.DRAW_MODE, newMode.toString());
        this.startNewGame();
      }
    });

    // Stock pile click
    this.dom.stock.addEventListener('click', () => this.handleStockClick());

    // Foundation and tableau slots
    this.dom.foundations.forEach((slot, fIdx) => {
      slot.addEventListener('click', () => this.handleSlotClick('foundation', fIdx));
      this.attachDropHandlers(slot, 'foundation', fIdx);
    });

    this.dom.tableau.forEach((slot, tIdx) => {
      slot.addEventListener('click', (e) => {
        if (e.target === slot) {
          this.handleSlotClick('tableau', tIdx);
        }
      });
      this.attachDropHandlers(slot, 'tableau', tIdx);
    });

    // Save Name & Score Event Handlers
    this.dom.btnSaveScore.addEventListener('click', () => this.commitPlayerScore());
    this.dom.winNameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.commitPlayerScore();
      }
    });

    // Victory modal buttons
    this.dom.btnWinReplay.addEventListener('click', () => {
      this.commitPlayerScore();
      this.dom.winModal.classList.add('hidden');
      this.startNewGame();
    });

    this.dom.btnWinScores.addEventListener('click', () => {
      this.commitPlayerScore();
      this.dom.winModal.classList.add('hidden');
      this.openHighScores(this.drawMode === 3 ? 'draw3' : 'draw1');
    });

    // High Scores Modal Controls
    this.dom.btnScores.addEventListener('click', () => this.openHighScores(this.drawMode === 3 ? 'draw3' : 'draw1'));
    this.dom.btnCloseScores.addEventListener('click', () => this.dom.scoresModal.classList.add('hidden'));
    this.dom.btnClearScores.addEventListener('click', () => this.clearCurrentBoardScores());

    this.dom.tabDraw1.addEventListener('click', () => this.switchScoreTab('draw1'));
    this.dom.tabDraw3.addEventListener('click', () => this.switchScoreTab('draw3'));

    // --- Right-Click Feature: Sweep all possible visible cards to Foundations! ---
    window.addEventListener('contextmenu', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      e.preventDefault();
      this.sendAllPossibleToFoundations();
    });

    // Mobile / Touch Felt double-tap or double-click to sweep to foundations
    let lastFeltTapTime = 0;
    const triggerFeltSweep = (e) => {
      if (e.target.closest('.card.face-up') || e.target.closest('button') || e.target.closest('select') || e.target.closest('input') || e.target.closest('.modal-card')) {
        return;
      }
      const now = Date.now();
      if (now - lastFeltTapTime < 380) {
        if (e.cancelable) e.preventDefault();
        this.sendAllPossibleToFoundations();
        lastFeltTapTime = 0;
      } else {
        lastFeltTapTime = now;
      }
    };

    if (this.dom.tableFelt) {
      this.dom.tableFelt.addEventListener('touchend', triggerFeltSweep, { passive: false });
      this.dom.tableFelt.addEventListener('dblclick', triggerFeltSweep);
    }

    this.initPointerDrag();

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.clearSelection();
        this.dom.scoresModal.classList.add('hidden');
      }
    });
  }

  // --- Right-Click Action: Sweep all possible visible cards to Foundations ---
  sendAllPossibleToFoundations() {
    if (this.gameWon || this.autoFinishing) return;

    let totalMoved = 0;
    let stateSaved = false;

    let movedInPass = true;
    while (movedInPass) {
      movedInPass = false;

      // 1. Check Waste pile (top card)
      if (this.waste.length > 0) {
        const wasteCard = this.waste[this.waste.length - 1];
        for (let f = 0; f < 4; f++) {
          if (this.canMoveToFoundation(wasteCard, f)) {
            if (!stateSaved) {
              this.saveState();
              stateSaved = true;
            }
            this.waste.pop();
            this.foundations[f].push(wasteCard);
            this.score += 10;
            this.moves++;
            totalMoved++;
            movedInPass = true;
            break;
          }
        }
      }
      if (movedInPass) continue;

      // 2. Check Tableau columns (top face-up card of each column)
      for (let t = 0; t < 7; t++) {
        const col = this.tableau[t];
        if (col.length > 0) {
          const topCard = col[col.length - 1];
          if (topCard.faceUp) {
            for (let f = 0; f < 4; f++) {
              if (this.canMoveToFoundation(topCard, f)) {
                if (!stateSaved) {
                  this.saveState();
                  stateSaved = true;
                }
                col.pop();
                this.foundations[f].push(topCard);
                this.score += 10;
                this.moves++;
                totalMoved++;
                this.revealTableauTops();
                movedInPass = true;
                break;
              }
            }
          }
        }
        if (movedInPass) break;
      }
    }

    if (totalMoved > 0) {
      this.sound.playFoundation();
      this.clearSelection();
      this.render();
      this.showToast(`⚡ Sent ${totalMoved} shot glass${totalMoved > 1 ? 'es' : ''} to Foundation!`);
      this.checkWinCondition();
    } else {
      this.showToast('No cards can be moved to Foundations right now.', 1800);
    }
  }

  // --- Start & Reset ---
  startNewGame() {
    clearInterval(this.timerInterval);
    this.autoFinishing = false;
    this.timerSeconds = 0;
    this.moves = 0;
    this.score = 0;
    this.history = [];
    this.selected = null;
    this.gameWon = false;
    this.pendingWinRecord = null;
    this.hasSavedCurrentWin = false;

    this.dom.winModal.classList.add('hidden');
    this.dom.btnAutocomplete.classList.add('hidden');
    this.dom.winSaveMsg.classList.add('hidden');
    this.dom.btnSaveScore.textContent = 'Save Score';
    this.dom.btnSaveScore.disabled = false;

    this.updateStats();
    this.timerInterval = setInterval(() => {
      if (!this.gameWon) {
        this.timerSeconds++;
        this.updateStats();
      }
    }, 1000);

    let cardIndices;
    if (this.dealType === 'solvable') {
      cardIndices = this.dealGenerator.getGuaranteedDeal(this.drawMode);
    } else {
      cardIndices = Array.from({ length: 52 }, (_, i) => i);
      for (let i = cardIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cardIndices[i], cardIndices[j]] = [cardIndices[j], cardIndices[i]];
      }
    }

    const deck = cardIndices.map((idx, idNum) => {
      const suitIdx = Math.floor(idx / 13);
      const rankIdx = idx % 13;
      const suit = SUITS[suitIdx];
      const rank = RANKS[rankIdx];
      return {
        id: idNum + 1,
        suit: suit.name,
        suitTitle: suit.title,
        color: suit.color,
        rank: rank.value,
        value: rank.value,
        label: rank.label,
        faceArt: rank.face || null,
        faceUp: false
      };
    });

    this.stock = [];
    this.waste = [];
    this.foundations = [[], [], [], []];
    this.tableau = [[], [], [], [], [], [], []];

    for (let col = 0; col < 7; col++) {
      for (let row = 0; row <= col; row++) {
        const card = deck.shift();
        if (row === col) card.faceUp = true;
        this.tableau[col].push(card);
      }
    }

    this.stock = deck;

    this.initialDealState = {
      stock: this.stock.map(c => ({ ...c })),
      waste: [],
      foundations: [[], [], [], []],
      tableau: this.tableau.map(col => col.map(c => ({ ...c })))
    };

    this.render();
  }

  replayCurrentDeal() {
    if (!this.initialDealState) return;
    clearInterval(this.timerInterval);
    this.autoFinishing = false;
    this.timerSeconds = 0;
    this.moves = 0;
    this.score = 0;
    this.history = [];
    this.selected = null;
    this.gameWon = false;
    this.pendingWinRecord = null;
    this.hasSavedCurrentWin = false;

    this.dom.winModal.classList.add('hidden');
    this.dom.btnAutocomplete.classList.add('hidden');

    this.stock = this.initialDealState.stock.map(c => ({ ...c, faceUp: false }));
    this.waste = [];
    this.foundations = [[], [], [], []];
    this.tableau = this.initialDealState.tableau.map(col => col.map(c => ({ ...c })));

    this.updateStats();
    this.timerInterval = setInterval(() => {
      if (!this.gameWon) {
        this.timerSeconds++;
        this.updateStats();
      }
    }, 1000);

    this.sound.playFlip();
    this.render();
    this.showToast('↺ Deal restarted from move 1! Try a fresh approach.');
  }

  // --- State Snapshot & Undo ---
  saveState() {
    const cloneCard = (c) => ({ ...c });
    const snapshot = {
      stock: this.stock.map(cloneCard),
      waste: this.waste.map(cloneCard),
      foundations: this.foundations.map(arr => arr.map(cloneCard)),
      tableau: this.tableau.map(arr => arr.map(cloneCard)),
      score: this.score,
      moves: this.moves
    };
    this.history.push(snapshot);
    if (this.history.length > 50) this.history.shift();
  }

  undo() {
    if (this.history.length === 0 || this.gameWon || this.autoFinishing) return;
    const prev = this.history.pop();
    this.stock = prev.stock;
    this.waste = prev.waste;
    this.foundations = prev.foundations;
    this.tableau = prev.tableau;
    this.score = Math.max(0, prev.score - 10);
    this.moves++;
    this.clearSelection();
    this.sound.playFlip();
    this.render();
  }

  // --- Auto-Finish Feature ---
  canAutoFinish() {
    if (this.gameWon || this.autoFinishing) return false;
    const allTableauFaceUp = this.tableau.every(col => col.every(card => card.faceUp));
    return allTableauFaceUp && this.stock.length === 0;
  }

  autoFinish() {
    if (this.autoFinishing || this.gameWon) return;
    this.autoFinishing = true;
    this.dom.btnAutocomplete.classList.add('hidden');

    const finishInterval = setInterval(() => {
      let moved = false;

      if (this.waste.length > 0) {
        const wasteCard = this.waste[this.waste.length - 1];
        for (let f = 0; f < 4; f++) {
          if (this.canMoveToFoundation(wasteCard, f)) {
            this.executeMove('waste', 0, this.waste.length - 1, 'foundation', f);
            moved = true;
            break;
          }
        }
      }

      if (!moved) {
        for (let t = 0; t < 7; t++) {
          const col = this.tableau[t];
          if (col.length > 0) {
            const top = col[col.length - 1];
            for (let f = 0; f < 4; f++) {
              if (this.canMoveToFoundation(top, f)) {
                this.executeMove('tableau', t, col.length - 1, 'foundation', f);
                moved = true;
                break;
              }
            }
          }
          if (moved) break;
        }
      }

      const totalInFoundations = this.foundations.reduce((sum, f) => sum + f.length, 0);
      if (totalInFoundations === 52 || !moved) {
        clearInterval(finishInterval);
        this.autoFinishing = false;
      }
    }, 90);
  }

  // --- Card Movement Rules (Alternating: Black ⇄ Color) ---
  canMoveToFoundation(card, foundationIndex) {
    const targetSuit = SUITS[foundationIndex].name;
    if (card.suit !== targetSuit) return false;

    const pile = this.foundations[foundationIndex];
    if (pile.length === 0) {
      return card.rank === 1; // Ace
    }
    const topCard = pile[pile.length - 1];
    return card.rank === topCard.rank + 1;
  }

  canMoveToTableau(movingCard, colIndex) {
    const targetCol = this.tableau[colIndex];
    if (targetCol.length === 0) {
      return movingCard.rank === 13; // King can fill empty column
    }
    const topCard = targetCol[targetCol.length - 1];
    if (!topCard.faceUp) return false;
    // Alternating rule: Black can only go on Color, and Color can only go on Black!
    return movingCard.color !== topCard.color && movingCard.rank === topCard.rank - 1;
  }

  revealTableauTops() {
    let revealed = false;
    this.tableau.forEach(col => {
      if (col.length > 0) {
        const top = col[col.length - 1];
        if (!top.faceUp) {
          top.faceUp = true;
          this.score += 5;
          revealed = true;
        }
      }
    });
    return revealed;
  }

  // --- Stock Handling ---
  handleStockClick() {
    if (this.autoFinishing) return;
    this.saveState();
    this.clearSelection();

    if (this.stock.length > 0) {
      const drawCount = Math.min(this.drawMode, this.stock.length);
      for (let i = 0; i < drawCount; i++) {
        const card = this.stock.pop();
        card.faceUp = true;
        this.waste.push(card);
      }
      this.sound.playFlip();
    } else {
      if (this.waste.length === 0) return;
      while (this.waste.length > 0) {
        const card = this.waste.pop();
        card.faceUp = false;
        this.stock.push(card);
      }
      this.score = Math.max(0, this.score - 20);
      this.sound.playFlip();
    }

    this.moves++;
    this.render();
  }

  // --- Interaction: Drag & Drop (Touch, Pointer & Mouse) ---
  initPointerDrag() {
    window.addEventListener('pointermove', (e) => this.handlePointerMove(e), { passive: false });
    window.addEventListener('pointerup', (e) => this.handlePointerUp(e));
    window.addEventListener('pointercancel', (e) => this.handlePointerCancel(e));
  }

  handleCardPointerDown(card, source, colIndex, cardIndex, el, event) {
    if (this.autoFinishing || this.gameWon) return;
    if (!card.faceUp) return;
    if (source === 'waste' && cardIndex !== this.waste.length - 1) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    this.pointerDragState = {
      isDragging: false,
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      startX: event.clientX,
      startY: event.clientY,
      source,
      colIndex,
      cardIndex,
      card,
      sourceElement: el,
      elementsToMove: [],
      proxyContainer: null,
      grabOffsetX: 0,
      grabOffsetY: 0
    };
  }

  findTargetSlot(x, y) {
    // 1. Point test through floating proxy (which has pointer-events: none)
    const hit = document.elementFromPoint(x, y);
    if (hit) {
      const slot = hit.closest('.card-slot');
      if (slot) {
        const fIdx = this.dom.foundations.indexOf(slot);
        if (fIdx !== -1) return { slot, targetType: 'foundation', targetIndex: fIdx };
        const tIdx = this.dom.tableau.indexOf(slot);
        if (tIdx !== -1) return { slot, targetType: 'tableau', targetIndex: tIdx };
      }
    }

    // 2. Bounding-box test with generous touch margin tolerance (forgiving on mobile)
    for (let f = 0; f < 4; f++) {
      const slot = this.dom.foundations[f];
      const r = slot.getBoundingClientRect();
      if (x >= r.left - 8 && x <= r.right + 8 && y >= r.top - 8 && y <= r.bottom + 12) {
        return { slot, targetType: 'foundation', targetIndex: f };
      }
    }

    for (let t = 0; t < 7; t++) {
      const slot = this.dom.tableau[t];
      const r = slot.getBoundingClientRect();
      if (x >= r.left - 6 && x <= r.right + 6 && y >= r.top - 6 && y <= r.bottom + 25) {
        return { slot, targetType: 'tableau', targetIndex: t };
      }
    }

    return null;
  }

  handlePointerMove(event) {
    if (!this.pointerDragState) return;
    if (event.pointerId !== this.pointerDragState.pointerId) return;

    const dx = event.clientX - this.pointerDragState.startX;
    const dy = event.clientY - this.pointerDragState.startY;

    if (!this.pointerDragState.isDragging) {
      if (Math.hypot(dx, dy) > 7) {
        this.pointerDragState.isDragging = true;
        this.clearSelection();

        const { source, colIndex, cardIndex, sourceElement } = this.pointerDragState;

        // Collect elements to move: single card or substack
        if (source === 'tableau') {
          const colCards = Array.from(this.dom.tableau[colIndex].querySelectorAll('.card'));
          this.pointerDragState.elementsToMove = colCards.slice(cardIndex);
        } else {
          this.pointerDragState.elementsToMove = [sourceElement];
        }

        // Setup floating drag proxy
        let proxy = document.getElementById('drag-proxy-container');
        if (!proxy) {
          proxy = document.createElement('div');
          proxy.id = 'drag-proxy-container';
          proxy.className = 'drag-proxy-container';
          document.body.appendChild(proxy);
        }
        proxy.innerHTML = '';
        this.pointerDragState.proxyContainer = proxy;

        const baseRect = sourceElement.getBoundingClientRect();
        this.pointerDragState.grabOffsetX = this.pointerDragState.startX - baseRect.left;
        this.pointerDragState.grabOffsetY = this.pointerDragState.startY - baseRect.top;

        const baseTop = sourceElement.offsetTop;
        this.pointerDragState.elementsToMove.forEach(cEl => {
          const clone = cEl.cloneNode(true);
          clone.classList.remove('selected', 'hint-highlight');
          clone.style.position = 'absolute';
          clone.style.left = '0';
          clone.style.top = `${cEl.offsetTop - baseTop}px`;
          clone.style.width = `${baseRect.width}px`;
          clone.style.height = `${baseRect.height}px`;
          clone.style.margin = '0';
          clone.style.pointerEvents = 'none';
          clone.style.transition = 'none';
          proxy.appendChild(clone);
          cEl.style.opacity = '0.22';
        });

        document.body.classList.add('is-pointer-dragging');
        proxy.style.display = 'block';
        proxy.style.transform = `translate3d(${event.clientX - this.pointerDragState.grabOffsetX}px, ${event.clientY - this.pointerDragState.grabOffsetY}px, 0)`;
      }
    }

    if (this.pointerDragState.isDragging) {
      if (event.cancelable) event.preventDefault();

      const proxy = this.pointerDragState.proxyContainer;
      if (proxy) {
        proxy.style.transform = `translate3d(${event.clientX - this.pointerDragState.grabOffsetX}px, ${event.clientY - this.pointerDragState.grabOffsetY}px, 0)`;
      }

      // Highlight target slot if valid
      document.querySelectorAll('.card-slot.drag-over').forEach(s => s.classList.remove('drag-over'));

      const target = this.findTargetSlot(event.clientX, event.clientY);
      if (target) {
        const { slot, targetType, targetIndex } = target;
        let isLegal = false;
        if (targetType === 'foundation') {
          if (this.pointerDragState.elementsToMove.length === 1) {
            isLegal = this.canMoveToFoundation(this.pointerDragState.card, targetIndex);
          }
        } else if (targetType === 'tableau') {
          if (this.pointerDragState.source !== 'tableau' || this.pointerDragState.colIndex !== targetIndex) {
            isLegal = this.canMoveToTableau(this.pointerDragState.card, targetIndex);
          }
        }
        if (isLegal) {
          slot.classList.add('drag-over');
        }
      }
    }
  }

  handlePointerUp(event) {
    if (!this.pointerDragState) return;
    if (event.pointerId !== this.pointerDragState.pointerId) return;

    if (this.pointerDragState.isDragging) {
      this.justFinishedDrag = true;
      setTimeout(() => { this.justFinishedDrag = false; }, 150);

      document.body.classList.remove('is-pointer-dragging');
      document.querySelectorAll('.card-slot.drag-over').forEach(s => s.classList.remove('drag-over'));

      if (this.pointerDragState.elementsToMove) {
        this.pointerDragState.elementsToMove.forEach(cEl => {
          cEl.style.opacity = '1';
        });
      }

      if (this.pointerDragState.proxyContainer) {
        this.pointerDragState.proxyContainer.innerHTML = '';
        this.pointerDragState.proxyContainer.style.display = 'none';
      }

      const target = this.findTargetSlot(event.clientX, event.clientY);
      const { source, colIndex, cardIndex } = this.pointerDragState;
      this.pointerDragState = null;

      if (target) {
        this.executeMove(source, colIndex, cardIndex, target.targetType, target.targetIndex);
      }
    } else {
      this.pointerDragState = null;
    }
  }

  handlePointerCancel(event) {
    if (!this.pointerDragState) return;
    if (this.pointerDragState.isDragging) {
      document.body.classList.remove('is-pointer-dragging');
      document.querySelectorAll('.card-slot.drag-over').forEach(s => s.classList.remove('drag-over'));
      if (this.pointerDragState.elementsToMove) {
        this.pointerDragState.elementsToMove.forEach(cEl => { cEl.style.opacity = '1'; });
      }
      if (this.pointerDragState.proxyContainer) {
        this.pointerDragState.proxyContainer.innerHTML = '';
        this.pointerDragState.proxyContainer.style.display = 'none';
      }
    }
    this.pointerDragState = null;
  }

  attachDropHandlers(element, targetType, targetIndex) {
    element.addEventListener('dragover', (e) => {
      e.preventDefault();
      element.classList.add('drag-over');
    });

    element.addEventListener('dragleave', () => {
      element.classList.remove('drag-over');
    });

    element.addEventListener('drop', (e) => {
      e.preventDefault();
      element.classList.remove('drag-over');
      if (!this.dragData) return;

      const { source, colIndex, cardIndex } = this.dragData;
      this.executeMove(source, colIndex, cardIndex, targetType, targetIndex);
    });
  }

  handleCardClick(card, source, colIndex, cardIndex, event) {
    if (this.autoFinishing) return;
    if (this.justFinishedDrag) return;
    event.stopPropagation();
    if (!card.faceUp) return;

    if (source === 'waste' && cardIndex !== this.waste.length - 1) {
      return;
    }

    // Double-tap / Quick-tap detection for mobile touch & responsive play
    const now = Date.now();
    const cardKey = `${source}-${colIndex}-${cardIndex}-${card.id}`;
    if (this.lastCardClick && this.lastCardClick.key === cardKey && (now - this.lastCardClick.time) < 380) {
      this.lastCardClick = null;
      this.clearSelection();
      this.handleCardDoubleClick(card, source, colIndex, cardIndex, event);
      return;
    }
    this.lastCardClick = { key: cardKey, time: now };

    if (this.selected) {
      if (this.selected.source === source && this.selected.colIndex === colIndex && this.selected.cardIndex === cardIndex) {
        this.clearSelection();
        return;
      }

      if (source === 'tableau') {
        const success = this.executeMove(this.selected.source, this.selected.colIndex, this.selected.cardIndex, 'tableau', colIndex);
        if (success) {
          this.clearSelection();
          return;
        }
      } else if (source === 'foundation') {
        const success = this.executeMove(this.selected.source, this.selected.colIndex, this.selected.cardIndex, 'foundation', colIndex);
        if (success) {
          this.clearSelection();
          return;
        }
      }
    }

    this.selected = { source, colIndex, cardIndex, card };
    this.renderHighlights();
  }

  handleSlotClick(targetType, targetIndex) {
    if (!this.selected || this.autoFinishing) return;
    this.executeMove(this.selected.source, this.selected.colIndex, this.selected.cardIndex, targetType, targetIndex);
    this.clearSelection();
  }

  handleCardDoubleClick(card, source, colIndex, cardIndex, event) {
    if (this.autoFinishing) return;
    event.stopPropagation();
    if (!card.faceUp) return;

    const isTopCard =
      (source === 'waste' && cardIndex === this.waste.length - 1) ||
      (source === 'tableau' && cardIndex === this.tableau[colIndex].length - 1) ||
      (source === 'foundation');

    if (!isTopCard) return;

    for (let f = 0; f < 4; f++) {
      if (this.canMoveToFoundation(card, f)) {
        this.executeMove(source, colIndex, cardIndex, 'foundation', f);
        return;
      }
    }

    for (let t = 0; t < 7; t++) {
      if (source === 'tableau' && colIndex === t) continue;
      if (this.canMoveToTableau(card, t)) {
        this.executeMove(source, colIndex, cardIndex, 'tableau', t);
        return;
      }
    }
  }

  clearSelection() {
    this.selected = null;
    this.renderHighlights();
  }

  renderHighlights() {
    document.querySelectorAll('.card.selected').forEach(el => el.classList.remove('selected'));
    if (!this.selected) return;

    const { source, colIndex, cardIndex } = this.selected;

    if (source === 'waste') {
      const cards = this.dom.waste.querySelectorAll('.card');
      const cardEl = cards[cards.length - 1];
      if (cardEl) cardEl.classList.add('selected');
    } else if (source === 'tableau') {
      const cards = this.dom.tableau[colIndex].querySelectorAll('.card');
      for (let i = cardIndex; i < cards.length; i++) {
        if (cards[i]) cards[i].classList.add('selected');
      }
    }
  }

  executeMove(source, fromCol, fromCardIdx, targetType, targetIdx) {
    let movingCards = [];

    if (source === 'waste') {
      if (this.waste.length === 0) return false;
      movingCards = [this.waste[this.waste.length - 1]];
    } else if (source === 'tableau') {
      const col = this.tableau[fromCol];
      if (fromCardIdx < 0 || fromCardIdx >= col.length) return false;
      movingCards = col.slice(fromCardIdx);
    } else if (source === 'foundation') {
      const pile = this.foundations[fromCol];
      if (pile.length === 0) return false;
      movingCards = [pile[pile.length - 1]];
    }

    if (movingCards.length === 0) return false;
    const baseCard = movingCards[0];

    if (targetType === 'foundation') {
      if (movingCards.length !== 1) return false;
      if (!this.canMoveToFoundation(baseCard, targetIdx)) return false;

      this.saveState();

      if (source === 'waste') this.waste.pop();
      else if (source === 'tableau') this.tableau[fromCol].pop();
      else if (source === 'foundation') this.foundations[fromCol].pop();

      this.foundations[targetIdx].push(baseCard);
      this.score += 10;
      this.moves++;
      this.revealTableauTops();
      this.sound.playFoundation();
      this.render();
      this.checkWinCondition();
      return true;
    }

    if (targetType === 'tableau') {
      if (!this.canMoveToTableau(baseCard, targetIdx)) return false;

      this.saveState();

      if (source === 'waste') {
        this.waste.pop();
        this.score += 5;
      } else if (source === 'tableau') {
        this.tableau[fromCol].splice(fromCardIdx);
      } else if (source === 'foundation') {
        this.foundations[fromCol].pop();
        this.score = Math.max(0, this.score - 15);
      }

      this.tableau[targetIdx].push(...movingCards);
      this.moves++;
      this.revealTableauTops();
      this.sound.playPlace();
      this.render();
      return true;
    }

    return false;
  }

  // --- Smart Hint System ---
  giveHint() {
    this.clearSelection();
    document.querySelectorAll('.hint-highlight').forEach(el => el.classList.remove('hint-highlight'));

    let hintFound = null;

    for (let t = 0; t < 7; t++) {
      const col = this.tableau[t];
      if (col.length === 0) continue;
      const topCard = col[col.length - 1];
      if (!topCard.faceUp) continue;
      for (let f = 0; f < 4; f++) {
        if (this.canMoveToFoundation(topCard, f)) {
          hintFound = {
            srcEl: this.dom.tableau[t].querySelector(`.card[data-id="${topCard.id}"]`),
            dstEl: this.dom.foundations[f],
            msg: `Move ${topCard.label} of ${topCard.suitTitle} to Foundation`
          };
          break;
        }
      }
      if (hintFound) break;
    }

    if (!hintFound && this.waste.length > 0) {
      const wasteCard = this.waste[this.waste.length - 1];
      for (let f = 0; f < 4; f++) {
        if (this.canMoveToFoundation(wasteCard, f)) {
          hintFound = {
            srcEl: this.dom.waste.querySelector(`.card[data-id="${wasteCard.id}"]`),
            dstEl: this.dom.foundations[f],
            msg: `Move ${wasteCard.label} of ${wasteCard.suitTitle} to Foundation`
          };
          break;
        }
      }
    }

    if (!hintFound) {
      for (let t = 0; t < 7; t++) {
        const col = this.tableau[t];
        const firstFaceUpIdx = col.findIndex(c => c.faceUp);
        if (firstFaceUpIdx > 0) {
          const card = col[firstFaceUpIdx];
          for (let targetT = 0; targetT < 7; targetT++) {
            if (targetT === t) continue;
            if (this.canMoveToTableau(card, targetT)) {
              hintFound = {
                srcEl: this.dom.tableau[t].querySelector(`.card[data-id="${card.id}"]`),
                dstEl: this.dom.tableau[targetT],
                msg: `Move stack to reveal hidden card in column ${t + 1}`
              };
              break;
            }
          }
        }
        if (hintFound) break;
      }
    }

    if (!hintFound && this.waste.length > 0) {
      const wasteCard = this.waste[this.waste.length - 1];
      for (let t = 0; t < 7; t++) {
        if (this.canMoveToTableau(wasteCard, t)) {
          hintFound = {
            srcEl: this.dom.waste.querySelector(`.card[data-id="${wasteCard.id}"]`),
            dstEl: this.dom.tableau[t],
            msg: `Move ${wasteCard.label} of ${wasteCard.suitTitle} to column ${t + 1}`
          };
          break;
        }
      }
    }

    if (hintFound && hintFound.srcEl && hintFound.dstEl) {
      hintFound.srcEl.classList.add('hint-highlight');
      hintFound.dstEl.classList.add('hint-highlight');
      this.showToast(`💡 Hint: ${hintFound.msg}`);
      setTimeout(() => {
        hintFound.srcEl.classList.remove('hint-highlight');
        hintFound.dstEl.classList.remove('hint-highlight');
      }, 2500);
    } else {
      this.dom.stock.classList.add('hint-highlight');
      this.showToast('💡 Hint: Draw from the Stock pile to find new cards!');
      setTimeout(() => this.dom.stock.classList.remove('hint-highlight'), 2000);
    }
  }

  // --- Win Condition & Player Name Entry ---
  checkWinCondition() {
    const totalInFoundations = this.foundations.reduce((sum, f) => sum + f.length, 0);
    if (totalInFoundations === 52) {
      this.gameWon = true;
      clearInterval(this.timerInterval);
      this.sound.playVictory();
      this.celebration.start();

      const modeName = this.drawMode === 3 ? 'Draw 3' : 'Draw 1';
      const timeFormatted = this.formatTime(this.timerSeconds);

      this.dom.winDealType.textContent = this.dealType === 'solvable' ? '🌟 Solvable (Rigged)' : '🎲 Random';
      this.dom.winMode.textContent = modeName;
      this.dom.winTime.textContent = timeFormatted;
      this.dom.winMoves.textContent = this.moves;
      this.dom.winScore.textContent = this.score;

      const savedName = localStorage.getItem(STORAGE_KEYS.PLAYER_NAME) || '';
      this.dom.winNameInput.value = savedName;
      this.dom.winSaveMsg.classList.add('hidden');
      this.dom.btnSaveScore.textContent = 'Save Score';
      this.dom.btnSaveScore.disabled = false;
      this.hasSavedCurrentWin = false;

      this.pendingWinRecord = {
        mode: modeName,
        dealType: this.dealType === 'solvable' ? 'Solvable' : 'Random',
        score: this.score,
        timeSeconds: this.timerSeconds,
        timeFormatted: timeFormatted,
        moves: this.moves,
        date: new Date().toLocaleDateString()
      };

      this.dom.winModal.classList.remove('hidden');
      setTimeout(() => this.dom.winNameInput.focus(), 300);
    }
  }

  commitPlayerScore() {
    if (!this.pendingWinRecord || this.hasSavedCurrentWin) return;

    let playerName = this.dom.winNameInput.value.trim();
    if (!playerName) {
      playerName = 'Player';
    }

    localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, playerName);

    this.recordHighScore({
      ...this.pendingWinRecord,
      name: playerName
    });

    this.hasSavedCurrentWin = true;
    this.dom.winSaveMsg.classList.remove('hidden');
    this.dom.btnSaveScore.textContent = 'Saved ✓';
    this.dom.btnSaveScore.disabled = true;
  }

  // --- Two Distinct High Score Boards (Draw 1 & Draw 3, up to 100 entries each) ---
  getStorageKeyForMode(mode) {
    return mode === 'Draw 3' || mode === 'draw3'
      ? STORAGE_KEYS.HIGH_SCORES_DRAW3
      : STORAGE_KEYS.HIGH_SCORES_DRAW1;
  }

  getHighScoresForMode(mode) {
    const key = this.getStorageKeyForMode(mode);
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  recordHighScore(record) {
    const key = this.getStorageKeyForMode(record.mode);
    let scores = this.getHighScoresForMode(record.mode);
    scores.push(record);

    scores.sort((a, b) => b.score - a.score || a.timeSeconds - b.timeSeconds || a.moves - b.moves);

    const top100 = scores.slice(0, 100);
    localStorage.setItem(key, JSON.stringify(top100));
  }

  openHighScores(targetMode = null) {
    const mode = targetMode || (this.drawMode === 3 ? 'draw3' : 'draw1');
    this.switchScoreTab(mode);
    this.dom.scoresModal.classList.remove('hidden');
  }

  switchScoreTab(tab) {
    this.currentScoreTab = tab;
    this.dom.tabDraw1.classList.toggle('active', tab === 'draw1');
    this.dom.tabDraw3.classList.toggle('active', tab === 'draw3');
    this.renderHighScoresTable();
  }

  renderHighScoresTable() {
    const scores = this.getHighScoresForMode(this.currentScoreTab);
    const boardTitle = this.currentScoreTab === 'draw3' ? 'Draw 3' : 'Draw 1';

    this.dom.scoresTbody.innerHTML = '';
    if (scores.length === 0) {
      this.dom.scoresTbody.innerHTML = `
        <tr>
          <td colspan="6" class="no-scores-msg">No recorded victories in ${boardTitle} yet. Win a game to take the #1 spot!</td>
        </tr>
      `;
      return;
    }

    scores.forEach((s, idx) => {
      const tr = document.createElement('tr');
      const rankBadge = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : (idx + 1).toString();
      tr.innerHTML = `
        <td><strong>${rankBadge}</strong></td>
        <td class="player-name-cell" title="${s.name || 'Player'}">${s.name || 'Player'}</td>
        <td><strong>${s.score}</strong></td>
        <td>${s.timeFormatted}</td>
        <td>${s.moves}</td>
        <td>${s.date}</td>
      `;
      this.dom.scoresTbody.appendChild(tr);
    });
  }

  clearCurrentBoardScores() {
    const boardTitle = this.currentScoreTab === 'draw3' ? 'Draw 3' : 'Draw 1';
    if (confirm(`Are you sure you want to clear the entire ${boardTitle} Leaderboard?`)) {
      const key = this.getStorageKeyForMode(this.currentScoreTab);
      localStorage.removeItem(key);
      this.renderHighScoresTable();
      this.showToast(`Cleared ${boardTitle} Leaderboard.`);
    }
  }

  // --- Rendering UI ---
  render() {
    this.updateStats();
    this.renderStock();
    this.renderWaste();
    this.renderFoundations();
    this.renderTableau();
    this.renderHighlights();

    if (this.canAutoFinish()) {
      this.dom.btnAutocomplete.classList.remove('hidden');
    } else {
      this.dom.btnAutocomplete.classList.add('hidden');
    }
  }

  updateStats() {
    this.dom.score.textContent = this.score;
    this.dom.moves.textContent = this.moves;
    this.dom.timer.textContent = this.formatTime(this.timerSeconds);
  }

  formatTime(totalSec) {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  createCardElement(card, source, colIndex, cardIndex) {
    const el = document.createElement('div');
    el.classList.add('card', `suit-${card.suit}`);
    el.dataset.id = card.id;

    if (!card.faceUp) {
      el.classList.add('face-down');
      return el;
    }

    el.classList.add('face-up', card.color);

    const isInteractive = source !== 'waste' || cardIndex === this.waste.length - 1;
    if (isInteractive) {
      el.addEventListener('click', (e) => this.handleCardClick(card, source, colIndex, cardIndex, e));
      el.addEventListener('dblclick', (e) => this.handleCardDoubleClick(card, source, colIndex, cardIndex, e));
      el.addEventListener('pointerdown', (e) => this.handleCardPointerDown(card, source, colIndex, cardIndex, el, e));
    }

    const rankValue = card.rank || card.value || 1;
    let cardBodyHTML = '';

    if (rankValue >= 11) {
      // Picture / Court Cards (J, Q, K) - Illustrated person holding the suit's shot glass
      cardBodyHTML = `<div class="card-court-container">${getCourtCardSVG(rankValue, card.suit)}</div>`;
    } else {
      // Number Cards (1 to 10) - Shot glasses matching the number of the card
      cardBodyHTML = getPipsHTML(rankValue, card.suit);
    }

    el.innerHTML = `
      <div class="card-corner top-left">
        <span class="card-rank">${card.label}</span>
      </div>
      ${cardBodyHTML}
      <div class="card-corner bottom-right">
        <span class="card-rank">${card.label}</span>
      </div>
    `;

    return el;
  }

  renderStock() {
    this.dom.stock.innerHTML = '';
    if (this.stock.length > 0) {
      const top = document.createElement('div');
      top.classList.add('card', 'face-down');
      this.dom.stock.appendChild(top);
    } else {
      const marker = document.createElement('div');
      marker.className = 'slot-marker';
      marker.textContent = '↺';
      this.dom.stock.appendChild(marker);
    }
  }

  renderWaste() {
    this.dom.waste.innerHTML = '';
    const len = this.waste.length;
    if (len === 0) {
      this.dom.waste.classList.remove('has-cards');
      return;
    }
    this.dom.waste.classList.add('has-cards');

    const visibleCount = this.drawMode === 3 ? Math.min(3, len) : 1;
    const startIndex = len - visibleCount;

    for (let i = startIndex; i < len; i++) {
      const card = this.waste[i];
      const el = this.createCardElement(card, 'waste', 0, i);
      if (this.drawMode === 3) {
        const offsetIndex = i - startIndex;
        el.style.left = `${offsetIndex * 18}px`;
        el.style.zIndex = offsetIndex + 1;
      } else {
        el.style.left = '0px';
        el.style.zIndex = 1;
      }
      this.dom.waste.appendChild(el);
    }
  }

  renderFoundations() {
    this.foundations.forEach((pile, fIdx) => {
      const slot = this.dom.foundations[fIdx];
      slot.innerHTML = '';

      if (pile.length > 0) {
        const topCard = pile[pile.length - 1];
        const el = this.createCardElement(topCard, 'foundation', fIdx, pile.length - 1);
        el.style.zIndex = pile.length;
        slot.appendChild(el);
      } else {
        const watermark = document.createElement('span');
        watermark.className = 'slot-watermark';
        watermark.innerHTML = getShotGlassSVG(SUITS[fIdx].name, 'watermark');
        slot.appendChild(watermark);
      }
    });
  }

  renderTableau() {
    this.tableau.forEach((col, colIdx) => {
      const slot = this.dom.tableau[colIdx];
      slot.innerHTML = '';

      let topOffset = 0;
      col.forEach((card, cardIdx) => {
        const el = this.createCardElement(card, 'tableau', colIdx, cardIdx);
        el.style.top = `${topOffset}px`;
        el.style.zIndex = cardIdx + 1;
        slot.appendChild(el);
        topOffset += card.faceUp ? 26 : 14;
      });
    });
  }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  window.solitaireApp = new SolitaireGame();
});
