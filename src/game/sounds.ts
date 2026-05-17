import { ref } from 'vue'

export const muted = ref(false)

let ctx: AudioContext | null = null

if (typeof document !== 'undefined') {
  const unlock = () => {
    if (!ctx) { try { ctx = new AudioContext() } catch { return } }
    if (ctx.state === 'suspended') void ctx.resume()
  }
  document.addEventListener('click',   unlock, { passive: true })
  document.addEventListener('keydown', unlock, { passive: true })
}

function getCtx(): AudioContext | null {
  try {
    if (!ctx) ctx = new AudioContext()
    return ctx
  } catch {
    return null
  }
}

function beep(freq: number, dur: number, delay = 0, type: OscillatorType = 'sine', vol = 0.4) {
  if (muted.value) return
  const a = getCtx()
  if (!a) return

  const doPlay = () => {
    try {
      const osc = a.createOscillator()
      const gain = a.createGain()
      osc.connect(gain)
      gain.connect(a.destination)
      osc.type = type
      osc.frequency.value = freq
      // Minimum 10 ms offset so the context is always past time 0
      const t0 = a.currentTime + Math.max(delay, 0.01)
      gain.gain.setValueAtTime(vol, t0)
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur)
      osc.start(t0)
      osc.stop(t0 + dur + 0.05)
    } catch { /* ignore */ }
  }

  if (a.state !== 'running') {
    a.resume().then(doPlay).catch(() => { /* ignore */ })
  } else {
    doPlay()
  }
}

// ── Push: short mechanical thud ──
export function playPush() {
  beep(260, 0.07, 0,    'square', 0.20)
  beep(130, 0.05, 0.05, 'square', 0.12)
}

// ── Eject: tile pops out ──
export function playEject() {
  beep(620, 0.04, 0,    'sine', 0.28)
  beep(440, 0.18, 0.05, 'sine', 0.35)
}

// ── Column complete: rising three-note chime ──
export function playColumnDone() {
  beep(523, 0.25, 0,    'sine', 0.38)   // C5
  beep(659, 0.25, 0.12, 'sine', 0.35)   // E5
  beep(784, 0.35, 0.24, 'sine', 0.40)   // G5
}

// ── Dice roll: rapid random clicks ──
export function playRoll() {
  for (let i = 0; i < 10; i++) {
    beep(120 + Math.random() * 180, 0.05, i * 0.14, 'square', 0.10)
  }
}

// ── Draw result: short fanfare ──
export function playDraw() {
  beep(440, 0.14, 0,    'sine', 0.30)
  beep(554, 0.14, 0.13, 'sine', 0.30)
  beep(659, 0.30, 0.26, 'sine', 0.35)
}

// ── Win: ascending fanfare with chord ──
export function playWin() {
  beep(523,  0.18, 0,    'sine', 0.38)  // C5
  beep(659,  0.18, 0.14, 'sine', 0.38)  // E5
  beep(784,  0.18, 0.28, 'sine', 0.38)  // G5
  beep(1047, 0.55, 0.42, 'sine', 0.42)  // C6
  beep(784,  0.50, 0.42, 'sine', 0.22)  // G5 harmony
  beep(659,  0.50, 0.42, 'sine', 0.18)  // E5 harmony
}
