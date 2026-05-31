/**
 * Timezone-aware time utilities for notification scheduling
 * Uses date-fns and JavaScript Intl APIs for timezone handling
 */

import { format, isToday, isSameDay, addDays, parseISO } from 'date-fns'

// Helper to convert UTC time to user's timezone using Intl API
function toUserTimezone(date: Date, timezone: string): Date {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const parts = formatter.formatToParts(date)
  const result: Record<string, string> = {}
  parts.forEach(part => {
    result[part.type] = part.value
  })

  return new Date(
    `${result.year}-${result.month}-${result.day}T${result.hour}:${result.minute}:${result.second}`
  )
}

// Helper to convert timezone-aware time back to UTC
function toUtcTime(date: Date, timezone: string): Date {
  // Get the offset by comparing the user's timezone time with UTC
  const userTime = toUserTimezone(date, timezone)
  const utcTime = new Date(date)
  const offsetMs = userTime.getTime() - utcTime.getTime()
  return new Date(date.getTime() - offsetMs)
}

/**
 * Check if current time is within quiet hours for the user
 */
export function isWithinQuietHours(
  currentTime: Date,
  quietHoursStart: string,
  quietHoursEnd: string,
  timezone: string
): boolean {
  try {
    // Convert current time to user's timezone
    const zonedTime = toUserTimezone(currentTime, timezone)
    const currentTimeStr = format(zonedTime, 'HH:mm')

    // Parse start and end times
    const [startHour, startMin] = quietHoursStart.split(':').map(Number)
    const [endHour, endMin] = quietHoursEnd.split(':').map(Number)
    const [currentHour, currentMin] = currentTimeStr.split(':').map(Number)

    const startTotalMin = startHour * 60 + startMin
    const endTotalMin = endHour * 60 + endMin
    const currentTotalMin = currentHour * 60 + currentMin

    // Handle quiet hours that span midnight (e.g., 22:00 to 08:00)
    if (startTotalMin > endTotalMin) {
      return currentTotalMin >= startTotalMin || currentTotalMin < endTotalMin
    }

    // Normal case (e.g., 08:00 to 22:00)
    return currentTotalMin >= startTotalMin && currentTotalMin < endTotalMin
  } catch (error) {
    console.error('Error checking quiet hours:', error)
    return false
  }
}

/**
 * Check if it's time to send a digest email
 */
export function isDigestTime(
  currentTime: Date,
  digestTimeStr: string,
  timezone: string,
  toleranceMinutes: number = 15
): boolean {
  try {
    // Convert current time to user's timezone
    const zonedTime = toUserTimezone(currentTime, timezone)
    const currentTimeStr = format(zonedTime, 'HH:mm')
    const currentTotalMin = timeToMinutes(currentTimeStr)
    const digestTotalMin = timeToMinutes(digestTimeStr)

    // Check if within tolerance window
    const diff = Math.abs(currentTotalMin - digestTotalMin)
    return diff <= toleranceMinutes
  } catch (error) {
    console.error('Error checking digest time:', error)
    return false
  }
}

/**
 * Convert HH:mm format to total minutes since midnight
 */
function timeToMinutes(timeStr: string): number {
  const [hour, min] = timeStr.split(':').map(Number)
  return hour * 60 + min
}

/**
 * Get the current time in user's timezone
 */
export function getCurrentTimeInTimezone(timezone: string): Date {
  try {
    return toUserTimezone(new Date(), timezone)
  } catch (error) {
    console.error('Error getting time in timezone:', error)
    return new Date()
  }
}

/**
 * Format time in user's timezone for display
 */
export function formatTimeInTimezone(date: Date, timezone: string, timeFormat: string = 'HH:mm'): string {
  try {
    const zonedTime = toUserTimezone(date, timezone)
    return format(zonedTime, timeFormat)
  } catch (error) {
    console.error('Error formatting time in timezone:', error)
    return ''
  }
}

/**
 * Get next occurrence of a specific time in user's timezone
 * Used for calculating when the next digest should be sent
 */
export function getNextOccurrenceOfTime(
  targetTimeStr: string,
  timezone: string,
  currentTime: Date = new Date()
): Date {
  try {
    const [targetHour, targetMin] = targetTimeStr.split(':').map(Number)

    // Get current time in user's timezone
    const zonedNow = toUserTimezone(currentTime, timezone)
    const [currentHour, currentMin] = [zonedNow.getHours(), zonedNow.getMinutes()]

    // Create a date object for target time today
    const targetToday = new Date(zonedNow)
    targetToday.setHours(targetHour, targetMin, 0, 0)

    // If target time hasn't passed today, schedule for today
    if (targetHour > currentHour || (targetHour === currentHour && targetMin > currentMin)) {
      return toUtcTime(targetToday, timezone)
    }

    // Otherwise, schedule for tomorrow
    const targetTomorrow = addDays(targetToday, 1)
    return toUtcTime(targetTomorrow, timezone)
  } catch (error) {
    console.error('Error calculating next occurrence:', error)
    return currentTime
  }
}

/**
 * Parse timezone string and validate it's a valid IANA timezone
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone })
    return true
  } catch (error) {
    return false
  }
}

/**
 * Get list of common timezones
 */
export const COMMON_TIMEZONES = [
  // North America
  { code: 'America/Los_Angeles', name: 'Pacific Time (PT)' },
  { code: 'America/Denver', name: 'Mountain Time (MT)' },
  { code: 'America/Chicago', name: 'Central Time (CT)' },
  { code: 'America/New_York', name: 'Eastern Time (ET)' },
  { code: 'America/Toronto', name: 'Eastern Time - Toronto (ET)' },
  { code: 'America/Vancouver', name: 'Pacific Time - Vancouver (PT)' },

  // Europe
  { code: 'Europe/London', name: 'Greenwich Mean Time (GMT)' },
  { code: 'Europe/Paris', name: 'Central European Time (CET)' },
  { code: 'Europe/Berlin', name: 'Central European Time (CET)' },

  // Asia
  { code: 'Asia/Dubai', name: 'Gulf Standard Time (GST)' },
  { code: 'Asia/Hong_Kong', name: 'Hong Kong Time (HKT)' },
  { code: 'Asia/Singapore', name: 'Singapore Standard Time (SGT)' },
  { code: 'Asia/Tokyo', name: 'Japan Standard Time (JST)' },
  { code: 'Asia/Shanghai', name: 'China Standard Time (CST)' },
  { code: 'Asia/Kolkata', name: 'India Standard Time (IST)' },

  // Australia
  { code: 'Australia/Sydney', name: 'Australian Eastern Time (AEDT)' },
  { code: 'Australia/Melbourne', name: 'Australian Eastern Time (AEDT)' },
  { code: 'Australia/Brisbane', name: 'Australian Eastern Time (AEST)' },
  { code: 'Australia/Perth', name: 'Australian Western Standard Time (AWST)' },

  // Others
  { code: 'UTC', name: 'Coordinated Universal Time (UTC)' },
]

/**
 * Get timezone offset for display
 */
export function getTimezoneOffset(timezone: string): string {
  try {
    const date = new Date()
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset',
    })

    const parts = formatter.formatToParts(date)
    const offset = parts.find(part => part.type === 'timeZoneName')
    return offset?.value || ''
  } catch (error) {
    return ''
  }
}

/**
 * Convert time from one timezone to another
 */
export function convertTimezone(
  date: Date,
  fromTimezone: string,
  toTimezone: string
): Date {
  try {
    // Convert from source timezone to UTC
    const utc = toUtcTime(date, fromTimezone)
    // Convert from UTC to target timezone
    return toUserTimezone(utc, toTimezone)
  } catch (error) {
    console.error('Error converting timezone:', error)
    return date
  }
}

/**
 * Check if a date is during business hours (9am-5pm)
 */
export function isDuringBusinessHours(
  date: Date,
  timezone: string
): boolean {
  try {
    const zonedTime = toUserTimezone(date, timezone)
    const hour = zonedTime.getHours()
    return hour >= 9 && hour < 17
  } catch (error) {
    return false
  }
}

/**
 * Check if a date is a weekend
 */
export function isWeekend(date: Date, timezone: string): boolean {
  try {
    const zonedTime = toUserTimezone(date, timezone)
    const dayOfWeek = zonedTime.getDay()
    return dayOfWeek === 0 || dayOfWeek === 6 // Sunday or Saturday
  } catch (error) {
    return false
  }
}
