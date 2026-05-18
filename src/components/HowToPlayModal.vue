<script setup lang="ts">
import { t } from '../i18n'

const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="htp-box">
      <button class="htp-close" @click="emit('close')">✕</button>
      <h2 class="htp-title">{{ t.howToPlay.title }}</h2>

      <div class="htp-steps">
        <div v-for="(step, i) in t.howToPlay.steps" :key="i" class="htp-step">
          <span class="htp-step-icon">{{ step.icon }}</span>
          <div class="htp-step-body">
            <strong class="htp-step-title">{{ step.title }}</strong>
            <p class="htp-step-desc">{{ step.desc }}</p>
          </div>
        </div>
      </div>

      <button class="btn-main htp-btn-close" @click="emit('close')">
        {{ t.howToPlay.closeBtn }}
      </button>
    </div>
  </div>
</template>
