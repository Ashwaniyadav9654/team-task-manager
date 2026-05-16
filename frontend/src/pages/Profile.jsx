import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { usersAPI } from '../services/api'
import { motion } from 'framer-motion'
import { Camera, Save, Shield, User } from 'lucide-react'
import { Avatar } from '../components/common/index.jsx'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, updateUser, isAdmin } = useAuth()
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '' })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Name is required')
    setSaving(true)
    try {
      const { data } = await usersAPI.updateProfile(form)
      updateUser(data.user)
      toast.success('Profile updated!')
    } catch (e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const handleAvatar = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return toast.error('File must be under 5MB')
    setUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = async (ev) => {
        try {
          const { data } = await usersAPI.uploadAvatar({ avatar: ev.target.result })
          updateUser(data.user)
          toast.success('Avatar updated!')
        } catch (e) { toast.error(e.message || 'Upload failed') }
        finally { setUploading(false) }
      }
      reader.readAsDataURL(file)
    } catch { setUploading(false) }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Manage your personal information</p>
      </div>

      <div className="card p-6">
        {/* Avatar */}
        <div className="flex items-center gap-5 mb-8">
          <div className="relative">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-2xl object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-primary-600 flex items-center justify-center text-white text-3xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-full flex items-center justify-center text-slate-500 hover:text-primary-600 shadow-sm transition-colors"
            >
              {uploading ? <div className="w-4 h-4 border-2 border-primary-600/30 border-t-primary-600 rounded-full animate-spin" /> : <Camera size={14} />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{user?.email}</p>
            <div className="flex items-center gap-1.5 mt-1">
              {isAdmin ? (
                <><Shield size={13} className="text-primary-500" /><span className="text-primary-600 dark:text-primary-400 text-xs font-medium">Admin</span></>
              ) : (
                <><User size={13} className="text-slate-400" /><span className="text-slate-500 text-xs">Member</span></>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input value={user?.email} disabled className="input-field opacity-60 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bio</label>
            <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} maxLength={200} className="input-field resize-none" placeholder="Tell your team about yourself..." />
            <p className="text-xs text-slate-400 mt-1 text-right">{form.bio.length}/200</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Member Since</label>
            <input value={user?.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : ''} disabled className="input-field opacity-60 cursor-not-allowed" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
