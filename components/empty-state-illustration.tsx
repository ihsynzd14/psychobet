import { motion } from 'framer-motion';

interface EmptyStateIllustrationProps {
  className?: string;
}

export function EmptyStateIllustration({ className }: EmptyStateIllustrationProps) {
  return (
    <div className={className}>
      <motion.svg
        width="200"
        height="170"
        viewBox="0 0 200 170"
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
                staggerChildren: 0.15,
                delayChildren: 0.2,
              },
            },
          }}
        >
          {/* Background field */}
          <motion.rect
            variants={{
              hidden: { opacity: 0, scale: 0.9 },
              visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
            }}
            className="text-blue-100 dark:text-blue-950"
            x="20"
            y="20"
            width="160"
            height="120"
            rx="8"
            fill="currentColor"
          />
          
          {/* Field lines */}
          <motion.rect
            variants={{
              hidden: { pathLength: 0, opacity: 0 },
              visible: { pathLength: 1, opacity: 1, transition: { duration: 0.8, delay: 0.3 } },
            }}
            className="text-blue-200 dark:text-blue-900"
            x="30"
            y="30"
            width="140"
            height="100"
            rx="4"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          
          {/* Center circle */}
          <motion.circle
            variants={{
              hidden: { scale: 0, opacity: 0 },
              visible: { scale: 1, opacity: 1, transition: { duration: 0.5, delay: 0.5 } },
            }}
            className="text-blue-200 dark:text-blue-900"
            cx="100"
            cy="80"
            r="20"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          
          {/* Center spot */}
          <motion.circle
            variants={{
              hidden: { scale: 0, opacity: 0 },
              visible: { scale: 1, opacity: 1, transition: { duration: 0.3, delay: 0.6 } },
            }}
            className="text-blue-300 dark:text-blue-800"
            cx="100"
            cy="80"
            r="2"
            fill="currentColor"
          />
          
          {/* Goals - left */}
          <motion.rect
            variants={{
              hidden: { x: -10, opacity: 0 },
              visible: { x: 0, opacity: 1, transition: { duration: 0.4, delay: 0.7 } },
            }}
            className="text-blue-300 dark:text-blue-800"
            x="30"
            y="70"
            width="5"
            height="20"
            fill="currentColor"
          />
          
          {/* Goals - right */}
          <motion.rect
            variants={{
              hidden: { x: 10, opacity: 0 },
              visible: { x: 0, opacity: 1, transition: { duration: 0.4, delay: 0.7 } },
            }}
            className="text-blue-300 dark:text-blue-800"
            x="165"
            y="70"
            width="5"
            height="20"
            fill="currentColor"
          />
          
          {/* Calendar icon */}
          <motion.g
            variants={{
              hidden: { y: -20, opacity: 0 },
              visible: { y: 0, opacity: 1, transition: { duration: 0.5, delay: 0.8 } },
            }}
          >
            <rect
              className="text-gray-200 dark:text-gray-800"
              x="80"
              y="50"
              width="40"
              height="40"
              rx="6"
              fill="currentColor"
            />
            <rect
              className="text-gray-300 dark:text-gray-700"
              x="85"
              y="60"
              width="30"
              height="25"
              rx="2"
              fill="currentColor"
            />
            <rect
              className="text-gray-100 dark:text-gray-900"
              x="90"
              y="65"
              width="5"
              height="5"
              rx="1"
              fill="currentColor"
            />
            <rect
              className="text-gray-100 dark:text-gray-900"
              x="100"
              y="65"
              width="5"
              height="5"
              rx="1"
              fill="currentColor"
            />
            <rect
              className="text-gray-100 dark:text-gray-900"
              x="110"
              y="65"
              width="5"
              height="5"
              rx="1"
              fill="currentColor"
            />
            <rect
              className="text-gray-100 dark:text-gray-900"
              x="90"
              y="75"
              width="5"
              height="5"
              rx="1"
              fill="currentColor"
            />
            <rect
              className="text-gray-100 dark:text-gray-900"
              x="100"
              y="75"
              width="5"
              height="5"
              rx="1"
              fill="currentColor"
            />
            <rect
              className="text-red-500"
              x="110"
              y="75"
              width="5"
              height="5"
              rx="1"
              fill="currentColor"
            />
          </motion.g>
          
          {/* Clock */}
          <motion.g
            variants={{
              hidden: { scale: 0, opacity: 0 },
              visible: { scale: 1, opacity: 1, transition: { duration: 0.5, delay: 0.9 } },
            }}
          >
            <circle
              className="text-gray-200 dark:text-gray-800"
              cx="100"
              cy="130"
              r="15"
              fill="currentColor"
            />
            <motion.path
              className="text-blue-500"
              d="M100 130 L100 120"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              animate={{ 
                rotate: 360,
                transition: { duration: 10, repeat: Infinity, ease: "linear" }
              }}
              style={{ transformOrigin: "100px 130px" }}
            />
            <motion.path
              className="text-red-500"
              d="M100 130 L108 135"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              animate={{ 
                rotate: 360,
                transition: { duration: 60, repeat: Infinity, ease: "linear" }
              }}
              style={{ transformOrigin: "100px 130px" }}
            />
            <circle
              className="text-gray-800 dark:text-gray-200"
              cx="100"
              cy="130"
              r="2"
              fill="currentColor"
            />
          </motion.g>
        </motion.g>
      </motion.svg>
    </div>
  );
} 