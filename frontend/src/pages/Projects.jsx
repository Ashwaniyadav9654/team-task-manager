import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { projectsAPI, usersAPI } from '../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, FolderKanban, Calendar, Users, Search, Filter, Trash2, Edit, ChevronRight } from 'lucide-react'
import { Badge, AvatarGroup, EmptyState, Skeleton } from '../components/common/index.jsx'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { format, isPast } from 'date-fns'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled']
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High']
const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899']

function ProjectForm({ initial, users, onSubmit, loading }) {
  const [form, setForm] = useState(initial || {
    title: '', description: '', deadline: '', status: 'Planning',
    priority: 'Medium', color: '#6366f1', tags: '', members: []
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Title is required')
    onSubmit({
      ...form,
      tags: typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : form.tags
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title *</label>
        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="Project name" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field min-h-20 resize-none" placeholder="Describe the project..." rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="input-field">
            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
          <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="input-field">
            {PRIORITY_OPTIONS.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Deadline</label>
        <input type="date" value={form.deadline ? form.deadline.split('T')[0] : ''} onChange={e => setForm({ ...form, deadline: e.target.value })} className="input-field" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Color</label>
        <div className="flex items-center gap-2 flex-wrap">
          {COLORS.map(c => (
            <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
              className={`w-7 h-7 rounded-lg transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-slate-500 scale-110' : ''}`}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Members</label>
        <div className="space-y-2 max-h-36 overflow-y-auto">
          {users.map(u => (
            <label key={u._id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 p-2 rounded-lg">
              <input
                type="checkbox"
                checked={form.members.includes(u._id)}
                onChange={e => setForm({ ...form, members: e.target.checked ? [...form.members, u._id] : form.members.filter(id => id !== u._id) })}
                className="rounded"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">{u.name}</span>
              <span className="text-xs text-slate-400">{u.email}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tags (comma separated)</label>
        <input value={typeof form.tags === 'string' ? form.tags : form.tags?.join(', ') || ''} onChange={e => setForm({ ...form, tags: e.target.value })} className="input-field" placeholder="react, backend, design" />
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Saving...' : initial ? 'Update Project' : 'Create Project'}
      </button>
    </form>
  )
}

export default function Projects() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [editProject, setEditProject] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const loadProjects = async () => {
    try {
      const params = {}
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      const { data } = await projectsAPI.getAll(params)
      setProjects(data.projects)
    } catch { toast.error('Failed to load projects') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadProjects() }, [search, statusFilter])
  useEffect(() => { usersAPI.getAll().then(r => setUsers(r.data.users)).catch(() => {}) }, [])

  const handleCreate = async (form) => {
    setSaving(true)
    try {
      await projectsAPI.create(form)
      toast.success('Project created!')
      setShowCreate(false)
      loadProjects()
    } catch (e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const handleUpdate = async (form) => {
    setSaving(true)
    try {
      await projectsAPI.update(editProject._id, form)
      toast.success('Project updated!')
      setEditProject(null)
      loadProjects()
    } catch (e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await projectsAPI.delete(deleteTarget._id)
      toast.success('Project deleted')
      setDeleteTarget(null)
      loadProjects()
    } catch (e) { toast.error(e.message) }
    finally { setDeleting(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Projects</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{projects.length} projects total</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> New Project
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="input-field pl-9"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field sm:w-44">
          <option value="">All Status</option>
          {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Projects grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-52" />)}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description={search || statusFilter ? "Try adjusting your filters" : isAdmin ? "Create your first project to get started" : "You haven't been added to any projects yet"}
          action={isAdmin && !search && !statusFilter ? (
            <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Create Project
            </button>
          ) : null}
        />
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {projects.map(project => {
              const progress = project.taskStats?.total > 0
                ? Math.round((project.taskStats.completed / project.taskStats.total) * 100) : 0
              const overdue = project.deadline && isPast(new Date(project.deadline)) && project.status !== 'Completed'
              return (
                <motion.div
                  key={project._id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="card p-5 flex flex-col gap-4 hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => navigate(`/projects/${project._id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: project.color }}>
                        {project.title.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-800 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{project.title}</h3>
                        <Badge variant={project.priority === 'High' ? 'high' : project.priority === 'Medium' ? 'medium' : 'low'}>{project.priority}</Badge>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setEditProject({ ...project, members: project.members?.map(m => m.user?._id || m.user) || [] })} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-slate-700 dark:hover:text-slate-300">
                          <Edit size={15} />
                        </button>
                        <button onClick={() => setDeleteTarget(project)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-slate-400 hover:text-red-500">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </div>

                  {project.description && (
                    <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed">{project.description}</p>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: project.color }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <AvatarGroup users={project.members?.map(m => m.user).filter(Boolean)} max={3} />
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <CheckSquare size={13} />
                        {project.taskStats?.total || 0}
                      </span>
                      {project.deadline && (
                        <span className={`flex items-center gap-1 ${overdue ? 'text-red-500 font-medium' : ''}`}>
                          <Calendar size={13} />
                          {overdue ? 'Overdue' : format(new Date(project.deadline), 'MMM d')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700">
                    <Badge variant={project.status === 'Active' ? 'success' : project.status === 'Completed' ? 'primary' : project.status === 'Cancelled' ? 'danger' : 'default'}>
                      {project.status}
                    </Badge>
                    <span className="text-primary-600 dark:text-primary-400 text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
                      View <ChevronRight size={13} />
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Project" size="lg">
        <ProjectForm users={users} onSubmit={handleCreate} loading={saving} />
      </Modal>

      <Modal open={!!editProject} onClose={() => setEditProject(null)} title="Edit Project" size="lg">
        {editProject && (
          <ProjectForm
            initial={{ ...editProject, tags: editProject.tags?.join(', ') || '', deadline: editProject.deadline?.split('T')[0] || '' }}
            users={users}
            onSubmit={handleUpdate}
            loading={saving}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This will also delete all associated tasks.`}
      />
    </div>
  )
}

// Need this import
function CheckSquare({ size, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  )
}
