<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import GameBoard from './components/GameBoard.vue'
import PlayerPanel from './components/PlayerPanel.vue'
import TileView from './components/TileView.vue'
import SetupScreen from './components/SetupScreen.vue'
import RewardModal from './components/RewardModal.vue'
import HowToPlayModal from './components/HowToPlayModal.vue'
import { state, newGame, executeMove, aiEnabled, playerNames, claimReward, activateAbility, cancelAbility, aiAbilityNotification, dismissAiAbility } from './game/gameState'
import { muted } from './game/sounds'
import { t, currentLang, setLang } from './i18n'
import type { Lang } from './i18n'
import type { GameConfig, PlayerId } from './game/types'
import type { AbilityId } from './game/abilities'
import { ABILITIES } from './game/abilities'

const LANGS: Lang[] = ['ar', 'en', 'de']

const layout          = ref<'vertical' | 'horizontal'>('horizontal')
const showHelp        = ref(false)
const showP1Drawer    = ref(false)
const showMobileMenu  = ref(false)
const game            = computed(() => state.game)

// Close P1 drawer when P1's turn ends
watch(() => game.value?.currentPlayer, (p) => {
  if (p !== 'P1') showP1Drawer.value = false
})
// Close mobile menu when switching to desktop layout
watch(layout, () => { showMobileMenu.value = false })

function applyAutoLayout() {
  if (window.innerWidth < 700) layout.value = 'vertical'
}
onMounted(() => {
  applyAutoLayout()
  window.addEventListener('resize', applyAutoLayout)
})
onUnmounted(() => window.removeEventListener('resize', applyAutoLayout))

// P2's display name: always the player's chosen name, with 🤖 prefix when AI is active
const p2DisplayName = computed(() =>
  aiEnabled.value ? `🤖 ${playerNames.P2}` : playerNames.P2
)

const turnLabel = computed(() =>
  game.value?.currentPlayer === 'P1' ? playerNames.P1 : p2DisplayName.value
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

const aiNotif = computed(() => {
  const id = aiAbilityNotification.value
  if (!id) return null
  return {
    icon: ABILITIES[id].icon,
    name: t.value.abilities[id].name,
    desc: t.value.abilities[id].desc,
  }
})

function canPush(id: 'P1' | 'P2'): boolean {
  if (!game.value) return false
  if (id === 'P2' && aiEnabled.value) return false
  if (aiAbilityNotification.value !== null) return false
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
  <div class="app" :class="[`layout--${layout}`, { 'mode--pvp': !aiEnabled }]">

    <!-- ── Header ── -->
    <header class="game-header">
      <h1 class="header-title">Push Match Duel</h1>

      <div class="header-right">
        <!-- Turn indicator: always visible during game -->
        <div v-if="game" class="turn-indicator" :class="`turn--${game.currentPlayer.toLowerCase()}`">
          {{ t.turnOf(turnLabel) }}
        </div>

        <!-- ── Desktop utility strip ── -->
        <div class="header-utils">
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
          <button class="btn-sm btn-mute" :title="muted ? t.unmuteLabel : t.muteLabel" @click="muted = !muted">
            {{ muted ? '🔇' : '🔊' }}
          </button>
          <button class="btn-sm btn-help" @click="showHelp = true">?</button>
          <button v-if="game" class="btn-sm btn-ai btn-ai--sm" :class="{ 'btn-ai--on': aiEnabled }" @click="aiEnabled = !aiEnabled">
            {{ aiEnabled ? `👤 ${t.aiBot}` : `🤖 ${t.aiHuman}` }}
          </button>
          <button v-if="game" class="btn-sm" @click="resetToSetup">↺</button>
        </div>

        <!-- ── Mobile kebab menu trigger ── -->
        <button class="btn-sm btn-kebab" @click="showMobileMenu = !showMobileMenu">⋮</button>
      </div>
    </header>

    <!-- Mobile menu backdrop -->
    <div v-if="showMobileMenu" class="mobile-menu-backdrop" @click="showMobileMenu = false" />

    <!-- Mobile menu dropdown -->
    <Transition name="menu-drop">
      <div v-if="showMobileMenu" class="mobile-menu">
        <!-- Language -->
        <div class="mobile-menu-langs">
          <button
            v-for="lang in LANGS" :key="lang"
            class="btn-lang" :class="{ 'btn-lang--active': currentLang === lang }"
            @click="setLang(lang); showMobileMenu = false"
          >{{ lang.toUpperCase() }}</button>
        </div>
        <div class="mobile-menu-sep" />
        <!-- Layout toggle -->
        <button class="mobile-menu-item"
          @click="layout = layout === 'vertical' ? 'horizontal' : 'vertical'; showMobileMenu = false">
          {{ layout === 'horizontal' ? '↕' : '↔' }}&ensp;{{ layout === 'horizontal' ? t.layoutTablet : t.layoutDesktop }}
        </button>
        <!-- Mute -->
        <button class="mobile-menu-item"
          @click="muted = !muted; showMobileMenu = false">
          {{ muted ? '🔇' : '🔊' }}&ensp;{{ muted ? t.unmuteLabel : t.muteLabel }}
        </button>
        <!-- AI toggle (only during game) -->
        <template v-if="game">
          <button class="mobile-menu-item" :class="{ 'mobile-menu-item--ai-on': aiEnabled }"
            @click="aiEnabled = !aiEnabled; showMobileMenu = false">
            {{ aiEnabled ? '👤' : '🤖' }}&ensp;{{ aiEnabled ? t.aiBot : t.aiHuman }}
          </button>
        </template>
        <!-- How to play -->
        <button class="mobile-menu-item"
          @click="showHelp = true; showMobileMenu = false">
          ?&ensp;{{ t.howToPlay.title }}
        </button>
        <!-- Reset (only during game) -->
        <template v-if="game">
          <div class="mobile-menu-sep" />
          <button class="mobile-menu-item mobile-menu-item--danger"
            @click="resetToSetup(); showMobileMenu = false">
            {{ t.homeBtn }}
          </button>
        </template>
      </div>
    </Transition>

    <!-- ── How to Play Modal ── -->
    <Transition name="modal">
      <HowToPlayModal v-if="showHelp" @close="showHelp = false" />
    </Transition>

    <!-- ── AI Ability Notification Modal (blocking) ── -->
    <Transition name="modal">
      <div v-if="aiNotif" class="modal-overlay ai-notif-overlay">
        <div class="modal-box ai-notif-box">
          <div class="ai-notif-robot">🤖</div>
          <p class="ai-notif-used">{{ t.aiUsed }}</p>
          <div class="ai-notif-card">
            <div class="ai-notif-card-icon">{{ aiNotif.icon }}</div>
            <div class="ai-notif-card-name">{{ aiNotif.name }}</div>
            <div class="ai-notif-card-desc">{{ aiNotif.desc }}</div>
          </div>
          <button class="btn-main ai-notif-ok" @click="dismissAiAbility()">{{ t.gotIt }}</button>
        </div>
      </div>
    </Transition>

    <!-- ── Setup Screen ── -->
    <SetupScreen v-if="!game" @start="handleStart" />

    <!-- ── Reward Modal ── -->
    <Transition name="modal">
      <RewardModal
        v-if="game?.pendingReward"
        :player="game.pendingReward"
        :player-name="game.pendingReward === 'P2' ? p2DisplayName : playerNames.P1"
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
            {{ game.winner === 'P1' ? playerNames.P1 : p2DisplayName }}
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

      <!-- P2 zone (board reordered: col-labels→board→push↑ via CSS; label sticks below push buttons) -->
      <div class="player-zone player-zone--p2" :class="{ 'zone--active': game.currentPlayer === 'P2' }">
        <GameBoard player-id="P2" :board="game.boards.P2"
          :can-push="canPush('P2')"
          :active-ability="game.activeAbility"
          :frozen-cols="game.frozenCols.P2"
          push-arrow="↑"
          :show-col-label="true"
          @push="i => executeMove(i, 'column')" />
        <div class="zone-label zone-label--p2" :class="{ 'zone-label--cur': game.currentPlayer === 'P2' }">
          <span class="estrip-dot dot--p2"></span>
          <span class="estrip-name estrip-name--p2">{{ p2DisplayName }}</span>
          <span class="estrip-score">{{ doneCount('P2') }}/6</span>
          <Transition name="ability-pop">
            <button v-if="game.abilities.P2"
              class="estrip-ability"
              :class="{ 'estrip-ability--on': isAbilityActiveFor('P2') }"
              :disabled="!canActivateAbility('P2') && !isAbilityActiveFor('P2')"
              @click="isAbilityActiveFor('P2') ? cancelAbility() : activateAbility('P2')"
            >{{ ABILITIES[game.abilities.P2].icon }}</button>
          </Transition>
        </div>
      </div>

      <!-- ── Center strip: current tile only ── -->
      <div class="ejected-strip">
        <div class="center-tile-wrap">
          <Transition name="eject" mode="out-in">
            <TileView v-if="game.currentTile[game.currentPlayer]"
              :key="game.currentPlayer + (game.currentTile[game.currentPlayer]?.id ?? '')"
              :tile="game.currentTile[game.currentPlayer]!" />
            <div v-else key="ghost" class="center-tile-ghost"></div>
          </Transition>
        </div>
      </div>

      <!-- P1 zone (label sticks above push buttons; push↓ reordered to top via CSS) -->
      <div class="player-zone player-zone--p1" :class="{ 'zone--active': game.currentPlayer === 'P1' }">
        <div class="zone-label zone-label--p1" :class="{ 'zone-label--cur': game.currentPlayer === 'P1' }">
          <span class="estrip-dot dot--p1"></span>
          <span class="estrip-name estrip-name--p1">{{ playerNames.P1 }}</span>
          <span class="estrip-score">{{ doneCount('P1') }}/6</span>
          <Transition name="ability-pop">
            <button v-if="game.abilities.P1"
              class="estrip-ability"
              :class="{ 'estrip-ability--on': isAbilityActiveFor('P1') }"
              :disabled="!canActivateAbility('P1') && !isAbilityActiveFor('P1')"
              @click="isAbilityActiveFor('P1') ? cancelAbility() : activateAbility('P1')"
            >{{ ABILITIES[game.abilities.P1].icon }}</button>
          </Transition>
        </div>
        <GameBoard player-id="P1" :board="game.boards.P1"
          :can-push="canPush('P1')"
          :active-ability="game.activeAbility"
          :frozen-cols="game.frozenCols.P1"
          :show-col-label="true"
          @push="i => executeMove(i, 'column')" />
      </div>

    </main>

    <!-- ══ HORIZONTAL ══ -->
    <main v-if="game && layout === 'horizontal'" class="game-area--horizontal">

      <div class="player-zone player-zone--p2" :class="{ 'zone--active': game.currentPlayer === 'P2' }">
        <div class="p2-header">
          <PlayerPanel player-id="P2"
:is-current-player="game.currentPlayer === 'P2'"
            :name="p2DisplayName"
            :done-count="doneCount('P2')"
            :ability="game.abilities.P2"
            :can-activate="canActivateAbility('P2')"
            :is-ability-active="isAbilityActiveFor('P2')"
            @activate-ability="activateAbility('P2')"
            @cancel-ability="cancelAbility()" />
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
