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

  aiUsed:  'Computer used',
  gotIt:   'Got it! ✓',
  abilities: {
    freeze_column: { name: 'Freeze Column', desc: "Pick an opponent column — frozen for a full turn" },
    swap_tiles:    { name: 'Swap Tiles',    desc: "Swap two tiles on the opponent's board" },
    rotate_row:    { name: 'Rotate Row',    desc: "Pick an opponent row — shifts one step" },
  },

  howToPlay: {
    title:    'How to Play',
    closeBtn: 'Got it! ▶',
    steps: [
      {
        icon:  '🎯',
        title: 'Goal',
        desc:  'Complete all 6 columns of your board — each column must contain 4 tiles of the same symbol.',
      },
      {
        icon:  '💠',
        title: 'Start',
        desc:  'Roll the dice to decide who goes first. The winner receives the special start tile.',
      },
      {
        icon:  '↓',
        title: 'Push',
        desc:  'On your turn, push your current tile into any column of your board — it enters from the top and ejects the bottom tile.',
      },
      {
        icon:  '🔄',
        title: 'Turn Transfer',
        desc:  "The ejected tile is revealed immediately. If it belongs to your opponent it passes to them and the turn switches; if it's yours, you keep playing.",
      },
      {
        icon:  '🏆',
        title: 'Ability Cards',
        desc:  'Complete 2 columns for the first time to earn a special ability: Freeze a column, Swap two tiles, or Rotate a full row on your opponent\'s board.',
      },
      {
        icon:  '🥇',
        title: 'Win',
        desc:  "First to complete all 6 columns wins! You also win if your opponent's remaining columns are all frozen and they can't move.",
      },
    ],
  },
}
