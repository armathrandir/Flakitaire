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
  { name: 'clubs', title: 'Black Shot Glass', color: 'black', symbol: 'glass' },
  { name: 'spades', title: 'Black Drop', color: 'black', symbol: 'drop' },
  { name: 'diamonds', title: 'Green Shot Glass', color: 'green', symbol: 'glass' },
  { name: 'hearts', title: 'Green Drop', color: 'green', symbol: 'drop' }
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
  DEAL_TYPE: 'solitaire_deal_type',
  LANGUAGE: 'solitaire_lang_v2',
  MUSIC_ENABLED: 'solitaire_music_v2',
  MUSIC_VOLUME: 'solitaire_music_volume',
  SOUND_CARDS_ENABLED: 'solitaire_sound_cards_enabled',
  SOUND_CARDS_VOLUME: 'solitaire_sound_cards_volume',
  SOUND_DRINKS_ENABLED: 'solitaire_sound_drinks_enabled',
  SOUND_DRINKS_VOLUME: 'solitaire_sound_drinks_volume',
  SOUND_VICTORY_ENABLED: 'solitaire_sound_victory_enabled',
  SOUND_VICTORY_VOLUME: 'solitaire_sound_victory_volume'
};

// --- Firebase Realtime Database for Global High Scores ---
const FIREBASE_DATABASE_URL = 'https://flakitaire-4556d-default-rtdb.europe-west1.firebasedatabase.app';

function getDeviceType() {
  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent);
  const isSmallScreen = window.innerWidth <= 768;
  return (isMobileUA || (isTouch && isSmallScreen)) ? 'mobile' : 'desktop';
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"']/g, function(m) {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#039;';
      default: return m;
    }
  });
}

// --- Comprehensive Multilingual Localization Dictionary ---
const TRANSLATIONS = {
  de: {
    pageTitle: 'Klassisches Klondike Solitär - Schnaps Edition',
    mainTitle: 'Solitär',
    badgeEdition: '🥃 Schnaps Edition',
    dealSolvable: '✨ Lösbar',
    dealRandom: '🎲 Zufällig',
    dealSolvableTitle: 'Dieses Spiel ist mathematisch garantiert zu 100% lösbar!',
    dealRandomTitle: 'Klassische, unmodifizierte Kartenzufallsmischung',
    labelDeal: 'Spiel:',
    optSolvable: '🌟 Lösbar',
    optRandom: '🎲 Zufällig',
    labelDraw: 'Karten:',
    optDraw1: '1 Karte',
    optDraw3: '3 Karten',
    labelFelt: 'Tisch:',
    optOak: '🪵 Eiche',
    optEmerald: '🟢 Smaragd',
    optNavy: '🔵 Marine',
    optBurgundy: '🔴 Bordeaux',
    optSlate: '⚫ Schiefer',
    optViolet: '🟣 Violett',
    labelLang: 'Sprache:',
    statScore: 'PUNKTE',
    statMoves: 'ZÜGE',
    statTime: 'ZEIT',
    btnAutoFinish: '⚡ Auto-Fertig',
    btnAutoFinishTitle: 'Alle verdeckten Karten aufgedeckt! Karten automatisch ablegen',
    btnSweep: '⚡ Abräumen',
    btnSweepTitle: 'Alle möglichen Karten auf die Ablagestapel legen (oder Rechtsklick / Spielfeld doppeltippen)',
    btnHint: '💡 Tipp',
    btnHintTitle: 'Verfügbaren Zug hervorheben',
    btnUndo: '↩ Zurück',
    btnUndoTitle: 'Letzten Zug rückgängig machen',
    btnReplay: '↺ Neustart',
    btnReplayTitle: 'Diesen Spielstand von Anfang an neu starten',
    btnScores: '🏆 Rekorde',
    btnScoresTitle: 'Bestenliste anzeigen',
    btnSettings: '⚙️ Einstellungen',
    btnSettingsTitle: 'Einstellungen öffnen',
    btnSoundOn: '🔊 Ton',
    btnSoundOff: '🔇 Stumm',
    btnSoundTitle: 'Soundeffekte ein-/ausschalten',
    btnMusicOn: '🎵 Musik',
    btnMusicOff: '🔇 Musik',
    btnMusicTitle: 'Hintergrundmusik ein-/ausschalten (Irischer Folk)',
    btnNew: 'Neues Spiel',
    btnNewTitle: 'Ein neues Spiel beginnen',
    stockTitle: 'Klicken zum Ziehen',
    wasteTitle: 'Gezogene Karten',
    foundations: {
      clubs: 'Schwarzes Schnapsglas Ablage',
      spades: 'Schwarzer Tropfen Ablage',
      diamonds: 'Grünes Schnapsglas Ablage',
      hearts: 'Grüner Tropfen Ablage'
    },
    legend: {
      rulesTitle: '🥃 <strong>Regeln: Wechselnde Farben (Schwarz ⇄ Grün):</strong>',
      blackGlass: 'Schwarzes Schnapsglas (♣)',
      blackDrop: 'Schwarzer Tropfen (♠)',
      greenGlass: 'Grünes Schnapsglas (♦)',
      greenDrop: 'Grüner Tropfen (♥)',
      sweepHint: '🖱️ <em>Rechtsklick</em>, <strong>⚡ Abräumen</strong> tippen oder Spielfeld doppeltippen zum Ablegen!'
    },
    courtTitles: {
      11: 'BUBE',
      12: 'DAME',
      13: 'KÖNIG'
    },
    suitTitles: {
      clubs: 'Schwarzes Schnapsglas',
      spades: 'Schwarzer Tropfen',
      diamonds: 'Grünes Schnapsglas',
      hearts: 'Grüner Tropfen'
    },
    winModal: {
      badge: '🏆 PROST! GEWONNEN!',
      title: 'Herzlichen Glückwunsch!',
      desc: 'Du hast die Schnaps Solitaire Edition gemeistert!',
      labelDeal: 'Spieltyp:',
      labelMode: 'Modus:',
      labelTime: 'Zeit:',
      labelMoves: 'Züge:',
      labelScore: 'Endstand:',
      labelName: 'Gib deinen Namen für die Bestenliste ein:',
      namePlaceholder: 'Spielername',
      btnSaveScore: 'Speichern',
      saveSuccess: '✅ Rekord weltweit eingetragen!',
      saveSuccessLocal: '✅ Rekord lokal gespeichert!',
      btnScores: 'Bestenliste',
      btnReplay: 'Nochmal spielen',
      dealSolvable: 'Lösbar',
      dealRandom: 'Zufällig',
      modeDraw1: '1 Karte',
      modeDraw3: '3 Karten'
    },
    scoresModal: {
      badge: 'RUHMESHALLE',
      title: '🏆 Bestenliste',
      tabDraw1: '🃏 1 Karte (Top 100)',
      tabDraw3: '🃏 3 Karten (Top 100)',
      filterAll: 'Alle',
      filterDesktop: '💻 PC',
      filterMobile: '📱 Handy',
      loading: 'Bestenliste wird geladen...',
      refreshTitle: 'Aktualisieren',
      offlineNotice: 'Offline - Lokale Rekorde werden angezeigt.',
      thPlayer: 'Spieler',
      thScore: 'Punkte',
      thTime: 'Zeit',
      thMoves: 'Züge',
      thDate: 'Datum',
      empty: 'Noch keine Rekorde erfasst. Gewinne ein Spiel, um Geschichte zu schreiben!',
      btnClose: 'Schließen'
    },
    settingsModal: {
      badge: 'KONFIGURATION',
      title: '⚙️ Einstellungen',
      sectionGame: 'Spiel & Tisch',
      labelDeal: 'Spielstil:',
      optDealSolvable: '🌟 Lösbar (Präpariert)',
      optDealRandom: '🎲 Zufällig (Klassisch)',
      labelDraw: 'Karten ziehen:',
      optDraw1: '1 Karte (Einfach)',
      optDraw3: '3 Karten (Klassisch)',
      labelFelt: 'Tisch-Oberfläche:',
      optOak: '🪵 Eichenholz (Taverne)',
      optEmerald: '🟢 Smaragdgrün',
      optNavy: '🔵 Marineblau',
      optBurgundy: '🔴 Bordeauxrot',
      optSlate: '⚫ Schiefergrau',
      optViolet: '🟣 Violett',
      labelLang: 'Sprache:',
      sectionAudio: 'Sound & Lautstärke',
      musicLabel: '🎵 Musik (Irischer Folk)',
      cardsLabel: '🃏 Karten-Sounds',
      drinksLabel: '🥃 Trink-Sounds (Ablage)',
      victoryLabel: '🎺 Sieges-Fanfare',
      btnClose: 'Schließen'
    },
    toasts: {
      dealSolvable: '🌟 Lösbarer Modus: Mathematisch garantiert gewinnbar!',
      dealRandom: '🎲 Zufälliger Modus: Klassisch ungemischter Zufalls-Deal.',
      switchDrawConfirm: 'Beim Wechseln des Zieh-Modus wird ein neues Spiel gestartet. Fortfahren?',
      sweptSuccess: (count) => `⚡ ${count} Karte(n) auf Ablagen abgelegt!`,
      noSweep: 'Aktuell kann keine Karte abgelegt werden.',
      dealRestarted: '↺ Spiel von Zug 1 neu gestartet! Viel Erfolg.',
      deckCycled: 'Stapel durchblättert',
      autoFinishReady: '⚡ Alle Karten aufgedeckt! Du kannst jetzt "Auto-Fertig" nutzen.',
      autoFinishing: 'Lege verbleibende Karten automatisch ab...',
      cannotUndo: 'Kein weiterer Zug zum Rückgängigmachen vorhanden.',
      moveUndone: 'Zug rückgängig gemacht.',
      hintFoundFoundation: (label, suit) => `Lege ${label} (${suit}) auf die Ablage`,
      hintFoundReveal: (col) => `Verschiebe Karten, um verdeckte Karte in Spalte ${col} aufzudecken`,
      hintFoundTableau: (label, suit, col) => `Lege ${label} (${suit}) auf Spalte ${col}`,
      hintStock: '💡 Tipp: Ziehe eine neue Karte vom Nachziehstapel!'
    }
  },
  en: {
    pageTitle: 'Classic Klondike Solitaire - Schnaps Edition',
    mainTitle: 'Solitaire',
    badgeEdition: '🥃 Schnaps Edition',
    dealSolvable: '✨ Solvable',
    dealRandom: '🎲 Random',
    dealSolvableTitle: 'This deal is mathematically verified to be 100% winnable!',
    dealRandomTitle: 'Classic unmodified card deal',
    labelDeal: 'Deal:',
    optSolvable: '🌟 Solvable',
    optRandom: '🎲 Random',
    labelDraw: 'Draw:',
    optDraw1: 'Draw 1',
    optDraw3: 'Draw 3',
    labelFelt: 'Felt:',
    optOak: '🪵 Oak',
    optEmerald: '🟢 Emerald',
    optNavy: '🔵 Navy',
    optBurgundy: '🔴 Burgundy',
    optSlate: '⚫ Slate',
    optViolet: '🟣 Violet',
    labelLang: 'Language:',
    statScore: 'SCORE',
    statMoves: 'MOVES',
    statTime: 'TIME',
    btnAutoFinish: '⚡ Auto-Finish',
    btnAutoFinishTitle: 'All hidden cards revealed! Automatically send cards to foundations',
    btnSweep: '⚡ Sweep',
    btnSweepTitle: 'Sweep all possible cards to Foundations (or right-click / double-tap the table felt)',
    btnHint: '💡 Hint',
    btnHintTitle: 'Highlight an available move',
    btnUndo: '↩ Undo',
    btnUndoTitle: 'Undo previous move',
    btnReplay: '↺ Replay Deal',
    btnReplayTitle: 'Restart this exact deal from the beginning',
    btnScores: '🏆 Scores',
    btnScoresTitle: 'View High Scores leaderboards',
    btnSettings: '⚙️ Settings',
    btnSettingsTitle: 'Open Settings',
    btnSoundOn: '🔊 Sound',
    btnSoundOff: '🔇 Muted',
    btnSoundTitle: 'Toggle sound effects',
    btnMusicOn: '🎵 Music',
    btnMusicOff: '🔇 Music',
    btnMusicTitle: 'Toggle background music (Irish Folk)',
    btnNew: 'New Game',
    btnNewTitle: 'Start a fresh game',
    stockTitle: 'Click to draw cards',
    wasteTitle: 'Drawn cards',
    foundations: {
      clubs: 'Black Shot Glass Foundation',
      spades: 'Black Drop Foundation',
      diamonds: 'Green Shot Glass Foundation',
      hearts: 'Green Drop Foundation'
    },
    legend: {
      rulesTitle: '🥃 <strong>Alternating Rules (Black ⇄ Green):</strong>',
      blackGlass: 'Black Shot Glass (♣)',
      blackDrop: 'Black Drop (♠)',
      greenGlass: 'Green Shot Glass (♦)',
      greenDrop: 'Green Drop (♥)',
      sweepHint: '🖱️ <em>Right-click</em>, tap <strong>⚡ Sweep</strong>, or double-tap felt to auto-sweep cards to Foundations!'
    },
    courtTitles: {
      11: 'JACK',
      12: 'QUEEN',
      13: 'KING'
    },
    suitTitles: {
      clubs: 'Black Shot Glass',
      spades: 'Black Drop',
      diamonds: 'Green Shot Glass',
      hearts: 'Green Drop'
    },
    winModal: {
      badge: '🏆 PROST! VICTORY!',
      title: 'Congratulations!',
      desc: 'You conquered the Schnaps Solitaire Edition!',
      labelDeal: 'Deal Type:',
      labelMode: 'Game Mode:',
      labelTime: 'Time:',
      labelMoves: 'Moves:',
      labelScore: 'Final Score:',
      labelName: 'Enter your name for the Highscores:',
      namePlaceholder: 'Player Name',
      btnSaveScore: 'Save Score',
      saveSuccess: '✅ Score saved to global leaderboard!',
      saveSuccessLocal: '✅ Score saved locally!',
      btnScores: 'Leaderboard',
      btnReplay: 'Play Again',
      dealSolvable: 'Solvable',
      dealRandom: 'Random',
      modeDraw1: 'Draw 1',
      modeDraw3: 'Draw 3'
    },
    scoresModal: {
      badge: 'HALL OF FAME',
      title: '🏆 High Scores',
      tabDraw1: '🃏 Draw 1 (Top 100)',
      tabDraw3: '🃏 Draw 3 (Top 100)',
      filterAll: 'All',
      filterDesktop: '💻 PC',
      filterMobile: '📱 Mobile',
      loading: 'Loading high scores...',
      refreshTitle: 'Refresh',
      offlineNotice: 'Offline - Showing local scores.',
      thPlayer: 'Player',
      thScore: 'Score',
      thTime: 'Time',
      thMoves: 'Moves',
      thDate: 'Date',
      empty: 'No high scores recorded yet. Win a game to make history!',
      btnClose: 'Close'
    },
    settingsModal: {
      badge: 'CONFIGURATION',
      title: '⚙️ Settings',
      sectionGame: 'Game & Tabletop',
      labelDeal: 'Game Style:',
      optDealSolvable: '🌟 Rigged (Solvable)',
      optDealRandom: '🎲 Random (Classic)',
      labelDraw: 'Drawing Mode:',
      optDraw1: '1 Card (Casual)',
      optDraw3: '3 Cards (Classic)',
      labelFelt: 'Tabletop Style:',
      optOak: '🪵 Oak Tavern',
      optEmerald: '🟢 Emerald Green',
      optNavy: '🔵 Royal Navy',
      optBurgundy: '🔴 Velvet Burgundy',
      optSlate: '⚫ Dark Slate',
      optViolet: '🟣 Deep Violet',
      labelLang: 'Language:',
      sectionAudio: 'Sound & Volume',
      musicLabel: '🎵 Background Music (Irish Folk)',
      cardsLabel: '🃏 Card Sounds',
      drinksLabel: '🥃 Drinking Sounds (Foundation)',
      victoryLabel: '🎺 Victory Fanfare',
      btnClose: 'Close'
    },
    toasts: {
      dealSolvable: '🌟 Solvable Mode: Guaranteed winnable deal!',
      dealRandom: '🎲 Random Mode: Unmodified shuffle.',
      switchDrawConfirm: 'Switching draw mode will start a fresh game. Proceed?',
      sweptSuccess: (count) => `⚡ Swept ${count} card(s) to Foundations!`,
      noSweep: 'No cards can be moved to Foundations right now.',
      dealRestarted: '↺ Deal restarted from move 1! Try a fresh approach.',
      deckCycled: 'Deck cycled',
      autoFinishReady: '⚡ All hidden cards revealed! You can now Auto-Finish.',
      autoFinishing: 'Auto-finishing remaining cards...',
      cannotUndo: 'Cannot undo further.',
      moveUndone: 'Move undone.',
      hintFoundFoundation: (label, suit) => `Move ${label} of ${suit} to Foundation`,
      hintFoundReveal: (col) => `Move stack to reveal hidden card in column ${col}`,
      hintFoundTableau: (label, suit, col) => `Move ${label} of ${suit} to column ${col}`,
      hintStock: '💡 Hint: Draw from the Stock pile to find new cards!'
    }
  },
  es: {
    pageTitle: 'Solitario Klondike Clásico - Edición Schnaps',
    mainTitle: 'Solitario',
    badgeEdition: '🥃 Edición Schnaps',
    dealSolvable: '✨ Con solución',
    dealRandom: '🎲 Aleatorio',
    dealSolvableTitle: '¡Esta partida está matemáticamente verificada como 100% ganable!',
    dealRandomTitle: 'Reparto aleatorio sin modificaciones',
    labelDeal: 'Reparto:',
    optSolvable: '🌟 Con solución',
    optRandom: '🎲 Aleatorio',
    labelDraw: 'Robo:',
    optDraw1: '1 Carta',
    optDraw3: '3 Cartas',
    labelFelt: 'Tapete:',
    optOak: '🪵 Roble',
    optEmerald: '🟢 Esmeralda',
    optNavy: '🔵 Marino',
    optBurgundy: '🔴 Burdeos',
    optSlate: '⚫ Pizarra',
    optViolet: '🟣 Violeta',
    labelLang: 'Idioma:',
    statScore: 'PUNTOS',
    statMoves: 'MOVIM.',
    statTime: 'TIEMPO',
    btnAutoFinish: '⚡ Auto-Completar',
    btnAutoFinishTitle: '¡Todas las cartas descubiertas! Enviar cartas a las bases automáticamente',
    btnSweep: '⚡ Recoger',
    btnSweepTitle: 'Enviar todas las cartas posibles a las bases (o clic derecho / doble toque al tapete)',
    btnHint: '💡 Pista',
    btnHintTitle: 'Mostrar un movimiento disponible',
    btnUndo: '↩ Deshacer',
    btnUndoTitle: 'Deshacer el último movimiento',
    btnReplay: '↺ Repetir',
    btnReplayTitle: 'Reiniciar este mismo reparto desde el principio',
    btnScores: '🏆 Récords',
    btnScoresTitle: 'Ver tabla de récords',
    btnSettings: '⚙️ Ajustes',
    btnSettingsTitle: 'Abrir ajustes',
    btnSoundOn: '🔊 Sonido',
    btnSoundOff: '🔇 Silencio',
    btnSoundTitle: 'Activar o desactivar efectos de sonido',
    btnMusicOn: '🎵 Música',
    btnMusicOff: '🔇 Música',
    btnMusicTitle: 'Activar o desactivar música de fondo (Irish Folk)',
    btnNew: 'Nueva partida',
    btnNewTitle: 'Iniciar una nueva partida',
    stockTitle: 'Clic para robar cartas',
    wasteTitle: 'Cartas robadas',
    foundations: {
      clubs: 'Base de vaso de chupito negro',
      spades: 'Base de gota negra',
      diamonds: 'Base de vaso de chupito verde',
      hearts: 'Base de gota verde'
    },
    legend: {
      rulesTitle: '🥃 <strong>Reglas de alternancia (Negro ⇄ Verde):</strong>',
      blackGlass: 'Vaso de chupito negro (♣)',
      blackDrop: 'Gota negra (♠)',
      greenGlass: 'Vaso de chupito verde (♦)',
      greenDrop: 'Gota verde (♥)',
      sweepHint: '🖱️ <em>Clic derecho</em>, pulsa <strong>⚡ Recoger</strong> o doble toque al tapete para enviar a las bases!'
    },
    courtTitles: {
      11: 'SOTA',
      12: 'REINA',
      13: 'REY'
    },
    suitTitles: {
      clubs: 'Vaso de chupito negro',
      spades: 'Gota negra',
      diamonds: 'Vaso de chupito verde',
      hearts: 'Gota verde'
    },
    winModal: {
      badge: '🏆 ¡SALUD! ¡VICTORIA!',
      title: '¡Felicidades!',
      desc: '¡Has completado la edición Schnaps del Solitario!',
      labelDeal: 'Tipo de reparto:',
      labelMode: 'Modo de juego:',
      labelTime: 'Tiempo:',
      labelMoves: 'Movimientos:',
      labelScore: 'Puntuación:',
      labelName: 'Introduce tu nombre para la clasificación:',
      namePlaceholder: 'Nombre de jugador',
      btnSaveScore: 'Guardar',
      saveSuccess: '✅ ¡Puntuación guardada globalmente!',
      saveSuccessLocal: '✅ ¡Puntuación guardada localmente!',
      btnScores: 'Clasificación',
      btnReplay: 'Jugar de nuevo',
      dealSolvable: 'Con solución',
      dealRandom: 'Aleatorio',
      modeDraw1: '1 Carta',
      modeDraw3: '3 Cartas'
    },
    scoresModal: {
      badge: 'SALÓN DE LA FAMA',
      title: '🏆 Récords',
      tabDraw1: '🃏 1 Carta (Top 100)',
      tabDraw3: '🃏 3 Cartas (Top 100)',
      filterAll: 'Todos',
      filterDesktop: '💻 PC',
      filterMobile: '📱 Móvil',
      loading: 'Cargando mejores puntuaciones...',
      refreshTitle: 'Actualizar',
      offlineNotice: 'Sin conexión - Mostrando récords locales.',
      thPlayer: 'Jugador',
      thScore: 'Puntos',
      thTime: 'Tiempo',
      thMoves: 'Movim.',
      thDate: 'Fecha',
      empty: '¡Aún no hay récords registrados! Gana una partida para entrar en la historia.',
      btnClose: 'Cerrar'
    },
    settingsModal: {
      badge: 'OPCIONES',
      title: '⚙️ Ajustes',
      sectionGame: 'Partida y Tapete',
      labelDeal: 'Estilo de juego:',
      optDealSolvable: '🌟 Preparada (Garantizada)',
      optDealRandom: '🎲 Aleatoria (Clásica)',
      labelDraw: 'Modo de robo:',
      optDraw1: '1 Carta (Fácil)',
      optDraw3: '3 Cartas (Clásico)',
      labelFelt: 'Estilo del tapete:',
      optOak: '🪵 Roble Taberna',
      optEmerald: '🟢 Esmeralda',
      optNavy: '🔵 Azul Marino',
      optBurgundy: '🔴 Burdeos',
      optSlate: '⚫ Pizarra',
      optViolet: '🟣 Violeta',
      labelLang: 'Idioma:',
      sectionAudio: 'Audio y Volumen',
      musicLabel: '🎵 Música de fondo (Irish Folk)',
      cardsLabel: '🃏 Sonidos de cartas',
      drinksLabel: '🥃 Sonidos de chupitos (Ablación)',
      victoryLabel: '🎺 Sonido de victoria',
      btnClose: 'Cerrar'
    },
    toasts: {
      dealSolvable: '🌟 Modo con solución: ¡Partida ganable garantizada!',
      dealRandom: '🎲 Modo aleatorio: Barajado clásico sin filtros.',
      switchDrawConfirm: 'Cambiar el modo de robo iniciará una nueva partida. ¿Continuar?',
      sweptSuccess: (count) => `⚡ ¡${count} carta(s) enviada(s) a las bases!`,
      noSweep: 'No hay cartas que se puedan mover a las bases en este momento.',
      dealRestarted: '↺ ¡Partida reiniciada desde el primer movimiento!',
      deckCycled: 'Mazo recorrido',
      autoFinishReady: '⚡ ¡Todas las cartas descubiertas! Puedes usar Auto-Completar.',
      autoFinishing: 'Completando cartas restantes automáticamente...',
      cannotUndo: 'No se puede deshacer más.',
      moveUndone: 'Movimiento deshecho.',
      hintFoundFoundation: (label, suit) => `Mueve ${label} (${suit}) a la base`,
      hintFoundReveal: (col) => `Mueve cartas para descubrir la oculta en columna ${col}`,
      hintFoundTableau: (label, suit, col) => `Mueve ${label} (${suit}) a la columna ${col}`,
      hintStock: '💡 Pista: ¡Roba una carta del mazo para encontrar jugadas!'
    }
  },
  ru: {
    pageTitle: 'Классический пасьянс Косынка - Schnaps Edition',
    mainTitle: 'Пасьянс',
    badgeEdition: '🥃 Schnaps Edition',
    dealSolvable: '✨ Решаемая',
    dealRandom: '🎲 Случайная',
    dealSolvableTitle: 'Этот расклад гарантированно решается на 100%!',
    dealRandomTitle: 'Классическая случайная тасовка колоды',
    labelDeal: 'Расклад:',
    optSolvable: '🌟 Решаемый',
    optRandom: '🎲 Случайный',
    labelDraw: 'Раздача:',
    optDraw1: 'По 1 карте',
    optDraw3: 'По 3 карты',
    labelFelt: 'Сукно:',
    optOak: '🪵 Дуб',
    optEmerald: '🟢 Изумруд',
    optNavy: '🔵 Синий',
    optBurgundy: '🔴 Бордо',
    optSlate: '⚫ Сланец',
    optViolet: '🟣 Фиолетовый',
    labelLang: 'Язык:',
    statScore: 'СЧЁТ',
    statMoves: 'ХОДЫ',
    statTime: 'ВРЕМЯ',
    btnAutoFinish: '⚡ Автозавершение',
    btnAutoFinishTitle: 'Все карты открыты! Автоматически собрать карты в дом',
    btnSweep: '⚡ Собрать',
    btnSweepTitle: 'Перенести все возможные карты в дом (или правый клик / двойной тап по столу)',
    btnHint: '💡 Подсказка',
    btnHintTitle: 'Показать доступный ход',
    btnUndo: '↩ Отмена',
    btnUndoTitle: 'Отменить предыдущий ход',
    btnReplay: '↺ Заново',
    btnReplayTitle: 'Переиграть этот расклад с начала',
    btnScores: '🏆 Рекорды',
    btnScoresTitle: 'Посмотреть таблицу рекордов',
    btnSettings: '⚙️ Настройки',
    btnSettingsTitle: 'Открыть настройки',
    btnSoundOn: '🔊 Звук',
    btnSoundOff: '🔇 Без звука',
    btnSoundTitle: 'Включить / выключить звуковые эффекты',
    btnMusicOn: '🎵 Музыка',
    btnMusicOff: '🔇 Музыка',
    btnMusicTitle: 'Включить / выключить музыку (Irish Folk)',
    btnNew: 'Новая игра',
    btnNewTitle: 'Начать новую партию',
    stockTitle: 'Нажмите, чтобы взять карту',
    wasteTitle: 'Сброс',
    foundations: {
      clubs: 'Дом чёрной рюмки',
      spades: 'Дом чёрной капли',
      diamonds: 'Дом зелёной рюмки',
      hearts: 'Дом зелёной капли'
    },
    legend: {
      rulesTitle: '🥃 <strong>Правило чередования (Чёрный ⇄ Зелёный):</strong>',
      blackGlass: 'Чёрная рюмка (♣)',
      blackDrop: 'Чёрная капля (♠)',
      greenGlass: 'Зелёная рюмка (♦)',
      greenDrop: 'Зелёная капля (♥)',
      sweepHint: '🖱️ <em>Правый клик</em>, кнопка <strong>⚡ Собрать</strong> или двойной тап по столу для автосбора в дом!'
    },
    courtTitles: {
      11: 'ВАЛЕТ',
      12: 'ДАМА',
      13: 'КОРОЛЬ'
    },
    suitTitles: {
      clubs: 'Чёрная рюмка',
      spades: 'Чёрная капля',
      diamonds: 'Зелёная рюмка',
      hearts: 'Зелёная капля'
    },
    winModal: {
      badge: '🏆 НА ЗДОРОВЬЕ! ПОБЕДА!',
      title: 'Поздравляем!',
      desc: 'Вы успешно покорили пасьянс Schnaps Edition!',
      labelDeal: 'Тип расклада:',
      labelMode: 'Режим игры:',
      labelTime: 'Время:',
      labelMoves: 'Ходы:',
      labelScore: 'Итоговый счёт:',
      labelName: 'Введите имя для таблицы рекордов:',
      namePlaceholder: 'Имя игрока',
      btnSaveScore: 'Сохранить',
      saveSuccess: '✅ Результат сохранён в мировой таблице!',
      saveSuccessLocal: '✅ Результат сохранён локально!',
      btnScores: 'Рекорды',
      btnReplay: 'Сыграть ещё',
      dealSolvable: 'Решаемый',
      dealRandom: 'Случайный',
      modeDraw1: 'По 1 карте',
      modeDraw3: 'По 3 карты'
    },
    scoresModal: {
      badge: 'ЗАЛ СЛАВЫ',
      title: '🏆 Рекорды',
      tabDraw1: '🃏 По 1 (Топ 100)',
      tabDraw3: '🃏 По 3 (Топ 100)',
      filterAll: 'Все',
      filterDesktop: '💻 ПК',
      filterMobile: '📱 Мобильный',
      loading: 'Загрузка рекордов...',
      refreshTitle: 'Обновить',
      offlineNotice: 'Офлайн — показаны локальные рекорды.',
      thPlayer: 'Игрок',
      thScore: 'Счёт',
      thTime: 'Время',
      thMoves: 'Ходы',
      thDate: 'Дата',
      empty: 'Пока нет рекордов. Выиграйте партию, чтобы войти в историю!',
      btnClose: 'Закрыть'
    },
    settingsModal: {
      badge: 'ПАРАМЕТРЫ',
      title: '⚙️ Настройки',
      sectionGame: 'Игра и стол',
      labelDeal: 'Стиль игры:',
      optDealSolvable: '🌟 Решаемая (Гарантия)',
      optDealRandom: '🎲 Случайная (Классика)',
      labelDraw: 'Раздача карт:',
      optDraw1: 'По 1 карте (Легко)',
      optDraw3: 'По 3 карты (Классика)',
      labelFelt: 'Сукно стола:',
      optOak: '🪵 Таверна (Дуб)',
      optEmerald: '🟢 Изумруд',
      optNavy: '🔵 Морской синий',
      optBurgundy: '🔴 Бордо',
      optSlate: '⚫ Графит / сланец',
      optViolet: '🟣 Фиолетовый',
      labelLang: 'Язык:',
      sectionAudio: 'Звук и громкость',
      musicLabel: '🎵 Фоновая музыка (Irish Folk)',
      cardsLabel: '🃏 Звуки карт',
      drinksLabel: '🥃 Звуки рюмки (Сбор в дом)',
      victoryLabel: '🎺 Победный сигнал (Фанфары)',
      btnClose: 'Закрыть'
    },
    toasts: {
      dealSolvable: '🌟 Решаемый режим: расклад со 100% гарантией победы!',
      dealRandom: '🎲 Случайный режим: классическая случайная тасовка.',
      switchDrawConfirm: 'Переключение режима раздачи начнет новую игру. Продолжить?',
      sweptSuccess: (count) => `⚡ Собрано карт в дом: ${count}!`,
      noSweep: 'Сейчас нет карт для перемещения в дом.',
      dealRestarted: '↺ Расклад начат заново с 1 хода! Попробуйте другой подход.',
      deckCycled: 'Колода пролистана',
      autoFinishReady: '⚡ Все карты открыты! Теперь можно использовать автозавершение.',
      autoFinishing: 'Автоматический сбор оставшихся карт...',
      cannotUndo: 'Больше ходов для отмены нет.',
      moveUndone: 'Ход отменён.',
      hintFoundFoundation: (label, suit) => `Положите ${label} (${suit}) в дом`,
      hintFoundReveal: (col) => `Переместите стопку, чтобы открыть карту в колонке ${col}`,
      hintFoundTableau: (label, suit, col) => `Положите ${label} (${suit}) на колонку ${col}`,
      hintStock: '💡 Подсказка: возьмите карту из колоды!'
    }
  },
  sv: {
    pageTitle: 'Klassisk Klondike Patiens - Schnaps Edition',
    mainTitle: 'Patiens',
    badgeEdition: '🥃 Schnaps Edition',
    dealSolvable: '✨ Lösbar giv',
    dealRandom: '🎲 Slumpad',
    dealSolvableTitle: 'Denna giv är matematiskt garanterad att kunna lösas till 100%!',
    dealRandomTitle: 'Klassisk slumpmässigt blandad kortlek',
    labelDeal: 'Giv:',
    optSolvable: '🌟 Lösbar',
    optRandom: '🎲 Slumpad',
    labelDraw: 'Dra:',
    optDraw1: '1 kort',
    optDraw3: '3 kort',
    labelFelt: 'Filt:',
    optOak: '🪵 Ek',
    optEmerald: '🟢 Smaragd',
    optNavy: '🔵 Marin',
    optBurgundy: '🔴 Vinröd',
    optSlate: '⚫ Skiffer',
    optViolet: '🟣 Violett',
    labelLang: 'Språk:',
    statScore: 'POÄNG',
    statMoves: 'DRAG',
    statTime: 'TID',
    btnAutoFinish: '⚡ Slutför aut.',
    btnAutoFinishTitle: 'Alla dolda kort har visats! Skicka automatiskt kort till baserna',
    btnSweep: '⚡ Samla in',
    btnSweepTitle: 'Samla alla möjliga kort till baserna (eller högerklicka / dubbeltryck på filten)',
    btnHint: '💡 Tips',
    btnHintTitle: 'Visa ett tillgängligt drag',
    btnUndo: '↩ Ångra',
    btnUndoTitle: 'Ångra senaste draget',
    btnReplay: '↺ Spela om',
    btnReplayTitle: 'Starta om denna giv från början',
    btnScores: '🏆 Topplista',
    btnScoresTitle: 'Visa poängtopplista',
    btnSettings: '⚙️ Inställningar',
    btnSettingsTitle: 'Öppna inställningar',
    btnSoundOn: '🔊 Ljud',
    btnSoundOff: '🔇 Ljud av',
    btnSoundTitle: 'Slå på/av ljudeffekter',
    btnMusicOn: '🎵 Musik',
    btnMusicOff: '🔇 Musik',
    btnMusicTitle: 'Slå på/av bakgrundsmusik (Irländsk folk)',
    btnNew: 'Nytt spel',
    btnNewTitle: 'Starta en ny omgång',
    stockTitle: 'Klicka för att dra kort',
    wasteTitle: 'Draget kort',
    foundations: {
      clubs: 'Bas för svart snapsglas',
      spades: 'Bas för svart droppe',
      diamonds: 'Bas för grönt snapsglas',
      hearts: 'Bas för grön droppe'
    },
    legend: {
      rulesTitle: '🥃 <strong>Regler: Växlande färger (Svart ⇄ Grön):</strong>',
      blackGlass: 'Svart snapsglas (♣)',
      blackDrop: 'Svart droppe (♠)',
      greenGlass: 'Grönt snapsglas (♦)',
      greenDrop: 'Grön droppe (♥)',
      sweepHint: '🖱️ <em>Högerklicka</em>, tryck <strong>⚡ Samla in</strong> eller dubbeltryck på filten för automatisk insamling!'
    },
    courtTitles: {
      11: 'KNEKT',
      12: 'DAM',
      13: 'KUNG'
    },
    suitTitles: {
      clubs: 'Svart snapsglas',
      spades: 'Svart droppe',
      diamonds: 'Grönt snapsglas',
      hearts: 'Grön droppe'
    },
    winModal: {
      badge: '🏆 SKÅL! SEGER!',
      title: 'Grattis!',
      desc: 'Du klarade Schnaps Solitaire Edition!',
      labelDeal: 'Givtyp:',
      labelMode: 'Spelläge:',
      labelTime: 'Tid:',
      labelMoves: 'Drag:',
      labelScore: 'Slutpoäng:',
      labelName: 'Ange ditt namn för topplistan:',
      namePlaceholder: 'Spelarnamn',
      btnSaveScore: 'Spara resultat',
      saveSuccess: '✅ Sparat på global topplista!',
      saveSuccessLocal: '✅ Sparat lokalt!',
      btnScores: 'Topplista',
      btnReplay: 'Spela igen',
      dealSolvable: 'Lösbar',
      dealRandom: 'Slumpad',
      modeDraw1: '1 kort',
      modeDraw3: '3 kort'
    },
    scoresModal: {
      badge: 'HALL OF FAME',
      title: '🏆 Topplista',
      tabDraw1: '🃏 1 Kort (Topp 100)',
      tabDraw3: '🃏 3 Kort (Topp 100)',
      filterAll: 'Alla',
      filterDesktop: '💻 Dator',
      filterMobile: '📱 Mobil',
      loading: 'Laddar topplista...',
      refreshTitle: 'Uppdatera',
      offlineNotice: 'Offline - Visar lokala resultat.',
      thPlayer: 'Spelare',
      thScore: 'Poäng',
      thTime: 'Tid',
      thMoves: 'Drag',
      thDate: 'Datum',
      empty: 'Inga sparade poäng än. Vinn ett spel för att skriva historia!',
      btnClose: 'Stäng'
    },
    settingsModal: {
      badge: 'INSTÄLLNINGAR',
      title: '⚙️ Inställningar',
      sectionGame: 'Spel & Bord',
      labelDeal: 'Spelstil:',
      optDealSolvable: '🌟 Lösbar (Garanterad)',
      optDealRandom: '🎲 Slumpmässig',
      labelDraw: 'Dragläge:',
      optDraw1: '1 kort (Lätt)',
      optDraw3: '3 kort (Klassisk)',
      labelFelt: 'Bordsstil:',
      optOak: '🪵 Ek Taverna',
      optEmerald: '🟢 Smaragd',
      optNavy: '🔵 Marinblå',
      optBurgundy: '🔴 Vinröd',
      optSlate: '⚫ Skiffer',
      optViolet: '🟣 Violett',
      labelLang: 'Språk:',
      sectionAudio: 'Ljud & Volym',
      musicLabel: '🎵 Bakgrundsmusik (Irländsk folk)',
      cardsLabel: '🃏 Kortljud',
      drinksLabel: '🥃 Dryckesljud (Ablation)',
      victoryLabel: '🎺 Segerljud (Fanfar)',
      btnClose: 'Stäng'
    },
    toasts: {
      dealSolvable: '🌟 Lösbart läge: Garanterat vinnbar giv!',
      dealRandom: '🎲 Slumpmässigt läge: Helt slumpad giv.',
      switchDrawConfirm: 'Att byta dragläge startar ett nytt spel. Fortsätta?',
      sweptSuccess: (count) => `⚡ Samlade ${count} kort till baserna!`,
      noSweep: 'Inga kort kan flyttas till baserna just nu.',
      dealRestarted: '↺ Givan startades om från drag 1! Försök igen.',
      deckCycled: 'Leken vänd',
      autoFinishReady: '⚡ Alla dolda kort framme! Du kan nu slutföra automatiskt.',
      autoFinishing: 'Slutför resterande kort automatiskt...',
      cannotUndo: 'Det finns inga fler drag att ångra.',
      moveUndone: 'Draget ångrades.',
      hintFoundFoundation: (label, suit) => `Flytta ${label} (${suit}) till basen`,
      hintFoundReveal: (col) => `Flytta kort för att visa dolt kort i kolumn ${col}`,
      hintFoundTableau: (label, suit, col) => `Flytta ${label} (${suit}) till kolumn ${col}`,
      hintStock: '💡 Tips: Dra ett kort från leken för att hitta nya drag!'
    }
  },
  it: {
    pageTitle: 'Solitario Klondike Classico - Schnaps Edition',
    mainTitle: 'Solitario',
    badgeEdition: '🥃 Schnaps Edition',
    dealSolvable: '✨ Risolvibile',
    dealRandom: '🎲 Casuale',
    dealSolvableTitle: 'Questa partita è matematicamente verificata come risolvibile al 100%!',
    dealRandomTitle: 'Mescolamento classico delle carte',
    labelDeal: 'Distrib.:',
    optSolvable: '🌟 Risolvibile',
    optRandom: '🎲 Casuale',
    labelDraw: 'Pesca:',
    optDraw1: '1 Carta',
    optDraw3: '3 Carte',
    labelFelt: 'Tavolo:',
    optOak: '🪵 Quercia',
    optEmerald: '🟢 Smeraldo',
    optNavy: '🔵 Blu Navy',
    optBurgundy: '🔴 Borgogna',
    optSlate: '⚫ Ardesia',
    optViolet: '🟣 Viola',
    labelLang: 'Lingua:',
    statScore: 'PUNTI',
    statMoves: 'MOSSE',
    statTime: 'TEMPO',
    btnAutoFinish: '⚡ Auto-Completa',
    btnAutoFinishTitle: 'Tutte le carte coperte sono scoperte! Invia automaticamente alle basi',
    btnSweep: '⚡ Raccogli',
    btnSweepTitle: 'Invia tutte le carte possibili alle basi (o clic destro / doppio tocco sul tavolo)',
    btnHint: '💡 Aiuto',
    btnHintTitle: 'Mostra una mossa disponibile',
    btnUndo: '↩ Annulla',
    btnUndoTitle: 'Annulla l\'ultima mossa',
    btnReplay: '↺ Rigioca',
    btnReplayTitle: 'Rigioca questa stessa partita dall\'inizio',
    btnScores: '🏆 Record',
    btnScoresTitle: 'Visualizza la classifica dei record',
    btnSettings: '⚙️ Impostazioni',
    btnSettingsTitle: 'Apri impostazioni',
    btnSoundOn: '🔊 Audio',
    btnSoundOff: '🔇 Muto',
    btnSoundTitle: 'Attiva/disattiva effetti audio',
    btnMusicOn: '🎵 Musica',
    btnMusicOff: '🔇 Musica',
    btnMusicTitle: 'Attiva/disattiva musica di sottofondo (Folk irlandese)',
    btnNew: 'Nuova partita',
    btnNewTitle: 'Inizia una nuova partita',
    stockTitle: 'Clicca per pescare carte',
    wasteTitle: 'Carte pescate',
    foundations: {
      clubs: 'Base bicchierino nero',
      spades: 'Base goccia nera',
      diamonds: 'Base bicchierino verde',
      hearts: 'Base goccia verde'
    },
    legend: {
      rulesTitle: '🥃 <strong>Regole: Colori alternati (Nero ⇄ Verde):</strong>',
      blackGlass: 'Bicchierino nero (♣)',
      blackDrop: 'Goccia nera (♠)',
      greenGlass: 'Bicchierino verde (♦)',
      greenDrop: 'Goccia verde (♥)',
      sweepHint: '🖱️ <em>Clic destro</em>, tocca <strong>⚡ Raccogli</strong> o doppio tocco sul tavolo per inviare alle basi!'
    },
    courtTitles: {
      11: 'FANTE',
      12: 'REGINA',
      13: 'RE'
    },
    suitTitles: {
      clubs: 'Bicchierino nero',
      spades: 'Goccia nera',
      diamonds: 'Bicchierino verde',
      hearts: 'Goccia verde'
    },
    winModal: {
      badge: '🏆 PROSIT! VITTORIA!',
      title: 'Congratulazioni!',
      desc: 'Hai conquistato la Schnaps Solitaire Edition!',
      labelDeal: 'Tipo partita:',
      labelMode: 'Modalità:',
      labelTime: 'Tempo:',
      labelMoves: 'Mosse:',
      labelScore: 'Punteggio:',
      labelName: 'Inserisci il tuo nome per la classifica:',
      namePlaceholder: 'Nome giocatore',
      btnSaveScore: 'Salva record',
      saveSuccess: '✅ Salvato nella classifica globale!',
      saveSuccessLocal: '✅ Salvato localmente!',
      btnScores: 'Classifica',
      btnReplay: 'Gioca ancora',
      dealSolvable: 'Risolvibile',
      dealRandom: 'Casuale',
      modeDraw1: '1 Carta',
      modeDraw3: '3 Carte'
    },
    scoresModal: {
      badge: 'SALA DELLA GLORIA',
      title: '🏆 Classifica',
      tabDraw1: '🃏 1 Carta (Top 100)',
      tabDraw3: '🃏 3 Carte (Top 100)',
      filterAll: 'Tutti',
      filterDesktop: '💻 PC',
      filterMobile: '📱 Cellulare',
      loading: 'Caricamento classifica...',
      refreshTitle: 'Aggiorna',
      offlineNotice: 'Offline - Mostra record locali.',
      thPlayer: 'Giocatore',
      thScore: 'Punti',
      thTime: 'Tempo',
      thMoves: 'Mosse',
      thDate: 'Data',
      empty: 'Nessun record salvato. Vinci una partita per entrare nella storia!',
      btnClose: 'Chiudi'
    },
    settingsModal: {
      badge: 'OPZIONI',
      title: '⚙️ Impostazioni',
      sectionGame: 'Gioco & Tavolo',
      labelDeal: 'Stile di gioco:',
      optDealSolvable: '🌟 Risolvibile (Garantito)',
      optDealRandom: '🎲 Casuale (Classico)',
      labelDraw: 'Pesca carte:',
      optDraw1: '1 Carta (Facile)',
      optDraw3: '3 Carte (Classico)',
      labelFelt: 'Stile tavolo:',
      optOak: '🪵 Quercia Taverna',
      optEmerald: '🟢 Smeraldo',
      optNavy: '🔵 Blu Navy',
      optBurgundy: '🔴 Borgogna',
      optSlate: '⚫ Ardesia',
      optViolet: '🟣 Viola',
      labelLang: 'Lingua:',
      sectionAudio: 'Audio & Volume',
      musicLabel: '🎵 Musica di sottofondo (Folk)',
      cardsLabel: '🃏 Suoni delle carte',
      drinksLabel: '🥃 Suoni del sorso (Bicchierino)',
      victoryLabel: '🎺 Suono di vittoria (Fanfara)',
      btnClose: 'Chiudi'
    },
    toasts: {
      dealSolvable: '🌟 Modalità risolvibile: Partita garantita al 100%!',
      dealRandom: '🎲 Modalità casuale: Mescolamento classico.',
      switchDrawConfirm: 'Cambiare la modalità di pesca avvierà una nuova partita. Continuare?',
      sweptSuccess: (count) => `⚡ Inviate ${count} carta/e alle basi!`,
      noSweep: 'Nessuna carta può essere inviata alle basi in questo momento.',
      dealRestarted: '↺ Partita ricominciata dalla mossa 1! Buona fortuna.',
      deckCycled: 'Mazzo scorso',
      autoFinishReady: '⚡ Tutte le carte scoperte! Ora puoi usare Auto-Completa.',
      autoFinishing: 'Completamento automatico delle carte rimanenti...',
      cannotUndo: 'Nessun\'altra mossa da annullare.',
      moveUndone: 'Mossa annullata.',
      hintFoundFoundation: (label, suit) => `Sposta ${label} (${suit}) sulla base`,
      hintFoundReveal: (col) => `Sposta le carte per scoprire la carta nella colonna ${col}`,
      hintFoundTableau: (label, suit, col) => `Sposta ${label} (${suit}) nella colonna ${col}`,
      hintStock: '💡 Aiuto: Pesca una carta dal mazzo per trovare nuove mosse!'
    }
  }
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

    case 'spades': // 🖤 Black Drop (Dark Herbal / Licorice Liqueur Droplet)
      return `
        <svg class="${sizeClass}" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="blackDropGrad" x1="10" y1="4" x2="22" y2="36" gradientUnits="userSpaceOnUse">
              <stop stop-color="#37474f"/>
              <stop offset="0.3" stop-color="#212121"/>
              <stop offset="0.75" stop-color="#111111"/>
              <stop offset="1" stop-color="#020202"/>
            </linearGradient>
          </defs>

          <!-- Liquid Droplet Body -->
          <path d="M16 4 C14 8, 6.5 17.5, 6.5 26 A 9.5 9.5 0 0 0 25.5 26 C25.5 17.5, 18 8, 16 4 Z" fill="url(#blackDropGrad)" stroke="#546e7a" stroke-width="1.4" stroke-linejoin="round"/>
          
          <!-- Inner Rim Gloss -->
          <path d="M16 6 C14.5 9.5, 8.2 18, 8.2 25.5 A 7.8 7.8 0 0 0 23.8 25.5 C23.8 18, 17.5 9.5, 16 6 Z" fill="none" stroke="#37474f" stroke-width="0.8" opacity="0.6"/>

          <!-- Specular Highlight Curve -->
          <path d="M10.5 24 C10 18.5, 13.5 11, 15 8" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" opacity="0.85"/>
          <circle cx="11.5" cy="27" r="1.3" fill="#ffffff" opacity="0.9"/>

          <!-- Secondary Soft Rim Reflection -->
          <path d="M22.5 22 C23 25, 20.5 32, 17 33.5" stroke="rgba(255,255,255,0.25)" stroke-width="0.9" stroke-linecap="round"/>
        </svg>
      `;

    case 'hearts': // 💚 Green Drop (Mint / Emerald Schnaps Droplet)
      return `
        <svg class="${sizeClass}" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="greenDropGrad" x1="10" y1="4" x2="22" y2="36" gradientUnits="userSpaceOnUse">
              <stop stop-color="#00e676"/>
              <stop offset="0.4" stop-color="#00a844"/>
              <stop offset="0.85" stop-color="#006022"/>
              <stop offset="1" stop-color="#003814"/>
            </linearGradient>
          </defs>

          <!-- Liquid Droplet Body -->
          <path d="M16 4 C14 8, 6.5 17.5, 6.5 26 A 9.5 9.5 0 0 0 25.5 26 C25.5 17.5, 18 8, 16 4 Z" fill="url(#greenDropGrad)" stroke="#004d20" stroke-width="1.4" stroke-linejoin="round"/>
          
          <!-- Inner Glow Contour -->
          <path d="M16 6 C14.5 9.5, 8.2 18, 8.2 25.5 A 7.8 7.8 0 0 0 23.8 25.5 C23.8 18, 17.5 9.5, 16 6 Z" fill="none" stroke="#69f0ae" stroke-width="0.8" opacity="0.5"/>

          <!-- Specular Highlight Curve -->
          <path d="M10.5 24 C10 18.5, 13.5 11, 15 8" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" opacity="0.9"/>
          <circle cx="11.5" cy="27" r="1.3" fill="#ffffff" opacity="0.95"/>

          <!-- Liquid Core Bubble -->
          <circle cx="16" cy="27" r="2.2" fill="#b9f6ca" opacity="0.6"/>

          <!-- Secondary Soft Rim Reflection -->
          <path d="M22.5 22 C23 25, 20.5 32, 17 33.5" stroke="rgba(255,255,255,0.3)" stroke-width="0.9" stroke-linecap="round"/>
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
    3: [{ x: 50, y: 19 }, { x: 50, y: 50 }, { x: 50, y: 81 }],
    4: [{ x: 26, y: 22 }, { x: 74, y: 22 }, { x: 26, y: 78 }, { x: 74, y: 78 }],
    5: [{ x: 26, y: 20 }, { x: 74, y: 20 }, { x: 50, y: 50 }, { x: 26, y: 80 }, { x: 74, y: 80 }],
    6: [{ x: 26, y: 20 }, { x: 74, y: 20 }, { x: 26, y: 50 }, { x: 74, y: 50 }, { x: 26, y: 80 }, { x: 74, y: 80 }],
    7: [{ x: 26, y: 20 }, { x: 74, y: 20 }, { x: 50, y: 35 }, { x: 26, y: 50 }, { x: 74, y: 50 }, { x: 26, y: 80 }, { x: 74, y: 80 }],
    8: [{ x: 26, y: 20 }, { x: 74, y: 20 }, { x: 50, y: 35 }, { x: 26, y: 50 }, { x: 74, y: 50 }, { x: 50, y: 65 }, { x: 26, y: 80 }, { x: 74, y: 80 }],
    9: [{ x: 26, y: 16 }, { x: 74, y: 16 }, { x: 26, y: 38 }, { x: 74, y: 38 }, { x: 50, y: 50 }, { x: 26, y: 62 }, { x: 74, y: 62 }, { x: 26, y: 84 }, { x: 74, y: 84 }],
    10: [{ x: 26, y: 16 }, { x: 74, y: 16 }, { x: 50, y: 27 }, { x: 26, y: 38 }, { x: 74, y: 38 }, { x: 26, y: 62 }, { x: 74, y: 62 }, { x: 50, y: 73 }, { x: 26, y: 84 }, { x: 74, y: 84 }]
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
function getCourtCardSVG(rankValue, suitName, lang = 'de') {
  const uid = Math.random().toString(36).substr(2, 6);
  const tDict = TRANSLATIONS[lang] || TRANSLATIONS.de;
  const roleTitle = (tDict.courtTitles && tDict.courtTitles[rankValue]) || (rankValue === 12 ? 'QUEEN' : (rankValue === 13 ? 'KING' : 'JACK'));

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

  // Vessel / Item held in character's hand (Shot Glass or Drop)
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
      <!-- Black Drop in Hand -->
      <g transform="translate(71, 16)">
        <path d="M12 4 C10.5 7, 4 14.5, 4 21 A 8 8 0 0 0 20 21 C20 14.5, 13.5 7, 12 4 Z" fill="#181818" stroke="#546e7a" stroke-width="1.2"/>
        <path d="M7.5 19 C7 15, 10 9, 11 6.5" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" opacity="0.75"/>
        <circle cx="8.5" cy="21.5" r="1" fill="#ffffff"/>
      </g>
    `;
  } else if (suitName === 'hearts') {
    heldGlassSVG = `
      <!-- Green Drop in Hand -->
      <g transform="translate(71, 16)">
        <path d="M12 4 C10.5 7, 4 14.5, 4 21 A 8 8 0 0 0 20 21 C20 14.5, 13.5 7, 12 4 Z" fill="#008f39" stroke="#004d20" stroke-width="1.2"/>
        <path d="M7.5 19 C7 15, 10 9, 11 6.5" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" opacity="0.85"/>
        <circle cx="8.5" cy="21.5" r="1" fill="#ffffff"/>
        <circle cx="12" cy="21" r="1.8" fill="#b9f6ca" opacity="0.5"/>
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

// --- Traditional Irish Folk Background Music Player ---
// Track: "Galway" by Kevin MacLeod (incompetech.com)
// Authentic acoustic Irish Folk pub session (Fiddle, Flute, Bass, Guitar, Drums)
// Licensed under Creative Commons: By Attribution 4.0 International
// http://creativecommons.org/licenses/by/4.0/
class IrishFolkMusicPlayer {
  constructor() {
    this.audio = document.getElementById('bg-music');
    if (!this.audio) {
      this.audio = new Audio('irish_folk.mp3');
      this.audio.id = 'bg-music';
    }
    this.audio.loop = true;
    this.audio.preload = 'auto';
    this.baseVolume = 0.16; // Subtle tavern background level so card sounds stay clearly audible
    const storedVol = localStorage.getItem(STORAGE_KEYS.MUSIC_VOLUME);
    this.volumePercent = storedVol !== null ? parseInt(storedVol, 10) : 80;
    this.audio.volume = this.effectiveVolume;
    this.duckTimeout = null;
    this.wasPlayingBeforeHide = false;
  }

  get effectiveVolume() {
    return Math.min(1.0, Math.max(0.0, this.baseVolume * (this.volumePercent / 80)));
  }

  get isPlaying() {
    return !!(this.audio && !this.audio.paused && !this.audio.ended);
  }

  setVolume(percent) {
    this.volumePercent = Math.min(100, Math.max(0, parseInt(percent, 10) || 0));
    if (this.audio) {
      this.audio.volume = this.effectiveVolume;
    }
  }

  start() {
    if (!this.audio) return;
    this.audio.volume = this.effectiveVolume;
    if (this.audio.paused) {
      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.log('Background music awaiting user gesture:', err);
        });
      }
    }
  }

  stop() {
    if (!this.audio) return;
    this.audio.pause();
  }

  duck(targetGain = 0.02, durationSec = 3.2) {
    if (!this.audio) return;
    clearTimeout(this.duckTimeout);
    const duckedLevel = Math.max(0.005, targetGain * (this.volumePercent / 80));
    this.audio.volume = duckedLevel;
    this.duckTimeout = setTimeout(() => {
      if (this.audio) {
        this.audio.volume = this.effectiveVolume;
      }
    }, durationSec * 1000);
  }

  pauseOnHide() {
    if (this.isPlaying) {
      this.wasPlayingBeforeHide = true;
      this.audio.pause();
    } else {
      this.wasPlayingBeforeHide = false;
    }
  }

  resumeOnShow() {
    if (this.wasPlayingBeforeHide) {
      this.start();
      this.wasPlayingBeforeHide = false;
    }
  }
}

// --- Sound Manager with Real Studio Foley Audio Assets & Multi-channel Volume Controls ---
// Audio Channels:
// - Background Music: Irish Folk tavern acoustic session
// - Card Sounds: Flip / Draw, Place / Snap, and Shove / Sweep (CC0: Kenney Casino)
// - Drinking Sounds: Real human sip & swallow with natural pitch/tempo variations (CC0: OwlStorm)
// - Victory Sound: Authentic heavy brass/orchestral fanfare (CC0: CynicMusic)
class SoundManager {
  constructor() {
    this.enabled = true;
    this.ctx = null;
    this.music = null;
    this.audioBuffers = {};
    this.audioElements = {};
    this.isPreloaded = false;

    // Music channel
    this.musicEnabled = localStorage.getItem(STORAGE_KEYS.MUSIC_ENABLED) !== 'false';
    const storedMusicVol = localStorage.getItem(STORAGE_KEYS.MUSIC_VOLUME);
    this.musicVolume = storedMusicVol !== null ? parseInt(storedMusicVol, 10) : 80;

    // Card sounds channel (flip, place, sweep)
    this.soundCardsEnabled = localStorage.getItem(STORAGE_KEYS.SOUND_CARDS_ENABLED) !== 'false';
    const storedCardsVol = localStorage.getItem(STORAGE_KEYS.SOUND_CARDS_VOLUME);
    this.soundCardsVolume = storedCardsVol !== null ? parseInt(storedCardsVol, 10) : 80;

    // Drinking sounds channel (foundation sip / swallow)
    this.soundDrinksEnabled = localStorage.getItem(STORAGE_KEYS.SOUND_DRINKS_ENABLED) !== 'false';
    const storedDrinksVol = localStorage.getItem(STORAGE_KEYS.SOUND_DRINKS_VOLUME);
    this.soundDrinksVolume = storedDrinksVol !== null ? parseInt(storedDrinksVol, 10) : 80;

    // Victory sound channel (fanfare)
    this.soundVictoryEnabled = localStorage.getItem(STORAGE_KEYS.SOUND_VICTORY_ENABLED) !== 'false';
    const storedVictoryVol = localStorage.getItem(STORAGE_KEYS.SOUND_VICTORY_VOLUME);
    this.soundVictoryVolume = storedVictoryVol !== null ? parseInt(storedVictoryVol, 10) : 80;

    this.soundPaths = {
      flip: [
        'sounds/card-flip-1.ogg',
        'sounds/card-flip-2.ogg',
        'sounds/card-flip-3.ogg',
        'sounds/card-flip-4.ogg'
      ],
      place: [
        'sounds/card-place-1.ogg',
        'sounds/card-place-2.ogg',
        'sounds/card-place-3.ogg',
        'sounds/card-place-4.ogg'
      ],
      foundation: [
        'sounds/drink-1.wav',
        'sounds/drink-2.wav',
        'sounds/drink-3.wav',
        'sounds/drink-4.wav',
        'sounds/drink-5.wav'
      ],
      sweep: [
        'sounds/card-shove.ogg'
      ],
      victory: [
        'sounds/victory.mp3'
      ]
    };
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (!this.music) {
      this.music = new IrishFolkMusicPlayer();
      this.music.setVolume(this.musicVolume);
    }
    this.preloadSounds();
  }

  preloadSounds() {
    if (this.isPreloaded) return;
    this.isPreloaded = true;

    // Preload both Web Audio API buffers (for zero-latency multi-playback)
    // and HTML5 Audio elements as an instant fallback
    const allPaths = Object.values(this.soundPaths).flat();
    allPaths.forEach(path => {
      // 1. HTML5 audio element cache
      try {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = path;
        this.audioElements[path] = audio;
      } catch (e) {}

      // 2. Web Audio decoded buffer cache
      if (this.ctx && window.fetch) {
        fetch(path)
          .then(res => res.arrayBuffer())
          .then(ab => this.ctx.decodeAudioData(ab))
          .then(decoded => {
            this.audioBuffers[path] = decoded;
          })
          .catch(() => {
            // Audio elements will serve as fallback
          });
      }
    });
  }

  setMusicEnabled(enabled) {
    this.init();
    this.musicEnabled = !!enabled;
    localStorage.setItem(STORAGE_KEYS.MUSIC_ENABLED, this.musicEnabled ? 'true' : 'false');
    if (this.music) {
      if (this.musicEnabled) {
        this.music.start();
      } else {
        this.music.stop();
      }
    }
    return this.musicEnabled;
  }

  setMusicVolume(volumePercent) {
    this.musicVolume = Math.min(100, Math.max(0, parseInt(volumePercent, 10) || 0));
    localStorage.setItem(STORAGE_KEYS.MUSIC_VOLUME, this.musicVolume.toString());
    if (this.music) {
      this.music.setVolume(this.musicVolume);
    }
  }

  setSoundCardsEnabled(enabled) {
    this.soundCardsEnabled = !!enabled;
    localStorage.setItem(STORAGE_KEYS.SOUND_CARDS_ENABLED, this.soundCardsEnabled ? 'true' : 'false');
    return this.soundCardsEnabled;
  }

  setSoundCardsVolume(volumePercent) {
    this.soundCardsVolume = Math.min(100, Math.max(0, parseInt(volumePercent, 10) || 0));
    localStorage.setItem(STORAGE_KEYS.SOUND_CARDS_VOLUME, this.soundCardsVolume.toString());
  }

  setSoundDrinksEnabled(enabled) {
    this.soundDrinksEnabled = !!enabled;
    localStorage.setItem(STORAGE_KEYS.SOUND_DRINKS_ENABLED, this.soundDrinksEnabled ? 'true' : 'false');
    return this.soundDrinksEnabled;
  }

  setSoundDrinksVolume(volumePercent) {
    this.soundDrinksVolume = Math.min(100, Math.max(0, parseInt(volumePercent, 10) || 0));
    localStorage.setItem(STORAGE_KEYS.SOUND_DRINKS_VOLUME, this.soundDrinksVolume.toString());
  }

  setSoundVictoryEnabled(enabled) {
    this.soundVictoryEnabled = !!enabled;
    localStorage.setItem(STORAGE_KEYS.SOUND_VICTORY_ENABLED, this.soundVictoryEnabled ? 'true' : 'false');
    return this.soundVictoryEnabled;
  }

  setSoundVictoryVolume(volumePercent) {
    this.soundVictoryVolume = Math.min(100, Math.max(0, parseInt(volumePercent, 10) || 0));
    localStorage.setItem(STORAGE_KEYS.SOUND_VICTORY_VOLUME, this.soundVictoryVolume.toString());
  }

  startMusic() {
    this.init();
    if (this.music && this.musicEnabled && !this.music.isPlaying) {
      this.music.start();
    }
  }

  stopMusic() {
    if (this.music) {
      this.music.stop();
    }
  }

  toggleMusic() {
    return this.setMusicEnabled(!this.musicEnabled);
  }

  isMusicEnabled() {
    return this.musicEnabled;
  }

  isPlayingMusic() {
    return !!(this.music && this.music.isPlaying);
  }

  // Generic sound player that tries Web Audio buffer first, falling back to HTML5 Audio
  playSound(category, volume = 0.6, pitchVariation = 0.04) {
    if (!this.enabled) return;
    this.init();

    const list = this.soundPaths[category];
    if (!list || list.length === 0) return;
    const path = list[Math.floor(Math.random() * list.length)];

    // Primary: Web Audio API BufferSource (zero-latency, overlapping, pitch-varied)
    const buf = this.audioBuffers[path];
    if (buf && this.ctx && this.ctx.state !== 'closed') {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      try {
        const source = this.ctx.createBufferSource();
        source.buffer = buf;
        if (pitchVariation > 0) {
          source.playbackRate.value = 1.0 + (Math.random() * 2 - 1) * pitchVariation;
        }
        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
        source.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        source.start();
        return;
      } catch (e) {
        // Fallback below
      }
    }

    // Secondary: HTML5 Audio clone fallback
    try {
      const audioEl = this.audioElements[path] ? this.audioElements[path].cloneNode() : new Audio(path);
      audioEl.volume = Math.min(1.0, Math.max(0.0, volume));
      audioEl.play().catch(() => {});
    } catch (e) {}
  }

  // Real card flip / draw sound
  playFlip() {
    if (!this.soundCardsEnabled) return;
    const vol = Math.min(1.0, 0.42 * (this.soundCardsVolume / 80));
    this.playSound('flip', vol, 0.05);
  }

  // Real card place / snap onto tableau or stack
  playPlace() {
    if (!this.soundCardsEnabled) return;
    const vol = Math.min(1.0, 0.48 * (this.soundCardsVolume / 80));
    this.playSound('place', vol, 0.04);
  }

  // Real sip / drink / gulp sound when moving card to foundation (drinking the shot)
  // Reduced by 5 dB from 1.20 (0.675 at baseline 80% volume)
  playFoundation() {
    if (!this.soundDrinksEnabled) return;
    const vol = Math.min(1.0, 0.675 * (this.soundDrinksVolume / 80));
    this.playSound('foundation', vol, 0.04);
  }

  // Real card sweep / shove sound
  playSweep() {
    if (!this.soundCardsEnabled) return;
    const vol = Math.min(1.0, 0.55 * (this.soundCardsVolume / 80));
    this.playSound('sweep', vol, 0.04);
  }

  // Real victory fanfare celebration
  playVictory() {
    if (!this.soundVictoryEnabled || !this.enabled) return;
    this.init();
    if (this.music) {
      // Duck Irish Folk background music during victory fanfare
      this.music.duck(0.02, 10.0);
    }
    const vol = Math.min(1.0, 0.85 * (this.soundVictoryVolume / 80));
    this.playSound('victory', vol, 0.0);
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
    const swapBlack = Math.random() > 0.5;
    const swapGreen = Math.random() > 0.5;
    const swapColors = Math.random() > 0.5;

    let suitMap = [0, 1, 2, 3];
    if (swapBlack) [suitMap[0], suitMap[1]] = [suitMap[1], suitMap[0]];
    if (swapGreen) [suitMap[2], suitMap[3]] = [suitMap[3], suitMap[2]];
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
          color: Math.floor(id / 13) < 2 ? 'black' : 'green',
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
        color: Math.floor(id / 13) < 2 ? 'black' : 'green',
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
    const storedFelt = localStorage.getItem(STORAGE_KEYS.FELT_THEME);
    this.feltTheme = urlTheme || (storedFelt && storedFelt !== 'emerald' ? storedFelt : 'oak');
    this.dealType = localStorage.getItem(STORAGE_KEYS.DEAL_TYPE) || 'solvable';
    const urlLang = new URLSearchParams(window.location.search).get('lang');
    this.lang = urlLang || localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'de';

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
    this.currentDeviceFilter = 'all';
    this.globalScoresCache = { draw1: null, draw3: null };
    this.isLoadingScores = false;

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
      selectLanguage: document.getElementById('select-language'),
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
      btnSettings: document.getElementById('btn-settings'),
      settingsModal: document.getElementById('settings-modal'),
      btnCloseSettings: document.getElementById('btn-close-settings'),
      btnSettingsX: document.getElementById('btn-settings-x'),
      toggleMusic: document.getElementById('toggle-music'),
      sliderMusic: document.getElementById('slider-music'),
      valMusic: document.getElementById('val-music'),
      toggleSoundCards: document.getElementById('toggle-sound-cards'),
      sliderSoundCards: document.getElementById('slider-sound-cards'),
      valSoundCards: document.getElementById('val-sound-cards'),
      toggleSoundDrinks: document.getElementById('toggle-sound-drinks'),
      sliderSoundDrinks: document.getElementById('slider-sound-drinks'),
      valSoundDrinks: document.getElementById('val-sound-drinks'),
      toggleSoundVictory: document.getElementById('toggle-sound-victory'),
      sliderSoundVictory: document.getElementById('slider-sound-victory'),
      valSoundVictory: document.getElementById('val-sound-victory'),
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
      tabDraw1: document.getElementById('tab-draw1'),
      tabDraw3: document.getElementById('tab-draw3'),
      filterDeviceAll: document.getElementById('filter-device-all'),
      filterDeviceDesktop: document.getElementById('filter-device-desktop'),
      filterDeviceMobile: document.getElementById('filter-device-mobile'),
      btnRefreshScores: document.getElementById('btn-refresh-scores')
    };

    if (this.dom.selectDraw) this.dom.selectDraw.value = this.drawMode.toString();
    if (this.dom.selectFelt) this.dom.selectFelt.value = this.feltTheme;
    if (this.dom.selectDeal) this.dom.selectDeal.value = this.dealType;
    if (this.dom.selectLanguage) this.dom.selectLanguage.value = this.lang;
    this.syncSettingsUI();
    this.updateUIText();
  }

  openSettingsModal() {
    if (!this.dom.settingsModal) return;
    this.syncSettingsUI();
    this.dom.settingsModal.classList.remove('hidden');
  }

  closeSettingsModal() {
    if (!this.dom.settingsModal) return;
    this.dom.settingsModal.classList.add('hidden');
  }

  syncSettingsUI() {
    if (this.dom.toggleMusic) this.dom.toggleMusic.checked = this.sound.musicEnabled;
    if (this.dom.sliderMusic) this.dom.sliderMusic.value = this.sound.musicVolume;
    if (this.dom.valMusic) this.dom.valMusic.textContent = this.sound.musicVolume + '%';

    if (this.dom.toggleSoundCards) this.dom.toggleSoundCards.checked = this.sound.soundCardsEnabled;
    if (this.dom.sliderSoundCards) this.dom.sliderSoundCards.value = this.sound.soundCardsVolume;
    if (this.dom.valSoundCards) this.dom.valSoundCards.textContent = this.sound.soundCardsVolume + '%';

    if (this.dom.toggleSoundDrinks) this.dom.toggleSoundDrinks.checked = this.sound.soundDrinksEnabled;
    if (this.dom.sliderSoundDrinks) this.dom.sliderSoundDrinks.value = this.sound.soundDrinksVolume;
    if (this.dom.valSoundDrinks) this.dom.valSoundDrinks.textContent = this.sound.soundDrinksVolume + '%';

    if (this.dom.toggleSoundVictory) this.dom.toggleSoundVictory.checked = this.sound.soundVictoryEnabled;
    if (this.dom.sliderSoundVictory) this.dom.sliderSoundVictory.value = this.sound.soundVictoryVolume;
    if (this.dom.valSoundVictory) this.dom.valSoundVictory.textContent = this.sound.soundVictoryVolume + '%';

    this.updateAudioRowMuteClasses();
  }

  updateAudioRowMuteClasses() {
    const musicRow = this.dom.toggleMusic ? this.dom.toggleMusic.closest('.audio-setting-row') : null;
    if (musicRow) musicRow.classList.toggle('is-muted', !this.sound.musicEnabled);

    const cardsRow = this.dom.toggleSoundCards ? this.dom.toggleSoundCards.closest('.audio-setting-row') : null;
    if (cardsRow) cardsRow.classList.toggle('is-muted', !this.sound.soundCardsEnabled);

    const drinksRow = this.dom.toggleSoundDrinks ? this.dom.toggleSoundDrinks.closest('.audio-setting-row') : null;
    if (drinksRow) drinksRow.classList.toggle('is-muted', !this.sound.soundDrinksEnabled);

    const victoryRow = this.dom.toggleSoundVictory ? this.dom.toggleSoundVictory.closest('.audio-setting-row') : null;
    if (victoryRow) victoryRow.classList.toggle('is-muted', !this.sound.soundVictoryEnabled);
  }

  setLanguage(lang) {
    if (!TRANSLATIONS[lang]) return;
    this.lang = lang;
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    if (this.dom.selectLanguage) this.dom.selectLanguage.value = lang;
    this.updateUIText();
    this.render();
  }

  updateUIText() {
    const t = TRANSLATIONS[this.lang] || TRANSLATIONS.de;
    document.documentElement.lang = this.lang;
    document.title = t.pageTitle;

    const elMainTitle = document.getElementById('title-main');
    if (elMainTitle) elMainTitle.textContent = t.mainTitle;

    const elBadge = document.getElementById('badge-edition');
    if (elBadge) elBadge.textContent = t.badgeEdition;

    this.updateDealBadge();

    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };
    const setHtml = (id, html) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    };

    setTxt('label-deal', t.labelDeal);
    setTxt('opt-deal-solvable', t.optSolvable);
    setTxt('opt-deal-random', t.optRandom);
    setTxt('label-draw', t.labelDraw);
    setTxt('opt-draw-1', t.optDraw1);
    setTxt('opt-draw-3', t.optDraw3);
    setTxt('label-felt', t.labelFelt);
    setTxt('opt-felt-oak', t.optOak);
    setTxt('opt-felt-emerald', t.optEmerald);
    setTxt('opt-felt-navy', t.optNavy);
    setTxt('opt-felt-burgundy', t.optBurgundy);
    setTxt('opt-felt-slate', t.optSlate);
    setTxt('opt-felt-violet', t.optViolet);
    setTxt('label-lang', t.labelLang);

    setTxt('label-stat-score', t.statScore);
    setTxt('label-stat-moves', t.statMoves);
    setTxt('label-stat-time', t.statTime);

    if (this.dom.btnAutocomplete) {
      this.dom.btnAutocomplete.textContent = t.btnAutoFinish;
      this.dom.btnAutocomplete.title = t.btnAutoFinishTitle;
    }
    if (this.dom.btnSweep) {
      this.dom.btnSweep.textContent = t.btnSweep;
      this.dom.btnSweep.title = t.btnSweepTitle;
    }
    if (this.dom.btnHint) {
      this.dom.btnHint.textContent = t.btnHint;
      this.dom.btnHint.title = t.btnHintTitle;
    }
    if (this.dom.btnUndo) {
      this.dom.btnUndo.textContent = t.btnUndo;
      this.dom.btnUndo.title = t.btnUndoTitle;
    }
    if (this.dom.btnReplay) {
      this.dom.btnReplay.textContent = t.btnReplay;
      this.dom.btnReplay.title = t.btnReplayTitle;
    }
    if (this.dom.btnScores) {
      this.dom.btnScores.textContent = t.btnScores;
      this.dom.btnScores.title = t.btnScoresTitle;
    }
    if (this.dom.btnSettings) {
      const labelSettings = document.getElementById('label-btn-settings');
      if (labelSettings) {
        labelSettings.textContent = t.btnSettings ? t.btnSettings.replace('⚙️ ', '') : 'Einstellungen';
      }
      this.dom.btnSettings.title = t.btnSettingsTitle || 'Einstellungen öffnen';
    }
    if (this.dom.btnNew) {
      this.dom.btnNew.textContent = t.btnNew;
      this.dom.btnNew.title = t.btnNewTitle;
    }

    if (this.dom.stock) this.dom.stock.title = t.stockTitle;
    if (this.dom.waste) this.dom.waste.title = t.wasteTitle;
    if (this.dom.foundations) {
      const suits = ['clubs', 'spades', 'diamonds', 'hearts'];
      suits.forEach((suit, i) => {
        if (this.dom.foundations[i]) {
          this.dom.foundations[i].title = t.foundations[suit];
        }
      });
    }

    setHtml('legend-rules-title', t.legend.rulesTitle);
    setTxt('legend-black-glass', t.legend.blackGlass);
    setTxt('legend-black-drop', t.legend.blackDrop);
    setTxt('legend-green-glass', t.legend.greenGlass);
    setTxt('legend-green-drop', t.legend.greenDrop);
    setHtml('legend-sweep-hint', t.legend.sweepHint);

    setTxt('win-modal-badge', t.winModal.badge);
    setTxt('win-modal-title', t.winModal.title);
    setTxt('win-modal-desc', t.winModal.desc);
    setTxt('win-label-deal', t.winModal.labelDeal);
    setTxt('win-label-mode', t.winModal.labelMode);
    setTxt('win-label-time', t.winModal.labelTime);
    setTxt('win-label-moves', t.winModal.labelMoves);
    setTxt('win-label-score', t.winModal.labelScore);
    setTxt('win-label-name', t.winModal.labelName);
    if (this.dom.winNameInput) this.dom.winNameInput.placeholder = t.winModal.namePlaceholder;
    setTxt('btn-save-score', t.winModal.btnSaveScore);
    setTxt('win-save-msg', t.winModal.saveSuccess);
    setTxt('btn-win-scores', t.winModal.btnScores);
    setTxt('btn-win-replay', t.winModal.btnReplay);

    setTxt('scores-modal-badge', t.scoresModal.badge);
    setTxt('scores-modal-title', t.scoresModal.title);
    setTxt('tab-draw1', t.scoresModal.tabDraw1);
    setTxt('tab-draw3', t.scoresModal.tabDraw3);
    setTxt('filter-device-all', t.scoresModal.filterAll);
    setTxt('filter-device-desktop', t.scoresModal.filterDesktop);
    setTxt('filter-device-mobile', t.scoresModal.filterMobile);
    if (this.dom.btnRefreshScores) this.dom.btnRefreshScores.title = t.scoresModal.refreshTitle;
    setTxt('th-player', t.scoresModal.thPlayer);
    setTxt('th-score', t.scoresModal.thScore);
    setTxt('th-time', t.scoresModal.thTime);
    setTxt('th-moves', t.scoresModal.thMoves);
    setTxt('th-date', t.scoresModal.thDate);
    setTxt('btn-close-scores', t.scoresModal.btnClose);

    // Settings Modal Localization
    const sm = t.settingsModal || {};
    setTxt('settings-modal-badge', sm.badge || 'KONFIGURATION');
    setTxt('settings-modal-title', sm.title || '⚙️ Einstellungen');
    setTxt('section-game-title', sm.sectionGame || 'Spiel & Tisch');
    setTxt('label-setting-deal', sm.labelDeal || t.labelDeal || 'Spielstil:');
    setTxt('opt-deal-solvable', sm.optDealSolvable || t.optSolvable);
    setTxt('opt-deal-random', sm.optDealRandom || t.optRandom);
    setTxt('label-setting-draw', sm.labelDraw || t.labelDraw || 'Karten ziehen:');
    setTxt('opt-draw-1', sm.optDraw1 || t.optDraw1);
    setTxt('opt-draw-3', sm.optDraw3 || t.optDraw3);
    setTxt('label-setting-felt', sm.labelFelt || t.labelFelt || 'Tisch-Oberfläche:');
    setTxt('opt-felt-oak', sm.optOak || t.optOak);
    setTxt('opt-felt-emerald', sm.optEmerald || t.optEmerald);
    setTxt('opt-felt-navy', sm.optNavy || t.optNavy);
    setTxt('opt-felt-burgundy', sm.optBurgundy || t.optBurgundy);
    setTxt('opt-felt-slate', sm.optSlate || t.optSlate);
    setTxt('opt-felt-violet', sm.optViolet || t.optViolet);
    setTxt('label-setting-lang', sm.labelLang || t.labelLang || 'Sprache:');
    setTxt('section-audio-title', sm.sectionAudio || 'Sound & Lautstärke');
    setTxt('label-setting-music', sm.musicLabel || '🎵 Musik (Irischer Folk)');
    setTxt('label-setting-cards', sm.cardsLabel || '🃏 Karten-Sounds');
    setTxt('label-setting-drinks', sm.drinksLabel || '🥃 Trink-Sounds (Ablage)');
    setTxt('label-setting-victory', sm.victoryLabel || '🎺 Sieges-Fanfare');
    setTxt('btn-close-settings', sm.btnClose || 'Schließen');
  }

  applyTheme(theme) {
    this.feltTheme = theme;
    document.body.setAttribute('data-felt', theme);
    localStorage.setItem(STORAGE_KEYS.FELT_THEME, theme);
  }

  updateDealBadge() {
    const t = TRANSLATIONS[this.lang] || TRANSLATIONS.de;
    if (this.dealType === 'solvable') {
      this.dom.dealBadge.textContent = t.dealSolvable;
      this.dom.dealBadge.className = 'badge badge-gold';
      this.dom.dealBadge.title = t.dealSolvableTitle;
    } else {
      this.dom.dealBadge.textContent = t.dealRandom;
      this.dom.dealBadge.className = 'badge';
      this.dom.dealBadge.title = t.dealRandomTitle;
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

    if (this.dom.btnSettings) {
      this.dom.btnSettings.addEventListener('click', () => {
        this.openSettingsModal();
      });
    }

    if (this.dom.btnCloseSettings) {
      this.dom.btnCloseSettings.addEventListener('click', () => {
        this.closeSettingsModal();
      });
    }

    if (this.dom.btnSettingsX) {
      this.dom.btnSettingsX.addEventListener('click', () => {
        this.closeSettingsModal();
      });
    }

    if (this.dom.settingsModal) {
      this.dom.settingsModal.addEventListener('click', (e) => {
        if (e.target === this.dom.settingsModal) {
          this.closeSettingsModal();
        }
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.dom.settingsModal && !this.dom.settingsModal.classList.contains('hidden')) {
          this.closeSettingsModal();
        }
      }
    });

    // Settings Audio Listeners
    if (this.dom.toggleMusic) {
      this.dom.toggleMusic.addEventListener('change', (e) => {
        this.sound.setMusicEnabled(e.target.checked);
        this.updateAudioRowMuteClasses();
      });
    }

    if (this.dom.sliderMusic) {
      this.dom.sliderMusic.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.sound.setMusicVolume(val);
        if (this.dom.valMusic) this.dom.valMusic.textContent = val + '%';
      });
    }

    if (this.dom.toggleSoundCards) {
      this.dom.toggleSoundCards.addEventListener('change', (e) => {
        this.sound.setSoundCardsEnabled(e.target.checked);
        this.updateAudioRowMuteClasses();
        if (e.target.checked) this.sound.playFlip();
      });
    }

    if (this.dom.sliderSoundCards) {
      let previewDebounce = null;
      this.dom.sliderSoundCards.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.sound.setSoundCardsVolume(val);
        if (this.dom.valSoundCards) this.dom.valSoundCards.textContent = val + '%';
        clearTimeout(previewDebounce);
        previewDebounce = setTimeout(() => this.sound.playFlip(), 120);
      });
    }

    if (this.dom.toggleSoundDrinks) {
      this.dom.toggleSoundDrinks.addEventListener('change', (e) => {
        this.sound.setSoundDrinksEnabled(e.target.checked);
        this.updateAudioRowMuteClasses();
        if (e.target.checked) this.sound.playFoundation();
      });
    }

    if (this.dom.sliderSoundDrinks) {
      let previewDebounce = null;
      this.dom.sliderSoundDrinks.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.sound.setSoundDrinksVolume(val);
        if (this.dom.valSoundDrinks) this.dom.valSoundDrinks.textContent = val + '%';
        clearTimeout(previewDebounce);
        previewDebounce = setTimeout(() => this.sound.playFoundation(), 120);
      });
    }

    if (this.dom.toggleSoundVictory) {
      this.dom.toggleSoundVictory.addEventListener('change', (e) => {
        this.sound.setSoundVictoryEnabled(e.target.checked);
        this.updateAudioRowMuteClasses();
      });
    }

    if (this.dom.sliderSoundVictory) {
      this.dom.sliderSoundVictory.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.sound.setSoundVictoryVolume(val);
        if (this.dom.valSoundVictory) this.dom.valSoundVictory.textContent = val + '%';
      });
    }

    // User gesture listener to unlock Web Audio & start background music if enabled
    const unlockAudioAndStartMusic = () => {
      this.sound.init();
      if (this.sound.isMusicEnabled()) {
        this.sound.startMusic();
      }
      if (this.sound.isPlayingMusic()) {
        window.removeEventListener('pointerdown', unlockAudioAndStartMusic);
        window.removeEventListener('keydown', unlockAudioAndStartMusic);
        window.removeEventListener('click', unlockAudioAndStartMusic);
        window.removeEventListener('touchstart', unlockAudioAndStartMusic);
      }
    };
    window.addEventListener('pointerdown', unlockAudioAndStartMusic, { passive: true });
    window.addEventListener('keydown', unlockAudioAndStartMusic, { passive: true });
    window.addEventListener('click', unlockAudioAndStartMusic, { passive: true });
    window.addEventListener('touchstart', unlockAudioAndStartMusic, { passive: true });

    // Pause music when tab is hidden, resume when tab is active again
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this.sound && this.sound.music) {
          this.sound.music.pauseOnHide();
        }
      } else {
        if (this.sound && this.sound.isMusicEnabled() && this.sound.music) {
          this.sound.music.resumeOnShow();
        }
      }
    });

    if (this.dom.selectLanguage) {
      this.dom.selectLanguage.addEventListener('change', (e) => {
        this.setLanguage(e.target.value);
      });
    }

    this.dom.selectFelt.addEventListener('change', (e) => {
      this.applyTheme(e.target.value);
    });

    this.dom.selectDeal.addEventListener('change', (e) => {
      this.dealType = e.target.value;
      localStorage.setItem(STORAGE_KEYS.DEAL_TYPE, this.dealType);
      this.updateDealBadge();
      this.startNewGame();
      const t = TRANSLATIONS[this.lang] || TRANSLATIONS.de;
      this.showToast(this.dealType === 'solvable' ? t.toasts.dealSolvable : t.toasts.dealRandom);
    });

    this.dom.selectDraw.addEventListener('change', (e) => {
      const newMode = parseInt(e.target.value, 10);
      const t = TRANSLATIONS[this.lang] || TRANSLATIONS.de;
      if (this.moves > 0 && !this.gameWon) {
        if (confirm(t.toasts.switchDrawConfirm)) {
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
        if (!e.target.closest('.card')) {
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

    this.dom.tabDraw1.addEventListener('click', () => this.switchScoreTab('draw1'));
    this.dom.tabDraw3.addEventListener('click', () => this.switchScoreTab('draw3'));
    if (this.dom.filterDeviceAll) this.dom.filterDeviceAll.addEventListener('click', () => this.switchDeviceFilter('all'));
    if (this.dom.filterDeviceDesktop) this.dom.filterDeviceDesktop.addEventListener('click', () => this.switchDeviceFilter('desktop'));
    if (this.dom.filterDeviceMobile) this.dom.filterDeviceMobile.addEventListener('click', () => this.switchDeviceFilter('mobile'));
    if (this.dom.btnRefreshScores) this.dom.btnRefreshScores.addEventListener('click', () => this.refreshScores());

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
      const t = TRANSLATIONS[this.lang] || TRANSLATIONS.de;
      this.showToast(t.toasts.sweptSuccess(totalMoved));
      this.checkWinCondition();
    } else {
      const t = TRANSLATIONS[this.lang] || TRANSLATIONS.de;
      this.showToast(t.toasts.noSweep, 1800);
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
    if (this.sound && this.sound.isMusicEnabled() && !this.sound.isPlayingMusic()) {
      this.sound.startMusic();
    }
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
    const t = TRANSLATIONS[this.lang] || TRANSLATIONS.de;
    this.showToast(t.toasts.dealRestarted);
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

    // Determine dragged card center coordinates from proxy if dragging
    let cardCx = x;
    let cardCy = y;
    if (this.pointerDragState && this.pointerDragState.proxyContainer) {
      const firstChild = this.pointerDragState.proxyContainer.firstElementChild;
      if (firstChild) {
        const proxyRect = firstChild.getBoundingClientRect();
        cardCx = proxyRect.left + proxyRect.width / 2;
        cardCy = proxyRect.top + proxyRect.height / 2;
      }
    }

    // 2. Foundation bounding box test
    for (let f = 0; f < 4; f++) {
      const slot = this.dom.foundations[f];
      const r = slot.getBoundingClientRect();
      const inFinger = (x >= r.left - 10 && x <= r.right + 10 && y >= r.top - 10 && y <= r.bottom + 15);
      const inCardCenter = (cardCx >= r.left - 6 && cardCx <= r.right + 6 && cardCy >= r.top - 6 && cardCy <= r.bottom + 12);
      if (inFinger || inCardCenter) {
        return { slot, targetType: 'foundation', targetIndex: f };
      }
    }

    // 3. Tableau bounding box test with generous vertical corridor and horizontal tolerance
    // On touch screens, columns are narrow; checking both finger point and dragged card center,
    // and extending the hit corridor downwards ensures natural, effortless King drops.
    let bestTableau = null;
    let bestDist = Infinity;

    for (let t = 0; t < 7; t++) {
      const slot = this.dom.tableau[t];
      const r = slot.getBoundingClientRect();
      const colWidth = r.width;
      const horizMargin = Math.max(12, colWidth * 0.25);
      const topBound = r.top - 20;
      // Allow dropping anywhere in the column down to the bottom of the board/viewport
      const bottomBound = Math.max(r.bottom + 160, window.innerHeight - 60);

      const fingerInside = (x >= r.left - horizMargin && x <= r.right + horizMargin && y >= topBound && y <= bottomBound);
      const cardInside = (cardCx >= r.left - horizMargin && cardCx <= r.right + horizMargin && cardCy >= topBound && cardCy <= bottomBound);

      if (fingerInside || cardInside) {
        const colCenter = r.left + colWidth / 2;
        const dist = Math.min(Math.abs(x - colCenter), Math.abs(cardCx - colCenter));
        if (dist < bestDist) {
          bestDist = dist;
          bestTableau = { slot, targetType: 'tableau', targetIndex: t };
        }
      }
    }

    if (bestTableau) return bestTableau;

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

    if (source === 'waste' && cardIndex !== this.waste.length - 1) return;

    // 1. Single top card: Try moving to Foundation first
    const isSingleCard =
      (source === 'waste' && cardIndex === this.waste.length - 1) ||
      (source === 'tableau' && cardIndex === this.tableau[colIndex].length - 1) ||
      (source === 'foundation');

    if (isSingleCard) {
      for (let f = 0; f < 4; f++) {
        if (this.canMoveToFoundation(card, f)) {
          this.executeMove(source, colIndex, cardIndex, 'foundation', f);
          return;
        }
      }
    }

    // 2. Try moving to Tableau column (including Kings moving to empty spaces)
    // Avoid moving a King already sitting alone at the base of an empty column (cardIndex === 0)
    // to another empty column.
    for (let t = 0; t < 7; t++) {
      if (source === 'tableau' && colIndex === t) continue;
      if (card.rank === 13 && source === 'tableau' && cardIndex === 0 && this.tableau[t].length === 0) {
        continue;
      }
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
    document.querySelectorAll('.empty-tableau-base.valid-target').forEach(el => el.classList.remove('valid-target'));
    if (!this.selected) return;

    const { source, colIndex, cardIndex, card } = this.selected;

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

    // If selected card is a King, highlight all empty tableau column placeholders
    if (card && card.rank === 13) {
      document.querySelectorAll('.empty-tableau-base').forEach(base => {
        base.classList.add('valid-target');
      });
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

    const t = TRANSLATIONS[this.lang] || TRANSLATIONS.de;
    const suitName = (suit) => (t.suitTitles && t.suitTitles[suit]) || suit;
    let hintFound = null;

    for (let tr = 0; tr < 7; tr++) {
      const col = this.tableau[tr];
      if (col.length === 0) continue;
      const topCard = col[col.length - 1];
      if (!topCard.faceUp) continue;
      for (let f = 0; f < 4; f++) {
        if (this.canMoveToFoundation(topCard, f)) {
          hintFound = {
            srcEl: this.dom.tableau[tr].querySelector(`.card[data-id="${topCard.id}"]`),
            dstEl: this.dom.foundations[f],
            msg: t.toasts.hintFoundFoundation(topCard.label, suitName(topCard.suit))
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
            msg: t.toasts.hintFoundFoundation(wasteCard.label, suitName(wasteCard.suit))
          };
          break;
        }
      }
    }

    if (!hintFound) {
      for (let tr = 0; tr < 7; tr++) {
        const col = this.tableau[tr];
        const firstFaceUpIdx = col.findIndex(c => c.faceUp);
        if (firstFaceUpIdx > 0) {
          const card = col[firstFaceUpIdx];
          for (let targetT = 0; targetT < 7; targetT++) {
            if (targetT === tr) continue;
            if (this.canMoveToTableau(card, targetT)) {
              hintFound = {
                srcEl: this.dom.tableau[tr].querySelector(`.card[data-id="${card.id}"]`),
                dstEl: this.dom.tableau[targetT],
                msg: t.toasts.hintFoundReveal(tr + 1)
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
      for (let tr = 0; tr < 7; tr++) {
        if (this.canMoveToTableau(wasteCard, tr)) {
          hintFound = {
            srcEl: this.dom.waste.querySelector(`.card[data-id="${wasteCard.id}"]`),
            dstEl: this.dom.tableau[tr],
            msg: t.toasts.hintFoundTableau(wasteCard.label, suitName(wasteCard.suit), tr + 1)
          };
          break;
        }
      }
    }

    if (hintFound && hintFound.srcEl && hintFound.dstEl) {
      hintFound.srcEl.classList.add('hint-highlight');
      hintFound.dstEl.classList.add('hint-highlight');
      this.showToast(`💡 ${hintFound.msg}`);
      setTimeout(() => {
        hintFound.srcEl.classList.remove('hint-highlight');
        hintFound.dstEl.classList.remove('hint-highlight');
      }, 2500);
    } else {
      this.dom.stock.classList.add('hint-highlight');
      this.showToast(t.toasts.hintStock);
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

      const t = TRANSLATIONS[this.lang] || TRANSLATIONS.de;
      const modeName = this.drawMode === 3 ? t.winModal.modeDraw3 : t.winModal.modeDraw1;
      const timeFormatted = this.formatTime(this.timerSeconds);

      this.dom.winDealType.textContent = this.dealType === 'solvable' ? t.winModal.dealSolvable : t.winModal.dealRandom;
      this.dom.winMode.textContent = modeName;
      this.dom.winTime.textContent = timeFormatted;
      this.dom.winMoves.textContent = this.moves;
      this.dom.winScore.textContent = this.score;

      const savedName = localStorage.getItem(STORAGE_KEYS.PLAYER_NAME) || '';
      this.dom.winNameInput.value = savedName;
      this.dom.winSaveMsg.classList.add('hidden');
      this.dom.btnSaveScore.textContent = t.winModal.btnSaveScore;
      this.dom.btnSaveScore.disabled = false;
      this.hasSavedCurrentWin = false;

      this.pendingWinRecord = {
        mode: this.drawMode === 3 ? 'draw3' : 'draw1',
        dealType: this.dealType,
        score: this.score,
        timeSeconds: this.timerSeconds,
        timeFormatted: timeFormatted,
        moves: this.moves,
        date: new Date().toLocaleDateString(this.lang)
      };

      this.dom.winModal.classList.remove('hidden');
      setTimeout(() => this.dom.winNameInput.focus(), 300);
    }
  }

  async commitPlayerScore() {
    if (!this.pendingWinRecord || this.hasSavedCurrentWin) return;

    let playerName = this.dom.winNameInput.value.trim();
    if (!playerName) {
      playerName = 'Player';
    }

    localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, playerName);

    const record = {
      ...this.pendingWinRecord,
      name: playerName,
      device: getDeviceType(),
      timestamp: Date.now()
    };

    // 1. Record in local device storage
    this.recordLocalHighScore(record);

    // 2. Submit to global Firebase Realtime Database
    this.hasSavedCurrentWin = true;
    this.dom.btnSaveScore.disabled = true;
    this.dom.btnSaveScore.textContent = '...';

    const t = TRANSLATIONS[this.lang] || TRANSLATIONS.de;
    try {
      await this.submitGlobalScore(record, record.mode);
      this.globalScoresCache[record.mode] = null; // Invalidate cache
      this.dom.winSaveMsg.textContent = t.winModal.saveSuccess;
    } catch (err) {
      console.warn('Firebase submission failed, saved locally:', err);
      this.dom.winSaveMsg.textContent = t.winModal.saveSuccessLocal || t.winModal.saveSuccess;
    }

    this.dom.winSaveMsg.classList.remove('hidden');
    this.dom.btnSaveScore.textContent = '✓';
  }

  // --- Two Distinct High Score Boards (Draw 1 & Draw 3) with Global & Local Sync ---
  getStorageKeyForMode(mode) {
    return mode === 'Draw 3' || mode === 'draw3' || mode === 3 || (typeof mode === 'string' && mode.includes('3'))
      ? STORAGE_KEYS.HIGH_SCORES_DRAW3
      : STORAGE_KEYS.HIGH_SCORES_DRAW1;
  }

  getLocalHighScoresForMode(mode) {
    const key = this.getStorageKeyForMode(mode);
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  recordLocalHighScore(record) {
    const key = this.getStorageKeyForMode(record.mode);
    let scores = this.getLocalHighScoresForMode(record.mode);
    scores.push(record);

    scores.sort((a, b) => b.score - a.score || a.timeSeconds - b.timeSeconds || a.moves - b.moves);

    const top100 = scores.slice(0, 100);
    localStorage.setItem(key, JSON.stringify(top100));
  }

  async submitGlobalScore(record, mode) {
    const modeKey = (mode === 'Draw 3' || mode === 'draw3' || mode === 3 || (typeof mode === 'string' && mode.includes('3')))
      ? 'draw3'
      : 'draw1';
    const url = `${FIREBASE_DATABASE_URL}/scores/${modeKey}.json`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  }

  async fetchGlobalScores(mode) {
    const modeKey = (mode === 'Draw 3' || mode === 'draw3' || mode === 3 || (typeof mode === 'string' && mode.includes('3')))
      ? 'draw3'
      : 'draw1';
    const url = `${FIREBASE_DATABASE_URL}/scores/${modeKey}.json`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data) return [];
      const list = Object.keys(data).map(k => ({ id: k, ...data[k] }));
      list.sort((a, b) => b.score - a.score || a.timeSeconds - b.timeSeconds || a.moves - b.moves);
      return list.slice(0, 100);
    } catch (err) {
      console.warn('Could not load global scores:', err);
      return null;
    }
  }

  openHighScores(targetMode = null) {
    const mode = targetMode || (this.drawMode === 3 ? 'draw3' : 'draw1');
    this.currentScoreTab = mode;
    this.dom.tabDraw1.classList.toggle('active', mode === 'draw1');
    this.dom.tabDraw3.classList.toggle('active', mode === 'draw3');
    this.dom.scoresModal.classList.remove('hidden');
    this.loadAndRenderScores();
  }

  switchScoreTab(tab) {
    this.currentScoreTab = tab;
    this.dom.tabDraw1.classList.toggle('active', tab === 'draw1');
    this.dom.tabDraw3.classList.toggle('active', tab === 'draw3');
    this.loadAndRenderScores();
  }

  switchDeviceFilter(device) {
    this.currentDeviceFilter = device;
    if (this.dom.filterDeviceAll) this.dom.filterDeviceAll.classList.toggle('active', device === 'all');
    if (this.dom.filterDeviceDesktop) this.dom.filterDeviceDesktop.classList.toggle('active', device === 'desktop');
    if (this.dom.filterDeviceMobile) this.dom.filterDeviceMobile.classList.toggle('active', device === 'mobile');
    this.renderHighScoresTable();
  }

  async refreshScores() {
    if (this.isLoadingScores) return;
    this.globalScoresCache[this.currentScoreTab] = null;
    await this.loadAndRenderScores(true);
  }

  async loadAndRenderScores(isManualRefresh = false) {
    const t = TRANSLATIONS[this.lang] || TRANSLATIONS.de;

    if (!this.globalScoresCache[this.currentScoreTab] || isManualRefresh) {
      this.isLoadingScores = true;
      if (this.dom.btnRefreshScores) this.dom.btnRefreshScores.classList.add('is-spinning');
      this.dom.scoresTbody.innerHTML = `
        <tr>
          <td colspan="6" class="loading-scores-msg">⏳ ${t.scoresModal.loading || 'Loading...'}</td>
        </tr>
      `;

      const globalList = await this.fetchGlobalScores(this.currentScoreTab);
      if (this.dom.btnRefreshScores) this.dom.btnRefreshScores.classList.remove('is-spinning');
      this.isLoadingScores = false;

      if (globalList !== null) {
        this.globalScoresCache[this.currentScoreTab] = globalList;
      } else {
        // If fetch failed (offline or network error), notify and use local cache as fallback
        this.showToast(t.scoresModal.offlineNotice || 'Offline');
        if (!this.globalScoresCache[this.currentScoreTab]) {
          this.globalScoresCache[this.currentScoreTab] = this.getLocalHighScoresForMode(this.currentScoreTab);
        }
      }
    }

    this.renderHighScoresTable();
  }

  renderHighScoresTable() {
    const t = TRANSLATIONS[this.lang] || TRANSLATIONS.de;
    let scores = this.globalScoresCache[this.currentScoreTab] || this.getLocalHighScoresForMode(this.currentScoreTab) || [];

    // Apply device filter
    let filtered = scores;
    if (this.currentDeviceFilter !== 'all') {
      filtered = scores.filter(s => (s.device || 'desktop') === this.currentDeviceFilter);
    }

    this.dom.scoresTbody.innerHTML = '';
    if (filtered.length === 0) {
      this.dom.scoresTbody.innerHTML = `
        <tr>
          <td colspan="6" class="no-scores-msg">${t.scoresModal.empty}</td>
        </tr>
      `;
      return;
    }

    filtered.forEach((s, idx) => {
      const tr = document.createElement('tr');
      const rankBadge = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : (idx + 1).toString();
      const isMobile = s.device === 'mobile';
      const deviceIcon = isMobile ? '📱' : '💻';
      const deviceTitle = isMobile ? (t.scoresModal.filterMobile || 'Mobile') : (t.scoresModal.filterDesktop || 'PC');

      tr.innerHTML = `
        <td><strong>${rankBadge}</strong></td>
        <td class="player-name-cell" title="${escapeHtml(s.name || 'Player')}">
          <span class="player-device-badge" title="${deviceTitle}">${deviceIcon}</span>
          <span class="player-name-text">${escapeHtml(s.name || 'Player')}</span>
        </td>
        <td><strong>${s.score}</strong></td>
        <td>${s.timeFormatted}</td>
        <td>${s.moves}</td>
        <td>${s.date}</td>
      `;
      this.dom.scoresTbody.appendChild(tr);
    });
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
      cardBodyHTML = `<div class="card-court-container">${getCourtCardSVG(rankValue, card.suit, this.lang)}</div>`;
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

  createEmptyTableauBase(colIdx) {
    const el = document.createElement('div');
    el.className = 'empty-tableau-base';
    el.setAttribute('data-col', colIdx);
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', `Empty Column ${colIdx + 1} - Place King`);
    el.innerHTML = `
      <span class="empty-slot-crown">👑</span>
      <span class="empty-slot-label">K</span>
    `;
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleSlotClick('tableau', colIdx);
    });
    return el;
  }

  renderTableau() {
    this.tableau.forEach((col, colIdx) => {
      const slot = this.dom.tableau[colIdx];
      slot.innerHTML = '';

      if (col.length === 0) {
        slot.appendChild(this.createEmptyTableauBase(colIdx));
        return;
      }

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