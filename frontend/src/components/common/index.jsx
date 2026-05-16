// Badge component
export function Badge({ children, variant = 'default', size = 'sm' }) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    todo: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    inprogress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    low: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }
  const sizes = { xs: 'text-xs px-1.5 py-0.5', sm: 'text-xs px-2 py-1', md: 'text-sm px-3 py-1' }
  return (
    <span className={`inline-flex items-center font-medium rounded-md ${variants[variant] || variants.default} ${sizes[size]}`}>
      {children}
    </span>
  )
}

// Avatar component
export function Avatar({ user, size = 'md', className = '' }) {
  const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-sm', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base', xl: 'w-14 h-14 text-lg' }
  if (user?.avatar) {
    return <img src={user.avatar} alt={user.name} className={`${sizes[size]} rounded-lg object-cover flex-shrink-0 ${className}`} />
  }
  return (
    <div className={`${sizes[size]} rounded-lg bg-primary-600 flex items-center justify-center text-white font-semibold flex-shrink-0 ${className}`}>
      {user?.name?.charAt(0).toUpperCase() || '?'}
    </div>
  )
}

// AvatarGroup
export function AvatarGroup({ users = [], max = 3, size = 'sm' }) {
  const shown = users.slice(0, max)
  const rest = users.length - max
  const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-7 h-7 text-xs', md: 'w-8 h-8 text-sm' }
  return (
    <div className="flex -space-x-2">
      {shown.map((u, i) => (
        <div key={i} className={`${sizes[size]} rounded-full ring-2 ring-white dark:ring-slate-800 overflow-hidden flex-shrink-0`}>
          {u?.avatar
            ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-primary-600 flex items-center justify-center text-white font-semibold">{u?.name?.charAt(0).toUpperCase()}</div>
          }
        </div>
      ))}
      {rest > 0 && (
        <div className={`${sizes[size]} rounded-full ring-2 ring-white dark:ring-slate-800 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 font-medium flex-shrink-0`}>
          +{rest}
        </div>
      )}
    </div>
  )
}

// Empty state
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
        {Icon && <Icon size={28} className="text-slate-400" />}
      </div>
      <h3 className="text-slate-700 dark:text-slate-300 font-semibold text-lg mb-1">{title}</h3>
      {description && <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  )
}

// Skeleton loader
export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg ${className}`} />
}

// Priority dot
export function PriorityDot({ priority }) {
  const colors = { Low: 'bg-slate-400', Medium: 'bg-amber-400', High: 'bg-red-500' }
  return <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colors[priority] || 'bg-slate-400'}`} />
}
