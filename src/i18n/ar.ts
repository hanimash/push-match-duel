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

  aiUsed:  'الكمبيوتر استخدم',
  gotIt:   'فهمت! ✓',
  abilities: {
    freeze_column: { name: 'تجميد عامود', desc: 'اختر عموداً عند الخصم — يُجمَّد لدور كامل' },
    swap_tiles:    { name: 'تبديل حجرين', desc: 'اختر حجرين في لوحة خصمك يتبادلان الموضع' },
    rotate_row:    { name: 'تدوير صف',    desc: 'اختر صفاً عند الخصم يتحرك بخطوة واحدة' },
  },

  howToPlay: {
    title:    'كيف تلعب؟',
    closeBtn: 'فهمت! ▶',
    steps: [
      {
        icon:  '🎯',
        title: 'الهدف',
        desc:  'أكمل أعمدتك الستة — كل عمود يجب أن يحتوي أربعة حجارة بنفس الرمز.',
      },
      {
        icon:  '💠',
        title: 'البداية',
        desc:  'يُجرى قرعة لتحديد من يبدأ، ويحصل الفائز على الحجرة الافتتاحية الخاصة.',
      },
      {
        icon:  '↓',
        title: 'الدفع',
        desc:  'في دورك ادفع حجرتك الحالية في أي عمود من لوحتك — تدخل من الأعلى وتخرج حجرة من الأسفل.',
      },
      {
        icon:  '🔄',
        title: 'انتقال الدور',
        desc:  'الحجرة الخارجة تُكشف فوراً. إن كانت تخص خصمك انتقلت إليه وتحوّل الدور له، وإن كانت لك تبقى معك وتستمر.',
      },
      {
        icon:  '🏆',
        title: 'بطاقات القدرات',
        desc:  'عند إكمال عمودين لأول مرة تحصل على بطاقة قدرة خاصة: تجميد عامود خصمك، تبديل حجرين، أو تدوير صف كامل.',
      },
      {
        icon:  '🥇',
        title: 'الفوز',
        desc:  'أول من يكمل أعمدته الستة يفوز! أو إذا جُمِّدت جميع أعمدة الخصم ولم يستطع اللعب.',
      },
    ],
  },
}
