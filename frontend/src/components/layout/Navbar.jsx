import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Menu, Sun, Moon, Bell, Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/tasks?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 sm:px-6 gap-4 flex-shrink-0">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-1"
      >
        <Menu size={22} />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md hidden sm:block">
        <AnimatePresence mode="wait">
          {searchOpen ? (
            <motion.form
              key="search"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleSearch}
              className="flex items-center gap-2"
            >
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks and projects..."
                className="input-field text-sm py-2 flex-1"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X size={18} />
              </button>
            </motion.form>
          ) : (
            <motion.button
              key="search-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-sm bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg w-full max-w-xs"
            >
              <Search size={15} />
              <span>Search...</span>
              <kbd className="ml-auto text-xs bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500">⌘K</kbd>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={toggle}
          className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
        </button>

        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-lg object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center text-white text-xs font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:block">{user?.name}</span>
        </button>
      </div>
    </header>
  )
}
