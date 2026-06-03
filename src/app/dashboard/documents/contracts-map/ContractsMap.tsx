'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react'

export type DocumentStatus = 'submitted' | 'recommended' | 'required-missing'

export interface ContractNode {
  id: string
  name: string
  type: string
  status: DocumentStatus
  submittedAt?: string
  description: string
  icon: React.ReactNode
}

export interface ContractsMapProps {
  nodes: ContractNode[]
  onNodeClick?: (node: ContractNode) => void
  onUploadClick?: (node: ContractNode) => void
  companyName?: string
}

interface NodePosition {
  x: number
  y: number
}

interface PhysicsNode extends ContractNode {
  vx: number
  vy: number
}

interface GraphEdge {
  source: string
  target: string
  weight: number
}

const ContractsMap: React.FC<ContractsMapProps> = ({
  nodes: initialNodes,
  onNodeClick,
  onUploadClick,
  companyName = 'Company',
}) => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [positions, setPositions] = useState<Record<string, NodePosition>>({})
  const [selectedNode, setSelectedNode] = useState<ContractNode | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(true)
  const animationRef = useRef<number>(0)

  // Find prospectus node (should be central)
  const prospectusNode = useMemo(
    () => initialNodes.find((n) => n.id === 'prospectus'),
    [initialNodes]
  )

  // Calculate initial positions using force-directed layout
  const calculateLayout = useMemo(() => {
    return () => {
      const newPositions: Record<string, NodePosition> = {}
      const canvasWidth = 1400
      const canvasHeight = 700

      // Place prospectus in center
      const centerX = canvasWidth / 2
      const centerY = canvasHeight / 2
      newPositions['prospectus'] = { x: centerX, y: centerY }

      // Arrange other nodes in a circular orbit around prospectus
      const otherNodes = initialNodes.filter((n) => n.id !== 'prospectus')
      const radius = 280
      const angleSlice = (2 * Math.PI) / otherNodes.length

      otherNodes.forEach((node, index) => {
        const angle = angleSlice * index
        newPositions[node.id] = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        }
      })

      return newPositions
    }
  }, [initialNodes])

  // Initialize positions
  useEffect(() => {
    setPositions(calculateLayout())
  }, [calculateLayout])

  // Simulate physics for smooth animation
  useEffect(() => {
    if (!isAnimating) return

    let iteration = 0
    const maxIterations = 150

    const simulate = () => {
      iteration++

      setPositions((prev) => {
        const updated = { ...prev }
        const canvasWidth = 1400
        const canvasHeight = 700
        const centerX = canvasWidth / 2
        const centerY = canvasHeight / 2

        // Apply forces
        Object.keys(updated).forEach((id) => {
          const node = updated[id]
          let fx = 0
          let fy = 0

          // Attract nodes toward prospectus (if not prospectus)
          if (id !== 'prospectus') {
            const dx = centerX - node.x
            const dy = centerY - node.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            if (distance > 0) {
              fx += (dx / distance) * 0.5
              fy += (dy / distance) * 0.5
            }
          }

          // Repel from other nodes
          Object.keys(updated).forEach((otherId) => {
            if (otherId !== id) {
              const other = updated[otherId]
              const dx = node.x - other.x
              const dy = node.y - other.y
              const distance = Math.sqrt(dx * dx + dy * dy)
              if (distance > 0 && distance < 500) {
                const repulsion = 200 / (distance * distance)
                fx += (dx / distance) * repulsion
                fy += (dy / distance) * repulsion
              }
            }
          })

          // Apply damping and update position
          const damping = 0.85
          const movement = 2
          updated[id].x += fx * movement * damping
          updated[id].y += fy * movement * damping

          // Boundary constraints
          updated[id].x = Math.max(50, Math.min(canvasWidth - 50, updated[id].x))
          updated[id].y = Math.max(50, Math.min(canvasHeight - 50, updated[id].y))
        })

        return updated
      })

      if (iteration < maxIterations) {
        animationRef.current = requestAnimationFrame(simulate)
      } else {
        setIsAnimating(false)
      }
    }

    animationRef.current = requestAnimationFrame(simulate)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isAnimating])

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case 'submitted':
        return { node: '#10b981', edge: '#d1fae5', light: '#f0fdf4' }
      case 'recommended':
        return { node: '#f59e0b', edge: '#fef3c7', light: '#fffbeb' }
      case 'required-missing':
        return { node: '#ef4444', edge: '#fee2e2', light: '#fef2f2' }
    }
  }

  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case 'submitted':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'recommended':
        return <Clock className="w-4 h-4 text-amber-600" />
      case 'required-missing':
        return <AlertCircle className="w-4 h-4 text-red-600" />
    }
  }

  const getStatusLabel = (status: DocumentStatus) => {
    switch (status) {
      case 'submitted':
        return 'Submitted'
      case 'recommended':
        return 'Recommended'
      case 'required-missing':
        return 'Required - Missing'
    }
  }

  const requiredMissingCount = initialNodes.filter(
    (n) => n.status === 'required-missing'
  ).length
  const recommendedCount = initialNodes.filter(
    (n) => n.status === 'recommended'
  ).length
  const submittedCount = initialNodes.filter((n) => n.status === 'submitted')
    .length

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header with status summary */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Material Contracts Network
        </h2>
        <div className="flex items-center justify-between">
          <p className="body-sm text-gray-600">
            Prospectus relationships and document status
          </p>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {requiredMissingCount}
              </p>
              <p className="caption-sm text-gray-600">Required Missing</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">
                {recommendedCount}
              </p>
              <p className="caption-sm text-gray-600">Recommended</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {submittedCount}
              </p>
              <p className="caption-sm text-gray-600">Submitted</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main graph area with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Graph canvas */}
        <div className="flex-1 relative bg-white overflow-auto">
          <svg
            className="w-full h-full"
            viewBox="0 0 1400 700"
            preserveAspectRatio="none"
            style={{ minHeight: '600px' }}
          >
            {/* Draw edges */}
            {initialNodes.map((node) => {
              if (node.id === 'prospectus' || !positions[node.id]) return null

              const sourcePos = positions['prospectus']
              const targetPos = positions[node.id]

              if (!sourcePos || !targetPos) return null

              const colors = getStatusColor(node.status)

              return (
                <g key={`edge-${node.id}`}>
                  {/* Connection line */}
                  <line
                    x1={sourcePos.x}
                    y1={sourcePos.y}
                    x2={targetPos.x}
                    y2={targetPos.y}
                    stroke={colors.node}
                    strokeWidth="3.5"
                    opacity="0.7"
                  />
                  {/* Animated flowing effect for required-missing */}
                  {node.status === 'required-missing' && (
                    <line
                      x1={sourcePos.x}
                      y1={sourcePos.y}
                      x2={targetPos.x}
                      y2={targetPos.y}
                      stroke={colors.node}
                      strokeWidth="4.5"
                      opacity="0"
                      style={{
                        animation:
                          'pulse-line 2s ease-in-out infinite',
                      }}
                    />
                  )}
                </g>
              )
            })}

            {/* Draw nodes */}
            {initialNodes.map((node) => {
              const pos = positions[node.id]
              if (!pos) return null

              const colors = getStatusColor(node.status)
              const isSelected = selectedNode?.id === node.id
              const isHovered = hoveredNode === node.id
              const isPulsing = node.status === 'required-missing'

              // Size based on importance
              const baseRadius = node.id === 'prospectus' ? 50 : 40
              const radius = isSelected ? baseRadius + 10 : baseRadius

              return (
                <g
                  key={`node-${node.id}`}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => {
                    setSelectedNode(node)
                    onNodeClick?.(node)
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Pulsing background for missing required docs */}
                  {isPulsing && (
                    <>
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={radius + 20}
                        fill="none"
                        stroke={colors.node}
                        strokeWidth="2"
                        opacity="0"
                        style={{
                          animation:
                            'pulse-ring 2s ease-in-out infinite',
                        }}
                      />
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={radius + 10}
                        fill="none"
                        stroke={colors.node}
                        strokeWidth="1"
                        opacity="0"
                        style={{
                          animation:
                            'pulse-ring 2s ease-in-out infinite 0.5s',
                        }}
                      />
                    </>
                  )}

                  {/* Main circle */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={radius}
                    fill={colors.node}
                    opacity={isHovered ? 1 : 0.85}
                    style={{
                      transition: 'all 0.3s ease',
                      filter: isSelected
                        ? 'drop-shadow(0 0 12px rgba(0,0,0,0.3))'
                        : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                    }}
                  />

                  {/* Hover ring */}
                  {isHovered && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={radius + 4}
                      fill="none"
                      stroke={colors.node}
                      strokeWidth="2"
                      opacity="0.3"
                    />
                  )}

                  {/* Icon */}
                  <g
                    transform={`translate(${pos.x - 12}, ${pos.y - 12})`}
                    style={{
                      pointerEvents: 'none',
                    }}
                  >
                    {node.icon && (
                      <foreignObject x="0" y="0" width="24" height="24">
                        <div className="flex items-center justify-center w-6 h-6 text-white">
                          {node.icon}
                        </div>
                      </foreignObject>
                    )}
                  </g>

                  {/* Label background */}
                  {node.id === 'prospectus' && (
                    <rect
                      x={pos.x - 50}
                      y={pos.y + radius + 10}
                      width="100"
                      height="24"
                      rx="4"
                      fill="white"
                      opacity="0.9"
                      stroke={colors.node}
                      strokeWidth="1"
                    />
                  )}

                  {/* Label text */}
                  <text
                    x={pos.x}
                    y={pos.y + radius + 25}
                    textAnchor="middle"
                    className="label-sm font-semibold"
                    fill={colors.node}
                    opacity={node.id === 'prospectus' ? 1 : isHovered ? 1 : 0}
                    style={{
                      transition: 'opacity 0.3s ease',
                      pointerEvents: 'none',
                    }}
                  >
                    {node.name}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg border border-gray-200 p-4 shadow-lg">
            <p className="label-sm font-semibold text-gray-700 mb-3">STATUS</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="caption-sm text-gray-600">Required - Missing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="caption-sm text-gray-600">Recommended</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="caption-sm text-gray-600">Submitted</span>
              </div>
            </div>
          </div>

          {/* CSS for animations */}
          <style>{`
            @keyframes pulse-ring {
              0% {
                r: var(--r);
                opacity: 0.8;
              }
              100% {
                r: calc(var(--r) + 20px);
                opacity: 0;
              }
            }

            @keyframes pulse-line {
              0%, 100% {
                opacity: 0;
                stroke-dashoffset: 0;
              }
              50% {
                opacity: 0.8;
              }
            }

            svg circle {
              transition: fill 0.2s ease;
            }
          `}</style>
        </div>

        {/* Right sidebar for details */}
        <AnimatePresence mode="wait">
          {selectedNode && (
            <motion.div
              key={selectedNode.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="w-96 border-l border-gray-200 bg-white overflow-y-auto flex flex-col"
            >
              {/* Sidebar header */}
              <div className="p-6 border-b border-gray-200">
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-gray-400 hover:text-gray-600 h4 font-bold mb-3"
                >
                  ✕
                </button>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                    style={{
                      backgroundColor: getStatusColor(selectedNode.status).node,
                    }}
                  >
                    {selectedNode.icon}
                  </div>
                  <div>
                    <h3 className="h4 font-bold text-gray-900">
                      {selectedNode.name}
                    </h3>
                    <p className="caption-sm text-gray-600">
                      {selectedNode.type}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sidebar content */}
              <div className="flex-1 p-6 space-y-6">
                {/* Status badge */}
                <div>
                  <p className="label-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Status
                  </p>
                  <div
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg font-medium body-sm"
                    style={{
                      backgroundColor:
                        getStatusColor(selectedNode.status).light,
                      color: getStatusColor(selectedNode.status).node,
                    }}
                  >
                    {getStatusIcon(selectedNode.status)}
                    {getStatusLabel(selectedNode.status)}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="label-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Description
                  </p>
                  <p className="body-sm text-gray-600 leading-relaxed">
                    {selectedNode.description}
                  </p>
                </div>

                {/* Submitted date */}
                {selectedNode.submittedAt && (
                  <div>
                    <p className="label-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                      Submitted Date
                    </p>
                    <p className="body-sm text-gray-600">
                      {new Date(selectedNode.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {/* Requirements */}
                <div>
                  <p className="label-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Requirement
                  </p>
                  <p className="body-sm text-gray-600">
                    {selectedNode.status === 'required-missing'
                      ? 'This document is required for prospectus filing'
                      : 'This document is recommended for enhanced IPO readiness'}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="border-t border-gray-200 p-6 space-y-3">
                {selectedNode.status === 'required-missing' && (
                  <button
                    onClick={() => onUploadClick?.(selectedNode)}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Document
                  </button>
                )}
                {selectedNode.status === 'recommended' && (
                  <button
                    onClick={() => onUploadClick?.(selectedNode)}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
                  >
                    <Upload className="w-4 h-4" />
                    Submit Document
                  </button>
                )}
                {selectedNode.status === 'submitted' && (
                  <button className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition">
                    <FileText className="w-4 h-4" />
                    View Document
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default ContractsMap
