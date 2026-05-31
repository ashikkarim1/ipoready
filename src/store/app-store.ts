'use client'
import { create } from 'zustand'
import { Company, Task, Document, TeamMember, Notification, Currency, Language, TaskStatus } from '@/types'

export type UserPlan = 'free' | 'starter' | 'growth' | 'enterprise' | 'trial'

// ── Badge Count Types ──────────────────────────────────────────────────────
interface BadgeCounts {
  unreadNotificationCount: number
  overdueTaskCount: number
  dueSoonTaskCount: number
  unlockedAchievementCount: number
  newDocumentCount: number
  pendingInviteCount: number
}

interface AppState {
  company: Company | null
  tasks: Task[]
  documents: Document[]
  teamMembers: TeamMember[]
  notifications: Notification[]
  currency: Currency
  language: Language
  sidebarOpen: boolean
  userPlan: UserPlan

  // ── Badge counts ────────────────────────────────────────────────────
  unreadNotificationCount: number
  overdueTaskCount: number
  dueSoonTaskCount: number
  unlockedAchievementCount: number
  newDocumentCount: number
  pendingInviteCount: number
  lastBadgeSyncTime: number

  setCompany: (company: Company) => void
  setUserPlan: (plan: UserPlan) => void
  setTasks: (tasks: Task[]) => void
  updateTaskStatus: (taskId: string, status: TaskStatus) => void
  addDocument: (doc: Document) => void
  updateDocument: (docId: string, updates: Partial<Document>) => void
  setCurrency: (currency: Currency) => void
  setLanguage: (language: Language) => void
  toggleSidebar: () => void
  markNotificationRead: (id: string) => void
  addNotification: (n: Notification) => void

  // ── Badge methods ───────────────────────────────────────────────────
  updateBadgeCounts: (counts: Partial<BadgeCounts>) => void
  syncBadgeCounts: () => Promise<void>
  resetBadgeCount: (type: keyof Omit<BadgeCounts, 'lastBadgeSyncTime'>) => void
}

// ── Store initialization ────────────────────────────────────────────────────
// Create a basic Zustand store without persist middleware (will add back safely later).
// This pattern defers store creation until first component use to avoid SSR issues.
let storeInstance: any = null

function getStoreInstance() {
  if (storeInstance === null) {
    storeInstance = create<AppState>((set, get) => ({
          company: {
            id: 'demo-company-1',
            name: 'Your Company',
            listingType: 'ipo',
            targetExchange: 'tsxv',
            currentPhase: 'corporate_restructuring',
            paceScore: 62,
            estimatedDaysToIPO: 187,
            progressPercentage: 23,
            currency: 'CAD',
            language: 'en',
            createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
            ownerId: 'demo-2',
          },
          tasks: [],
          documents: [],
          teamMembers: [],
          notifications: [
            {
              id: 'n1',
              companyId: 'demo-company-1',
              userId: 'demo-2',
              type: 'task_due',
              title: 'PIF Forms Due in 7 Days',
              message: 'Personal Information Forms for 3 directors are due for submission',
              read: false,
              createdAt: new Date().toISOString(),
              link: '/checklist',
            },
            {
              id: 'n2',
              companyId: 'demo-company-1',
              userId: 'demo-2',
              type: 'milestone',
              title: '🚀 Milestone Achieved!',
              message: 'Auditors engaged — you\'ve completed Phase 1 of the Pre-Planning stage',
              read: false,
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              link: '/dashboard',
            },
          ],
          currency: 'CAD',
          language: 'en',
          sidebarOpen: true,
          userPlan: 'growth' as UserPlan,

          // ── Badge counts initialization ────────────────────────────────
          unreadNotificationCount: 2,
          overdueTaskCount: 0,
          dueSoonTaskCount: 3,
          unlockedAchievementCount: 0,
          newDocumentCount: 0,
          pendingInviteCount: 0,
          lastBadgeSyncTime: Date.now(),

          setCompany: (company) => set({ company }),
          setUserPlan: (plan) => set({ userPlan: plan }),
          setTasks: (tasks) => set({ tasks }),
          updateTaskStatus: (taskId, status) =>
            set((state) => ({
              tasks: state.tasks.map((t) =>
                t.id === taskId
                  ? { ...t, status, completedAt: status === 'completed' ? new Date().toISOString() : t.completedAt }
                  : t
              ),
            })),
          addDocument: (doc) => set((state) => ({ documents: [...state.documents, doc] })),
          updateDocument: (docId, updates) =>
            set((state) => ({
              documents: state.documents.map((d) => (d.id === docId ? { ...d, ...updates } : d)),
            })),
          setCurrency: (currency) => set({ currency }),
          setLanguage: (language) => set({ language }),
          toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
          markNotificationRead: (id) =>
            set((state) => ({
              notifications: state.notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n
              ),
              unreadNotificationCount: Math.max(0, state.unreadNotificationCount - 1),
            })),
          addNotification: (n) =>
            set((state) => ({
              notifications: [n, ...state.notifications],
              unreadNotificationCount: state.unreadNotificationCount + 1,
            })),

          // ── Badge methods ──────────────────────────────────────────────
          updateBadgeCounts: (counts) =>
            set((state) => ({
              ...state,
              ...counts,
              lastBadgeSyncTime: Date.now(),
            })),

          syncBadgeCounts: async () => {
            try {
              const response = await fetch('/api/badges/counts', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
              })

              if (!response.ok) {
                console.error('Failed to sync badge counts:', response.statusText)
                return
              }

              const data = await response.json()
              get().updateBadgeCounts({
                unreadNotificationCount: data.unreadNotifications ?? 0,
                overdueTaskCount: data.overdueTasks ?? 0,
                dueSoonTaskCount: data.dueSoonTasks ?? 0,
                newDocumentCount: data.newDocuments ?? 0,
                pendingInviteCount: data.pendingInvites ?? 0,
              })
            } catch (error) {
              console.error('Error syncing badge counts:', error)
            }
          },

          resetBadgeCount: (type) =>
            set((state) => ({
              [type]: 0,
              lastBadgeSyncTime: Date.now(),
            })),
        }))
  }
  return storeInstance!
}

// ── Store hook with selector support ─────────────────────────────────────────
// Supports both `useAppStore()` for full state and `useAppStore(s => s.field)` for selectors
export function useAppStore(): AppState
export function useAppStore<T>(selector: (state: AppState) => T): T
export function useAppStore<T>(selector?: (state: AppState) => T): AppState | T {
  // On server (during SSR), return default state without initializing Zustand
  if (typeof window === 'undefined') {
    const defaultState: AppState = {
      company: null,
      tasks: [],
      documents: [],
      teamMembers: [],
      notifications: [],
      currency: 'CAD',
      language: 'en',
      sidebarOpen: true,
      userPlan: 'free',
      unreadNotificationCount: 0,
      overdueTaskCount: 0,
      dueSoonTaskCount: 0,
      unlockedAchievementCount: 0,
      newDocumentCount: 0,
      pendingInviteCount: 0,
      lastBadgeSyncTime: Date.now(),
      setCompany: () => {},
      setUserPlan: () => {},
      setTasks: () => {},
      updateTaskStatus: () => {},
      addDocument: () => {},
      updateDocument: () => {},
      setCurrency: () => {},
      setLanguage: () => {},
      toggleSidebar: () => {},
      markNotificationRead: () => {},
      addNotification: () => {},
      updateBadgeCounts: () => {},
      syncBadgeCounts: async () => {},
      resetBadgeCount: () => {},
    }
    return selector ? selector(defaultState) : defaultState
  }
  // On client, initialize and use the store with optional selector
  const store = getStoreInstance()
  return selector ? store(selector) : store()
}

// ── Export raw hook for advanced usage (subscribe, getState, etc.) ──────────
export function getAppStoreHook() {
  return getStoreInstance()
}
