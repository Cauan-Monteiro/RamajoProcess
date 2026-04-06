import { useEffect, useState } from 'react';
import {
  api,
  formatarTempo,
  type Processo,
  type SessaoHistorico,
} from '../shared';

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  historico: SessaoHistorico[] | null;
  carregando: boolean;
  onToggle: () => void;
}) {
  // Agrupar sessões por trave
  const porTrave: Record<string, SessaoHistorico[]> = {};
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
                          <th className="text-left px-3 py-2 font-medium">Banho</th>
                          <th className="text-right px-3 py-2 font-medium">Duração</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessoes.map((s) => (
                          <tr key={s.sessaoId} className="border-t border-slate-100">
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

// ─── Helpers de data ──────────────────────────────────────────────────────────

function toInputDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toLocalISOString(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function inicioUltimos7Dias(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  d.setHours(0, 0, 0, 0);
  return d;
}

function fimHoje(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

// ─── RegistrosPage ────────────────────────────────────────────────────────────

export default function RegistrosPage() {
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [expandidos, setExpandidos] = useState<Set<number>>(new Set());
  const [historicos, setHistoricos] = useState<Record<number, SessaoHistorico[]>>({});
  const [carregando, setCarregando] = useState<Set<number>>(new Set());
  const [erroCarga, setErroCarga] = useState(false);
  const [dataInicio, setDataInicio] = useState<Date>(inicioUltimos7Dias);
  const [dataFim, setDataFim] = useState<Date>(fimHoje);

  useEffect(() => {
    setErroCarga(false);
    setExpandidos(new Set());
    setHistoricos({});
    api.get('/processo/inativo', {
      params: {
        from: toLocalISOString(dataInicio),
        to: toLocalISOString(dataFim),
      },
    })
      .then((res) => setProcessos(res.data))
      .catch(() => setErroCarga(true));
  }, [dataInicio, dataFim]);

  function resetarUltimos7Dias() {
    setDataInicio(inicioUltimos7Dias());
    setDataFim(fimHoje());
  }

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
    } catch {
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
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold text-slate-800">Registros</h1>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={resetarUltimos7Dias}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Últimos 7 dias
          </button>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>De</span>
            <input
              type="date"
              value={toInputDate(dataInicio)}
              max={toInputDate(dataFim)}
              onChange={(e) => {
                if (!e.target.value) return;
                const d = new Date(e.target.value + 'T00:00:00');
                setDataInicio(d);
              }}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <span>até</span>
            <input
              type="date"
              value={toInputDate(dataFim)}
              min={toInputDate(dataInicio)}
              onChange={(e) => {
                if (!e.target.value) return;
                const d = new Date(e.target.value + 'T23:59:59');
                setDataFim(d);
              }}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
        </div>
      </div>

      {erroCarga ? (
        <p className="text-sm text-red-500 text-center mt-16">
          Erro ao carregar registros. Tente recarregar a página.
        </p>
      ) : processos.length === 0 ? (
        <p className="text-sm text-slate-400 text-center mt-16">
          Nenhum processo finalizado no período selecionado.
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
