'use client';

import { motion } from 'framer-motion';
import { Activity, Clock, Zap } from 'lucide-react';

interface LiveFeedEmptyStateProps {
  isConnected: boolean;
}

export function LiveFeedEmptyState({ isConnected }: LiveFeedEmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center text-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="relative mb-6"
      >
        <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl">
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </motion.div>
        </div>
        
        {/* Floating icons */}
        <motion.div
          animate={{ 
            y: [0, -8, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
          className="absolute -top-1 -right-1 p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <Clock className="w-3 h-3 text-gray-500 dark:text-gray-400" />
        </motion.div>
        
        <motion.div
          animate={{ 
            y: [0, -6, 0],
            rotate: [0, -8, 0]
          }}
          transition={{ 
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute -bottom-1 -left-1 p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <Zap className="w-3 h-3 text-amber-500 dark:text-amber-400" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="space-y-3"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {isConnected ? 'Waiting for Live Events' : 'Connecting to Live Feed...'}
        </h3>
        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
            {isConnected
              ? 'The match feed is ready. Live events will appear here as soon as the match begins.'
              : 'Establishing connection to the live data stream. This may take a moment...'
            }
          </p>
          
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, delay: 0.8, ease: "easeInOut" }}
            className="mx-auto"
          >
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-500">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                className="w-1.5 h-1.5 bg-blue-500 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                className="w-1.5 h-1.5 bg-blue-500 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                className="w-1.5 h-1.5 bg-blue-500 rounded-full"
              />
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className={`mt-8 px-4 py-2 rounded-full border ${
          isConnected
            ? 'bg-green-50 dark:bg-green-950/50 border-green-100 dark:border-green-900'
            : 'bg-amber-50 dark:bg-amber-950/50 border-amber-100 dark:border-amber-900'
        }`}
      >
        <p className={`text-xs font-medium ${
          isConnected
            ? 'text-green-700 dark:text-green-300'
            : 'text-amber-700 dark:text-amber-300'
        }`}>
          {isConnected
            ? '✅ Live feed is active and monitoring'
            : '⏳ Connecting to live data stream...'
          }
        </p>
      </motion.div>
    </motion.div>
  );
}