import useAdminAuth from "../hooks/useAdminAuth"

const AdminNavbar = () => {
  const { admin } = useAdminAuth()

  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-950 flex items-center px-6 shrink-0">
      <div className="ml-auto flex items-center gap-3">
        <span className="text-xs text-zinc-500">{admin?.email}</span>
        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-semibold text-white">
          {admin?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  )
}

export default AdminNavbar
