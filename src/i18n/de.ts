import type { Translations } from './types'

export const de: Translations = {
  turnOf:        (name) => `${name} ist dran`,
  layoutTablet:  'Tablet',
  layoutDesktop: 'Nebeneinander',
  muteLabel:     'Ton aus',
  unmuteLabel:   'Ton an',
  ejectedLabel:  'Raus',
  aiBot:         'Computer',
  aiHuman:       'Mensch',
  turnBadge:     'Aktiv',
  cancelAbility: 'Abbruch',

  gameMode:       'Spielmodus',
  modeVsComputer: '🤖 vs Computer',
  modeTwoPlayers: '👥 Zwei Spieler',
  player1Default: 'Spieler 1',
  player2Default: 'Spieler 2',
  aiName:         'Computer',
  aiLevel:        'KI-Schwierigkeit',
  aiEasy:         '😊 Leicht',
  aiHard:         '🤖 Schwer',
  categoryLabel:  (n) => `Kategorie von ${n}`,
  categoryNames: {
    animals:   'Tiere',
    plants:    'Pflanzen',
    fruits:    'Früchte',
    sports:    'Sport',
    space:     'Weltall',
    transport: 'Fahrzeuge',
    music:     'Musik',
  },
  aiCategoryAuto: '🎲 Zufällig',
  rollBtn:        '🎲 Würfeln!',
  drawing:        'Würfeln...',
  startsFirst:    (name) => `${name} beginnt!`,
  backBtn:        '↩ Zurück',
  playBtn:        '▶ Spielen!',

  rewardTitle:    'Belohnung!',
  rewardSubtitle: (name) => `${name} hat 2 Spalten vervollständigt — Karte wählen`,
  skipBtn:        'Überspringen ✕',

  wonGame:       'Gewinnt das Spiel!',
  completedCols: (n) => `${n} / 6 Spalten abgeschlossen`,
  homeBtn:       '↩ Menü',

  abilities: {
    freeze_column: { name: 'Spalte einfrieren', desc: 'Wähle eine Gegnerspalte — für einen vollen Zug gesperrt' },
    swap_tiles:    { name: 'Steine tauschen',   desc: 'Tausche zwei Steine auf dem Gegnerfeld' },
    rotate_row:    { name: 'Reihe drehen',      desc: 'Wähle eine Gegnerreihe — verschiebt sich einen Schritt' },
  },
}
