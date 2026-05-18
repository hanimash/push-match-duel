import { ref, computed } from 'vue'
import { ar } from './ar'
import { en } from './en'
import { de } from './de'
import type { Translations } from './types'

export type Lang = 'ar' | 'en' | 'de'
export type { Translations }

function detectLang(): Lang {
  const supported: Lang[] = ['ar', 'en', 'de']
  for (const pref of navigator.languages ?? [navigator.language]) {
    const code = pref.split('-')[0].toLowerCase() as Lang
    if (supported.includes(code)) return code
  }
  return 'en'
}

const initial = detectLang()

export const currentLang = ref<Lang>(initial)

const map: Record<Lang, Translations> = { ar, en, de }

export const t = computed(() => map[currentLang.value])

export function setLang(lang: Lang) {
  currentLang.value = lang
  if (typeof document !== 'undefined') {
    document.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }
}

// Apply dir/lang for the detected default
if (typeof document !== 'undefined') {
  document.dir = initial === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.lang = initial
}
