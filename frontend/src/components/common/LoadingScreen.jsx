import { Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center"
        >
          <Zap size={24} className="text-white" />
        </motion.div>
        <p className="text-slate-400 text-sm font-medium">Loading TeamFlow...</p>
      </motion.div>
    </div>
  )
}
