import { useEffect, useState } from 'react';
import {
  api,
  formatarTempo,
  type Estagio,
  type Processo,
  type TraveBanhoHistorico,
} from '../shared';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ESTAGIO_LABEL: Record<Estagio, string> = {
  PRE_TRATAMENTO: 'Pré-Tratamento',
  TRATAMENTO: 'Tratamento',
  POS_TRATAMENTO: 'Pós-Tratamento',
};

const ESTAGIO_COR: Record<Estagio, string> = {
  PRE_TRATAMENTO: 'bg-slate-100 text-slate-600 border-slate-200',
  TRATAMENTO: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  POS_TRATAMENTO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

function formatarData(date: Date | string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// ─── ProcessoRegistroCard ──────────────────────────────────────────────────────

function ProcessoRegistroCard({
  processo,
  expandido,
  historico,
  carregando,
  onToggle,
}: {
  processo: Processo;
  expandido: boolean;
  historico: TraveBanhoHistorico[] | null;
  carregando: boolean;
  onToggle: () => void;
}) {
  // Agrupar sessões por trave
  const porTrave: Record<string, TraveBanhoHistorico[]> = {};
  if (historico) {
    for (const s of historico) {
      (porTrave[s.traveNome] ??= []).push(s);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-l-4 border-l-slate-400 border-slate-100 shadow-md overflow-hidden">
      {/* Cabeçalho — sempre visível */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left px-5 py-5 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-base font-bold text-slate-800">
                OS {processo.numOS}
              </span>
              {processo.tempoTotalMinutos != null && (
                <span className="inline-flex items-center gap-1 text-sm text-slate-500">
                  <span className="text-slate-400">⏱</span>
                  {formatarTempo(processo.tempoTotalMinutos)}
                </span>
              )}
              <span className="text-sm text-slate-400">
                📅 {formatarData(processo.createdAt)}
                {processo.finishedAt && (
                  <span> → {formatarData(processo.finishedAt)}</span>
                )}
              </span>
            </div>
            {processo.nomesTraves && processo.nomesTraves.length > 0 && (
              <p className="mt-1 text-xs text-slate-500">
                Traves: {processo.nomesTraves.join(', ')}
              </p>
            )}
          </div>
          <span className="text-slate-400 text-xs mt-0.5 shrink-0">
            {expandido ? '▲' : '▼'}
          </span>
        </div>
      </button>

      {/* Corpo expandido */}
      {expandido && (
        <div className="border-t border-slate-100 px-5 py-4">
          {carregando ? (
            <p className="text-xs text-slate-400 text-center py-4">Carregando histórico…</p>
          ) : historico && historico.length === 0 ? (
            <p className="text-xs text-slate-400">Nenhuma sessão de banho registrada.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {Object.entries(porTrave).map(([traveNome, sessoes]) => (
                <div key={traveNome}>
                  <p className="text-xs font-semibold text-slate-700 mb-2">{traveNome}</p>
                  <div className="rounded-lg border border-slate-100 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500">
                          <th className="text-left px-3 py-2 font-medium">Estágio</th>
                          <th className="text-left px-3 py-2 font-medium">Banho</th>
                          <th className="text-right px-3 py-2 font-medium">Duração</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessoes.map((s) => (
                          <tr key={s.traveBanhoId} className="border-t border-slate-100">
                            <td className="px-3 py-2">
                              {s.banhoEstagio ? (
                                <span
                                  className={`inline-block rounded border px-1.5 py-0.5 text-[11px] font-medium ${ESTAGIO_COR[s.banhoEstagio]}`}
                                >
                                  {ESTAGIO_LABEL[s.banhoEstagio]}
                                </span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-slate-700">{s.banhoNome}</td>
                            <td className="px-3 py-2 text-right text-slate-600">
                              {s.duracaoMinutos != null
                                ? formatarTempo(s.duracaoMinutos)
                                : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── RegistrosPage ────────────────────────────────────────────────────────────

export default function RegistrosPage() {
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [expandidos, setExpandidos] = useState<Set<number>>(new Set());
  const [historicos, setHistoricos] = useState<Record<number, TraveBanhoHistorico[]>>({});
  const [carregando, setCarregando] = useState<Set<number>>(new Set());

  useEffect(() => {
    api.get('/processo/inativo').then((res) => setProcessos(res.data)).catch(console.error);
  }, []);

  async function toggleExpandir(id: number) {
    if (expandidos.has(id)) {
      setExpandidos((prev) => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
      return;
    }

    setExpandidos((prev) => new Set(prev).add(id));

    if (historicos[id] !== undefined) return; // já carregado

    setCarregando((prev) => new Set(prev).add(id));
    try {
      const res = await api.get(`/processo/${id}/historico`);
      setHistoricos((prev) => ({ ...prev, [id]: res.data }));
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
      setHistoricos((prev) => ({ ...prev, [id]: [] }));
    } finally {
      setCarregando((prev) => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-6">Registros</h1>

      {processos.length === 0 ? (
        <p className="text-sm text-slate-400 text-center mt-16">
          Nenhum processo finalizado ainda.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {processos.map((proc) => (
            <ProcessoRegistroCard
              key={proc.id}
              processo={proc}
              expandido={expandidos.has(proc.id)}
              historico={historicos[proc.id] ?? null}
              carregando={carregando.has(proc.id)}
              onToggle={() => toggleExpandir(proc.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
