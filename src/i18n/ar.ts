import type { Translations } from './types'

export const ar: Translations = {
  turnOf:        (name) => `دور ${name}`,
  layoutTablet:  'تابلت',
  layoutDesktop: 'جانبي',
  muteLabel:     'كتم الصوت',
  unmuteLabel:   'تفعيل الصوت',
  ejectedLabel:  'خرجت',
  aiBot:         'كمبيوتر',
  aiHuman:       'بشري',
  turnBadge:     'دوره',
  cancelAbility: 'إلغاء',

  gameMode:        'طريقة اللعب',
  modeVsComputer:  '🤖 لاعب ضد كمبيوتر',
  modeTwoPlayers:  '👥 لاعبان',
  player1Default:  'اللاعب الأول',
  player2Default:  'اللاعب الثاني',
  aiName:          'الكمبيوتر',
  aiLevel:         'مستوى الكمبيوتر',
  aiEasy:          '😊 سهل',
  aiHard:          '🤖 صعب',
  categoryLabel:   (n) => `فئة ${n}`,
  categoryNames: {
    animals:   'حيوانات',
    plants:    'نباتات',
    fruits:    'فواكه',
    sports:    'رياضة',
    space:     'فضاء',
    transport: 'مواصلات',
    music:     'موسيقى',
  },
  aiCategoryAuto: '🎲 عشوائي',
  rollBtn:         '🎲 قرعة!',
  drawing:         'القرعة...',
  startsFirst:     (name) => `يبدأ ${name}!`,
  backBtn:         '↩ رجوع',
  playBtn:         '▶ العب!',

  rewardTitle:    'مكافأة!',
  rewardSubtitle: (name) => `${name} أكمل عمودين — اختر بطاقة`,
  skipBtn:        'تجاهل ✕',

  wonGame:       'فاز باللعبة!',
  completedCols: (n) => `${n} / 6 أعمدة مكتملة`,
  homeBtn:       '↩ الرئيسية',

  abilities: {
    freeze_column: { name: 'تجميد عامود', desc: 'اختر عموداً عند الخصم — يُجمَّد لدور كامل' },
    swap_tiles:    { name: 'تبديل حجرين', desc: 'اختر حجرين في لوحة خصمك يتبادلان الموضع' },
    rotate_row:    { name: 'تدوير صف',    desc: 'اختر صفاً عند الخصم يتحرك بخطوة واحدة' },
  },
}
