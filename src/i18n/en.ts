import type { Translations } from './types'

export const en: Translations = {
  turnOf:        (name) => `${name}'s Turn`,
  layoutTablet:  'Tablet',
  layoutDesktop: 'Side by Side',
  muteLabel:     'Mute sound',
  unmuteLabel:   'Unmute sound',
  ejectedLabel:  'Ejected',
  aiBot:         'Computer',
  aiHuman:       'Human',
  turnBadge:     'Active',
  cancelAbility: 'Cancel',

  gameMode:       'Game Mode',
  modeVsComputer: '🤖 vs Computer',
  modeTwoPlayers: '👥 Two Players',
  player1Default: 'Player 1',
  player2Default: 'Player 2',
  aiName:         'Computer',
  aiLevel:        'AI Difficulty',
  aiEasy:         '😊 Easy',
  aiHard:         '🤖 Hard',
  categoryLabel:  (n) => `${n}'s Category`,
  categoryNames: {
    animals:   'Animals',
    plants:    'Plants',
    fruits:    'Fruits',
    sports:    'Sports',
    space:     'Space',
    transport: 'Transport',
    music:     'Music',
  },
  aiCategoryAuto: '🎲 Random',
  rollBtn:        '🎲 Roll!',
  drawing:        'Rolling...',
  startsFirst:    (name) => `${name} goes first!`,
  backBtn:        '↩ Back',
  playBtn:        '▶ Play!',

  rewardTitle:    'Reward!',
  rewardSubtitle: (name) => `${name} completed 2 columns — pick a card`,
  skipBtn:        'Skip ✕',

  wonGame:       'Wins the Game!',
  completedCols: (n) => `${n} / 6 columns completed`,
  homeBtn:       '↩ Menu',

  abilities: {
    freeze_column: { name: 'Freeze Column', desc: "Pick an opponent column — frozen for a full turn" },
    swap_tiles:    { name: 'Swap Tiles',    desc: "Swap two tiles on the opponent's board" },
    rotate_row:    { name: 'Rotate Row',    desc: "Pick an opponent row — shifts one step" },
  },
}
