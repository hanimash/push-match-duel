<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import GameBoard from './components/GameBoard.vue'
import PlayerPanel from './components/PlayerPanel.vue'
import TileView from './components/TileView.vue'
import SetupScreen from './components/SetupScreen.vue'
import RewardModal from './components/RewardModal.vue'
import { state, newGame, executeMove, aiEnabled, playerNames, claimReward, activateAbility, cancelAbility } from './game/gameState'
import { muted } from './game/sounds'
import { t, currentLang, setLang } from './i18n'
import type { Lang } from './i18n'
import type { GameConfig, PlayerId } from './game/types'
import type { AbilityId } from './game/abilities'

const LANGS: Lang[] = ['ar', 'en', 'de']

const layout = ref<'vertical' | 'horizontal'>('horizontal')
const game   = computed(() => state.game)

function applyAutoLayout() {
  if (window.innerWidth < 700) layout.value = 'vertical'
}
onMounted(() => {
  applyAutoLayout()
  window.addEventListener('resize', applyAutoLayout)
})
onUnmounted(() => window.removeEventListener('resize', applyAutoLayout))

const turnLabel = computed(() =>
  game.value?.currentPlayer === 'P1' ? playerNames.P1 : playerNames.P2
)

function doneCount(id: 'P1' | 'P2'): number {
  const board = game.value?.boards[id]
  if (!board) return 0
  let count = 0
  for (let col = 0; col < 6; col++) {
    const first = board[0][col]
    if (first.owner !== id || !first.revealed) continue
    let ok = true
    for (let row = 1; row < 4; row++) {
      const tile = board[row][col]
      if (tile.owner !== id || tile.symbol !== first.symbol) { ok = false; break }
    }
    if (ok) count++
  }
  return count
}

function handleStart(config: GameConfig) { newGame(config) }

function onRewardClaim(id: AbilityId) {
  if (game.value?.pendingReward) claimReward(game.value.pendingReward, id)
}
function onRewardSkip() {
  if (game.value?.pendingReward) claimReward(game.value.pendingReward, null)
}

function resetToSetup() { state.game = null }

function canPush(id: 'P1' | 'P2'): boolean {
  if (!game.value) return false
  if (id === 'P2' && aiEnabled.value) return false
  return (
    game.value.currentPlayer === id &&
    game.value.currentTile[id] !== null &&
    game.value.winner === null
  )
}


function canActivateAbility(id: PlayerId): boolean {
  if (!game.value) return false
  if (game.value.abilities[id] === null) return false
  if (game.value.winner) return false
  if (game.value.pendingReward !== null) return false
  if (game.value.currentPlayer !== id) return false
  return true
}

function isAbilityActiveFor(id: PlayerId): boolean {
  return game.value?.activeAbility?.player === id
}

</script>

<template>
  <div class="app" :class="`layout--${layout}`">

    <!-- ── Header ── -->
    <header class="game-header">
      <h1>Push Match Duel</h1>
      <div class="header-right">
        <div v-if="game" class="turn-indicator" :class="`turn--${game.currentPlayer.toLowerCase()}`">
          {{ t.turnOf(turnLabel) }}
        </div>

        <!-- Language selector -->
        <div class="lang-selector">
          <button
            v-for="lang in LANGS" :key="lang"
            class="btn-lang" :class="{ 'btn-lang--active': currentLang === lang }"
            @click="setLang(lang)"
          >{{ lang.toUpperCase() }}</button>
        </div>

        <button class="btn-sm btn-layout"
          :title="layout === 'horizontal' ? t.layoutTablet : t.layoutDesktop"
          @click="layout = layout === 'vertical' ? 'horizontal' : 'vertical'">
          {{ layout === 'horizontal' ? '↕' : '↔' }}
          <span class="btn-layout-label">{{ layout === 'horizontal' ? t.layoutTablet : t.layoutDesktop }}</span>
        </button>
        <button class="btn-sm btn-mute"
          :title="muted ? t.unmuteLabel : t.muteLabel"
          @click="muted = !muted">
          {{ muted ? '🔇' : '🔊' }}
        </button>
        <button v-if="game" class="btn-sm" @click="resetToSetup">↺</button>
      </div>
    </header>

    <!-- ── Setup Screen ── -->
    <SetupScreen v-if="!game" @start="handleStart" />

    <!-- ── Reward Modal ── -->
    <Transition name="modal">
      <RewardModal
        v-if="game?.pendingReward"
        :player="game.pendingReward"
        :player-name="playerNames[game.pendingReward]"
        @claim="onRewardClaim"
        @skip="onRewardSkip"
      />
    </Transition>

    <!-- ── Winner Modal ── -->
    <Transition name="modal">
      <div v-if="game?.winner" class="modal-overlay" @click.self="null">
        <div class="modal-box" :class="`modal--${game.winner.toLowerCase()}`">
          <div class="modal-trophy">🏆</div>
          <div class="modal-winner-name" :class="`text--${game.winner.toLowerCase()}`">
            {{ game.winner === 'P1' ? playerNames.P1 : playerNames.P2 }}
          </div>
          <p class="modal-subtitle">{{ t.wonGame }}</p>
          <div class="modal-done-cols">{{ t.completedCols(doneCount(game.winner)) }}</div>
          <div class="modal-actions">
            <button class="btn-main" @click="resetToSetup">{{ t.homeBtn }}</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ══ VERTICAL ══ -->
    <main v-if="game && layout === 'vertical'" class="game-area--vertical">

      <div class="player-zone player-zone--p2" :class="{ 'zone--active': game.currentPlayer === 'P2' }">
        <div class="p2-header">
          <PlayerPanel player-id="P2"
:is-current-player="game.currentPlayer === 'P2'"
            :name="playerNames.P2"
            :done-count="doneCount('P2')"
            :ability="game.abilities.P2"
            :can-activate="canActivateAbility('P2')"
            :is-ability-active="isAbilityActiveFor('P2')"
            @activate-ability="activateAbility('P2')"
            @cancel-ability="cancelAbility()" />
          <button class="btn-ai" :class="{ 'btn-ai--on': aiEnabled }" @click="aiEnabled = !aiEnabled">
            🤖 {{ aiEnabled ? t.aiBot : t.aiHuman }}
          </button>
        </div>
        <GameBoard player-id="P2" :board="game.boards.P2"
          :can-push="canPush('P2')"
          :active-ability="game.activeAbility"
          :frozen-cols="game.frozenCols.P2"
          @push="i => executeMove(i, 'column')" />
      </div>

      <div class="ejected-strip">
        <div class="strip-current">
          <span class="center-turn-label" :class="`text--${game.currentPlayer.toLowerCase()}`">{{ turnLabel }}</span>
          <div class="center-tile-wrap">
            <Transition name="eject" mode="out-in">
              <TileView v-if="game.currentTile[game.currentPlayer]"
                :key="game.currentPlayer + (game.currentTile[game.currentPlayer]?.id ?? '')"
                :tile="game.currentTile[game.currentPlayer]!" />
              <div v-else key="ghost" class="center-tile-ghost"></div>
            </Transition>
          </div>
        </div>
      </div>

      <div class="player-zone player-zone--p1" :class="{ 'zone--active': game.currentPlayer === 'P1' }">
        <GameBoard player-id="P1" :board="game.boards.P1"
          :can-push="canPush('P1')"
          :active-ability="game.activeAbility"
          :frozen-cols="game.frozenCols.P1"
          @push="i => executeMove(i, 'column')" />
        <PlayerPanel player-id="P1"
:is-current-player="game.currentPlayer === 'P1'"
          :name="playerNames.P1"
          :done-count="doneCount('P1')"
          :ability="game.abilities.P1"
          :can-activate="canActivateAbility('P1')"
          :is-ability-active="isAbilityActiveFor('P1')"
          @activate-ability="activateAbility('P1')"
          @cancel-ability="cancelAbility()" />
      </div>
    </main>

    <!-- ══ HORIZONTAL ══ -->
    <main v-if="game && layout === 'horizontal'" class="game-area--horizontal">

      <div class="player-zone player-zone--p2" :class="{ 'zone--active': game.currentPlayer === 'P2' }">
        <div class="p2-header">
          <PlayerPanel player-id="P2"
:is-current-player="game.currentPlayer === 'P2'"
            :name="playerNames.P2"
            :done-count="doneCount('P2')"
            :ability="game.abilities.P2"
            :can-activate="canActivateAbility('P2')"
            :is-ability-active="isAbilityActiveFor('P2')"
            @activate-ability="activateAbility('P2')"
            @cancel-ability="cancelAbility()" />
          <button class="btn-ai" :class="{ 'btn-ai--on': aiEnabled }" @click="aiEnabled = !aiEnabled">
            🤖 {{ aiEnabled ? t.aiBot : t.aiHuman }}
          </button>
        </div>
        <GameBoard player-id="P2" :board="game.boards.P2"
          :can-push="canPush('P2')"
          :active-ability="game.activeAbility"
          :frozen-cols="game.frozenCols.P2"
          @push="i => executeMove(i, 'column')" />
      </div>

      <div class="center-strip">
        <div class="strip-current">
          <span class="center-turn-label" :class="`text--${game.currentPlayer.toLowerCase()}`">{{ turnLabel }}</span>
          <div class="center-tile-wrap">
            <Transition name="eject" mode="out-in">
              <TileView v-if="game.currentTile[game.currentPlayer]"
                :key="game.currentPlayer + (game.currentTile[game.currentPlayer]?.id ?? '')"
                :tile="game.currentTile[game.currentPlayer]!" />
              <div v-else key="ghost" class="center-tile-ghost"></div>
            </Transition>
          </div>
        </div>
      </div>

      <div class="player-zone player-zone--p1" :class="{ 'zone--active': game.currentPlayer === 'P1' }">
        <PlayerPanel player-id="P1"
:is-current-player="game.currentPlayer === 'P1'"
          :name="playerNames.P1"
          :done-count="doneCount('P1')"
          :ability="game.abilities.P1"
          :can-activate="canActivateAbility('P1')"
          :is-ability-active="isAbilityActiveFor('P1')"
          @activate-ability="activateAbility('P1')"
          @cancel-ability="cancelAbility()" />
        <GameBoard player-id="P1" :board="game.boards.P1"
          :can-push="canPush('P1')"
          :active-ability="game.activeAbility"
          :frozen-cols="game.frozenCols.P1"
          @push="i => executeMove(i, 'column')" />
      </div>
    </main>

  </div>
</template>
