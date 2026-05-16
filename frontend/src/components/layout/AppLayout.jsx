import { useState } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { motion } from 'framer-motion'

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
