import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { usersAPI } from '../services/api'
import { Sun, Moon, Lock, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Settings() {
  const { dark, toggle } = useTheme()
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match')
    if (pwForm.newPassword.length < 8) return toast.error('Password must be at least 8 characters')
    setSaving(true)
    try {
      await usersAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      toast.success('Password changed successfully')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Customize your experience</p>
      </div>

      {/* Appearance */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Appearance</h2>
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
          <div className="flex items-center gap-3">
            {dark ? <Moon size={20} className="text-primary-400" /> : <Sun size={20} className="text-amber-500" />}
            <div>
              <p className="font-medium text-slate-800 dark:text-white text-sm">{dark ? 'Dark Mode' : 'Light Mode'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Toggle between light and dark theme</p>
            </div>
          </div>
          <button
            onClick={toggle}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${dark ? 'bg-primary-600' : 'bg-slate-300'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${dark ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </div>

      {/* Password */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <Lock size={18} /> Change Password
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
            <input
              type="password"
              value={pwForm.currentPassword}
              onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
            <input
              type="password"
              value={pwForm.newPassword}
              onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
              className="input-field"
              placeholder="Min 8 characters"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={pwForm.confirmPassword}
              onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
              className="input-field"
              placeholder="Repeat new password"
              required
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            <Save size={16} /> {saving ? 'Saving...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* About */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-800 dark:text-white mb-3">About</h2>
        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <p>TeamFlow v1.0.0</p>
          <p>A modern project and task management platform for teams.</p>
          <p className="text-xs text-slate-400">Built with React, Node.js, MongoDB</p>
        </div>
      </div>
    </div>
  )
}
