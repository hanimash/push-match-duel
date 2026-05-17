<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { CATEGORIES } from '../game/constants'
import { playRoll, playDraw } from '../game/sounds'
import type { GameConfig, PlayerId } from '../game/types'
import { t } from '../i18n'

const emit = defineEmits<{ start: [GameConfig] }>()

const mode       = ref<'pvp' | 'pvc'>('pvc')
const p1CatId    = ref(CATEGORIES[0].id)
const p2CatId    = ref(CATEGORIES[1].id)
const p1Name     = ref('')
const p2Name     = ref('')
const difficulty = ref<'easy' | 'hard'>('hard')

watch(p1CatId, (id) => {
  if (p2CatId.value === id)
    p2CatId.value = CATEGORIES.find(c => c.id !== id)!.id
})

const aiCatId    = computed(() => {
  const others = CATEGORIES.filter(c => c.id !== p1CatId.value)
  return others[Math.floor(Math.random() * others.length)].id
})
const aiCategory = computed(() => CATEGORIES.find(c => c.id === aiCatId.value)!)
const p1Cat      = computed(() => CATEGORIES.find(c => c.id === p1CatId.value)!)
const p2Cat      = computed(() => CATEGORIES.find(c => c.id === p2CatId.value)!)
const p1Label    = computed(() => t.value.player1Default)
const p2Label  = computed(() => mode.value === 'pvc' ? t.value.aiName : t.value.player2Default)

type DrawPhase = 'setup' | 'rolling' | 'done'
const drawPhase   = ref<DrawPhase>('setup')
const firstPlayer = ref<PlayerId>('P1')

const DICE = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
const diceIdx = ref(0)
let diceTimer: ReturnType<typeof setInterval> | null = null

function clearDice() {
  if (diceTimer) { clearInterval(diceTimer); diceTimer = null }
}
onUnmounted(clearDice)

function roll() {
  drawPhase.value   = 'rolling'
  firstPlayer.value = Math.random() < 0.5 ? 'P1' : 'P2'
  diceIdx.value = 0
  diceTimer = setInterval(() => { diceIdx.value = (diceIdx.value + 1) % DICE.length }, 100)
  playRoll()
  setTimeout(() => { clearDice(); drawPhase.value = 'done'; playDraw() }, 1600)
}

function launch() {
  const p1Cat     = CATEGORIES.find(c => c.id === p1CatId.value)!
  const p2CatUsed = mode.value === 'pvc' ? aiCatId.value : p2CatId.value
  const p2Cat     = CATEGORIES.find(c => c.id === p2CatUsed)!
  emit('start', {
    mode:         mode.value,
    p1Symbols:    [...p1Cat.symbols],
    p2Symbols:    [...p2Cat.symbols],
    firstPlayer:  firstPlayer.value,
    p1Name:       p1Name.value.trim() || t.value.player1Default,
    p2Name:       mode.value === 'pvc'
                    ? t.value.aiName
                    : (p2Name.value.trim() || t.value.player2Default),
    aiDifficulty: difficulty.value,
  })
}
</script>

<template>
  <div class="setup-screen">
    <div class="setup-card">
      <h2 class="setup-title">Push Match Duel</h2>

      <!-- Draw overlay -->
      <Transition name="fade">
        <div v-if="drawPhase !== 'setup'" class="draw-overlay">
          <div v-if="drawPhase === 'rolling'" class="draw-rolling">
            <span class="draw-dice">{{ DICE[diceIdx] }}</span>
            <p class="draw-hint">{{ t.drawing }}</p>
          </div>
          <div v-else class="draw-result">
            <span class="draw-winner-dot" :class="firstPlayer === 'P1' ? 'dot--p1' : 'dot--p2'"></span>
            <p class="draw-winner-label">
              {{ t.startsFirst(firstPlayer === 'P1' ? p1Label : p2Label) }}
            </p>
            <div class="draw-actions">
              <button class="btn-secondary" @click="drawPhase = 'setup'">{{ t.backBtn }}</button>
              <button class="btn-main" @click="launch">{{ t.playBtn }}</button>
            </div>
          </div>
        </div>
      </Transition>

      <template v-if="drawPhase === 'setup'">

        <!-- Mode -->
        <div class="setup-section">
          <p class="setup-label">{{ t.gameMode }}</p>
          <div class="mode-row">
            <button class="mode-btn" :class="{ 'mode-btn--on': mode === 'pvc' }" @click="mode = 'pvc'">
              {{ t.modeVsComputer }}
            </button>
            <button class="mode-btn" :class="{ 'mode-btn--on': mode === 'pvp' }" @click="mode = 'pvp'">
              {{ t.modeTwoPlayers }}
            </button>
          </div>
        </div>

        <!-- Player names -->
        <div class="setup-section">
          <div class="names-row">
            <div class="name-field name-field--p1">
              <label class="name-label setup-label--p1">{{ p1Label }}</label>
              <input v-model="p1Name" class="name-input name-input--p1" maxlength="20"
                     :placeholder="t.player1Default" />
            </div>
            <div v-if="mode === 'pvp'" class="name-field name-field--p2">
              <label class="name-label setup-label--p2">{{ p2Label }}</label>
              <input v-model="p2Name" class="name-input name-input--p2" maxlength="20"
                     :placeholder="t.player2Default" />
            </div>
          </div>
        </div>

        <!-- AI difficulty -->
        <div v-if="mode === 'pvc'" class="setup-section">
          <p class="setup-label">{{ t.aiLevel }}</p>
          <div class="difficulty-row">
            <button class="diff-btn" :class="{ 'diff-btn--on': difficulty === 'easy' }" @click="difficulty = 'easy'">
              {{ t.aiEasy }}
            </button>
            <button class="diff-btn" :class="{ 'diff-btn--on': difficulty === 'hard' }" @click="difficulty = 'hard'">
              {{ t.aiHard }}
            </button>
          </div>
        </div>

        <!-- P1 category -->
        <div class="setup-section">
          <p class="setup-label setup-label--p1">{{ t.categoryLabel(p1Label) }}</p>
          <div class="cat-select-wrap cat-select-wrap--p1">
            <select v-model="p1CatId" class="cat-select cat-select--p1">
              <option v-for="cat in CATEGORIES" :key="cat.id" :value="cat.id"
                :disabled="mode === 'pvp' && cat.id === p2CatId">
                {{ cat.emoji }} {{ t.categoryNames[cat.id] ?? cat.name }}
              </option>
            </select>
          </div>
          <div class="cat-preview">{{ p1Cat.symbols.join('  ') }}</div>
        </div>

        <!-- P2 / AI category -->
        <div class="setup-section">
          <p class="setup-label" :class="mode === 'pvp' ? 'setup-label--p2' : 'setup-label--ai'">
            {{ t.categoryLabel(p2Label) }}
          </p>

          <!-- PvP: P2 picks from dropdown -->
          <template v-if="mode === 'pvp'">
            <div class="cat-select-wrap cat-select-wrap--p2">
              <select v-model="p2CatId" class="cat-select cat-select--p2">
                <option v-for="cat in CATEGORIES" :key="cat.id" :value="cat.id"
                  :disabled="cat.id === p1CatId">
                  {{ cat.emoji }} {{ t.categoryNames[cat.id] ?? cat.name }}
                </option>
              </select>
            </div>
            <div class="cat-preview">{{ p2Cat.symbols.join('  ') }}</div>
          </template>

          <!-- PvC: AI auto-selected (random, different from P1) -->
          <div v-else class="ai-cat-display">
            <span class="cat-row-emoji">{{ aiCategory.emoji }}</span>
            <span class="cat-row-name">{{ t.categoryNames[aiCategory.id] ?? aiCategory.name }}</span>
            <span class="cat-row-symbols">{{ aiCategory.symbols.join(' ') }}</span>
            <span class="ai-cat-badge">{{ t.aiCategoryAuto }}</span>
          </div>
        </div>

        <button class="btn-main btn-roll" @click="roll">{{ t.rollBtn }}</button>
      </template>
    </div>
  </div>
</template>
