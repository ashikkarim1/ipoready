import {
  Bell,
  AlertCircle,
  CheckCircle,
  Zap,
  Shield,
  Trophy,
  Activity,
  AlertTriangle,
  Info,
  LucideIcon,
} from 'lucide-react'

// ── Badge Type Definitions ──────────────────────────────────────────────────
export type BadgeType = 'notification' | 'task' | 'achievement' | 'activity' | 'warning' | 'info'

export type BadgeVariant = 'dot' | 'count' | 'text'

export interface BadgeConfig {
  type: BadgeType
  variant: BadgeVariant
  count?: number
  label?: string
  color: string
  bgColor: string
  icon: LucideIcon
  animated?: boolean
  maxCount?: number
}

// ── Badge Type Configurations ───────────────────────────────────────────────
export const BADGE_CONFIGS: Record<BadgeType, Omit<BadgeConfig, 'count' | 'label'>> = {
  notification: {
    type: 'notification',
    variant: 'count',
    color: '#FFFFFF',
    bgColor: '#E8312A',
    icon: Bell,
    animated: true,
    maxCount: 99,
  },
  task: {
    type: 'task',
    variant: 'count',
    color: '#FFFFFF',
    bgColor: '#F97316',
    icon: AlertCircle,
    animated: false,
    maxCount: 99,
  },
  achievement: {
    type: 'achievement',
    variant: 'count',
    color: '#FFFFFF',
    bgColor: '#F59E0B',
    icon: Trophy,
    animated: true,
    maxCount: 99,
  },
  activity: {
    type: 'activity',
    variant: 'dot',
    color: '#FFFFFF',
    bgColor: '#10B981',
    icon: Activity,
    animated: false,
  },
  warning: {
    type: 'warning',
    variant: 'count',
    color: '#FFFFFF',
    bgColor: '#EF4444',
    icon: AlertTriangle,
    animated: true,
    maxCount: 99,
  },
  info: {
    type: 'info',
    variant: 'count',
    color: '#FFFFFF',
    bgColor: '#3B82F6',
    icon: Info,
    animated: false,
    maxCount: 99,
  },
}

// ── Badge Count Utility ─────────────────────────────────────────────────────
export function formatBadgeCount(count: number, maxCount: number = 99): string {
  if (count === 0) return '0'
  if (count > maxCount) return `${maxCount}+`
  return count.toString()
}

// ── Badge Color Constants ───────────────────────────────────────────────────
export const BADGE_COLORS = {
  alert: '#E8312A',
  warning: '#F97316',
  success: '#10B981',
  info: '#3B82F6',
  achievement: '#F59E0B',
  neutral: '#6B7280',
} as const
