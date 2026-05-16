import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { tasksAPI, projectsAPI } from '../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, CheckSquare, Calendar, AlertTriangle, Filter, ArrowUpDown } from 'lucide-react'
import { Badge, Avatar, EmptyState, Skeleton, PriorityDot } from '../components/common/index.jsx'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { format, isPast, formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

export default function Tasks() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [projectFilter, setProjectFilter] = useState('')
  const [sortBy, setSortBy] = useState('-createdAt')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const params = { sort: sortBy }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      if (priorityFilter) params.priority = priorityFilter
      if (projectFilter) params.project = projectFilter
      const { data } = await tasksAPI.getAll(params)
      setTasks(data.tasks)
    } catch { toast.error('Failed to load tasks') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [search, statusFilter, priorityFilter, projectFilter, sortBy])
  useEffect(() => { projectsAPI.getAll().then(r => setProjects(r.data.projects)).catch(() => {}) }, [])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await tasksAPI.delete(deleteTarget._id)
      toast.success('Task deleted')
      setDeleteTarget(null)
      load()
    } catch (e) { toast.error(e.message) }
    finally { setDeleting(false) }
  }

  const statusBadge = (s) => s === 'Completed' ? 'completed' : s === 'In Progress' ? 'inprogress' : 'todo'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tasks</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{tasks.length} tasks found</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." className="input-field pl-9" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field text-sm">
            <option value="">All Status</option>
            <option>Todo</option><option>In Progress</option><option>Completed</option>
          </select>
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="input-field text-sm">
            <option value="">All Priority</option>
            <option>Low</option><option>Medium</option><option>High</option>
          </select>
          <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} className="input-field text-sm">
            <option value="">All Projects</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input-field text-sm">
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="dueDate">Due Date</option>
            <option value="-priority">Priority</option>
          </select>
        </div>
      </div>

      {/* Tasks list */}
      {loading ? (
        <div className="space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : tasks.length === 0 ? (
        <EmptyState icon={CheckSquare} title="No tasks found" description="Try adjusting your filters or create a new task from a project" />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {tasks.map((task, i) => {
              const overdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'Completed'
              return (
                <motion.div
                  key={task._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="card p-4 cursor-pointer hover:shadow-md transition-all group flex items-center gap-4"
                  onClick={() => navigate(`/tasks/${task._id}`)}
                >
                  <div className="w-1 h-12 rounded-full flex-shrink-0" style={{ background: task.project?.color || '#6366f1' }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <PriorityDot priority={task.priority} />
                      <h4 className="font-medium text-slate-800 dark:text-white text-sm truncate group-hover:text-primary-600 dark:group-hover:text-primary-400">{task.title}</h4>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{task.project?.title}</span>
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      <span className="text-xs text-slate-400">{formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {task.dueDate && (
                      <span className={`text-xs hidden sm:flex items-center gap-1 ${overdue ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                        {overdue && <AlertTriangle size={12} />}
                        <Calendar size={12} />
                        {format(new Date(task.dueDate), 'MMM d')}
                      </span>
                    )}
                    {task.assignedTo && <Avatar user={task.assignedTo} size="sm" />}
                    <Badge variant={statusBadge(task.status)}>{task.status}</Badge>
                    {isAdmin && (
                      <button
                        onClick={e => { e.stopPropagation(); setDeleteTarget(task) }}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} title="Delete Task" message={`Delete "${deleteTarget?.title}"?`} />
    </div>
  )
}
