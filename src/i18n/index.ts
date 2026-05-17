import { ref, computed } from 'vue'
import { ar } from './ar'
import { en } from './en'
import { de } from './de'
import type { Translations } from './types'

export type Lang = 'ar' | 'en' | 'de'
export type { Translations }

export const currentLang = ref<Lang>('ar')

const map: Record<Lang, Translations> = { ar, en, de }

export const t = computed(() => map[currentLang.value])

export function setLang(lang: Lang) {
  currentLang.value = lang
  if (typeof document !== 'undefined') {
    document.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }
}

// Set RTL for default Arabic locale on module load
if (typeof document !== 'undefined') {
  document.dir = 'rtl'
  document.documentElement.lang = 'ar'
}
