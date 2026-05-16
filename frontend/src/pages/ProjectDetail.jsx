import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { projectsAPI, tasksAPI, usersAPI } from '../services/api'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Plus, Edit, Trash2, Calendar, Users,
  CheckSquare, Clock, AlertTriangle, UserPlus, UserMinus
} from 'lucide-react'
import { Badge, Avatar, AvatarGroup, EmptyState, Skeleton } from '../components/common/index.jsx'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { format, isPast } from 'date-fns'
import toast from 'react-hot-toast'

const STATUSES = ['Todo', 'In Progress', 'Completed']
const PRIORITIES = ['Low', 'Medium', 'High']

function TaskCard({ task, isAdmin, onEdit, onDelete, onClick }) {
  const overdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'Completed'
  return (
    <div
      onClick={onClick}
      className="card p-4 cursor-pointer hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-slate-800 dark:text-white text-sm truncate group-hover:text-primary-600 dark:group-hover:text-primary-400">{task.title}</h4>
          {task.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{task.description}</p>}
        </div>
        {isAdmin && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" onClick={e => e.stopPropagation()}>
            <button onClick={() => onEdit(task)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-600">
              <Edit size={13} />
            </button>
            <button onClick={() => onDelete(task)} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-slate-400 hover:text-red-500">
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <Badge variant={task.priority === 'High' ? 'high' : task.priority === 'Medium' ? 'medium' : 'low'}>{task.priority}</Badge>
        {task.assignedTo && (
          <div className="flex items-center gap-1">
            <Avatar user={task.assignedTo} size="xs" />
            <span className="text-xs text-slate-500 dark:text-slate-400">{task.assignedTo.name}</span>
          </div>
        )}
        {task.dueDate && (
          <span className={`text-xs flex items-center gap-1 ml-auto ${overdue ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
            {overdue && <AlertTriangle size={11} />}
            <Calendar size={11} />
            {format(new Date(task.dueDate), 'MMM d')}
          </span>
        )}
      </div>
    </div>
  )
}

function TaskForm({ initial, projectMembers, onSubmit, loading }) {
  const [form, setForm] = useState(initial || {
    title: '', description: '', assignedTo: '', priority: 'Medium', status: 'Todo', dueDate: ''
  })
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title *</label>
        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="Task title" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field min-h-20 resize-none" rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="input-field">
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
          <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="input-field">
            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assign To</label>
        <select value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })} className="input-field">
          <option value="">Unassigned</option>
          {projectMembers.map(m => <option key={m.user?._id} value={m.user?._id}>{m.user?.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
        <input type="date" value={form.dueDate ? form.dueDate.split('T')[0] : ''} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="input-field" />
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Saving...' : initial?._id ? 'Update Task' : 'Create Task'}</button>
    </form>
  )
}

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin, user } = useAuth()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [deleteTask, setDeleteTask] = useState(null)
  const [showAddMember, setShowAddMember] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    try {
      const { data } = await projectsAPI.get(id)
      setProject(data.project)
      setTasks(data.tasks)
    } catch { toast.error('Failed to load project'); navigate('/projects') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])
  useEffect(() => { usersAPI.getAll().then(r => setAllUsers(r.data.users)).catch(() => {}) }, [])

  const handleCreateTask = async (form) => {
    setSaving(true)
    try {
      await tasksAPI.create({ ...form, project: id, assignedTo: form.assignedTo || null })
      toast.success('Task created!')
      setShowTaskModal(false)
      load()
    } catch (e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const handleUpdateTask = async (form) => {
    setSaving(true)
    try {
      await tasksAPI.update(editTask._id, { ...form, assignedTo: form.assignedTo || null })
      toast.success('Task updated!')
      setEditTask(null)
      load()
    } catch (e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const handleDeleteTask = async () => {
    setDeleting(true)
    try {
      await tasksAPI.delete(deleteTask._id)
      toast.success('Task deleted')
      setDeleteTask(null)
      load()
    } catch (e) { toast.error(e.message) }
    finally { setDeleting(false) }
  }

  const handleAddMember = async (userId) => {
    try {
      await projectsAPI.addMember(id, { userId })
      toast.success('Member added')
      setShowAddMember(false)
      load()
    } catch (e) { toast.error(e.message) }
  }

  const handleRemoveMember = async (userId) => {
    try {
      await projectsAPI.removeMember(id, userId)
      toast.success('Member removed')
      load()
    } catch (e) { toast.error(e.message) }
  }

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-32" />
      <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64" />)}</div>
    </div>
  )
  if (!project) return null

  const tasksByStatus = {
    'Todo': tasks.filter(t => t.status === 'Todo'),
    'In Progress': tasks.filter(t => t.status === 'In Progress'),
    'Completed': tasks.filter(t => t.status === 'Completed')
  }
  const progress = tasks.length > 0 ? Math.round((tasksByStatus['Completed'].length / tasks.length) * 100) : 0
  const canManage = isAdmin || project.createdBy?._id === user?._id

  const nonMembers = allUsers.filter(u => !project.members?.some(m => m.user?._id === u._id))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/projects')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: project.color }}>{project.title.charAt(0)}</div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white truncate">{project.title}</h1>
            <Badge variant={project.status === 'Active' ? 'success' : 'default'}>{project.status}</Badge>
          </div>
        </div>
        {canManage && (
          <button onClick={() => setShowTaskModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Add Task
          </button>
        )}
      </div>

      {/* Project info */}
      <div className="card p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Description</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{project.description || 'No description'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Deadline</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Calendar size={14} />
              {project.deadline ? format(new Date(project.deadline), 'MMM d, yyyy') : 'No deadline'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Team ({project.members?.length || 0})</p>
            <div className="flex items-center gap-2">
              <AvatarGroup users={project.members?.map(m => m.user).filter(Boolean)} max={5} />
              {canManage && (
                <button onClick={() => setShowAddMember(true)} className="w-7 h-7 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400 hover:border-primary-400 hover:text-primary-500 transition-colors">
                  <Plus size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Overall Progress</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">{progress}% ({tasksByStatus['Completed'].length}/{tasks.length} tasks)</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-2 rounded-full"
              style={{ background: project.color }}
            />
          </div>
        </div>
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {STATUSES.map(status => (
          <div key={status} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${status === 'Todo' ? 'bg-slate-400' : status === 'In Progress' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{status}</h3>
                <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium px-2 py-0.5 rounded-full">{tasksByStatus[status].length}</span>
              </div>
              {canManage && (
                <button onClick={() => setShowTaskModal(true)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-primary-500 transition-colors">
                  <Plus size={16} />
                </button>
              )}
            </div>
            <div className="space-y-3 min-h-24">
              {tasksByStatus[status].map(task => (
                <TaskCard
                  key={task._id}
                  task={task}
                  isAdmin={canManage}
                  onClick={() => navigate(`/tasks/${task._id}`)}
                  onEdit={t => setEditTask({ ...t, assignedTo: t.assignedTo?._id || '' })}
                  onDelete={setDeleteTask}
                />
              ))}
              {tasksByStatus[status].length === 0 && (
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center text-slate-400 text-sm">
                  No {status.toLowerCase()} tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Members panel */}
      {canManage && (
        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Team Members</h3>
          <div className="space-y-3">
            {project.members?.map(m => (
              <div key={m.user?._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar user={m.user} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">{m.user?.name}</p>
                    <p className="text-xs text-slate-500">{m.role}</p>
                  </div>
                </div>
                {canManage && m.user?._id !== project.createdBy?._id && (
                  <button onClick={() => handleRemoveMember(m.user?._id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-slate-400 hover:text-red-500 transition-colors">
                    <UserMinus size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal open={showTaskModal} onClose={() => setShowTaskModal(false)} title="Create Task">
        <TaskForm projectMembers={project.members || []} onSubmit={handleCreateTask} loading={saving} />
      </Modal>
      <Modal open={!!editTask} onClose={() => setEditTask(null)} title="Edit Task">
        {editTask && <TaskForm initial={editTask} projectMembers={project.members || []} onSubmit={handleUpdateTask} loading={saving} />}
      </Modal>
      <Modal open={showAddMember} onClose={() => setShowAddMember(false)} title="Add Member" size="sm">
        <div className="space-y-2">
          {nonMembers.length === 0 ? <p className="text-slate-500 text-sm text-center py-4">All users are already members</p> : nonMembers.map(u => (
            <button key={u._id} onClick={() => handleAddMember(u._id)} className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors text-left">
              <Avatar user={u} size="sm" />
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-white">{u.name}</p>
                <p className="text-xs text-slate-500">{u.email}</p>
              </div>
            </button>
          ))}
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteTask} onClose={() => setDeleteTask(null)} onConfirm={handleDeleteTask} loading={deleting} title="Delete Task" message={`Delete "${deleteTask?.title}"? This cannot be undone.`} />
    </div>
  )
}
