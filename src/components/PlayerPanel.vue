<script setup lang="ts">
import { ABILITIES } from '../game/abilities'
import type { AbilityId } from '../game/abilities'
import type { PlayerId } from '../game/types'
import { t } from '../i18n'

defineProps<{
  playerId:        PlayerId
  isCurrentPlayer: boolean
  name:            string
  doneCount:       number
  ability:         AbilityId | null
  canActivate:     boolean
  isAbilityActive: boolean
}>()

const emit = defineEmits<{
  'activate-ability': []
  'cancel-ability':   []
}>()
</script>

<template>
  <div
    class="player-panel"
    :class="[`panel--${playerId.toLowerCase()}`, { 'panel--active': isCurrentPlayer }]"
  >
    <!-- Row 1: name + turn badge + progress -->
    <div class="panel-row1">
      <span class="panel-dot" :class="`dot--${playerId.toLowerCase()}`"></span>
      <span class="panel-name">{{ name }}</span>
      <span v-if="isCurrentPlayer" class="panel-turn-badge">{{ t.turnBadge }}</span>
      <span class="panel-spacer"></span>
      <span class="panel-done-count">{{ doneCount }}/6 ✓</span>
    </div>

    <!-- Row 2: ability card only (when player has one) -->
    <div v-if="ability !== null" class="panel-row2">
      <Transition name="ability-pop">
        <button
          v-if="ability"
          class="ability-card"
          :class="{
            'ability-card--ready':  canActivate && !isAbilityActive,
            'ability-card--active': isAbilityActive,
          }"
          :disabled="!canActivate && !isAbilityActive"
          @click="isAbilityActive ? emit('cancel-ability') : emit('activate-ability')"
        >
          <span class="ability-card-icon">{{ ABILITIES[ability].icon }}</span>
          <span class="ability-card-name">
            {{ isAbilityActive ? t.cancelAbility : t.abilities[ability].name }}
          </span>
        </button>
      </Transition>
    </div>
  </div>
</template>
