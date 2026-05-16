import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { tasksAPI } from '../services/api'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Clock, MessageSquare, Activity, Send, AlertTriangle, Edit2, Check } from 'lucide-react'
import { Badge, Avatar } from '../components/common/index.jsx'
import { format, isPast, formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

const STATUSES = ['Todo', 'In Progress', 'Completed']

export default function TaskDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [posting, setPosting] = useState(false)
  const [editStatus, setEditStatus] = useState(false)

  const load = async () => {
    try {
      const { data } = await tasksAPI.get(id)
      setTask(data.task)
    } catch { toast.error('Failed to load task'); navigate('/tasks') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  const handleStatusChange = async (status) => {
    try {
      const { data } = await tasksAPI.update(id, { status })
      setTask(data.task)
      toast.success(`Status updated to ${status}`)
      setEditStatus(false)
    } catch (e) { toast.error(e.message) }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    setPosting(true)
    try {
      const { data } = await tasksAPI.comment(id, { text: comment.trim() })
      setTask(prev => ({ ...prev, comments: data.comments, activity: data.activity }))
      setComment('')
    } catch (e) { toast.error(e.message) }
    finally { setPosting(false) }
  }

  if (loading) return (
    <div className="space-y-4">
      <div className="h-8 w-32 animate-pulse bg-slate-200 dark:bg-slate-700 rounded" />
      <div className="h-64 animate-pulse bg-slate-200 dark:bg-slate-700 rounded-xl" />
    </div>
  )
  if (!task) return null

  const overdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'Completed'

  return (
    <div className="max-w-4xl space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm transition-colors">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-snug flex-1">{task.title}</h1>
              {overdue && (
                <div className="flex items-center gap-1.5 text-red-500 text-xs font-medium bg-red-50 dark:bg-red-900/20 px-2.5 py-1 rounded-full flex-shrink-0">
                  <AlertTriangle size={13} /> Overdue
                </div>
              )}
            </div>
            {task.description && (
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">{task.description}</p>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant={task.priority === 'High' ? 'high' : task.priority === 'Medium' ? 'medium' : 'low'}>
                {task.priority} Priority
              </Badge>
              <div
                className="cursor-pointer"
                onClick={() => setEditStatus(!editStatus)}
              >
                <Badge variant={task.status === 'Completed' ? 'completed' : task.status === 'In Progress' ? 'inprogress' : 'todo'}>
                  {task.status} <Edit2 size={10} className="ml-1 inline" />
                </Badge>
              </div>
            </div>
            {editStatus && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex gap-2 flex-wrap">
                {STATUSES.map(s => (
                  <button key={s} onClick={() => handleStatusChange(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${task.status === s ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                    {s}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Comments */}
          <div className="card p-6">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <MessageSquare size={18} /> Comments ({task.comments?.length || 0})
            </h3>
            <div className="space-y-4 mb-4 max-h-72 overflow-y-auto">
              {task.comments?.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">No comments yet. Be the first!</p>
              ) : task.comments?.map(c => (
                <div key={c._id} className="flex gap-3">
                  <Avatar user={c.user} size="sm" className="flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-800 dark:text-white">{c.user?.name}</span>
                      <span className="text-xs text-slate-400">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-lg px-3 py-2">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleComment} className="flex gap-2">
              <Avatar user={user} size="sm" className="flex-shrink-0 mt-0.5" />
              <div className="flex-1 flex gap-2">
                <input
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="input-field text-sm flex-1"
                />
                <button type="submit" disabled={posting || !comment.trim()} className="btn-primary px-3 py-2 flex-shrink-0">
                  <Send size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Project</p>
                <button
                  onClick={() => navigate(`/projects/${task.project?._id}`)}
                  className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  <div className="w-3 h-3 rounded" style={{ background: task.project?.color }} />
                  {task.project?.title}
                </button>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Assigned To</p>
                {task.assignedTo ? (
                  <div className="flex items-center gap-2">
                    <Avatar user={task.assignedTo} size="sm" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{task.assignedTo.name}</span>
                  </div>
                ) : <p className="text-sm text-slate-400">Unassigned</p>}
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Created By</p>
                <div className="flex items-center gap-2">
                  <Avatar user={task.createdBy} size="sm" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{task.createdBy?.name}</span>
                </div>
              </div>
              {task.dueDate && (
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Due Date</p>
                  <p className={`text-sm flex items-center gap-1 ${overdue ? 'text-red-500 font-medium' : 'text-slate-700 dark:text-slate-300'}`}>
                    <Calendar size={14} />
                    {format(new Date(task.dueDate), 'MMM d, yyyy')}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Created</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {format(new Date(task.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
              {task.completedAt && (
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Completed</p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Check size={14} /> {format(new Date(task.completedAt), 'MMM d, yyyy')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Activity */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-4 flex items-center gap-2">
              <Activity size={16} /> Activity
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {task.activity?.slice().reverse().map((a, i) => (
                <div key={i} className="flex gap-2 text-xs">
                  <Avatar user={a.user} size="xs" className="flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{a.user?.name}</span>
                    <span className="text-slate-500 dark:text-slate-400"> {a.action}</span>
                    {a.newValue && <span className="text-slate-500"> → <span className="font-medium text-slate-700 dark:text-slate-300">{a.newValue}</span></span>}
                    <p className="text-slate-400 mt-0.5">{formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
