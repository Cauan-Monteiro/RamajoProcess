import { Fragment, useEffect, useState } from 'react';
import Modal from '../components/Modal';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
import {
  api,
  calcularProgressoBanho,
  formatarTempoDecorrido,
  type AlertType,
  type Banho,
  type Estagio,
  type Trave,
  type TraveEmBanho,
} from '../shared';

// ─── ProcessoPos ──────────────────────────────────────────────────────────────

interface ProcessoPos {
  processoId: number;
  processoNumOS: string;
  traves: TraveEmBanho[];
  prontoParaFinalizar: boolean;
}

// ─── Cronômetro helpers ───────────────────────────────────────────────────────

function corTempo(iniciadoEm: string, tempoBanho: number | null): string {
  if (!tempoBanho) return 'text-slate-400';
  const p = calcularProgressoBanho(iniciadoEm, tempoBanho);
  if (p >= 100) return 'text-red-600 font-semibold';
  if (p >= 80) return 'text-amber-500 font-medium';
  return 'text-emerald-600';
}

function corCard(traves: TraveEmBanho[]): string {
  const progresses = traves
    .filter((t) => t.iniciadoEm !== null && t.tempoBanho !== null)
    .map((t) => calcularProgressoBanho(t.iniciadoEm!, t.tempoBanho!));
  if (progresses.some((p) => p >= 100)) return 'bg-red-500';
  if (progresses.some((p) => p >= 80)) return 'bg-amber-400';
  if (progresses.length > 0) return 'bg-emerald-500';
  return 'bg-slate-300';
}

// ─── BanhoCard ────────────────────────────────────────────────────────────────

function BanhoCard({
  banho,
  traves,
  onClick,
}: {
  banho: Banho;
  traves: TraveEmBanho[];
  onClick: () => void;
}) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const compartilhado = banho.areas.length > 1;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border shadow-md px-5 py-5 cursor-pointer hover:shadow-lg active:scale-[0.99] active:shadow-sm transition-all border-l-4 ${
        traves.length > 0
          ? compartilhado ? 'border-l-violet-400' : 'border-l-cyan-400'
          : 'border-l-slate-200'
      } border-slate-100`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-slate-800">{banho.nome}</span>
          {compartilhado && (
            <span className="inline-flex items-center rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-600 border border-violet-200">
              Compartilhado
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {traves.length > 0 && (
            <span className={`h-2.5 w-2.5 rounded-full ${corCard(traves)}`} />
          )}
          <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-sm font-semibold border ${
            compartilhado
              ? 'bg-violet-50 text-violet-700 border-violet-200'
              : 'bg-cyan-50 text-cyan-700 border-cyan-200'
          }`}>
            {traves.length} {traves.length === 1 ? 'trave' : 'traves'}
          </span>
        </div>
      </div>
      {banho.descricao && (
        <p className="text-xs text-slate-500 mb-3">{banho.descricao}</p>
      )}
      {traves.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {traves.map((t) => (
            <li
              key={t.traveId}
              className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm"
            >
              <span>
                <span className="font-medium text-slate-800">{t.traveNome}</span>
                <span className="text-slate-400 ml-1.5">OS {t.processoNumOS}</span>
              </span>
              {t.iniciadoEm && (
                <span className={`text-sm tabular-nums font-medium ${corTempo(t.iniciadoEm, t.tempoBanho)}`}>
                  {formatarTempoDecorrido(t.iniciadoEm)}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── ProcessoPosCard ──────────────────────────────────────────────────────────

function ProcessoPosCard({
  processo,
  onFinalizar,
  onLiberarTrave,
}: {
  processo: ProcessoPos;
  onFinalizar: (id: number) => void;
  onLiberarTrave: (processoId: number, traveId: number) => void;
}) {
  return (
    <div className={`bg-white rounded-xl border shadow-md px-5 py-5 border-l-4 ${
      processo.prontoParaFinalizar ? 'border-l-emerald-400' : 'border-l-amber-400'
    } border-slate-100`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <span className="text-base font-bold text-slate-800">OS {processo.processoNumOS}</span>
          <span className="ml-2 text-sm text-slate-400">
            {processo.traves.length} {processo.traves.length === 1 ? 'trave' : 'traves'}
          </span>
        </div>
        <button
          type="button"
          disabled={!processo.prontoParaFinalizar}
          onClick={() => onFinalizar(processo.processoId)}
          className="w-full sm:w-auto rounded-lg bg-emerald-600 px-5 py-3 text-base font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Finalizar processo
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {processo.traves.map((t) => {
          const pronta = t.estagioAtual === 'POS_TRATAMENTO';
          return (
            <li
              key={t.traveId}
              className={`flex flex-wrap items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                pronta
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              <span className="font-medium">{t.traveNome}</span>
              <div className="flex items-center gap-2">
                {!pronta && <span className="text-sm opacity-70">em tratamento</span>}
                {pronta && (
                  <>
                    <span className="text-sm font-semibold">✓ pronta</span>
                    <button
                      type="button"
                      onClick={() => onLiberarTrave(processo.processoId, t.traveId)}
                      className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors min-w-[72px]"
                    >
                      Liberar
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {!processo.prontoParaFinalizar && (
        <p className="mt-3 text-xs text-amber-600 font-medium">
          Aguardando conclusão de todas as traves para finalizar.
        </p>
      )}
    </div>
  );
}

// ─── ProcessosPage ────────────────────────────────────────────────────────────

const TAB_LABELS: Record<Estagio, string> = {
  PRE_TRATAMENTO: 'Pré-Tratamento',
  TRATAMENTO: 'Tratamento',
  POS_TRATAMENTO: 'Pós-Tratamento',
};

const TAB_LABELS_SHORT: Record<Estagio, string> = {
  PRE_TRATAMENTO: 'Pré',
  TRATAMENTO: 'Trat.',
  POS_TRATAMENTO: 'Pós',
};

const TABS: Estagio[] = ['PRE_TRATAMENTO', 'TRATAMENTO', 'POS_TRATAMENTO'];

const NEXT_ESTAGIO: Partial<Record<Estagio, Estagio>> = {
  PRE_TRATAMENTO: 'TRATAMENTO',
  TRATAMENTO: 'POS_TRATAMENTO',
};

const PREV_ESTAGIO: Partial<Record<Estagio, Estagio>> = {
  TRATAMENTO: 'PRE_TRATAMENTO',
  POS_TRATAMENTO: 'TRATAMENTO',
};

export default function ProcessosPage() {

  // ── Tab ────────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<Estagio>('PRE_TRATAMENTO');

  // ── Banhos & traves por banho ──────────────────────────────────────────────
  const [banhos, setBanhos] = useState<Banho[]>([]);
  const [travesPorBanho, setTravesPorBanho] = useState<Record<number, TraveEmBanho[]>>({});

  // ── Modal mover traves ─────────────────────────────────────────────────────
  const [banhoAberto, setBanhoAberto] = useState<Banho | null>(null);
  const [travesSelecionadasMover, setTravesSelecionadasMover] = useState<number[]>([]);
  const [banhoDestinoId, setBanhoDestinoId] = useState<number | null>(null);
  const [movendo, setMovendo] = useState(false);
  const [concluindo, setConcluindo] = useState(false);

  // ── Modal criar processo ───────────────────────────────────────────────────
  const [isModalCriarOpen, setIsModalCriarOpen] = useState(false);
  const [novoNumOS, setNovoNumOS] = useState('');
  const [scanSuccess, setScanSuccess] = useState<string | null>(null);
  const { openScanner, scannerModal } = useBarcodeScanner();
  const [travesSelecionadas, setTravesSelecionadas] = useState<number[]>([]);
  const [travesLivres, setTravesLivres] = useState<Trave[]>([]);

  // ── Processos ativos (para modal adicionar trave) ──────────────────────────
  const [processosAtivos, setProcessosAtivos] = useState<{ id: number; numOS: string }[]>([]);

  // ── Modal adicionar trave a processo ───────────────────────────────────────
  const [isModalAdicionarOpen, setIsModalAdicionarOpen] = useState(false);
  const [adicionarProcessoId, setAdicionarProcessoId] = useState<number | null>(null);
  const [adicionarTraveId, setAdicionarTraveId] = useState<number | null>(null);
  const [adicionarBanhoId, setAdicionarBanhoId] = useState<number | null>(null);

  // ── POS_TRATAMENTO cards ───────────────────────────────────────────────────
  const [processosPos, setProcessosPos] = useState<ProcessoPos[]>([]);

  // ── Alert ──────────────────────────────────────────────────────────────────
  const [alertState, setAlertState] = useState<{
    open: boolean;
    title: string;
    message: string;
    type: AlertType;
  }>({
    open: false,
    title: '',
    message: '',
    type: 'info',
  });

  // ── Data fetching ──────────────────────────────────────────────────────────

  async function carregarTudo() {
    try {
      const [banhosRes, processosRes] = await Promise.all([
        api.get('/banho'),
        api.get('/processo/ativo'),
      ]);

      const banhosData: Banho[] = banhosRes.data;
      setBanhos(banhosData);

      const processos: { id: number; numOS: string }[] = processosRes.data;
      setProcessosAtivos(processos);

      const travesAtivasMap: Record<number, TraveEmBanho[]> = {};
      const processosPosMap: Record<number, ProcessoPos> = {};

      await Promise.all(
        processos.map(async (proc) => {
          try {
            const travesRes = await api.get(`/processo/${proc.id}/traves`);
            const todas = (travesRes.data as TraveEmBanho[]).map((t) => ({
              ...t,
              processoId: proc.id,
              processoNumOS: proc.numOS,
            }));

            for (const t of todas) {
              if (t.emSessao && t.banhoId !== null) {
                if (!travesAtivasMap[t.banhoId]) travesAtivasMap[t.banhoId] = [];
                travesAtivasMap[t.banhoId].push(t);
              }
            }

            // Build processosPos: include processo if any trave has estagioAtual='POS_TRATAMENTO'
            const temPos = todas.some((t) => t.estagioAtual === 'POS_TRATAMENTO');
            if (temPos) {
              processosPosMap[proc.id] = {
                processoId: proc.id,
                processoNumOS: proc.numOS,
                traves: todas,
                prontoParaFinalizar: todas.every((t) => t.estagioAtual === 'POS_TRATAMENTO'),
              };
            }
          } catch {
            /* silent */
          }
        })
      );

      setTravesPorBanho(travesAtivasMap);
      setProcessosPos(Object.values(processosPosMap));
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
  }

  async function carregarTravesLivres() {
    try {
      const res = await api.get('/trave/disponiveis');
      setTravesLivres(res.data);
    } catch {
      /* silent — modal de criar processo simplesmente não exibe traves */
    }
  }

  useEffect(() => {
    carregarTudo();
  }, []);

  // ── Criar processo ─────────────────────────────────────────────────────────

  function openModalCriar() {
    carregarTravesLivres();
    setIsModalCriarOpen(true);
  }

  function cancelModalCriar() {
    setNovoNumOS('');
    setTravesSelecionadas([]);
    setScanSuccess(null);
    setIsModalCriarOpen(false);
  }

  async function confirmarCriacao() {
    try {
      const resposta = await api.post('/processo', {
        numOS: novoNumOS,
        idsTraves: travesSelecionadas,
      });

      const processoId: number = resposta.data.id;
      const banhoSabao = banhos.find(
        (b) => b.nome === 'Sabão' && b.areas.some((a) => a.nome === 'PRE_TRATAMENTO')
      );

      if (banhoSabao) {
        await Promise.all(
          travesSelecionadas.map((traveId) =>
            api.post('/trave_sessao', {
              processoId,
              traveIds: [traveId],
              banhoId: banhoSabao.id,
            })
          )
        );
      }

      setIsModalCriarOpen(false);
      setNovoNumOS('');
      setTravesSelecionadas([]);
      setScanSuccess(null);
      await carregarTudo();
      setAlertState({
        open: true,
        title: 'Processo criado',
        message: banhoSabao
          ? 'Processo criado e traves iniciadas no banho Sabão.'
          : 'Processo criado, mas o banho Sabão não foi encontrado.',
        type: 'success',
      });
    } catch {
      setAlertState({
        open: true,
        title: 'Erro ao criar processo',
        message: 'Erro ao salvar o processo. Verifique os dados e tente novamente.',
        type: 'error',
      });
    }
  }

  // ── Mover traves ───────────────────────────────────────────────────────────

  function abrirModalBanho(banho: Banho) {
    setBanhoAberto(banho);
    setTravesSelecionadasMover(
      (travesPorBanho[banho.id] ?? []).map((t) => t.traveId)
    );
    const destinos = banhosFiltrados.filter((b) => b.id !== banho.id);
    setBanhoDestinoId(destinos.length === 1 ? destinos[0].id : null);
  }

  function fecharModalMover() {
    setBanhoAberto(null);
    setTravesSelecionadasMover([]);
    setBanhoDestinoId(null);
  }

  async function moverTraves() {
    if (!banhoAberto || banhoDestinoId === null) return;
    setMovendo(true);
    try {
      for (const traveId of travesSelecionadasMover) {
        const trave = travesPorBanho[banhoAberto.id]?.find((t) => t.traveId === traveId);
        if (!trave) continue;
        await api.put(`/trave_sessao/finalizar/${trave.sessaoId}`);
        await api.post('/trave_sessao', {
          processoId: trave.processoId,
          traveIds: [traveId],
          banhoId: banhoDestinoId,
        });
      }
      fecharModalMover();
      await carregarTudo();
    } catch {
      setAlertState({
        open: true,
        title: 'Erro ao mover traves',
        message: 'Não foi possível mover as traves. Tente novamente.',
        type: 'error',
      });
    } finally {
      setMovendo(false);
    }
  }

  async function concluirNoEstagioAtual() {
    if (!banhoAberto) return;
    setConcluindo(true);
    try {
      for (const traveId of travesSelecionadasMover) {
        const trave = travesPorBanho[banhoAberto.id]?.find((t) => t.traveId === traveId);
        if (!trave?.sessaoId) continue;
        await api.put(`/trave_sessao/${trave.sessaoId}/avancar-estagio`, {
          proximoEstagio: activeTab,
        });
      }
      fecharModalMover();
      await carregarTudo();
    } catch {
      setAlertState({
        open: true,
        title: 'Erro ao concluir',
        message: 'Não foi possível concluir o tratamento. Tente novamente.',
        type: 'error',
      });
    } finally {
      setConcluindo(false);
    }
  }

  // ── Adicionar trave a processo ativo ───────────────────────────────────────

  function fecharModalAdicionar() {
    setIsModalAdicionarOpen(false);
    setAdicionarProcessoId(null);
    setAdicionarTraveId(null);
    setAdicionarBanhoId(null);
  }

  async function adicionarTraveAoProcesso() {
    if (adicionarProcessoId === null || adicionarTraveId === null || adicionarBanhoId === null) return;
    try {
      await api.post(`/processo/${adicionarProcessoId}/trave`, { traveId: adicionarTraveId });
      await api.post('/trave_sessao', {
        processoId: adicionarProcessoId,
        traveIds: [adicionarTraveId],
        banhoId: adicionarBanhoId,
      });
      fecharModalAdicionar();
      await carregarTudo();
    } catch {
      setAlertState({
        open: true,
        title: 'Erro ao adicionar trave',
        message: 'Não foi possível adicionar a trave ao processo. Tente novamente.',
        type: 'error',
      });
    }
  }

  // ── Finalizar POS_TRATAMENTO ───────────────────────────────────────────────

  async function finalizarProcesso(processoId: number) {
    try {
      await api.put(`/processo/finalizar/${processoId}`);
      await carregarTudo();
    } catch {
      setAlertState({
        open: true,
        title: 'Erro ao finalizar',
        message: 'Não foi possível finalizar o processo. Tente novamente.',
        type: 'error',
      });
    }
  }

  async function liberarTrave(processoId: number, traveId: number) {
    try {
      await api.put(`/processo/${processoId}/trave/${traveId}/liberar`);
      await carregarTudo();
    } catch {
      setAlertState({
        open: true,
        title: 'Erro ao liberar',
        message: 'Não foi possível liberar a trave. Tente novamente.',
        type: 'error',
      });
    }
  }

  // ── Derivados ──────────────────────────────────────────────────────────────

  const banhosFiltrados = banhos.filter((b) => b.areas.some((a) => a.nome === activeTab));

  const prevStage = PREV_ESTAGIO[activeTab];
  const nextStage = NEXT_ESTAGIO[activeTab];

  const banhosCompartilhadosPrev = prevStage
    ? banhosFiltrados.filter((b) => b.areas.some((a) => a.nome === prevStage))
    : [];

  const banhosCompartilhadosNext = nextStage
    ? banhosFiltrados.filter(
        (b) =>
          b.areas.some((a) => a.nome === nextStage) &&
          !banhosCompartilhadosPrev.some((bp) => bp.id === b.id)
      )
    : [];

  const banhosExclusivos = banhosFiltrados.filter(
    (b) =>
      !banhosCompartilhadosPrev.some((bp) => bp.id === b.id) &&
      !banhosCompartilhadosNext.some((bn) => bn.id === b.id)
  );

  const banhosDestinoMesmoEstagio = banhoAberto
    ? banhosFiltrados.filter((b) => b.id !== banhoAberto.id)
    : [];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Stage Stepper */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-center gap-1 w-full">
          {TABS.map((tab, idx) => (
            <Fragment key={tab}>
              <button
                onClick={() => setActiveTab(tab)}
                className={`flex flex-1 items-center justify-center gap-1 sm:gap-2 rounded-lg px-2 sm:px-3 py-3 text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === tab
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 border border-slate-200'
                }`}
              >
                <span className={`hidden sm:flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                  activeTab === tab ? 'bg-white/20' : 'bg-slate-100 text-slate-400'
                }`}>
                  {idx + 1}
                </span>
                <span className="hidden sm:inline">{TAB_LABELS[tab]}</span>
                <span className="sm:hidden">{TAB_LABELS_SHORT[tab]}</span>
              </button>
              {idx < TABS.length - 1 && (
                <div className="flex items-center px-2 text-slate-300">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-10">

        {/* Botões — somente na aba PRÉ-TRATAMENTO */}
        {activeTab === 'PRE_TRATAMENTO' && (
          <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mb-6">
            <button
              onClick={() => {
                carregarTravesLivres();
                setIsModalAdicionarOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <span className="leading-none">＋</span> Adicionar trave
            </button>
            <button
              onClick={openModalCriar}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base font-semibold text-white shadow-md hover:bg-cyan-700 transition-colors"
            >
              <span className="leading-none">＋</span> Novo processo
            </button>
          </div>
        )}

        {/* ── Conteúdo (todos os tabs) ── */}
        {banhosFiltrados.length === 0 && !(activeTab === 'POS_TRATAMENTO' && processosPos.length > 0) ? (
          <p className="text-sm text-slate-400 text-center mt-16">
            Nenhum banho cadastrado para este estágio.
          </p>
        ) : (
          <div className="flex flex-col gap-8">

            {/* Seção: compartilhado com estágio anterior (topo) */}
            {banhosCompartilhadosPrev.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    ← {TAB_LABELS[prevStage!]}
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {banhosCompartilhadosPrev.map((banho) => (
                    <BanhoCard
                      key={banho.id}
                      banho={banho}
                      traves={travesPorBanho[banho.id] ?? []}
                      onClick={() => abrirModalBanho(banho)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Seção: exclusivos deste estágio (meio) */}
            {banhosExclusivos.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {banhosExclusivos.map((banho) => (
                  <BanhoCard
                    key={banho.id}
                    banho={banho}
                    traves={travesPorBanho[banho.id] ?? []}
                    onClick={() => abrirModalBanho(banho)}
                  />
                ))}
              </div>
            )}

            {/* Seção: compartilhado com estágio seguinte (base) */}
            {banhosCompartilhadosNext.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {TAB_LABELS[nextStage!]} →
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {banhosCompartilhadosNext.map((banho) => (
                    <BanhoCard
                      key={banho.id}
                      banho={banho}
                      traves={travesPorBanho[banho.id] ?? []}
                      onClick={() => abrirModalBanho(banho)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Seção: processos prontos para finalizar (somente Pós-Tratamento) */}
            {activeTab === 'POS_TRATAMENTO' && processosPos.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-emerald-200" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                    Prontos para finalizar
                  </span>
                  <div className="flex-1 h-px bg-emerald-200" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {processosPos.map((p) => (
                    <ProcessoPosCard key={p.processoId} processo={p} onFinalizar={finalizarProcesso} onLiberarTrave={liberarTrave} />
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {scannerModal}

      {/* ── Modal Criar Processo ──────────────────────────────────────────────── */}
      {isModalCriarOpen && (
        <Modal
          title="Novo Processo"
          onClose={cancelModalCriar}
          description="Preencha os campos abaixo para registrar um novo processo."
          footer={
            <>
              <button
                type="button"
                onClick={cancelModalCriar}
                className="px-5 py-3 text-sm font-semibold text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarCriacao}
                className="px-5 py-3 text-sm font-semibold text-white rounded-lg bg-cyan-600 hover:bg-cyan-700 shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={!novoNumOS || travesSelecionadas.length === 0}
              >
                Criar processo
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-700">
                Numero da OS
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex.: 123456"
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/70 focus:border-cyan-500 transition-shadow"
                  value={novoNumOS}
                  onChange={(e) => setNovoNumOS(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsModalCriarOpen(false);
                    openScanner((code) => {
                      setNovoNumOS(code);
                      setScanSuccess(code);
                      setIsModalCriarOpen(true);
                    });
                  }}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
                  title="Escanear código de barras"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
                    <line x1="7" y1="8" x2="7" y2="16"/><line x1="10" y1="8" x2="10" y2="16"/><line x1="13" y1="8" x2="13" y2="11"/><line x1="16" y1="8" x2="16" y2="16"/><line x1="13" y1="14" x2="13" y2="16"/>
                  </svg>
                  Escanear
                </button>
              </div>
              {scanSuccess && (
                <p className="text-xs text-emerald-600 font-medium">
                  Código lido: {scanSuccess}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700">
                  Traves disponiveis
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400">
                    {travesLivres.length} livres
                  </span>
                  {travesLivres.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setTravesSelecionadas(
                          travesSelecionadas.length === travesLivres.length
                            ? []
                            : travesLivres.map((t) => t.idTrave)
                        )
                      }
                      className="text-xs text-cyan-600 font-medium hover:underline"
                    >
                      {travesSelecionadas.length === travesLivres.length ? 'Desmarcar' : 'Todas'}
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 max-h-56 md:max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/60 px-2 py-1.5">
                {travesLivres.length === 0 && (
                  <p className="text-xs text-slate-400 px-1 py-1.5">
                    Nenhuma trave disponivel no momento.
                  </p>
                )}
                {travesLivres.map((trave) => (
                  <label
                    key={trave.idTrave}
                    className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 hover:bg-white hover:shadow-[0_0_0_1px_rgba(148,163,184,0.35)] transition-all"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                      checked={travesSelecionadas.includes(trave.idTrave)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTravesSelecionadas([...travesSelecionadas, trave.idTrave]);
                        } else {
                          setTravesSelecionadas(
                            travesSelecionadas.filter((id) => id !== trave.idTrave)
                          );
                        }
                      }}
                    />
                    <span className="text-xs sm:text-sm text-slate-700">{trave.nome}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal Mover Traves ────────────────────────────────────────────────── */}
      {banhoAberto && (
        <Modal
          title={banhoAberto.nome}
          onClose={fecharModalMover}
          description="Selecione as traves a mover e o banho de destino."
          wide
          footer={
            <>
              <button
                type="button"
                onClick={fecharModalMover}
                className="px-5 py-3 text-sm font-semibold text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              {activeTab === 'POS_TRATAMENTO' && (
                <button
                  type="button"
                  onClick={concluirNoEstagioAtual}
                  disabled={travesSelecionadasMover.length === 0 || concluindo}
                  className="px-5 py-3 text-sm font-semibold text-white rounded-lg bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {concluindo ? 'Concluindo…' : '✓ Concluir tratamento'}
                </button>
              )}
              <button
                type="button"
                onClick={moverTraves}
                disabled={travesSelecionadasMover.length === 0 || banhoDestinoId === null || movendo}
                className="px-5 py-3 text-sm font-semibold text-white rounded-lg bg-cyan-600 hover:bg-cyan-700 shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {movendo ? 'Movendo…' : 'Mover selecionadas →'}
              </button>
            </>
          }
        >
          <div className="space-y-5">
            {/* Traves no banho */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-slate-700">Traves neste banho</p>
                {(travesPorBanho[banhoAberto.id] ?? []).length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setTravesSelecionadasMover(
                        travesSelecionadasMover.length === (travesPorBanho[banhoAberto.id] ?? []).length
                          ? []
                          : (travesPorBanho[banhoAberto.id] ?? []).map((t) => t.traveId)
                      )
                    }
                    className="text-xs text-cyan-600 font-medium hover:underline"
                  >
                    {travesSelecionadasMover.length === (travesPorBanho[banhoAberto.id] ?? []).length
                      ? 'Desmarcar todas'
                      : 'Selecionar todas'}
                  </button>
                )}
              </div>
              {(travesPorBanho[banhoAberto.id] ?? []).length === 0 ? (
                <p className="text-xs text-slate-400">Nenhuma trave neste banho no momento.</p>
              ) : (
                <div className="space-y-1.5 max-h-56 md:max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/60 px-2 py-1.5">
                  {(travesPorBanho[banhoAberto.id] ?? []).map((t) => (
                    <label
                      key={t.traveId}
                      className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 hover:bg-white hover:shadow-[0_0_0_1px_rgba(148,163,184,0.35)] transition-all"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                        checked={travesSelecionadasMover.includes(t.traveId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTravesSelecionadasMover([...travesSelecionadasMover, t.traveId]);
                          } else {
                            setTravesSelecionadasMover(
                              travesSelecionadasMover.filter((id) => id !== t.traveId)
                            );
                          }
                        }}
                      />
                      <span className="text-xs sm:text-sm text-slate-700">
                        {t.traveNome}
                        <span className="text-slate-400"> — OS {t.processoNumOS}</span>
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Banho destino (mesmo estágio) */}
            {banhosDestinoMesmoEstagio.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-700 mb-2">Mover para outro banho</p>
                <div className="flex flex-wrap gap-2">
                  {banhosDestinoMesmoEstagio.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBanhoDestinoId(b.id)}
                      className={`rounded-lg border px-4 py-3 text-sm font-semibold min-h-[44px] transition-colors ${
                        banhoDestinoId === b.id
                          ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {b.nome}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ── Modal Adicionar Trave a Processo ─────────────────────────────────── */}
      {isModalAdicionarOpen && (
        <Modal
          title="Adicionar trave a processo"
          onClose={fecharModalAdicionar}
          description="Selecione o processo, a trave e o banho inicial."
          footer={
            <>
              <button
                type="button"
                onClick={fecharModalAdicionar}
                className="px-5 py-3 text-sm font-semibold text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={adicionarTraveAoProcesso}
                disabled={adicionarProcessoId === null || adicionarTraveId === null || adicionarBanhoId === null}
                className="px-5 py-3 text-sm font-semibold text-white rounded-lg bg-cyan-600 hover:bg-cyan-700 shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Confirmar
              </button>
            </>
          }
        >
          <div className="space-y-5">
            {/* Selecionar processo */}
            <div>
              <p className="text-xs font-medium text-slate-700 mb-2">Processo</p>
              {processosAtivos.length === 0 ? (
                <p className="text-xs text-slate-400">Nenhum processo ativo no momento.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {processosAtivos.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setAdicionarProcessoId(p.id)}
                      className={`rounded-lg border px-4 py-3 text-sm font-semibold min-h-[44px] transition-colors ${
                        adicionarProcessoId === p.id
                          ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      OS {p.numOS}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selecionar trave */}
            <div>
              <p className="text-xs font-medium text-slate-700 mb-2">Trave disponível</p>
              {travesLivres.length === 0 ? (
                <p className="text-xs text-slate-400">Nenhuma trave disponível no momento.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {travesLivres.map((t) => (
                    <button
                      key={t.idTrave}
                      type="button"
                      onClick={() => setAdicionarTraveId(t.idTrave)}
                      className={`rounded-lg border px-4 py-3 text-sm font-semibold min-h-[44px] transition-colors ${
                        adicionarTraveId === t.idTrave
                          ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {t.nome}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selecionar banho inicial */}
            <div>
              <p className="text-xs font-medium text-slate-700 mb-1">
                Banho inicial
              </p>
              <div className="flex flex-wrap gap-2">
                {banhos
                  .filter((b) => b.areas.some((a) => a.nome === 'PRE_TRATAMENTO'))
                  .map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setAdicionarBanhoId(b.id)}
                      className={`rounded-lg border px-4 py-3 text-sm font-semibold min-h-[44px] transition-colors ${
                        adicionarBanhoId === b.id
                          ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {b.nome}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal Alerta ──────────────────────────────────────────────────────── */}
      {alertState.open && (
        <Modal
          title={alertState.title}
          onClose={() => setAlertState((prev) => ({ ...prev, open: false }))}
          variant={alertState.type}
          footer={
            <button
              type="button"
              onClick={() => setAlertState((prev) => ({ ...prev, open: false }))}
              className="px-5 py-3 text-sm font-semibold text-white rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors"
            >
              OK
            </button>
          }
        >
          <p className="text-sm text-slate-600">{alertState.message}</p>
        </Modal>
      )}

    </div>
  );
}
