'use client'

export function SimpleRocket() {
  return (
    <>
      <style>{`
        @keyframes rocketLaunch {
          0% {
            bottom: -100px;
            left: -200px;
            opacity: 0;
            transform: rotate(45deg) scale(0.5);
          }
          10% {
            opacity: 1;
          }
          50% {
            bottom: 80vh;
            left: 35vw;
            transform: rotate(-5deg) scale(1);
          }
          75% {
            bottom: 35vh;
            left: 80vw;
          }
          100% {
            bottom: 35vh;
            left: 80vw;
            opacity: 1;
            transform: rotate(0deg) scale(1);
          }
        }

        @keyframes textFadeIn {
          0% { opacity: 0; }
          50% { opacity: 0; }
          100% { opacity: 1; }
        }

        .rocket-container {
          position: fixed;
          bottom: -100px;
          left: -200px;
          z-index: 30;
          pointer-events: none;
          animation: rocketLaunch 8s ease-in-out forwards;
        }

        .rocket-emoji {
          font-size: 4rem;
          display: block;
        }

        .rocket-text {
          position: absolute;
          right: -200px;
          top: 0;
          white-space: nowrap;
          color: #E8312A !important;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
          animation: textFadeIn 3s ease-in-out forwards;
          font-weight: bold;
        }

        .rocket-text p {
          margin: 0;
          font-size: 1.2rem;
        }

        .rocket-text small {
          font-size: 0.8rem;
          display: block;
          margin-top: 4px;
        }
      `}</style>

      <div className="rocket-container">
        <span className="rocket-emoji">🚀</span>
        <div className="rocket-text">
          <p>Ready for an IPO?</p>
          <small>Let's get you listed →</small>
        </div>
      </div>
    </>
  )
}
