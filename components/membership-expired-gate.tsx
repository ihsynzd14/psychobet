'use client'

import { motion } from 'framer-motion'
import { ArrowRight, User2Icon, Lock, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function MembershipExpiredGate() {
    const router = useRouter()

    return (
        <div className="h-full w-full flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 absolute inset-0 z-50 overflow-hidden font-sans selection:bg-purple-500/30 transition-colors duration-1000">
            {/* Ultra-ambient background */}
            <div className="absolute inset-0 z-0 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-1000">
                {/* Subtle radial spotlights */}
                <div className="absolute -top-[20%] -left-[10%] h-[70%] w-[50%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(120,0,255,0.08),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(120,0,255,0.15),transparent_70%)] blur-3xl opacity-80 dark:opacity-60 mix-blend-multiply dark:mix-blend-screen transition-all duration-1000" />
                <div className="absolute top-[40%] -right-[20%] h-[80%] w-[60%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,120,255,0.05),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(0,120,255,0.1),transparent_70%)] blur-3xl opacity-80 dark:opacity-50 mix-blend-multiply dark:mix-blend-screen transition-all duration-1000" />

                {/* Tech grid mesh overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] transition-colors duration-1000" />
            </div>

            {/* Core Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-[440px]"
            >
                {/* Outer Glow Outline */}
                <div className="absolute -inset-[1px] rounded-[2rem] bg-gradient-to-b from-black/5 via-black/2 to-transparent dark:from-white/15 dark:via-white/5 dark:to-transparent opacity-60 transition-colors duration-1000" />

                {/* Main Glass Panel */}
                <div className="relative rounded-[2rem] bg-white/60 dark:bg-zinc-950/40 backdrop-blur-3xl border border-black/5 dark:border-white/10 p-8 sm:p-10 shadow-[0_0_80px_rgba(0,0,0,0.05)] dark:shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-1000">
                    {/* Top edge inner highlight */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/20 to-transparent transition-colors duration-1000" />

                    {/* Status indicator */}
                    <div className="flex justify-center mb-10">
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-mono text-red-600 dark:text-red-400 uppercase tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.05)] dark:shadow-[0_0_20px_rgba(239,68,68,0.15)] transition-all duration-1000"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                            </span>
                            Access Restricted
                        </motion.div>
                    </div>

                    {/* Hero Icon */}
                    <div className="relative mb-10 flex justify-center">
                        <motion.div
                            initial={{ rotate: -5, scale: 0.8 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ type: "spring", bounce: 0.5, duration: 1.2, delay: 0.1 }}
                            className="relative"
                        >
                            {/* Neon core glow */}
                            <div className="absolute inset-0 rounded-full bg-purple-500/20 dark:bg-purple-500/40 blur-[30px] transition-colors duration-1000" />

                            {/* The Lock Container */}
                            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-black/5 dark:border-white/15 bg-gradient-to-b from-black/5 to-transparent dark:from-white/10 dark:to-transparent shadow-xl dark:shadow-2xl backdrop-blur-md transition-all duration-1000">
                                <Lock className="h-9 w-9 text-zinc-700 dark:text-white/90 transition-colors duration-1000" strokeWidth={1.5} />
                            </div>

                            {/* Rotating dashed ring */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                className="absolute -inset-5 rounded-full border border-dashed border-zinc-300 dark:border-white/20 transition-colors duration-1000"
                            />
                            {/* Counter-rotating static ring with a glow point */}
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                className="absolute -inset-8 rounded-full border border-zinc-200 dark:border-white/5 transition-colors duration-1000"
                            >
                                <div className="absolute top-0 left-1/2 -ml-1 h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400 blur-[2px] transition-colors duration-1000" />
                                <div className="absolute top-0 left-1/2 -ml-[1px] h-[2px] w-[2px] rounded-full bg-zinc-800 dark:bg-white transition-colors duration-1000" />
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Typography block */}
                    <div className="text-center mb-10 space-y-4">
                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="text-3xl sm:text-4xl font-semibold tracking-tighter text-zinc-900 dark:text-white transition-colors duration-1000"
                        >
                            Membership Expired
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="text-[15px] font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-[280px] mx-auto transition-colors duration-1000"
                        >
                            Your Psychoff Radar privileges are currently inactive. Renew today to instantly regain access to elite live fixtures.
                        </motion.p>
                    </div>

                    {/* Interaction Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="space-y-4"
                    >
                        {/* Primary Premium CTA */}
                        <Button
                            onClick={() => window.open('https://www.psychoff.co.uk/psychoff-radar', '_blank')}
                            className="group relative w-full h-14 overflow-hidden rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 transition-all hover:bg-zinc-800 dark:hover:bg-zinc-200 hover:scale-[1.02] shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-xl dark:hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] border-0"
                        >
                            {/* Hover glint effect */}
                            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 dark:via-black/5 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />

                            <span className="relative flex items-center justify-center gap-2 font-bold tracking-widest text-[13px] uppercase">
                                <Sparkles className="h-4 w-4 text-purple-400 dark:text-purple-600 transition-colors duration-1000" />
                                Purchase Membership
                                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                            </span>
                        </Button>

                        {/* Secondary ghost CTA */}
                        <button
                            onClick={() => router.push('/')}
                            className="group flex w-full h-12 items-center justify-center gap-2 rounded-xl border border-black/5 dark:border-white/5 bg-transparent text-[13px] font-medium text-zinc-500 dark:text-zinc-500 uppercase tracking-wider transition-all hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-800 dark:hover:text-zinc-300 hover:border-black/10 dark:hover:border-white/10"
                        >
                            <User2Icon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                            Return to Profile
                        </button>
                    </motion.div>
                </div>
            </motion.div>

            <style jsx global>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    )
}
