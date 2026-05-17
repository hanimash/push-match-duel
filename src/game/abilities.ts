export type AbilityId = 'freeze_column' | 'swap_tiles' | 'rotate_row'

export interface AbilityDef {
  id:         AbilityId
  icon:       string
  targetType: 'opponent_column' | 'opponent_board' | 'opponent_row'
}

export const ABILITIES: Record<AbilityId, AbilityDef> = {
  freeze_column: { id: 'freeze_column', icon: '❄️', targetType: 'opponent_column' },
  swap_tiles:    { id: 'swap_tiles',    icon: '🔄', targetType: 'opponent_board' },
  rotate_row:    { id: 'rotate_row',    icon: '🌀', targetType: 'opponent_row' },
}

export const ABILITY_IDS: AbilityId[] = ['freeze_column', 'swap_tiles', 'rotate_row']
