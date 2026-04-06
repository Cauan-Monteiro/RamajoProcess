import { NavLink, Outlet } from 'react-router-dom';

// ─── App Layout ───────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* Navbar */}
      <nav className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 lg:px-8 lg:py-5 bg-white shadow-md border-b border-slate-100 gap-3 sm:gap-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-cyan-600 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-white">GR</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-base sm:text-lg tracking-tight">
              Gestor de Processos Ramajo
            </span>
            <span className="text-sm text-slate-500 hidden sm:block">
              Acompanhamento dos processos em tempo real
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <div className="flex items-center gap-1 sm:gap-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex-1 sm:flex-none text-center px-3 py-2 sm:px-5 sm:py-3 text-sm sm:text-base font-semibold rounded-lg transition-colors ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            Processos
          </NavLink>
          <NavLink
            to="/cadastros"
            className={({ isActive }) =>
              `flex-1 sm:flex-none text-center px-3 py-2 sm:px-5 sm:py-3 text-sm sm:text-base font-semibold rounded-lg transition-colors ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            Cadastros
          </NavLink>
          <NavLink
            to="/registros"
            className={({ isActive }) =>
              `flex-1 sm:flex-none text-center px-3 py-2 sm:px-5 sm:py-3 text-sm sm:text-base font-semibold rounded-lg transition-colors ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            Registros
          </NavLink>
        </div>
      </nav>

      {/* Page content */}
      <main className="px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-8">
        <Outlet />
      </main>

    </div>
  );
}
