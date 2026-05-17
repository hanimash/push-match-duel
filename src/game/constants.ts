export const ROWS = 4
export const COLS = 6

export interface Category {
  id: string
  name: string
  emoji: string
  symbols: readonly string[]
}

export const CATEGORIES: readonly Category[] = [
  { id: 'animals',   name: 'Animals',   emoji: '🦁', symbols: ['🦁', '🐘', '🦅', '🦊', '🐊', '🐺'] },
  { id: 'plants',    name: 'Plants',    emoji: '🌿', symbols: ['🌸', '🌻', '🌴', '🌵', '🍄', '🌹'] },
  { id: 'fruits',    name: 'Fruits',    emoji: '🍎', symbols: ['🍎', '🍊', '🍋', '🍇', '🍓', '🍑'] },
  { id: 'sports',    name: 'Sports',    emoji: '⚽', symbols: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐'] },
  { id: 'space',     name: 'Space',     emoji: '🚀', symbols: ['🌙', '⭐', '🪐', '☀️', '☄️', '🚀'] },
  { id: 'transport', name: 'Transport', emoji: '🚗', symbols: ['🚗', '✈️', '🚢', '🚂', '🚁', '🏍️'] },
  { id: 'music',     name: 'Music',     emoji: '🎵', symbols: ['🎸', '🎹', '🎺', '🎻', '🥁', '🎷'] },
]
