'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export function RocketAnimation() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-30" suppressHydrationWarning>
      {mounted && (
        <>
          {/* ─── ROCKET: Full flight path (UP → DOWN → LAND) ─── */}
          <motion.div
            initial={{
              x: '-200px',
              y: 'calc(100vh + 100px)',
              opacity: 0,
              rotate: 45,
              scale: 0.5,
            }}
            animate={{
              // Full arc: start bottom-left → up to sky → down to PACE card TOP
              x: ['calc(-200px)', 'calc(40vw)', 'calc(80vw - 50px)', 'calc(80vw - 50px)'],
              y: [
                'calc(100vh + 100px)',
                'calc(-400px)',
                'calc(28vh)',
                'calc(28vh)',
              ],
              opacity: [0, 1, 1, 1],
              rotate: [45, -5, 0, 0],
              scale: [0.5, 1, 1, 1],
            }}
            transition={{
              duration: 12.5, // Full journey including pause
              times: [0, 0.35, 0.76, 1], // Land at 76% (9.5s), stay until 12.5s
              ease: [
                [0.23, 0.86, 0.39, 0.96],
                [0.23, 0.86, 0.39, 0.96],
                'easeOut',
                'easeOut',
              ],
              delay: 0.3,
            }}
            className="absolute"
          >
            {/* Rocket with text */}
            <div className="relative flex items-center gap-6 lg:gap-8">
              <motion.div
                className="text-9xl drop-shadow-2xl select-none"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              >
                🚀
              </motion.div>

              {/* Flight text */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="flex flex-col items-start gap-1.5"
              >
                <div className="text-white drop-shadow-lg select-none">
                  <p className="text-2xl lg:text-3xl font-black tracking-tight">
                    Ready for an IPO?
                  </p>
                  <p className="text-xs lg:text-sm font-bold uppercase tracking-widest text-white/90 mt-2">
                    Let's get you listed →
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* ─── FLAME TRAIL ─── */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`flame-${i}`}
              initial={{
                x: '-150px',
                y: 'calc(100vh + 50px)',
                opacity: 1,
                scale: 1,
              }}
              animate={{
                x: ['calc(-150px)', 'calc(40vw)', 'calc(80vw - 50px)', 'calc(80vw - 50px)'],
                y: [
                  'calc(100vh + 50px)',
                  'calc(-400px)',
                  'calc(28vh)',
                  'calc(28vh)',
                ],
                opacity: [1, 1, 0, 0],
                scale: [1, 0.7, 0.3, 0],
              }}
              transition={{
                duration: 12.5,
                times: [0, 0.35, 0.76, 1],
                ease: [
                  [0.23, 0.86, 0.39, 0.96],
                  [0.23, 0.86, 0.39, 0.96],
                  'easeOut',
                  'easeOut',
                ],
                delay: 0.3 + i * 0.08,
              }}
              className="absolute pointer-events-none"
            >
              <motion.div
                animate={{ rotate: [0, 360], scale: [1, 0.7, 1] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="text-3xl lg:text-4xl drop-shadow-xl"
              >
                🔥
              </motion.div>
            </motion.div>
          ))}

          {/* ─── SMOKE BURST at landing (9.5s) ─── */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`smoke-${i}`}
              initial={{
                x: `calc(80vw + ${(Math.random() - 0.5) * 80}px)`,
                y: 'calc(28vh + 80px)',
                opacity: 0,
                scale: 0.3,
              }}
              animate={{
                y: 'calc(28vh - 200px)',
                opacity: 0,
                scale: 1.5,
              }}
              transition={{
                duration: 2,
                delay: 9.5 + i * 0.05,
                ease: 'easeOut',
              }}
              className="absolute pointer-events-none text-6xl"
            >
              💨
            </motion.div>
          ))}

          {/* ─── DUST IMPACT ─── */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`dust-${i}`}
              initial={{
                x: `calc(80vw + ${Math.cos((i / 8) * Math.PI * 2) * 40}px)`,
                y: 'calc(28vh + 120px)',
                scale: 1,
                opacity: 0,
              }}
              animate={{
                x: `calc(80vw + ${Math.cos((i / 8) * Math.PI * 2) * 150}px)`,
                y: 'calc(28vh + 200px)',
                scale: 0,
                opacity: 0,
              }}
              transition={{
                duration: 1.5,
                delay: 9.5,
                ease: 'easeOut',
              }}
              className="absolute pointer-events-none text-4xl"
            >
              ☁️
            </motion.div>
          ))}

          {/* ─── ASTRONAUT: Exits, pauses 4s, drifts right ─── */}
          <motion.div
            initial={{
              x: 'calc(80vw - 60px)',
              y: 'calc(28vh + 80px)',
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 10.5,
              duration: 0.3,
            }}
            className="fixed pointer-events-none"
          >
            {/* Astronaut body animation: pause 4s, then drift right */}
            <motion.div
              animate={{
                x: [0, 0, 200, 500, 900],
                y: [0, 0, -100, -300, -600],
                rotate: [0, 0, 15, 45, 90],
                opacity: [1, 1, 1, 0.8, 0],
              }}
              transition={{
                duration: 7,
                times: [0, 0.57, 0.71, 0.86, 1],
                delay: 0.3,
                ease: 'easeInOut',
              }}
              className="relative flex flex-col items-center gap-1"
            >
              {/* Full body astronaut */}
              <div className="flex flex-col items-center gap-1">
                {/* Head */}
                <div className="text-6xl select-none drop-shadow-lg">🧑‍🚀</div>
                {/* Body/Suit */}
                <div className="flex flex-col items-center gap-0">
                  <div className="text-5xl select-none drop-shadow-lg">👕</div>
                  <div className="text-5xl select-none drop-shadow-lg">🦵</div>
                </div>
                {/* Arms spread */}
                <div className="flex justify-between w-32 text-4xl select-none drop-shadow-lg gap-8">
                  <span>🤲</span>
                  <span>🤲</span>
                </div>
              </div>

              {/* Flag in hand */}
              <motion.div
                animate={{
                  rotate: [20, -20, 20, -20, 20],
                  x: [50, 60, 55, 60, 55],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
                className="absolute -right-8 top-8 text-4xl"
              >
                🚩
              </motion.div>

              {/* Flag label */}
              <motion.div
                animate={{
                  rotate: [20, -20, 20, -20, 20],
                  x: [50, 60, 55, 60, 55],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
                className="absolute right-2 top-16 whitespace-nowrap"
              >
                <div className="text-sm font-black text-white drop-shadow-xl bg-gradient-to-r from-green-600 to-green-700 px-3 py-2 rounded-lg border-2 border-white shadow-lg">
                  Your IPO! 🎊
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* ─── SPARKLE TRAIL (starts at 14.5s) ─── */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`trail-${i}`}
              initial={{
                x: 'calc(80vw)',
                y: 'calc(28vh)',
                opacity: 0,
                scale: 0,
              }}
              animate={{
                x: `calc(80vw + ${200 + i * 40}px)`,
                y: `calc(28vh + ${-100 - i * 30}px)`,
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                delay: 14.5 + i * 0.12,
                ease: 'easeOut',
              }}
              className="fixed pointer-events-none text-2xl"
            >
              ✨
            </motion.div>
          ))}
        </>
      )}
    </div>
  )
}
