import { memo } from 'react';
import { motion } from 'framer-motion';

interface MatchStateIllustrationProps {
  type: 'empty' | 'error' | 'noMatches';
  className?: string;
}

function MatchStateIllustrationComponent({ type, className }: MatchStateIllustrationProps) {
  return (
    <div className={className}>
      <motion.svg
        width="260"
        height="200"
        viewBox="0 0 260 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial="hidden"
        animate="visible"
      >
        {/* Animation variants */}
        <motion.g
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
              },
            },
          }}
        >
          {/* Stadium background */}
          <motion.rect
            variants={{
              hidden: { opacity: 0, scale: 0.9 },
              visible: { opacity: 1, scale: 1, transition: { duration: 0.7 } },
            }}
            className="text-blue-100 dark:text-blue-950"
            x="30"
            y="30"
            width="200"
            height="140"
            rx="10"
            fill="currentColor"
          />
          
          {/* Field outline */}
          <motion.rect
            variants={{
              hidden: { pathLength: 0, opacity: 0 },
              visible: { pathLength: 1, opacity: 1, transition: { duration: 1, delay: 0.3 } },
            }}
            className="text-green-200 dark:text-green-900"
            x="40"
            y="40"
            width="180"
            height="120"
            rx="6"
            stroke="currentColor"
            strokeWidth="3"
            fill="url(#grass-pattern)"
          />
          
          {/* Center circle */}
          <motion.circle
            variants={{
              hidden: { scale: 0, opacity: 0 },
              visible: { scale: 1, opacity: 1, transition: { duration: 0.7, delay: 0.6 } },
            }}
            className="text-white dark:text-gray-300"
            cx="130"
            cy="100"
            r="25"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="4 4"
            fill="none"
          />
          
          {/* Center line */}
          <motion.line
            variants={{
              hidden: { pathLength: 0, opacity: 0 },
              visible: { pathLength: 1, opacity: 1, transition: { duration: 0.5, delay: 0.7 } },
            }}
            className="text-white dark:text-gray-300"
            x1="130"
            y1="40"
            x2="130"
            y2="160"
            stroke="currentColor"
            strokeWidth="2"
          />
          
          {/* Center spot */}
          <motion.circle
            variants={{
              hidden: { scale: 0, opacity: 0 },
              visible: { scale: 1, opacity: 1, transition: { duration: 0.3, delay: 0.8 } },
            }}
            className="text-white dark:text-gray-300"
            cx="130"
            cy="100"
            r="3"
            fill="currentColor"
          />
          
          {/* Goals */}
          <motion.rect
            variants={{
              hidden: { scaleX: 0, opacity: 0 },
              visible: { scaleX: 1, opacity: 1, transition: { duration: 0.4, delay: 0.9 } },
            }}
            className="text-blue-300 dark:text-blue-700"
            x="30"
            y="90"
            width="10"
            height="20"
            fill="currentColor"
          />
          
          <motion.rect
            variants={{
              hidden: { scaleX: 0, opacity: 0 },
              visible: { scaleX: 1, opacity: 1, transition: { duration: 0.4, delay: 0.9 } },
            }}
            className="text-blue-300 dark:text-blue-700"
            x="220"
            y="90"
            width="10"
            height="20"
            fill="currentColor"
          />
          
          {/* Penalty areas */}
          <motion.rect
            variants={{
              hidden: { pathLength: 0, opacity: 0 },
              visible: { pathLength: 1, opacity: 1, transition: { duration: 0.6, delay: 1.0 } },
            }}
            className="text-white dark:text-gray-300"
            x="40"
            y="70"
            width="30"
            height="60"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          
          <motion.rect
            variants={{
              hidden: { pathLength: 0, opacity: 0 },
              visible: { pathLength: 1, opacity: 1, transition: { duration: 0.6, delay: 1.0 } },
            }}
            className="text-white dark:text-gray-300"
            x="190"
            y="70"
            width="30"
            height="60"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          
          {type === 'empty' && (
            <>
              {/* Calendar */}
              <motion.g
                variants={{
                  hidden: { y: -20, opacity: 0 },
                  visible: { y: 0, opacity: 1, transition: { duration: 0.7, delay: 1.2 } },
                }}
              >
                <rect
                  className="text-gray-200 dark:text-gray-800"
                  x="100"
                  y="70"
                  width="60"
                  height="60"
                  rx="6"
                  fill="currentColor"
                />
                <rect
                  className="text-gray-300 dark:text-gray-700"
                  x="105"
                  y="80"
                  width="50"
                  height="45"
                  rx="3"
                  fill="currentColor"
                />
                <rect
                  className="text-gray-50 dark:text-gray-900"
                  x="112"
                  y="87"
                  width="8"
                  height="8"
                  rx="1"
                  fill="currentColor"
                />
                <rect
                  className="text-gray-50 dark:text-gray-900"
                  x="126"
                  y="87"
                  width="8"
                  height="8"
                  rx="1"
                  fill="currentColor"
                />
                <rect
                  className="text-gray-50 dark:text-gray-900"
                  x="140"
                  y="87"
                  width="8"
                  height="8"
                  rx="1"
                  fill="currentColor"
                />
                <rect
                  className="text-gray-50 dark:text-gray-900"
                  x="112"
                  y="101"
                  width="8"
                  height="8"
                  rx="1"
                  fill="currentColor"
                />
                <rect
                  className="text-gray-50 dark:text-gray-900"
                  x="126"
                  y="101"
                  width="8"
                  height="8"
                  rx="1"
                  fill="currentColor"
                />
                <rect
                  className="text-red-500"
                  x="140"
                  y="101"
                  width="8"
                  height="8"
                  rx="1"
                  fill="currentColor"
                />
                <rect
                  className="text-gray-50 dark:text-gray-900"
                  x="112"
                  y="115"
                  width="8"
                  height="8"
                  rx="1"
                  fill="currentColor"
                />
                <rect
                  className="text-gray-50 dark:text-gray-900"
                  x="126"
                  y="115"
                  width="8"
                  height="8"
                  rx="1"
                  fill="currentColor"
                />
                <rect
                  className="text-gray-50 dark:text-gray-900"
                  x="140"
                  y="115"
                  width="8"
                  height="8"
                  rx="1"
                  fill="currentColor"
                />
              </motion.g>
            </>
          )}
          
          {type === 'error' && (
            <>
              {/* Error message icon */}
              <motion.g
                variants={{
                  hidden: { opacity: 0, scale: 0 },
                  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, delay: 1.2 } },
                }}
              >
                <circle
                  className="text-red-100 dark:text-red-900"
                  cx="130"
                  cy="100"
                  r="30"
                  fill="currentColor"
                />
                <path
                  className="text-red-500"
                  d="M130 80V110M130 120V120.1"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </motion.g>
              
              {/* Lightning bolt */}
              <motion.path
                variants={{
                  hidden: { opacity: 0, pathLength: 0 },
                  visible: { opacity: 1, pathLength: 1, transition: { duration: 0.8, delay: 1.5 } },
                }}
                className="text-yellow-500"
                d="M165 70L145 100H160L140 130"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </>
          )}
          
          {type === 'noMatches' && (
            <>
              {/* Clock */}
              <motion.g
                variants={{
                  hidden: { opacity: 0, scale: 0 },
                  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, delay: 1.2 } },
                }}
              >
                <circle
                  className="text-gray-200 dark:text-gray-800"
                  cx="130"
                  cy="100"
                  r="25"
                  fill="currentColor"
                />
                <motion.path
                  className="text-blue-500"
                  d="M130 85L130 100L145 100"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  animate={{ 
                    rotate: 360,
                    transition: { duration: 20, repeat: Infinity, ease: "linear" }
                  }}
                  style={{ transformOrigin: "130px 100px" }}
                />
                <circle
                  className="text-gray-800 dark:text-gray-200"
                  cx="130"
                  cy="100"
                  r="3"
                  fill="currentColor"
                />
              </motion.g>
            </>
          )}
          
          {/* Stadium stands */}
          <motion.path
            variants={{
              hidden: { opacity: 0, pathLength: 0 },
              visible: { opacity: 1, pathLength: 1, transition: { duration: 0.8, delay: 1.3 } },
            }}
            className="text-blue-200 dark:text-blue-800"
            d="M10 50C10 50 30 30 130 30C230 30 250 50 250 50V170C250 170 230 190 130 190C30 190 10 170 10 170V50Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          
          {/* Define grass pattern */}
          <defs>
            <pattern id="grass-pattern" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45)">
              <line className="text-green-300 dark:text-green-800" x1="0" y1="0" x2="0" y2="10" strokeWidth="1" stroke="currentColor" />
            </pattern>
          </defs>
        </motion.g>
      </motion.svg>
    </div>
  );
}

export const MatchStateIllustration = memo(MatchStateIllustrationComponent); 