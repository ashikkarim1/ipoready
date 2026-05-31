/**
 * Badge Component Examples
 *
 * This file demonstrates how to use all badge components throughout the IPOReady app.
 * These are reference implementations - customize as needed for your specific use case.
 */

'use client'

import React from 'react'
import { FileText, Users, Gift } from 'lucide-react'
import {
  NotificationBadge,
  TaskBadge,
  AchievementBadge,
  ActivityBadge,
  CountBadge,
} from './index'

// ── Header Badge Examples ──────────────────────────────────────────────────

/**
 * Example: Header with notification badge
 * Place in your main header/nav component
 */
export function HeaderWithBadges() {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <h1 className="text-xl font-bold">IPOReady</h1>

      <div className="flex items-center gap-4">
        {/* Notification bell badge */}
        <NotificationBadge
          className="ml-auto"
          onClick={() => console.log('Notification clicked')}
        />

        {/* User profile with activity status */}
        <div className="flex items-center gap-2">
          <ActivityBadge
            status="online"
            size="sm"
          />
          <span className="text-sm font-medium">John Doe</span>
        </div>
      </div>
    </header>
  )
}

// ── Dashboard Badge Examples ───────────────────────────────────────────────

/**
 * Example: Dashboard stat card with task badges
 * Place in dashboard to show task status
 */
export function DashboardStatCard() {
  return (
    <div className="p-6 bg-white rounded-lg border shadow-sm">
      <h2 className="text-sm font-semibold text-gray-600 mb-4">Task Status</h2>

      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl font-bold">42</span>
        <TaskBadge variant="combined" />
      </div>

      <p className="text-xs text-gray-500">
        Total tasks in progress across all phases
      </p>
    </div>
  )
}

// ── Notification List Badge Examples ──────────────────────────────────────

/**
 * Example: Notification list item with read status
 * Place in notifications page
 */
export function NotificationListItem() {
  return (
    <div className="p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-3">
        {/* Unread indicator */}
        <CountBadge
          count={1}
          variant="dot"
          bgColor="#E8312A"
          size="sm"
        />

        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">
            Personal Information Forms Due
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            Forms for 3 directors are due for submission next week
          </p>
          <time className="text-xs text-gray-500">2 hours ago</time>
        </div>
      </div>
    </div>
  )
}

// ── Checklist/Tasks Page Examples ──────────────────────────────────────────

/**
 * Example: Task list with overdue badges
 * Place in checklist page
 */
export function TaskListWithBadges() {
  return (
    <div className="space-y-2">
      {/* Overdue task */}
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <TaskBadge variant="overdue" compact={false} />
          <h3 className="font-semibold text-sm">File Annual Report</h3>
        </div>
        <p className="text-xs text-gray-600">Due: May 15, 2026</p>
      </div>

      {/* Due soon task */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <TaskBadge variant="due-soon" compact={false} />
          <h3 className="font-semibold text-sm">Audit Review</h3>
        </div>
        <p className="text-xs text-gray-600">Due: May 28, 2026</p>
      </div>

      {/* Completed task */}
      <div className="p-4 bg-white border rounded-lg opacity-60">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="font-semibold text-sm text-gray-600 line-through">
            Board Resolution
          </h3>
        </div>
        <p className="text-xs text-gray-500">Completed: May 1, 2026</p>
      </div>
    </div>
  )
}

// ── Documents Page Examples ────────────────────────────────────────────────

/**
 * Example: Document list with new badges
 * Place in documents page
 */
export function DocumentListWithBadges() {
  return (
    <div className="space-y-3">
      {/* New document */}
      <div className="p-4 bg-white border rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-blue-500" />
          <div>
            <h3 className="font-semibold text-sm">Financial Statements Q1</h3>
            <p className="text-xs text-gray-500">Uploaded today</p>
          </div>
        </div>
        <CountBadge
          count={1}
          variant="badge"
          bgColor="#FCD34D"
          textColor="#B45309"
          size="sm"
        />
      </div>

      {/* Multiple new documents notification */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <CountBadge
          count={5}
          variant="pill"
          bgColor="#F59E0B"
          icon={FileText}
          label="New Documents"
          size="md"
        />
      </div>
    </div>
  )
}

// ── Team Page Examples ─────────────────────────────────────────────────────

/**
 * Example: Team member list with pending invites
 * Place in team page
 */
export function TeamMemberWithStatus() {
  return (
    <div className="space-y-3">
      {/* Accepted member */}
      <div className="p-4 bg-white border rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold">
            JD
          </div>
          <div>
            <h3 className="font-semibold text-sm">John Doe</h3>
            <p className="text-xs text-gray-500">CEO</p>
          </div>
        </div>
        <ActivityBadge status="online" showLabel size="sm" />
      </div>

      {/* Pending invite */}
      <div className="p-4 bg-gray-50 border rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold">
            SD
          </div>
          <div>
            <h3 className="font-semibold text-sm">Sarah Davis</h3>
            <p className="text-xs text-gray-500">CFO - Invite pending</p>
          </div>
        </div>
        <CountBadge
          count={1}
          variant="badge"
          bgColor="#F97316"
          size="sm"
        />
      </div>
    </div>
  )
}

// ── Achievement/Milestone Examples ──────────────────────────────────────────

/**
 * Example: Achievement notification popup
 * Show when user completes a milestone
 */
export function AchievementNotification() {
  return (
    <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-start gap-4">
        <div className="text-3xl">🏆</div>
        <div className="flex-1">
          <h3 className="font-bold text-sm mb-1">Milestone Achieved!</h3>
          <p className="text-xs text-gray-600 mb-3">
            You've completed Phase 1 of the Pre-Planning stage
          </p>
          <AchievementBadge compact={true} />
        </div>
      </div>
    </div>
  )
}

// ── Sidebar Nav Badge Examples ─────────────────────────────────────────────

/**
 * Example: Navigation item with context badge
 * Place in sidebar/nav items
 */
export function NavItemWithBadge() {
  return (
    <nav className="space-y-1">
      {/* Dashboard with task badges */}
      <a
        href="/dashboard"
        className="px-4 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between group"
      >
        <span className="font-medium text-sm">Mission Control</span>
        <TaskBadge variant="overdue" compact={true} />
      </a>

      {/* Notifications with unread count */}
      <a
        href="/notifications"
        className="px-4 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between group"
      >
        <span className="font-medium text-sm">Notifications</span>
        <CountBadge
          count={2}
          variant="badge"
          bgColor="#E8312A"
          size="sm"
        />
      </a>

      {/* Documents with new items */}
      <a
        href="/documents"
        className="px-4 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between group"
      >
        <span className="font-medium text-sm">Documents</span>
        <CountBadge
          count={3}
          variant="badge"
          bgColor="#3B82F6"
          size="sm"
        />
      </a>

      {/* Team with pending invites */}
      <a
        href="/team"
        className="px-4 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between group"
      >
        <span className="font-medium text-sm">Team</span>
        <CountBadge
          count={1}
          variant="badge"
          bgColor="#F97316"
          size="sm"
        />
      </a>
    </nav>
  )
}

// ── Tab Badge Examples ─────────────────────────────────────────────────────

/**
 * Example: Tab with unread count badge
 * Place in tabbed interfaces
 */
export function TabsWithBadges() {
  const tabs = [
    { label: 'All', count: 12 },
    { label: 'Unread', count: 3, highlight: true },
    { label: 'Starred', count: 2 },
  ]

  return (
    <div className="border-b flex gap-8">
      {tabs.map((tab) => (
        <button
          key={tab.label}
          className={`px-1 py-3 text-sm font-medium relative ${
            tab.highlight ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {tab.label}
          {tab.count > 0 && (
            <CountBadge
              count={tab.count}
              variant="minimal"
              bgColor={tab.highlight ? '#E8312A' : '#9CA3AF'}
              className="ml-2 text-xs"
            />
          )}
        </button>
      ))}
    </div>
  )
}

// ── Stats Dashboard Example ────────────────────────────────────────────────

/**
 * Example: Stats dashboard showing all badge types
 * Place on main dashboard
 */
export function StatsOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Notifications stat */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-600 uppercase">
            Notifications
          </h3>
          <CountBadge
            count={2}
            variant="badge"
            bgColor="#E8312A"
            size="sm"
          />
        </div>
        <p className="text-2xl font-bold text-gray-900">2 New</p>
        <p className="text-xs text-gray-500 mt-1">Items requiring attention</p>
      </div>

      {/* Tasks stat */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-600 uppercase">
            Overdue Tasks
          </h3>
          <TaskBadge variant="overdue" compact={true} />
        </div>
        <p className="text-2xl font-bold text-gray-900">1 Task</p>
        <p className="text-xs text-gray-500 mt-1">Needs immediate action</p>
      </div>

      {/* Documents stat */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-600 uppercase">
            New Documents
          </h3>
          <CountBadge
            count={3}
            variant="badge"
            bgColor="#3B82F6"
            size="sm"
          />
        </div>
        <p className="text-2xl font-bold text-gray-900">3 Documents</p>
        <p className="text-xs text-gray-500 mt-1">Uploaded this week</p>
      </div>

      {/* Team stat */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-600 uppercase">
            Pending Invites
          </h3>
          <CountBadge
            count={1}
            variant="badge"
            bgColor="#F97316"
            size="sm"
          />
        </div>
        <p className="text-2xl font-bold text-gray-900">1 Invite</p>
        <p className="text-xs text-gray-500 mt-1">Awaiting response</p>
      </div>
    </div>
  )
}
