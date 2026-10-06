# Classic Klondike Solitaire - Schnaps Edition 🥃

A responsive, standalone Klondike Solitaire browser game featuring custom Schnaps shot glass and hip flask suits, authentic pip arrangements, illustrated court cards, and guaranteed solvable deals. Built with pure vanilla HTML5, CSS3, and JavaScript.

---

## 🥃 Two Colors, Four Symbols: Shot Glasses & Hip Flasks

To maximize gameplay clarity and honor traditional Solitaire alternating rules, the deck features **two distinct card colors: Black and Green**, with one **Shot Glass** and one **Hip Flask** in each color:

### 🖤 Black Team:
- ♣ **Clubs**: **Black Shot Glass** (Jet-black licorice liquor in a heavy silver/chrome-trimmed glass with specular reflections).
- ♠ **Spades**: **Black Hip Flask** (Sleek matte-black pocket flask with stainless steel screw cap, captive hinge, and silver seal).

### 💚 Green Team:
- ♦ **Diamonds**: **Green Shot Glass** (Vibrant emerald mint Pfeffi in an emerald-trimmed glass with rising carbonation bubbles).
- ♥ **Hearts**: **Green Hip Flask** (Radiant emerald lacquer pocket flask with polished chrome cap and mint leaf medallion).

### 🔄 The Alternating Color Rule (Black ⇄ Green):
In Klondike, tableau cards must alternate in color. In the Schnaps Edition:
- **Black cards (Shot Glass ♣ or Hip Flask ♠)** can only be placed onto **Green cards (Shot Glass ♦ or Hip Flask ♥)**.
- **Green cards (Shot Glass ♦ or Hip Flask ♥)** can only be placed onto **Black cards (Shot Glass ♣ or Hip Flask ♠)**.
- The corner ranks are clearly color-coded (**Black** or **Green**) so you can scan the board at a glance!
- A handy legend is displayed at the bottom of the table felt for quick reference.

---

## 🎴 Card Design & Face Layout

- **Rank-Only Corners**: Corner indices display **only the rank number or letter** (`A`, `2`–`10`, `J`, `Q`, `K`) in top-left and bottom-right in bold Black or Green. All corner glasses and flasks have been removed for maximum clarity and traditional playing card aesthetics.
- **Number Cards (A, 2–10)**: Display symbols matching the **exact number of the card** (e.g. 1 centered symbol for Ace, 2 vertical for 2, 5 dice pattern for 5, up to 10 for 10) in standard playing card pip arrangements:
  - Clubs: 1–10 Black Shot Glasses
  - Spades: 1–10 Black Hip Flasks
  - Diamonds: 1–10 Green Shot Glasses
  - Hearts: 1–10 Green Hip Flasks
- **Court / Picture Cards (J, Q, K)**: Rich vector portraits of royal characters holding up their suit's drinking vessel in a celebratory toast:
  - **Jack (J)**: Young dashing squire/knight in a cavalier feathered beret and slashed doublet raising the vessel.
  - **Queen (Q)**: Elegant crowned queen with pearls, flowing hair, and royal ermine robe gracefully holding the vessel.
  - **King (K)**: Majestic bearded king with a jeweled golden crown and ermine mantle raising the vessel in a royal toast.
  - *Clubs* court figures hold the **Black Shot Glass**.
  - *Spades* court figures hold the **Black Hip Flask**.
  - *Diamonds* court figures hold the **Green Shot Glass**.
  - *Hearts* court figures hold the **Green Hip Flask**.

---

## 🚀 Key Features

### 🖱️ Right-Click Quick Sweep (Foundation Fast-Send)
- **Send All Eligible Cards**: Right-clicking anywhere on the board instantly sweeps all visible cards from the waste pile and tableau tops up to the Foundations.
- **Cascade Detection**: If sending one card reveals another card underneath that can also move to a foundation, it cascades automatically!
- **Single-Move Undo**: The entire sweep is grouped into a single undo step, so clicking **↩ Undo** restores the exact board state prior to the sweep.

### 🏆 Player Names & Two Dedicated High Score Boards (Top 100 Each)
- **Player Name Input**: When you win a game, enter your name/handle in the victory screen and click **Save Score** (or press Enter).
- **Persistent Memory**: Remembers your player name across games via `localStorage`.
- **Two Distinct Leaderboards**:
  - **🃏 Draw 1 Board** (Top 100 scores)
  - **🃏 Draw 3 Board** (Top 100 scores)
- **Rankings**: Tracks Rank (🥇, 🥈, 🥉, 4..100), Player Name, Final Score, Elapsed Time, Move Count, and Date.

### 🌟 Guaranteed Solvable Mode (Rigged Deals)
- **100% Solvable by Default**: Every new game is generated through an in-engine forward solver and verified against a curated repository of solvable seeds with dynamic suit/color permutations. Every deal has a guaranteed winning path!
- **Mode Toggle**: Switch between **🌟 Solvable (Rigged)** and **🎲 Random** in the top bar anytime.
- **↺ Replay Deal**: Reset the moves and timer to try the exact same layout again.

### ⚡ Auto-Finish
- Once all face-down cards in the tableau are revealed, a glowing **⚡ Auto-Finish** button appears to smoothly cascade all remaining cards directly home to the foundations!

### 💡 Smart Hints & Non-Displacing Toast
- Clicking **💡 Hint** highlights the next playable move with a pulsating glow.
- Toast notifications appear as a fixed floating pill at the bottom center of the screen, completely preventing any layout shifts or playing field movement.

### 🎴 Custom Military Artillery Card Back Theme
- Uses custom artillery artwork on all face-down cards, tuned with darker brightness, rich contrast, and a subtle golden inner bevel border.

### 🟢 Customizable Table Felt & Surface Styles
- Switch anytime between 6 table finishes: **Emerald Classic**, **Royal Navy**, **Burgundy Velvet**, **Slate Charcoal**, **Deep Violet**, and **🪵 Oak Wood** (authentic natural oak tabletop texture with rich organic wood grain, knots, and warm amber tavern ambient lighting).

### 🃏 Draw 1 & Draw 3 Modes
- Seamlessly toggle between Draw 1 and Draw 3 with authentic horizontal waste card fanning.

### 🔊 Procedural Web Audio & Celebration
- Real-time synthesizer sound effects:
  - **Card Flip & Draw**: Crisp physical card slide and paper flick off the deck.
  - **Card Movements & Tableau Stacking**: Authentic physical card movement sound (surface friction slide, crisp edge snap, and cardstock body flex thump).
  - **Foundation Scoring**: Distinct **drink sip / gulp sound** (liquid suction draw + throat swallow gulp + refreshing glass finish).
  - **Victory**: Multi-chord celebratory fanfare and confetti.
- Confetti particle celebration on game completion.

---

## 🎮 How to Play

Open [`index.html`](file:///C:/Users/Admin/.gemini/antigravity/scratch/solitaire/index.html) in any modern browser:
- Double-click `index.html` in File Explorer, or
- Right-click `index.html` -> "Open with" -> Google Chrome / Microsoft Edge / Firefox.
