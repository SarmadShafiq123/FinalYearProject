import formatBytes from "../../utils/formatBytes"

const StorageBar = ({ storageUsed, storageLimit, planStatus }) => {
  const isLocked = planStatus === "locked" || planStatus === "expired"

  const percentage = isLocked
    ? 100
    : storageLimit > 0
    ? Math.min((storageUsed / storageLimit) * 100, 100)
    : 0

  const getBarColor = () => {
    if (isLocked) return "bg-red-600"
    if (percentage >= 90) return "bg-red-600"
    if (percentage >= 75) return "bg-yellow-500"
    return "bg-blue-600"
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-white">Storage</span>
        <span className="text-xs text-zinc-400">
          {isLocked
            ? "Storage Locked"
            : `${formatBytes(storageUsed)} used of ${formatBytes(storageLimit)}`}
        </span>
      </div>
      <div className="w-full bg-zinc-800 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${getBarColor()}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <p className="text-xs text-zinc-400 mt-1">
        {isLocked ? "Renew your plan to restore access" : `${percentage.toFixed(1)}% used`}
      </p>
    </div>
  )
}

export default StorageBar
