<script setup lang="ts">
import type { Tile } from '../game/types'

defineProps<{ tile: Tile | null }>()
</script>

<template>
  <div class="ejected-display">
    <span class="ejected-label">خرجت</span>
    <Transition name="eject" mode="out-in">
      <div v-if="tile" :key="tile.id + tile.revealed" class="ejected-tile">
        <span class="ejected-symbol">{{ tile.revealed ? tile.symbol : '◆' }}</span>
        <span class="ejected-owner" :class="`owner--${tile.owner.toLowerCase()}`">
          {{ tile.owner }}
        </span>
      </div>
      <div v-else class="ejected-empty">—</div>
    </Transition>
  </div>
</template>
