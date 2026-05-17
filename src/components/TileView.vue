<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Tile } from '../game/types'

const props = defineProps<{ tile: Tile; done?: boolean }>()

const justDone = ref(false)

watch(() => props.done, (val, old) => {
  if (val && !old) {
    justDone.value = true
    setTimeout(() => { justDone.value = false }, 900)
  }
})
</script>

<template>
  <div
    class="tile"
    :class="[
      tile.revealed
        ? [tile.isStartTile ? 'tile--start' : `tile--${tile.owner.toLowerCase()}`, 'tile--revealed']
        : 'tile--hidden',
      { 'tile--col-done': done, 'tile--just-done': justDone }
    ]"
  >
    <Transition name="flip" mode="out-in">
      <span :key="tile.revealed ? tile.symbol : '__hidden__'">
        {{ tile.revealed ? tile.symbol : '◆' }}
      </span>
    </Transition>
  </div>
</template>
