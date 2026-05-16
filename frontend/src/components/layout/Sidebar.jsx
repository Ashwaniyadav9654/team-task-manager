import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, FolderKanban, CheckSquare, User,
  Settings, LogOut, X, Zap, Shield, ChevronRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' }
]

function SidebarContent({ onClose }) {
  const { user, logout, isAdmin } = useAuth()
  const location = useLocation()

  return (
    <div className="flex flex-col h-full bg-slate-900 dark:bg-slate-950 w-64">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">TeamFlow</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white lg:hidden p-1">
            <X size={18} />
          </button>
        )}
      </div>

      {/* User */}
      <div className="px-4 py-4 border-b border-slate-800">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-lg object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center text-white font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isAdmin ? (
                <><Shield size={10} className="text-primary-400" /><span className="text-primary-400 text-xs font-medium">Admin</span></>
              ) : (
                <span className="text-slate-400 text-xs">Member</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={14} className="text-white/60" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 text-sm font-medium transition-all"
        >
          <LogOut size={18} />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  )
}

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: -264 }}
              animate={{ x: 0 }}
              exit={{ x: -264 }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed left-0 top-0 bottom-0 z-50 lg:hidden"
            >
              <SidebarContent onClose={onClose} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
