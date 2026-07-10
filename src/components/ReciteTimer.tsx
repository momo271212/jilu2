'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Square, Check, Clock } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'

type Phase = 'setup' | 'running' | 'paused' | 'done'

const DURATION_OPTIONS = [
  { label: '15分钟', value: 15 },
  { label: '25分钟', value: 25 },
  { label: '45分钟', value: 45 },
]

function formatCountdown(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}分钟`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h${m}m` : `${h}h`
}

interface ReciteTimerProps {
  itemName: string
  onClose: () => void
  onComplete: (durationMinutes: number) => void
}

export default function ReciteTimer({ itemName, onClose, onComplete }: ReciteTimerProps) {
  const [phase, setPhase] = useState<Phase>('setup')
  const [duration, setDuration] = useState(25)
  const [remaining, setRemaining] = useState(0)
  const [totalDurationSeconds, setTotalDurationSeconds] = useState(0)
  const [showCustom, setShowCustom] = useState(false)
  const [customMinutes, setCustomMinutes] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const customTotalSeconds = (parseInt(customMinutes) || 0) * 60
  const isValidCustom = customTotalSeconds >= 1 && customTotalSeconds <= 5999

  const handleSelectPreset = useCallback((val: number) => {
    setDuration(val)
    setShowCustom(false)
    setCustomMinutes('')
  }, [])

  const handleOpenCustom = useCallback(() => {
    setShowCustom(true)
  }, [])

  const handleStart = useCallback(() => {
    const secs = showCustom ? customTotalSeconds : duration * 60
    if (secs <= 0) return
    setRemaining(secs)
    setTotalDurationSeconds(secs)
    setPhase('running')
  }, [showCustom, customTotalSeconds, duration])

  const handlePause = useCallback(() => setPhase('paused'), [])
  const handleResume = useCallback(() => setPhase('running'), [])

  const handleStop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setPhase('setup')
    setRemaining(0)
    setTotalDurationSeconds(0)
    setShowCustom(false)
    setCustomMinutes('')
  }, [])

  const handleComplete = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    const recordMinutes = Math.ceil(totalDurationSeconds / 60)
    onComplete(recordMinutes)
    setPhase('done')
    setTimeout(() => {
      onClose()
    }, 1500)
  }, [totalDurationSeconds, onComplete, onClose])

  // Timer countdown
  useEffect(() => {
    if (phase === 'running') {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            // 倒计时结束，自动暂停但不强制完成
            if (intervalRef.current) clearInterval(intervalRef.current)
            setPhase('paused')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [phase])

  // Progress ring
  const totalSeconds = totalDurationSeconds || duration * 60
  const progress = totalSeconds > 0 ? (totalSeconds - remaining) / totalSeconds : 0
  const circumference = 2 * Math.PI * 52

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-20 flex items-center justify-center px-6"
      onClick={(e) => phase === 'setup' && e.stopPropagation()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        className="soft-card p-6 w-full max-w-sm"
      >
        <AnimatePresence mode="wait">
          {/* ===== SETUP ===== */}
          {phase === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-5">
                <Clock className="w-10 h-10 text-sea-blue mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground mb-1">{itemName}</p>
                <p className="text-[10px] text-soft-text">设置背诵时长</p>
              </div>

              {/* Duration selection */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {DURATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSelectPreset(opt.value)}
                    className={`py-3 rounded-xl text-sm font-medium transition-all duration-300 active:scale-95 ${
                      !showCustom && duration === opt.value
                        ? 'bg-sea-blue/20 text-sea-blue-deep ring-1 ring-sea-blue/30 shadow-sm'
                        : 'bg-muted/40 text-soft-text hover:text-foreground'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Custom time */}
              <AnimatePresence mode="wait">
                {!showCustom ? (
                  <motion.button
                    key="custom-btn"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleOpenCustom}
                    className="w-full mb-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 active:scale-95 flex items-center justify-center gap-1.5 bg-muted/30 text-soft-text hover:text-foreground"
                  >
                    <Clock className="w-3 h-3" />
                    自定义时间
                  </motion.button>
                ) : (
                  <motion.div
                    key="custom-form"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 overflow-hidden"
                  >
                    <div className="soft-card p-3">
                      <div className="flex items-center gap-1.5 mb-2.5">
                        <Clock className="w-3 h-3 text-cream-deep" />
                        <p className="text-xs text-cream-deep font-medium">自定义时长</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 relative">
                          <input
                            type="number"
                            min="1"
                            max="999"
                            value={customMinutes}
                            onChange={(e) => setCustomMinutes(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
                            placeholder="00"
                            className="w-full text-center text-lg font-light tabular-nums bg-white/70 rounded-xl border border-border/50 focus:border-cream focus:ring-1 focus:ring-cream/30 outline-none placeholder:text-soft-text/40 py-2 transition-all duration-300"
                            autoFocus
                          />
                          <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-soft-text/60">分钟</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-soft-text/50 mt-5 text-center">
                        {isValidCustom
                          ? `共 ${formatDuration(parseInt(customMinutes))}`
                          : '至少 1 分钟'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Start button */}
              <button
                onClick={handleStart}
                disabled={showCustom ? !isValidCustom : false}
                className="w-full py-3 rounded-2xl text-sm font-medium bg-moss/15 text-moss hover:bg-moss/25 transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4" />
                开始背诵
              </button>

              {/* Cancel button */}
              <button
                onClick={onClose}
                className="w-full mt-2 py-2.5 rounded-2xl text-xs text-soft-text hover:text-foreground transition-colors flex items-center justify-center gap-1.5"
              >
                取消
              </button>
            </motion.div>
          )}

          {/* ===== RUNNING / PAUSED ===== */}
          {(phase === 'running' || phase === 'paused') && (
            <motion.div
              key="timer"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center py-4"
            >
              <p className="text-sm text-foreground font-medium mb-0.5 text-center">{itemName}</p>
              <p className="text-[10px] text-soft-text mb-6">
                {phase === 'running' ? '正在背诵中...' : '已暂停'}
              </p>

              <div className="relative w-36 h-36 mb-6">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="4" />
                  <motion.circle
                    cx="60" cy="60" r="52"
                    fill="none"
                    stroke="currentColor"
                    className="text-sea-blue"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset: circumference * (1 - progress) }}
                    transition={{ duration: 0.5, ease: 'linear' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-light tabular-nums tracking-wider text-foreground">
                    {formatCountdown(remaining)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {phase === 'running' ? (
                  <button
                    onClick={handlePause}
                    className="w-12 h-12 rounded-full bg-cream/40 text-cream-deep flex items-center justify-center hover:bg-cream/60 transition-colors active:scale-95"
                  >
                    <Pause className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={handleResume}
                    className="w-12 h-12 rounded-full bg-sea-blue/30 text-sea-blue-deep flex items-center justify-center hover:bg-sea-blue/50 transition-colors active:scale-95"
                  >
                    <Play className="w-5 h-5 ml-0.5" />
                  </button>
                )}
                <button
                  onClick={handleStop}
                  className="w-10 h-10 rounded-full bg-muted/40 text-soft-text flex items-center justify-center hover:bg-muted/60 transition-colors active:scale-95"
                >
                  <Square className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Complete button */}
              {phase === 'paused' && (
                <button
                  onClick={handleComplete}
                  className="mt-4 w-full py-2.5 rounded-xl text-xs font-medium bg-moss/15 text-moss hover:bg-moss/25 transition-all duration-300 flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  <Check className="w-3.5 h-3.5" />
                  完成背诵
                </button>
              )}
            </motion.div>
          )}

          {/* ===== DONE ===== */}
          {phase === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12 }}
              className="py-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
                className="w-14 h-14 rounded-full bg-moss/15 flex items-center justify-center mx-auto mb-3"
              >
                <Check className="w-6 h-6 text-moss" />
              </motion.div>
              <p className="text-base font-medium text-foreground">背诵完成</p>
              <p className="text-xs text-soft-text mt-1">
                {itemName} · {formatDuration(Math.ceil(totalDurationSeconds / 60))}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
