<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import TileView from './TileView.vue'
import type { Board, Tile, PlayerId, ActiveAbilityState } from '../game/types'
import { applyFreeze, applySwapClick, applyRotateRow, aiPushSignal } from '../game/gameState'

const props = defineProps<{
  playerId:      PlayerId
  board:         Board | null
  canPush:       boolean
  activeAbility?: ActiveAbilityState | null
  frozenCols?:   number[]
  pushArrow?:    string
  showColLabel?: boolean
}>()

const emit = defineEmits<{ push: [colIndex: number] }>()

interface EjectGhost {
  col:     number
  symbol:  string
  revealed: boolean
  tileCls: string
}
const ejectGhost = ref<EjectGhost | null>(null)
let ghostTimer: ReturnType<typeof setTimeout> | null = null

function triggerGhost(col: number, symbol: string, revealed: boolean, tileCls: string) {
  if (ghostTimer) clearTimeout(ghostTimer)
  ejectGhost.value = { col, symbol, revealed, tileCls }
  ghostTimer = setTimeout(() => { ejectGhost.value = null }, 650)
}

// AI pushes don't go through onPushOrFreeze — watch the signal instead
watch(aiPushSignal, (sig) => {
  if (!sig || props.playerId !== 'P2') return
  triggerGhost(sig.col, sig.symbol, sig.revealed, sig.tileCls)
})

const ROWS = 4
const COLS = 6
const COL_LABELS = ['A', 'B', 'C', 'D', 'E', 'F']

// P2's board is read from the opposite end, so column labels run F→A on screen
const pushColLabels = computed(() =>
  props.playerId === 'P2' ? [...COL_LABELS].reverse() : COL_LABELS
)

function emptyTile(r: number, c: number): Tile {
  return { id: `e-${r}-${c}`, owner: 'P1', symbol: '', revealed: false }
}

const doneColSet = computed(() => {
  const set = new Set<number>()
  if (!props.board) return set
  for (let col = 0; col < COLS; col++) {
    const first = props.board[0][col]
    if (first.owner !== props.playerId || !first.revealed) continue
    let ok = true
    for (let row = 1; row < ROWS; row++) {
      const t = props.board[row][col]
      if (t.owner !== props.playerId || t.symbol !== first.symbol) { ok = false; break }
    }
    if (ok) set.add(col)
  }
  return set
})

const ab = computed(() => props.activeAbility ?? null)

const isOpponentBoard = computed(() => ab.value !== null && ab.value.player !== props.playerId)

const freezeMode = computed(() => isOpponentBoard.value && ab.value?.ability === 'freeze_column')
const swapMode   = computed(() => isOpponentBoard.value && ab.value?.ability === 'swap_tiles')
const rotateMode = computed(() => isOpponentBoard.value && ab.value?.ability === 'rotate_row')

const frozenSet = computed(() => new Set(props.frozenCols ?? []))

const swapFirst = computed<[number, number] | null>(() => {
  const a = ab.value
  if (a?.ability === 'swap_tiles' && a.first !== null) return a.first
  return null
})

function onPushOrFreeze(col: number) {
  if (freezeMode.value) { applyFreeze(col); return }

  // Capture the bottom tile BEFORE the board updates
  if (props.board) {
    const bt = props.board[ROWS - 1][col]
    triggerGhost(
      col,
      bt.symbol,
      bt.revealed,
      bt.revealed ? (bt.isStartTile ? 'tile--start' : `tile--${bt.owner.toLowerCase()}`) : 'tile--hidden'
    )
  }
  emit('push', col)
}

function onTileClick(row: number, col: number) {
  if (swapMode.value) applySwapClick(row, col)
}

function onRowLabelClick(row: number) {
  if (rotateMode.value) applyRotateRow(row)
}

function isSwapSelected(row: number, col: number): boolean {
  return swapFirst.value !== null && swapFirst.value[0] === row && swapFirst.value[1] === col
}
</script>

<template>
  <div class="board-wrap" :class="{ 'board--targeting': freezeMode || swapMode || rotateMode }">

    <!-- Column labels (A–F) -->
    <div class="coord-col-row">
      <span class="coord-corner"></span>
      <span v-for="label in COL_LABELS" :key="label" class="coord-col-label">{{ label }}</span>
    </div>

    <!-- Push buttons (also used for freeze targeting) -->
    <div class="board-push-row">
      <span class="coord-corner"></span>
      <button
        v-for="col in COLS" :key="col"
        class="push-btn"
        :class="[
          `push-btn--${playerId.toLowerCase()}`,
          { 'push-btn--freeze': freezeMode, 'push-btn--frozen': frozenSet.has(col - 1) }
        ]"
        :disabled="(!canPush && !freezeMode) || frozenSet.has(col - 1)"
        @click="onPushOrFreeze(col - 1)"
      ><template v-if="freezeMode || frozenSet.has(col - 1)">❄️</template>
        <span v-else-if="props.showColLabel" class="push-btn-inner">
          <span class="push-btn-col">{{ pushColLabels[col - 1] }}</span>
          <span class="push-btn-arr">{{ props.pushArrow ?? '↓' }}</span>
        </span>
        <template v-else>{{ props.pushArrow ?? '↓' }}</template>
      </button>
    </div>

    <!-- Board rows with row labels -->
    <div class="board">
      <template v-if="board">
        <div v-for="(row, rIdx) in board" :key="rIdx" class="board-row-wrap">
          <span
            class="coord-row-label"
            :class="{ 'row-label--rotate-target': rotateMode }"
            @click="onRowLabelClick(rIdx)"
          >{{ rIdx + 1 }}</span>
          <div class="board-row">
            <div
              v-for="(tile, cIdx) in row"
              :key="tile.id"
              class="tile-click-wrap"
              :class="{
                'tile-wrap--swap-target':   swapMode && !isSwapSelected(rIdx, cIdx),
                'tile-wrap--swap-selected': isSwapSelected(rIdx, cIdx),
                'tile-wrap--frozen':        frozenSet.has(cIdx),
              }"
              @click="onTileClick(rIdx, cIdx)"
            >
              <TileView :tile="tile" :done="doneColSet.has(cIdx)" />
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div v-for="r in ROWS" :key="r" class="board-row-wrap">
          <span class="coord-row-label">{{ r }}</span>
          <div class="board-row">
            <TileView v-for="c in COLS" :key="c" :tile="emptyTile(r, c)" />
          </div>
        </div>
      </template>

      <!-- Ghost tile: animates the ejected tile flying out from the bottom -->
      <div
        v-if="ejectGhost"
        class="tile tile--revealed eject-ghost-tile"
        :class="ejectGhost.tileCls"
        :style="{ '--eject-col': ejectGhost.col }"
      >{{ ejectGhost.revealed ? ejectGhost.symbol : '◆' }}</div>
    </div>

  </div>
</template>
