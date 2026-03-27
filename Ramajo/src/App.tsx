import { NavLink, Outlet } from 'react-router-dom';

// ─── App Layout ───────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 bg-white shadow-md border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-cyan-600 flex items-center justify-center">
            <span className="text-sm font-bold text-white">GR</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight">
              Gestor de Processos Ramajo
            </span>
            <span className="text-sm text-slate-500">
              Acompanhamento dos processos em tempo real
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <div className="flex items-center gap-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-5 py-3 text-base font-semibold rounded-lg transition-colors ${
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
              `px-5 py-3 text-base font-semibold rounded-lg transition-colors ${
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
              `px-5 py-3 text-base font-semibold rounded-lg transition-colors ${
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
      <main className="px-6 py-6 lg:px-10 lg:py-8">
        <Outlet />
      </main>

    </div>
  );
}
