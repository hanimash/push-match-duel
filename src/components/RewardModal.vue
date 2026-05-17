<script setup lang="ts">
import { ref } from 'vue'
import { ABILITIES, ABILITY_IDS } from '../game/abilities'
import type { AbilityId } from '../game/abilities'
import type { PlayerId } from '../game/types'
import { t } from '../i18n'

const props = defineProps<{ player: PlayerId; playerName: string }>()

const emit = defineEmits<{
  claim: [AbilityId]
  skip:  []
}>()

const cards = [...ABILITY_IDS].sort(() => Math.random() - 0.5)

const flippedIdx = ref<number | null>(null)
const locked      = ref(false)

function onCardClick(i: number) {
  if (locked.value || flippedIdx.value !== null) return
  flippedIdx.value = i
  locked.value = true
  setTimeout(() => emit('claim', cards[i]), 650)
}
</script>

<template>
  <div class="reward-overlay">
    <div class="reward-box" :class="`reward-box--${player.toLowerCase()}`">

      <div class="reward-header">
        <span class="reward-trophy">🎁</span>
        <div>
          <p class="reward-title">{{ t.rewardTitle }}</p>
          <p class="reward-subtitle">{{ t.rewardSubtitle(playerName) }}</p>
        </div>
      </div>

      <div class="reward-cards">
        <button
          v-for="(id, i) in cards" :key="id"
          class="reward-card"
          :class="{
            'reward-card--flipped': flippedIdx === i,
            'reward-card--dimmed':  flippedIdx !== null && flippedIdx !== i,
          }"
          :disabled="locked"
          @click="onCardClick(i)"
        >
          <div class="reward-card-inner">
            <div class="reward-card-face reward-card-front">
              <span class="reward-card-q">?</span>
            </div>
            <div
              class="reward-card-face reward-card-back"
              :class="`reward-card-back--${player.toLowerCase()}`"
            >
              <span class="reward-card-icon">{{ ABILITIES[id].icon }}</span>
              <span class="reward-card-name">{{ t.abilities[id].name }}</span>
              <span class="reward-card-desc">{{ t.abilities[id].desc }}</span>
            </div>
          </div>
        </button>
      </div>

      <button class="btn-skip-reward" @click="emit('skip')">{{ t.skipBtn }}</button>
    </div>
  </div>
</template>
