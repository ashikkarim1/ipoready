import { useState, useCallback, useEffect } from 'react'

export interface Document {
  id: string
  name: string
  isMandatory: boolean
  status: 'empty' | 'partial' | 'submitted' | 'verified'
  fileCount: number
}

interface CompletionData {
  totalDocuments: number
  mandatoryDocuments: number
  completedDocuments: number
  mandatoryCompleted: number
  completionPercentage: number
  mandatoryCompletionPercentage: number
  isSubmissionReady: boolean
}

export function useDocumentCompletion(documents: Document[]) {
  const [completionData, setCompletionData] = useState<CompletionData>({
    totalDocuments: 0,
    mandatoryDocuments: 0,
    completedDocuments: 0,
    mandatoryCompleted: 0,
    completionPercentage: 0,
    mandatoryCompletionPercentage: 0,
    isSubmissionReady: false,
  })

  const [notifications, setNotifications] = useState<string[]>([])

  // Calculate completion metrics
  const calculateCompletion = useCallback(() => {
    const total = documents.length
    const mandatory = documents.filter((d) => d.isMandatory).length
    const completed = documents.filter(
      (d) => d.status === 'verified' || d.status === 'submitted'
    ).length
    const mandatoryComplete = documents.filter(
      (d) => d.isMandatory && (d.status === 'verified' || d.status === 'submitted')
    ).length

    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0
    const mandatoryCompletionPercentage = mandatory > 0 ? Math.round((mandatoryComplete / mandatory) * 100) : 0
    const isSubmissionReady = mandatoryCompletionPercentage >= 90

    setCompletionData({
      totalDocuments: total,
      mandatoryDocuments: mandatory,
      completedDocuments: completed,
      mandatoryCompleted: mandatoryComplete,
      completionPercentage,
      mandatoryCompletionPercentage,
      isSubmissionReady,
    })

    return {
      completionPercentage,
      mandatoryCompletionPercentage,
      isSubmissionReady,
    }
  }, [documents])

  // Trigger notifications at milestone
  useEffect(() => {
    const { completionPercentage, isSubmissionReady } = calculateCompletion()

    // Trigger submission ready notification at 90%
    if (isSubmissionReady && !notifications.includes('submission-ready')) {
      setNotifications((prev) => [...prev, 'submission-ready'])
      notifyTeam({
        type: 'submission-ready',
        message: 'Your documents are 90%+ complete and ready for review!',
        completionPercentage,
      })
    }
  }, [documents, calculateCompletion, notifications])

  return {
    completionData,
    calculateCompletion,
  }
}

// Team notification function (integrates with your backend)
async function notifyTeam(notification: {
  type: 'submission-ready' | 'milestone-reached'
  message: string
  completionPercentage: number
}) {
  try {
    const response = await fetch('/api/documents/notify-team', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: notification.type,
        message: notification.message,
        completionPercentage: notification.completionPercentage,
        timestamp: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      console.error('Failed to notify team')
    }

    const data = await response.json()
    console.log('Team notified:', data)
  } catch (error) {
    console.error('Error notifying team:', error)
  }
}
