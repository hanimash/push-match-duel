<script setup lang="ts">
import type { Tile } from '../game/types'

defineProps<{
  layout: 'vertical' | 'horizontal'
  canPushP1: boolean
  canPushP2: boolean
  lastEjected: Tile | null
}>()

const emit = defineEmits<{
  pushP1: [index: number]
  pushP2: [index: number]
}>()

const COLS = 6
const ROWS = 4
</script>

<template>

  <!-- ══════════════ VERTICAL ══════════════ -->
  <div v-if="layout === 'vertical'" class="push-zone push-zone--vertical">

    <!-- P2 push buttons ↑ -->
    <div class="vt-row">
      <button
        v-for="col in COLS" :key="col"
        class="push-btn push-btn--p2"
        :disabled="!canPushP2"
        @click="emit('pushP2', col - 1)"
      >↑</button>
    </div>

    <!-- Ejected tile + VS -->
    <div class="vt-middle">
      <div class="ejected-zone">
        <span class="ejected-label">خرجت</span>
        <Transition name="eject" mode="out-in">
          <div
            v-if="lastEjected"
            :key="lastEjected.id + String(lastEjected.revealed)"
            class="ejected-tile-big"
            :class="`owner--${lastEjected.owner.toLowerCase()}`"
          >{{ lastEjected.revealed ? lastEjected.symbol : '◆' }}</div>
          <div v-else class="ejected-empty">—</div>
        </Transition>
      </div>
      <span class="vs-text">VS</span>
    </div>

    <!-- P1 push buttons ↓ -->
    <div class="vt-row">
      <button
        v-for="col in COLS" :key="col"
        class="push-btn push-btn--p1"
        :disabled="!canPushP1"
        @click="emit('pushP1', col - 1)"
      >↓</button>
    </div>

  </div>

  <!-- ══════════════ HORIZONTAL ══════════════ -->
  <div v-else class="push-zone push-zone--horizontal">

    <!-- Ejected tile neutral area -->
    <div class="ejected-zone hz">
      <span class="ejected-label">خرجت</span>
      <Transition name="eject" mode="out-in">
        <div
          v-if="lastEjected"
          :key="lastEjected.id + String(lastEjected.revealed)"
          class="ejected-tile-big"
          :class="`owner--${lastEjected.owner.toLowerCase()}`"
        >{{ lastEjected.revealed ? lastEjected.symbol : '◆' }}</div>
        <div v-else class="ejected-empty">—</div>
      </Transition>
    </div>

    <!-- Row buttons: ← for P2 (left board), → for P1 (right board) -->
    <div class="hz-btn-grid">
      <div v-for="row in ROWS" :key="row" class="hz-btn-pair">
        <button
          class="push-btn push-btn--p2 push-btn--hz"
          :disabled="!canPushP2"
          @click="emit('pushP2', row - 1)"
        >←</button>
        <button
          class="push-btn push-btn--p1 push-btn--hz"
          :disabled="!canPushP1"
          @click="emit('pushP1', row - 1)"
        >→</button>
      </div>
    </div>

  </div>

</template>
