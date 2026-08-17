const StatCard = ({ label, value, sub, subRed }) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">{label}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
      {sub && (
        <p className={`text-xs mt-1 ${subRed ? "text-red-400" : "text-zinc-500"}`}>{sub}</p>
      )}
    </div>
  )
}

export default StatCard
