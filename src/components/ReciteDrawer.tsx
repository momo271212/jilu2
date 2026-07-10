'use client'

import { useStore, DECAY_DURATIONS, DECAY_LABELS, DECAY_TIMES, type ReciteItem } from '@/store/useStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, BookOpen, Check, X } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import ReciteTimer from './ReciteTimer'

function formatRemaining(ms: number): string {
  if (ms <= 0) return '即将变黄'
  const totalSec = Math.floor(ms / 1000)
  if (totalSec >= 3600) {
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    return m > 0 ? `${h}h${m}m` : `${h}h`
  }
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}m${s.toString().padStart(2, '0')}s`
}

function DecayBar({ item, decaySpeed }: { item: ReciteItem; decaySpeed: string }) {
  const [, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  if (item.lastMemorizedAt === null) return null

  const duration = DECAY_DURATIONS[decaySpeed as keyof typeof DECAY_DURATIONS]
  const elapsed = Date.now() - item.lastMemorizedAt
  const remaining = Math.max(0, duration - elapsed)
  const progress = Math.min(1, elapsed / duration)

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <div className="flex-1 h-1.5 rounded-full bg-muted/60 overflow-hidden mr-3">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-moss/60 to-cream-deep/80"
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <span className="text-[10px] text-soft-text whitespace-nowrap w-16 text-right">
          {formatRemaining(remaining)}
        </span>
      </div>
    </div>
  )
}

function MiniLeaf({ color, size = 16 }: { color: 'green' | 'yellow'; size?: number }) {
  return (
    <svg viewBox="0 0 20 26" width={size} height={size * 1.3} className="flex-shrink-0">
      <ellipse
        cx="10" cy="13" rx="8" ry="11"
        fill={color === 'green' ? '#7CB968' : '#F7E8A0'}
        stroke={color === 'green' ? '#5E9448' : '#E0C868'}
        strokeWidth="1"
        opacity="0.9"
      />
      <line x1="10" y1="4" x2="10" y2="22" stroke={color === 'green' ? '#4E8040' : '#DCC050'} strokeWidth="0.8" opacity="0.4" />
    </svg>
  )
}

export default function ReciteDrawer() {
  const {
    reciteItems, leaves, decaySpeed,
    addReciteItem, deleteReciteItem, completeRecite,
    activePanel, setActivePanel,
  } = useStore()

  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [recitingId, setRecitingId] = useState<string | null>(null)

  // All hooks MUST be before any early return (React rules of hooks)
  const itemCount = reciteItems.length
  const getLeafColor = useCallback((itemId: string): 'green' | 'yellow' => {
    const leaf = leaves.find((l) => l.reciteItemId === itemId)
    return leaf?.color ?? 'yellow'
  }, [leaves])

  const handleAdd = useCallback(() => {
    if (!newName.trim() || itemCount >= 25) return
    addReciteItem(newName.trim())
    setNewName('')
    setShowAddForm(false)
  }, [newName, itemCount, addReciteItem])

  const handleConfirmRecite = useCallback(() => {
    if (confirmId) {
      completeRecite(confirmId)
      setConfirmId(null)
    }
  }, [confirmId, completeRecite])

  const handleConfirmDelete = useCallback(() => {
    if (deleteId) {
      deleteReciteItem(deleteId)
      setDeleteId(null)
    }
  }, [deleteId, deleteReciteItem])

  const handleStartRecite = useCallback((itemId: string) => {
    setRecitingId(itemId)
  }, [])

  const handleReciteComplete = useCallback((durationMinutes: number) => {
    // 先完成背诵（更新叶子状态）
    if (recitingId) {
      completeRecite(recitingId)
    }
    setRecitingId(null)
  }, [recitingId, completeRecite])

  const handleCloseTimer = useCallback(() => {
    setRecitingId(null)
  }, [])

  if (activePanel !== 'recite') return null

  const greenCount = leaves.filter((l) => l.color === 'green').length
  const yellowCount = leaves.filter((l) => l.color === 'yellow').length

  const confirmItem = confirmId ? reciteItems.find((r) => r.id === confirmId) : null
  const deleteItem = deleteId ? reciteItems.find((r) => r.id === deleteId) : null
  const recitingItem = recitingId ? reciteItems.find((r) => r.id === recitingId) : null

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed inset-0 z-50 flex flex-col justify-end"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"
        onClick={() => {
          setActivePanel(null)
          setRecitingId(null)
        }}
      />

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative bg-warm-white/95 backdrop-blur-xl rounded-t-3xl shadow-[0_-8px_40px_rgba(0,0,0,0.08)] flex flex-col max-h-[85vh]"
      >
        {/* Handle + close */}
        <div className="flex items-center justify-between px-5 pt-3 pb-2">
          <button
            onClick={() => {
              setActivePanel(null)
              setRecitingId(null)
            }}
            className="w-7 h-7 rounded-full bg-muted/50 flex items-center justify-center text-soft-text hover:text-foreground transition-colors text-sm"
            aria-label="关闭"
          >
            &times;
          </button>
          <div className="w-10 h-1 rounded-full bg-earth/25" />
          <div className="w-7" />
        </div>

        {/* Header */}
        <div className="px-6 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground tracking-tight">背诵</h2>
              <p className="text-xs text-soft-text mt-0.5">
                {greenCount}绿 {yellowCount}黄 · 最多25条
              </p>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-soft-text bg-muted/40 px-2.5 py-1 rounded-full">
              <span>节奏: {DECAY_LABELS[decaySpeed]}</span>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2.5 relative">
          {reciteItems.map((item) => {
            const color = getLeafColor(item.id)
            const isYellow = color === 'yellow'

            return (
              <motion.div
                key={item.id}
                layout
                className="soft-card p-3.5"
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5">
                    <MiniLeaf color={color} size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-foreground truncate">{item.name}</h3>
                      <button
                        onClick={() => setDeleteId(item.id)}
                        className="ml-2 w-6 h-6 rounded-full flex items-center justify-center text-soft-text/40 hover:text-cream-deep hover:bg-cream/30 transition-colors flex-shrink-0"
                        aria-label="删除"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    {/* Decay bar for green items */}
                    {!isYellow && <DecayBar item={item} decaySpeed={decaySpeed} />}
                  </div>
                </div>
                {/* Recite button for yellow items */}
                {isYellow && (
                  <div className="mt-2.5 flex justify-end">
                    <button
                      onClick={() => handleStartRecite(item.id)}
                      className="flex items-center gap-1.5 text-xs font-medium text-moss bg-moss/10 px-4 py-2 rounded-full hover:bg-moss/20 transition-all duration-300 active:scale-95"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      开始背诵
                    </button>
                  </div>
                )}
              </motion.div>
            )
          })}

          {/* Add button / form */}
          <AnimatePresence mode="wait">
            {!showAddForm ? (
              <motion.button
                key="add-btn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAddForm(true)}
                disabled={itemCount >= 25}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-border/50 text-soft-text hover:text-foreground hover:border-cream/60 transition-all duration-300 flex items-center justify-center gap-2 text-xs disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                {itemCount >= 25 ? '已达上限（25条）' : '添加背诵内容'}
              </motion.button>
            ) : (
              <motion.div
                key="add-form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="soft-card p-4 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-foreground">添加背诵内容</p>
                  <button onClick={() => { setShowAddForm(false); setNewName(''); }} className="text-soft-text hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  placeholder="如：英语Unit5单词、古诗三首..."
                  className="w-full px-3 py-2 text-sm bg-white/70 rounded-xl border border-border/50 focus:border-sea-blue focus:ring-1 focus:ring-sea-blue/30 outline-none placeholder:text-soft-text/50 transition-all duration-300 mb-3"
                  autoFocus
                />
                <button
                  onClick={handleAdd}
                  disabled={!newName.trim() || itemCount >= 25}
                  className="w-full py-2 rounded-xl text-xs font-medium bg-moss/15 text-moss hover:bg-moss/25 transition-all disabled:opacity-40 flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  添加到树上
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {reciteItems.length === 0 && !showAddForm && (
            <div className="text-center py-8">
              <MiniLeaf color="yellow" size={32} />
              <p className="text-sm text-soft-text mt-3">还没有背诵内容</p>
              <p className="text-xs text-soft-text/60 mt-1">添加要背诵的知识点吧</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Recite Timer overlay */}
      <AnimatePresence>
        {recitingItem && (
          <ReciteTimer
            key={recitingItem.id}
            itemName={recitingItem.name}
            onClose={handleCloseTimer}
            onComplete={handleReciteComplete}
          />
        )}
      </AnimatePresence>

      {/* Confirm recite dialog (legacy - kept for compatibility) */}
      <AnimatePresence>
        {confirmItem && !recitingId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-end justify-center px-8 pb-24"
            onClick={() => setConfirmId(null)}
          >
            <motion.div
              initial={{ y: 20, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="soft-card p-5 w-full max-w-sm shadow-lg"
            >
              <div className="text-center mb-4">
                <MiniLeaf color="yellow" size={28} />
                <p className="text-sm font-medium text-foreground mt-2">{confirmItem.name}</p>
              </div>
              <p className="text-xs text-soft-text text-center leading-relaxed mb-4">
                回忆一下这个知识点的要点<br />确认自己复习过了再点击按钮
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmId(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs text-soft-text bg-muted/40 hover:bg-muted/60 transition-colors"
                >
                  再想想
                </button>
                <button
                  onClick={handleConfirmRecite}
                  className="flex-1 py-2.5 rounded-xl text-xs font-medium text-white bg-moss hover:bg-moss/80 transition-colors flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  <Check className="w-3.5 h-3.5" />
                  我背诵完了
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm delete dialog */}
      <AnimatePresence>
        {deleteItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-end justify-center px-8 pb-24"
            onClick={() => setDeleteId(null)}
          >
            <motion.div
              initial={{ y: 20, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="soft-card p-5 w-full max-w-sm shadow-lg"
            >
              <p className="text-sm font-medium text-foreground text-center mb-1">
                确定删除「{deleteItem.name}」？
              </p>
              <p className="text-xs text-soft-text text-center mb-4">树上对应的叶子也会消失</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs text-soft-text bg-muted/40 hover:bg-muted/60 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 rounded-xl text-xs font-medium text-cream-deep bg-cream/50 hover:bg-cream/70 transition-colors flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  删除
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
