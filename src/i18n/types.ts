import type { AbilityId } from '../game/abilities'

export interface Translations {
  // Header
  turnOf:         (name: string) => string
  layoutTablet:   string
  layoutDesktop:  string
  muteLabel:      string
  unmuteLabel:    string
  // Game area
  ejectedLabel:   string
  aiBot:          string
  aiHuman:        string
  // Player panel
  turnBadge:      string
  cancelAbility:  string
  // Setup screen
  gameMode:          string
  modeVsComputer:    string
  modeTwoPlayers:    string
  player1Default:    string
  player2Default:    string
  aiName:            string
  aiLevel:           string
  aiEasy:            string
  aiHard:            string
  categoryLabel:     (playerName: string) => string
  categoryNames:     Record<string, string>
  aiCategoryAuto:    string
  rollBtn:           string
  drawing:           string
  startsFirst:       (name: string) => string
  backBtn:           string
  playBtn:           string
  // Reward modal
  rewardTitle:    string
  rewardSubtitle: (name: string) => string
  skipBtn:        string
  // Winner modal
  wonGame:        string
  completedCols:  (count: number) => string
  homeBtn:        string
  // Abilities
  abilities: Record<AbilityId, { name: string; desc: string }>
}
