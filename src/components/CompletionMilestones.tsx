'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Trophy, Star } from 'lucide-react'

interface MilestoneProps {
  completionPercentage: number
  onMilestoneReached?: (milestone: number) => void
}

export function CompletionMilestones({
  completionPercentage,
  onMilestoneReached,
}: MilestoneProps) {
  const [reachedMilestones, setReachedMilestones] = useState<number[]>([])
  const [showCelebration, setShowCelebration] = useState<number | null>(null)

  useEffect(() => {
    const milestones = [25, 50, 75, 90, 100]
    milestones.forEach((milestone) => {
      if (
        completionPercentage >= milestone &&
        !reachedMilestones.includes(milestone)
      ) {
        setReachedMilestones((prev) => [...prev, milestone])
        setShowCelebration(milestone)
        onMilestoneReached?.(milestone)

        // Auto-hide celebration after 5 seconds (except 100%)
        if (milestone !== 100) {
          const timer = setTimeout(() => setShowCelebration(null), 5000)
          return () => clearTimeout(timer)
        }
      }
    })
  }, [completionPercentage, reachedMilestones, onMilestoneReached])

  return (
    <AnimatePresence>
      {showCelebration === 25 && (
        <Milestone25 onClose={() => setShowCelebration(null)} />
      )}
      {showCelebration === 50 && (
        <Milestone50 onClose={() => setShowCelebration(null)} />
      )}
      {showCelebration === 75 && (
        <Milestone75 onClose={() => setShowCelebration(null)} />
      )}
      {showCelebration === 90 && (
        <Milestone90 onClose={() => setShowCelebration(null)} />
      )}
      {showCelebration === 100 && <Milestone100 onClose={() => setShowCelebration(null)} />}
    </AnimatePresence>
  )
}

// ─── 25% Milestone: Getting Started 🎉
function Milestone25({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
    >
      {/* Confetti Background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -20, opacity: 1, rotate: 0 }}
            animate={{
              y: window.innerHeight + 20,
              opacity: 0,
              rotate: 360,
            }}
            transition={{
              duration: 3,
              delay: i * 0.05,
              ease: 'easeIn',
            }}
            className="absolute text-2xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-20px',
            }}
          >
            {['🎉', '✨', '🚀', '⭐', '💫'][i % 5]}
          </motion.div>
        ))}
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="relative bg-white rounded-2xl p-8 max-w-md shadow-2xl"
      >
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            🎉
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            You&apos;ve Started!
          </h3>
          <p className="text-gray-600 mb-4">
            25% of your mandatory documents are ready. Great momentum!
          </p>
          <p className="text-sm text-gray-500">
            Keep going - your IPO journey has begun! 🚀
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── 50% Milestone: Halfway There 💪
function Milestone50({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
    >
      {/* Celebration Bursts */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: 0,
            y: 0,
            opacity: 1,
            scale: 1,
          }}
          animate={{
            x: Math.cos((i / 12) * Math.PI * 2) * 200,
            y: Math.sin((i / 12) * Math.PI * 2) * 200,
            opacity: 0,
            scale: 0,
          }}
          transition={{
            duration: 1.5,
            ease: 'easeOut',
          }}
          className="absolute text-3xl pointer-events-none"
          style={{
            left: '50%',
            top: '50%',
            marginLeft: '-15px',
            marginTop: '-15px',
          }}
        >
          {['🎊', '✨', '⭐', '💫'][i % 4]}
        </motion.div>
      ))}

      {/* Main Card */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 max-w-md shadow-2xl border border-blue-200"
      >
        <div className="text-center">
          <motion.div
            animate={{
              rotate: [0, 10, -10, 10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            💪
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Halfway There!
          </h3>
          <p className="text-gray-700 font-semibold mb-2">50% Complete</p>
          <p className="text-gray-600 mb-4">
            You&apos;re crushing it! Half your documents are submission-ready.
          </p>
          <p className="text-sm text-blue-600 font-medium">
            Just a little more push to cross 75%! 💙
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── 75% Milestone: Almost There! 🔥
function Milestone75({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
    >
      {/* Particle Rain */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -50, opacity: 1, x: 0 }}
          animate={{
            y: window.innerHeight,
            opacity: 0,
            x: Math.sin(i) * 50,
          }}
          transition={{
            duration: 2.5,
            delay: i * 0.05,
            ease: 'easeIn',
          }}
          className="absolute text-xl pointer-events-none"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-50px',
          }}
        >
          🔥
        </motion.div>
      ))}

      {/* Main Card */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: 'spring', bounce: 0.5 }}
        className="relative bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 max-w-md shadow-2xl border-2 border-orange-300"
      >
        <div className="text-center">
          <motion.div
            animate={{
              scale: [1, 1.2, 1.1, 1.2, 1],
            }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-7xl mb-4"
          >
            🔥
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            On Fire! 🚀
          </h3>
          <p className="text-gray-700 font-semibold mb-2">75% Complete</p>
          <p className="text-gray-600 mb-4">
            You&apos;re in the final stretch! Your submission readiness is
            nearly complete.
          </p>
          <p className="text-sm text-orange-600 font-bold">
            15% away from the Bell! Can you feel it? 🛎️
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── 90% Milestone: Ready for Submission 🛎️
function Milestone90({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 pointer-events-auto"
    >
      {/* Bell Ring Sound + Particles */}
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * 100 - 50,
            y: -50,
            opacity: 1,
          }}
          animate={{
            x: Math.random() * 200 - 100,
            y: window.innerHeight,
            opacity: 0,
          }}
          transition={{
            duration: 3,
            delay: i * 0.03,
          }}
          className="absolute text-2xl pointer-events-none"
        >
          {i % 3 === 0 ? '🛎️' : i % 3 === 1 ? '✨' : '⭐'}
        </motion.div>
      ))}

      {/* Main Alert */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotateX: -20 }}
        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
        transition={{ duration: 0.8, type: 'spring' }}
        className="relative bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 rounded-3xl p-10 max-w-lg shadow-2xl border-2 border-green-400"
      >
        {/* Animated Background */}
        <motion.div
          className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-400/10 to-blue-400/10"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />

        <div className="relative text-center">
          <motion.div
            animate={{
              rotate: [0, -30, 30, -20, 20, 0],
              scale: [1, 1.15, 1.1, 1.2, 1.1, 1],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: 0.2,
            }}
            className="text-8xl mb-4"
          >
            🛎️
          </motion.div>

          <h3 className="text-3xl font-black text-gray-900 mb-2">
            SUBMISSION READY!
          </h3>
          <p className="text-xl font-bold text-green-600 mb-3">90% Complete</p>

          <p className="text-gray-700 mb-4 text-lg">
            Your mandatory documents are submission-ready! Your team has been
            notified.
          </p>

          <div className="space-y-3 mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 text-left bg-green-100/50 rounded-lg p-3"
            >
              <span className="text-2xl">✅</span>
              <span className="text-sm text-gray-700">
                Team notified of submission readiness
              </span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-3 text-left bg-blue-100/50 rounded-lg p-3"
            >
              <span className="text-2xl">📋</span>
              <span className="text-sm text-gray-700">
                All mandatory documents verified
              </span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3 text-left bg-purple-100/50 rounded-lg p-3"
            >
              <span className="text-2xl">🎯</span>
              <span className="text-sm text-gray-700">
                Final 10% will complete your journey
              </span>
            </motion.div>
          </div>

          <p className="text-sm text-blue-600 font-bold">
            Just 10% more to ring the bell! 🛎️
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── 100% Milestone: Bell Ringing Celebration! 🛎️🎊
function Milestone100({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 bg-gradient-to-b from-blue-400 to-green-300"
    >
      {/* Massive Confetti Explosion */}
      {[...Array(100)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: 0,
            y: 0,
            opacity: 1,
            rotate: 0,
            scale: 1,
          }}
          animate={{
            x: (Math.random() - 0.5) * 600,
            y: window.innerHeight + 100,
            opacity: 0,
            rotate: Math.random() * 720,
            scale: 0,
          }}
          transition={{
            duration: 4,
            delay: i * 0.02,
            ease: 'easeIn',
          }}
          className="absolute pointer-events-none"
          style={{
            left: '50%',
            top: '50%',
            marginLeft: '-12px',
            marginTop: '-12px',
          }}
        >
          {['🎉', '✨', '🛎️', '⭐', '💫', '🚀', '🎊', '🏆'][i % 8]}
        </motion.div>
      ))}

      {/* Bell Ringer Animation */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          type: 'spring',
          bounce: 0.6,
        }}
        className="relative z-10"
      >
        <motion.div
          animate={{
            rotate: [-20, 20, -15, 15, -10, 10, -5, 5, 0],
          }}
          transition={{
            duration: 2,
            times: [0, 0.12, 0.24, 0.36, 0.48, 0.6, 0.72, 0.84, 1],
          }}
          className="text-9xl"
          style={{
            transformOrigin: '50% 0',
          }}
        >
          🛎️
        </motion.div>
      </motion.div>

      {/* Main Celebration Message */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{
          delay: 0.8,
          duration: 0.8,
          type: 'spring',
        }}
        className="absolute bottom-0 left-0 right-0 top-0 flex flex-col items-center justify-center pointer-events-none"
      >
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-5xl md:text-6xl font-black text-white drop-shadow-xl mb-4"
          >
            YOU DID IT! 🎉
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 }}
            className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg mb-2"
          >
            100% SUBMISSION READY
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="text-xl text-white drop-shadow-lg max-w-2xl mx-auto mb-6"
          >
            All mandatory documents and audits are complete!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 3, duration: 0.8 }}
            className="bg-white/95 rounded-2xl p-8 max-w-2xl shadow-2xl backdrop-blur"
          >
            <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600 mb-4">
              GET READY FOR THE RIDE OF YOUR LIFE! 🚀
            </p>

            <div className="space-y-3 text-lg font-semibold text-gray-800">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 3.3 }}
                className="flex items-center gap-3"
              >
                <span className="text-3xl">📈</span>
                <span>Your IPO roadshow begins</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 3.5 }}
                className="flex items-center gap-3"
              >
                <span className="text-3xl">🌍</span>
                <span>Investor meetings are locked in</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 3.7 }}
                className="flex items-center gap-3"
              >
                <span className="text-3xl">🛎️</span>
                <span>The bell is ringing soon...</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 3.9 }}
                className="flex items-center gap-3"
              >
                <span className="text-3xl">🎊</span>
                <span>History in the making</span>
              </motion.div>
            </div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 4.2 }}
              onClick={onClose}
              className="mt-8 px-8 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
            >
              Let&apos;s Go! 🚀
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}
