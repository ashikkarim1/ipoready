'use client'

import { useEffect, useState } from 'react'

export interface PeerBand {
  range: string
  companies: number
  percentOfPeers: number
}

export interface PaceBenchmarksData {
  companyPaceScore: number
  peerPercentile: number
  peerMedian: number
  peerStdDev: number
  peerBands: PeerBand[]
}

interface UsePaceBenchmarksReturn extends PaceBenchmarksData {
  isLoading: boolean
  error?: string
}

export function usePaceBenchmarks(): UsePaceBenchmarksReturn {
  const [data, setData] = useState<PaceBenchmarksData>({
    companyPaceScore: 0,
    peerPercentile: 0,
    peerMedian: 0,
    peerStdDev: 0,
    peerBands: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>()

  useEffect(() => {
    const fetchBenchmarks = async () => {
      try {
        setIsLoading(true)
        setError(undefined)

        const response = await fetch('/api/pace/benchmarks')
        if (!response.ok) {
          throw new Error(`Failed to fetch PACE benchmarks: ${response.statusText}`)
        }

        const benchmarks = await response.json()
        
        setData({
          companyPaceScore: benchmarks.company_pace_score || 0,
          peerPercentile: benchmarks.peer_percentile || 0,
          peerMedian: benchmarks.peer_median || 0,
          peerStdDev: benchmarks.peer_std_dev || 0,
          peerBands: benchmarks.peer_bands || [],
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        console.error('[usePaceBenchmarks]', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBenchmarks()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchBenchmarks, 30000)
    return () => clearInterval(interval)
  }, [])

  return {
    ...data,
    isLoading,
    error,
  }
}
