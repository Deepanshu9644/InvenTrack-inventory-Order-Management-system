export default function StatsCard({ title, value, icon: Icon, gradient }) {
  const gradientMap = {
    indigo: 'from-indigo-600 to-violet-600 shadow-indigo-500/20',
    emerald: 'from-emerald-600 to-teal-600 shadow-emerald-500/20',
    amber: 'from-amber-500 to-orange-600 shadow-amber-500/20',
    rose: 'from-rose-600 to-pink-600 shadow-rose-500/20',
  }

  const borderGlow = {
    indigo: 'hover:border-indigo-500/30',
    emerald: 'hover:border-emerald-500/30',
    amber: 'hover:border-amber-500/30',
    rose: 'hover:border-rose-500/30',
  }

  return (
    <div
      className={`glass-card p-6 hover:-translate-y-1 transition-all duration-300 cursor-default ${borderGlow[gradient] || 'hover:border-indigo-500/30'}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-4xl font-bold text-gray-100 tracking-tight">
            {value ?? '—'}
          </p>
        </div>
        <div
          className={`p-3 rounded-xl bg-gradient-to-br ${gradientMap[gradient] || gradientMap.indigo} shadow-lg`}
        >
          {Icon && <Icon className="w-6 h-6 text-white" />}
        </div>
      </div>
    </div>
  )
}
