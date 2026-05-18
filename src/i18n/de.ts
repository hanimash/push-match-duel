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

  aiUsed:  'Computer nutzte',
  gotIt:   'Verstanden! ✓',
  abilities: {
    freeze_column: { name: 'Spalte einfrieren', desc: 'Wähle eine Gegnerspalte — für einen vollen Zug gesperrt' },
    swap_tiles:    { name: 'Steine tauschen',   desc: 'Tausche zwei Steine auf dem Gegnerfeld' },
    rotate_row:    { name: 'Reihe drehen',      desc: 'Wähle eine Gegnerreihe — verschiebt sich einen Schritt' },
  },

  howToPlay: {
    title:    'Spielanleitung',
    closeBtn: 'Verstanden! ▶',
    steps: [
      {
        icon:  '🎯',
        title: 'Ziel',
        desc:  'Vervollständige alle 6 Spalten deines Spielfelds — jede Spalte muss 4 Steine mit demselben Symbol enthalten.',
      },
      {
        icon:  '💠',
        title: 'Start',
        desc:  'Ein Würfelwurf entscheidet, wer beginnt. Der Gewinner erhält den Startstein.',
      },
      {
        icon:  '↓',
        title: 'Schieben',
        desc:  'Schiebe in deinem Zug deinen aktuellen Stein in eine beliebige Spalte — er tritt oben ein und der unterste Stein wird ausgeworfen.',
      },
      {
        icon:  '🔄',
        title: 'Zugwechsel',
        desc:  'Der ausgeworfene Stein wird sofort aufgedeckt. Gehört er dem Gegner, wechselt der Zug; gehört er dir, spielst du weiter.',
      },
      {
        icon:  '🏆',
        title: 'Fähigkeitskarten',
        desc:  'Vervollständige zum ersten Mal 2 Spalten für eine Sonderfähigkeit: Spalte einfrieren, Steine tauschen oder eine Reihe drehen.',
      },
      {
        icon:  '🥇',
        title: 'Sieg',
        desc:  'Wer zuerst alle 6 Spalten vervollständigt, gewinnt! Du gewinnst auch, wenn alle Spalten des Gegners gesperrt sind.',
      },
    ],
  },
}
