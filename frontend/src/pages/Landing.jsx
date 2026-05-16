import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, CheckCircle, Users, BarChart3, ArrowRight, Shield, Layers, Clock } from 'lucide-react'

const features = [
  { icon: Layers, title: 'Project Management', desc: 'Organize work into projects with deadlines, priorities, and team assignments.' },
  { icon: CheckCircle, title: 'Task Tracking', desc: 'Create, assign, and track tasks through Todo, In Progress, and Completed stages.' },
  { icon: Users, title: 'Team Collaboration', desc: 'Add team members, assign roles, and work together seamlessly.' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Get real-time insights into project progress and team performance.' },
  { icon: Shield, title: 'Role-Based Access', desc: 'Admins manage everything; members focus on their assigned tasks.' },
  { icon: Clock, title: 'Due Date Tracking', desc: 'Never miss a deadline with overdue indicators and reminders.' }
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-0 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">TeamFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="text-slate-300 hover:text-white text-sm font-medium px-4 py-2 transition-colors"
          >
            Sign in
          </button>
          <button
            onClick={() => navigate('/register')}
            className="bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Get started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 bg-primary-600/10 border border-primary-600/20 text-primary-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Zap size={14} />
            Built for modern teams
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
            Ship faster with<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-violet-400">better teamwork</span>
          </h1>
          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            TeamFlow helps teams manage projects, track tasks, and collaborate effortlessly — all in one beautifully designed platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/register')}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all hover:shadow-lg hover:shadow-primary-600/30"
            >
              Start for free
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-medium px-8 py-4 rounded-xl text-base transition-colors"
            >
              Demo: admin@test.com
            </button>
          </div>
        </motion.div>

        {/* Dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-16 mx-auto max-w-5xl"
        >
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-1 backdrop-blur-sm shadow-2xl">
            <div className="bg-slate-900 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                <div className="flex-1 mx-4 bg-slate-800 rounded-md h-6 text-slate-500 text-xs flex items-center justify-center">app.teamflow.io/dashboard</div>
              </div>
              <div className="p-6 grid grid-cols-4 gap-3">
                {[['12', 'Projects', '#6366f1'], ['48', 'Tasks', '#8b5cf6'], ['32', 'Completed', '#10b981'], ['4', 'Overdue', '#ef4444']].map(([n, l, c]) => (
                  <div key={l} className="bg-slate-800 rounded-xl p-4">
                    <div className="text-2xl font-bold mb-1" style={{ color: c }}>{n}</div>
                    <div className="text-slate-400 text-xs">{l}</div>
                  </div>
                ))}
                <div className="col-span-4 bg-slate-800 rounded-xl p-4 h-28 flex items-end gap-2">
                  {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                    <div key={i} className="flex-1 bg-primary-600/60 rounded-sm" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything your team needs</h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">Powerful features that scale with your team, from small startups to large enterprises.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-primary-600/40 transition-colors group"
            >
              <div className="w-11 h-11 bg-primary-600/10 border border-primary-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-600/20 transition-colors">
                <Icon size={20} className="text-primary-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-br from-primary-600/20 to-violet-600/20 border border-primary-600/20 rounded-3xl p-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-slate-400 text-lg mb-8">Join teams who trust TeamFlow to deliver projects on time.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/register')} className="bg-primary-600 hover:bg-primary-500 text-white font-semibold px-8 py-4 rounded-xl transition-all hover:shadow-lg hover:shadow-primary-600/30 flex items-center gap-2">
              Create free account <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate('/login')} className="text-slate-300 hover:text-white font-medium px-8 py-4 transition-colors">
              Demo credentials →
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        <p>© 2024 TeamFlow. Built for teams who build things.</p>
      </footer>
    </div>
  )
}
