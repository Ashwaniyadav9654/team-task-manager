import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { dashboardAPI } from '../services/api'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import {
  FolderKanban, CheckSquare, Clock, AlertTriangle,
  TrendingUp, Users, Zap, ArrowRight, Calendar
} from 'lucide-react'
import { Badge, Avatar, Skeleton } from '../components/common/index.jsx'
import { formatDistanceToNow, format, isPast } from 'date-fns'

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']

function StatCard({ label, value, icon: Icon, color, trend, loading }) {
  if (loading) return <Skeleton className="h-28" />
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
          {trend !== undefined && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp size={12} /> {trend}% this month
            </p>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardAPI.get()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const stats = data?.stats || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Here's what's happening with your team today.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
          <Calendar size={15} />
          {format(new Date(), 'EEE, MMM d')}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Projects" value={stats.totalProjects ?? 0} icon={FolderKanban} color="bg-primary-600" loading={loading} />
        <StatCard label="Total Tasks" value={stats.totalTasks ?? 0} icon={CheckSquare} color="bg-violet-600" loading={loading} />
        <StatCard label="Completed" value={stats.completedTasks ?? 0} icon={TrendingUp} color="bg-emerald-600" loading={loading} />
        <StatCard label="Overdue" value={stats.overdueTasks ?? 0} icon={AlertTriangle} color="bg-red-500" loading={loading} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line chart */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Task Activity (6 months)</h3>
          {loading ? <Skeleton className="h-52" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data?.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#f1f5f9' }}
                />
                <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} name="Total" />
                <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Tasks by Status</h3>
          {loading ? <Skeleton className="h-52" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={data?.tasksByStatus?.map(t => ({ name: t._id, value: t.count })) || []} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {(data?.tasksByStatus || []).map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#f1f5f9' }} />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent tasks */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 dark:text-white">Recent Tasks</h3>
            <button onClick={() => navigate('/tasks')} className="text-primary-600 dark:text-primary-400 text-sm hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
          ) : data?.recentTasks?.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No tasks yet</p>
          ) : (
            <div className="space-y-3">
              {(data?.recentTasks || []).slice(0, 5).map(task => {
                const overdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'Completed'
                return (
                  <div
                    key={task._id}
                    onClick={() => navigate(`/tasks/${task._id}`)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors group"
                  >
                    <div className="w-1.5 h-10 rounded-full flex-shrink-0" style={{ background: task.project?.color || '#6366f1' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400">{task.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{task.project?.title}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {overdue && <AlertTriangle size={14} className="text-red-500" />}
                      <Badge variant={task.status === 'Completed' ? 'success' : task.status === 'In Progress' ? 'info' : 'default'}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent projects */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 dark:text-white">Recent Projects</h3>
            <button onClick={() => navigate('/projects')} className="text-primary-600 dark:text-primary-400 text-sm hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
          ) : data?.recentProjects?.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No projects yet</p>
          ) : (
            <div className="space-y-3">
              {(data?.recentProjects || []).slice(0, 5).map(project => (
                <div
                  key={project._id}
                  onClick={() => navigate(`/projects/${project._id}`)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer group transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: project.color }}>
                    {project.title.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400">{project.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {project.deadline ? `Due ${format(new Date(project.deadline), 'MMM d')}` : 'No deadline'}
                    </p>
                  </div>
                  <Badge variant={project.status === 'Active' ? 'success' : project.status === 'Planning' ? 'info' : 'default'}>
                    {project.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Completion rate */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-800 dark:text-white">Overall Completion Rate</h3>
          <span className="text-2xl font-bold text-primary-600">{stats.completionRate ?? 0}%</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats.completionRate ?? 0}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="bg-gradient-to-r from-primary-500 to-emerald-500 h-3 rounded-full"
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-2">
          <span>{stats.completedTasks ?? 0} completed</span>
          <span>{(stats.totalTasks ?? 0) - (stats.completedTasks ?? 0)} remaining</span>
        </div>
      </div>
    </div>
  )
}
