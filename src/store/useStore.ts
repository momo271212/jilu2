import { create } from 'zustand'

// ---------- Types ----------

export type DecaySpeed = 'slow' | 'medium' | 'fast'

export const DECAY_DURATIONS: Record<DecaySpeed, number> = {
  slow: 2 * 60 * 60 * 1000,    // 2 hours
  medium: 1 * 60 * 60 * 1000,  // 1 hour
  fast: 30 * 60 * 1000,         // 30 min
}

export const DECAY_LABELS: Record<DecaySpeed, string> = {
  slow: '慢慢来',
  medium: '适中',
  fast: '冲刺',
}

export const DECAY_DESCS: Record<DecaySpeed, string> = {
  slow: '绿叶2小时后变黄',
  medium: '绿叶1小时后变黄',
  fast: '绿叶30分钟后变黄',
}

export const DECAY_TIMES: Record<DecaySpeed, string> = {
  slow: '2小时',
  medium: '1小时',
  fast: '30分钟',
}

export interface Leaf {
  id: string
  reciteItemId: string
  x: number
  y: number
  size: number
  rotation: number
  color: 'green' | 'yellow'
  knowledgePoint: string
  hint: string
}

export interface ReciteItem {
  id: string
  leafId: string
  name: string
  lastMemorizedAt: number | null
  createdAt: number
}

export interface FocusRecord {
  id: string
  taskDescription: string
  clarity: number
  durationMinutes: number
  hour: number
  minute: number
}

export interface ReciteRecord {
  id: string
  reciteItemId: string
  itemName: string
  date: string  // YYYY-MM-DD format
  timestamp: number
}

export interface DailyReciteStat {
  date: string
  count: number
  items: string[]
}

export interface MonthlySummary {
  month: string  // YYYY-MM format
  totalRecites: number
  totalFocusMinutes: number
  totalFocusRecords: number
  dailyStats: DailyReciteStat[]
  reciteItemsCount: number
}

export type PanelType = 'recite' | 'pace' | 'focus' | 'summary' | null

export interface Distraction {
  id: string
  content: string
  time: string
}

// ---------- Leaf Slots (25 positions on the canopy) ----------

export const LEAF_SLOTS = [
  // Top center
  { x: 200, y: 168, size: 14, rotation: -3 },
  { x: 183, y: 176, size: 11, rotation: 10 },
  { x: 217, y: 176, size: 11, rotation: -8 },
  // Upper sides
  { x: 158, y: 188, size: 12, rotation: -18 },
  { x: 242, y: 188, size: 12, rotation: 18 },
  { x: 140, y: 200, size: 11, rotation: -22 },
  { x: 260, y: 200, size: 11, rotation: 22 },
  // Middle band
  { x: 180, y: 198, size: 10, rotation: -5 },
  { x: 220, y: 198, size: 10, rotation: 5 },
  { x: 200, y: 208, size: 12, rotation: 0 },
  { x: 165, y: 210, size: 10, rotation: -12 },
  { x: 235, y: 210, size: 10, rotation: 12 },
  { x: 190, y: 190, size: 10, rotation: 3 },
  // Lower middle
  { x: 150, y: 226, size: 11, rotation: -15 },
  { x: 250, y: 226, size: 11, rotation: 15 },
  { x: 183, y: 226, size: 10, rotation: -8 },
  { x: 217, y: 226, size: 10, rotation: 8 },
  // Lower sides
  { x: 125, y: 236, size: 10, rotation: -25 },
  { x: 275, y: 236, size: 10, rotation: 25 },
  { x: 108, y: 246, size: 9, rotation: -20 },
  { x: 292, y: 246, size: 9, rotation: 20 },
  // Bottom
  { x: 168, y: 240, size: 9, rotation: -10 },
  { x: 232, y: 240, size: 9, rotation: 10 },
  { x: 200, y: 246, size: 10, rotation: 0 },
  { x: 145, y: 248, size: 8, rotation: -18 },
  { x: 255, y: 248, size: 8, rotation: 18 },
]

// ---------- Helpers ----------

let slotIndex = 0
function nextSlot() {
  const slot = LEAF_SLOTS[slotIndex % LEAF_SLOTS.length]
  slotIndex++
  return slot
}

// ---------- Store ----------

interface AppState {
  // Leaves
  leaves: Leaf[]
  newLeafIds: Set<string>
  bounceLeafIds: Set<string>

  // Recite
  reciteItems: ReciteItem[]
  reciteRecords: ReciteRecord[]
  decaySpeed: DecaySpeed
  addReciteItem: (name: string) => void
  deleteReciteItem: (id: string) => void
  completeRecite: (id: string) => void
  setDecaySpeed: (speed: DecaySpeed) => void

  // Focus (independent)
  focusRecords: FocusRecord[]
  addFocusRecord: (taskDescription: string, clarity: number, durationMinutes: number) => void

  // Distractions
  distractions: Distraction[]
  addDistraction: (content: string) => void

  // UI
  activePanel: PanelType
  setActivePanel: (panel: PanelType) => void
  selectedLeafId: string | null
  setSelectedLeafId: (id: string | null) => void

  // Decay timer
  refreshLeafColors: () => void
  removeBounceLeaf: (id: string) => void

  // Monthly summary
  getMonthlySummary: (year: number, month: number) => MonthlySummary
}

let idCounter = 0
let focusCounter = 0
let distractionCounter = 0
let reciteRecordCounter = 0

export const useStore = create<AppState>((set, get) => ({
  // --- Leaves ---
  leaves: [],
  newLeafIds: new Set(),
  bounceLeafIds: new Set(),

  // --- Recite ---
  reciteItems: [],
  reciteRecords: [],
  decaySpeed: 'medium',

  addReciteItem: (name) => {
    const state = get()
    if (state.reciteItems.length >= 25) return

    idCounter++
    const itemId = `r_${Date.now()}_${idCounter}`
    const slot = nextSlot()
    const leafId = `l_${itemId}`

    const newLeaf: Leaf = {
      id: leafId,
      reciteItemId: itemId,
      x: slot.x,
      y: slot.y,
      size: slot.size,
      rotation: slot.rotation,
      color: 'yellow',
      knowledgePoint: name,
      hint: `背诵"${name}"后叶子会变绿`,
    }

    const newItem: ReciteItem = {
      id: itemId,
      leafId,
      name,
      lastMemorizedAt: null,
      createdAt: Date.now(),
    }

    set((s) => ({
      reciteItems: [...s.reciteItems, newItem],
      leaves: [...s.leaves, newLeaf],
      newLeafIds: new Set([...s.newLeafIds, leafId]),
    }))

    setTimeout(() => {
      set((s) => {
        const next = new Set(s.newLeafIds)
        next.delete(leafId)
        return { newLeafIds: next }
      })
    }, 1200)
  },

  deleteReciteItem: (id) => {
    const state = get()
    const item = state.reciteItems.find((r) => r.id === id)
    if (!item) return

    set((s) => ({
      reciteItems: s.reciteItems.filter((r) => r.id !== id),
      leaves: s.leaves.filter((l) => l.reciteItemId !== id),
      selectedLeafId: s.selectedLeafId === item.leafId ? null : s.selectedLeafId,
    }))
  },

  completeRecite: (id) => {
    const state = get()
    const item = state.reciteItems.find((r) => r.id === id)
    if (!item) return
    const now = Date.now()
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

    reciteRecordCounter++

    set((s) => ({
      reciteItems: s.reciteItems.map((r) =>
        r.id === id ? { ...r, lastMemorizedAt: now } : r
      ),
      leaves: s.leaves.map((l) =>
        l.id === item.leafId ? { ...l, color: 'green' as const } : l
      ),
      bounceLeafIds: new Set([...s.bounceLeafIds, item.leafId]),
      selectedLeafId: s.selectedLeafId === item.leafId ? null : s.selectedLeafId,
      reciteRecords: [
        ...s.reciteRecords,
        {
          id: `rr_${Date.now()}_${reciteRecordCounter}`,
          reciteItemId: item.id,
          itemName: item.name,
          date: today,
          timestamp: now,
        },
      ],
    }))
  },

  setDecaySpeed: (speed) => {
    const state = get()
    const decayDuration = DECAY_DURATIONS[speed]
    const now = Date.now()

    // Recalculate all leaf colors with new speed
    const updatedLeaves = state.leaves.map((leaf) => {
      const item = state.reciteItems.find((r) => r.id === leaf.reciteItemId)
      if (!item || item.lastMemorizedAt === null) {
        return leaf.color === 'yellow' ? leaf : { ...leaf, color: 'yellow' as const }
      }
      const elapsed = now - item.lastMemorizedAt
      const duration = item.customDecayDuration ?? decayDuration
      const newColor = elapsed >= duration ? 'yellow' as const : 'green' as const
      return newColor === leaf.color ? leaf : { ...leaf, color: newColor }
    })

    set({ decaySpeed: speed, leaves: updatedLeaves })
  },

  updateReciteCustomDuration: (id, customDecayDuration) => {
    set((s) => ({
      reciteItems: s.reciteItems.map((r) =>
        r.id === id ? { ...r, customDecayDuration } : r
      ),
    }))
  },

  // --- Focus ---
  focusRecords: [],
  addFocusRecord: (taskDescription, clarity, durationMinutes) => {
    focusCounter++
    const now = new Date()
    set((s) => ({
      focusRecords: [
        {
          id: `f_${Date.now()}_${focusCounter}`,
          taskDescription,
          clarity,
          durationMinutes,
          hour: now.getHours(),
          minute: now.getMinutes(),
        },
        ...s.focusRecords,
      ],
    }))
  },

  // --- Distractions ---
  distractions: [] as Distraction[],
  addDistraction: (content) => {
    distractionCounter++
    const now = new Date()
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    set((s) => ({
      distractions: [
        { id: `d_${Date.now()}_${distractionCounter}`, content, time },
        ...s.distractions,
      ],
    }))
  },

  // --- UI ---
  activePanel: null,
  setActivePanel: (panel) => set({ activePanel: panel }),
  selectedLeafId: null,
  setSelectedLeafId: (id) => set({ selectedLeafId: id }),

  // --- Decay timer (called every second from page) ---
  refreshLeafColors: () => {
    const state = get()
    const now = Date.now()

    let changed = false
    const updatedLeaves = state.leaves.map((leaf) => {
      const item = state.reciteItems.find((r) => r.id === leaf.reciteItemId)
      if (!item || item.lastMemorizedAt === null) {
        if (leaf.color !== 'yellow') { changed = true; return { ...leaf, color: 'yellow' as const } }
        return leaf
      }
      const elapsed = now - item.lastMemorizedAt
      const duration = DECAY_DURATIONS[state.decaySpeed]
      const newColor = elapsed >= duration ? 'yellow' as const : 'green' as const
      if (newColor !== leaf.color) { changed = true; return { ...leaf, color: newColor } }
      return leaf
    })

    if (changed) set({ leaves: updatedLeaves })
  },

  removeBounceLeaf: (id) => {
    set((s) => {
      const next = new Set(s.bounceLeafIds)
      next.delete(id)
      return { bounceLeafIds: next }
    })
  },

  // --- Monthly summary ---
  getMonthlySummary: (year, month) => {
    const state = get()
    const monthStr = `${year}-${month.toString().padStart(2, '0')}`

    // Filter recite records for the month
    const monthReciteRecords = state.reciteRecords.filter((r) => {
      return r.date.startsWith(monthStr)
    })

    // Filter focus records for the month
    const monthFocusRecords = state.focusRecords.filter((r) => {
      const recordDate = new Date(r.hour, r.minute)
      return recordDate.getFullYear() === year && recordDate.getMonth() === month - 1
    })

    // Group recite records by date
    const dailyStatsMap = new Map<string, { count: number; items: Set<string> }>()
    monthReciteRecords.forEach((record) => {
      if (!dailyStatsMap.has(record.date)) {
        dailyStatsMap.set(record.date, { count: 0, items: new Set() })
      }
      const stat = dailyStatsMap.get(record.date)!
      stat.count++
      stat.items.add(record.itemName)
    })

    const dailyStats: DailyReciteStat[] = Array.from(dailyStatsMap.entries())
      .map(([date, stat]) => ({
        date,
        count: stat.count,
        items: Array.from(stat.items),
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const totalRecites = monthReciteRecords.length
    const totalFocusMinutes = monthFocusRecords.reduce((sum, r) => sum + r.durationMinutes, 0)
    const totalFocusRecords = monthFocusRecords.length
    const reciteItemsCount = new Set(monthReciteRecords.map((r) => r.reciteItemId)).size

    return {
      month: monthStr,
      totalRecites,
      totalFocusMinutes,
      totalFocusRecords,
      dailyStats,
      reciteItemsCount,
    }
  },
}))
