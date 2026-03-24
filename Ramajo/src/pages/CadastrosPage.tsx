import { useEffect, useState } from 'react';
import Modal from '../components/Modal';
import {
  api,
  type AlertType,
  type AreaProducao,
  type Trave,
  type Banho,
  type Estagio,
} from '../shared';

const ESTAGIO_LABELS: Record<Estagio, string> = {
  PRE_TRATAMENTO: 'Pré-Tratamento',
  TRATAMENTO:     'Tratamento',
  POS_TRATAMENTO: 'Pós-Tratamento',
};

// ─── CadastrosPage ────────────────────────────────────────────────────────────

export default function CadastrosPage() {

  // ── Loading ────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);

  // ── Alert modal ────────────────────────────────────────────────────────────
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

  // ── Confirm modal ──────────────────────────────────────────────────────────
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  function showConfirm(title: string, message: string, onConfirm: () => void) {
    setConfirmState({ open: true, title, message, onConfirm });
  }

  function closeConfirm() {
    setConfirmState((prev) => ({ ...prev, open: false }));
  }

  // ── Traves ─────────────────────────────────────────────────────────────────
  const [todasTraves, setTodasTraves] = useState<Trave[]>([]);
  const [secaoTravesAberta, setSecaoTravesAberta] = useState(true);

  // Nova trave modal
  const [modalNovaTrave, setModalNovaTrave] = useState(false);
  const [nomeNovaTrave, setNomeNovaTrave] = useState('');

  // Editar trave modal
  const [modalEditarTrave, setModalEditarTrave] = useState<{
    open: boolean;
    idTrave: number | null;
    nome: string;
  }>({ open: false, idTrave: null, nome: '' });

  // ── Banhos ─────────────────────────────────────────────────────────────────
  const [banhos, setBanhos] = useState<Banho[]>([]);
  const [areasDisponiveis, setAreasDisponiveis] = useState<AreaProducao[]>([]);
  const [secaoBanhosAberta, setSecaoBanhosAberta] = useState(true);
  const [modalNovoBanho, setModalNovoBanho] = useState(false);
  const [novoBanho, setNovoBanho] = useState<{
    nome: string; descricao: string; tempoBanho: string; areaIds: number[];
  }>({ nome: '', descricao: '', tempoBanho: '', areaIds: [] });
  const [modalEditarBanho, setModalEditarBanho] = useState<{
    open: boolean;
    id: number | null;
    nome: string;
    descricao: string;
    tempoBanho: string;
    areaIds: number[];
  }>({ open: false, id: null, nome: '', descricao: '', tempoBanho: '', areaIds: [] });

  // ── Data fetching ──────────────────────────────────────────────────────────

  async function carregarTodasTraves() {
    try {
      const response = await api.get('/trave');
      setTodasTraves(response.data);
    } catch (erro) {
      console.error('Erro ao carregar traves:', erro);
    }
  }

  async function carregarBanhos() {
    try {
      const response = await api.get('/banho');
      setBanhos(response.data);
    } catch (erro) {
      console.error('Erro ao carregar banhos:', erro);
    }
  }

  async function carregarAreas() {
    try {
      const response = await api.get('/area');
      setAreasDisponiveis(response.data);
    } catch (erro) {
      console.error('Erro ao carregar áreas:', erro);
    }
  }

  useEffect(() => {
    Promise.all([
      carregarTodasTraves(),
      carregarBanhos(),
      carregarAreas(),
    ]).finally(() => setLoading(false));
  }, []);

  // ── Trave actions ──────────────────────────────────────────────────────────

  async function criarTrave() {
    if (!nomeNovaTrave.trim()) return;
    try {
      await api.post('/trave', { nome: nomeNovaTrave.trim() });
      setModalNovaTrave(false);
      setNomeNovaTrave('');
      carregarTodasTraves();
      setAlertState({
        open: true,
        title: 'Trave criada',
        message: `A trave "${nomeNovaTrave.trim()}" foi adicionada com sucesso.`,
        type: 'success',
      });
    } catch (erro) {
      console.error('Erro ao criar trave:', erro);
      setAlertState({
        open: true,
        title: 'Erro ao criar trave',
        message: 'Não foi possível criar a trave. Tente novamente.',
        type: 'error',
      });
    }
  }

  async function salvarEdicaoTrave() {
    if (!modalEditarTrave.idTrave || !modalEditarTrave.nome.trim()) return;
    try {
      await api.put(`/trave/${modalEditarTrave.idTrave}`, {
        nome: modalEditarTrave.nome.trim(),
      });
      setModalEditarTrave({ open: false, idTrave: null, nome: '' });
      carregarTodasTraves();
      setAlertState({
        open: true,
        title: 'Trave atualizada',
        message: 'O nome da trave foi atualizado com sucesso.',
        type: 'success',
      });
    } catch (erro) {
      console.error('Erro ao editar trave:', erro);
      setAlertState({
        open: true,
        title: 'Erro ao editar trave',
        message: 'Não foi possível atualizar o nome da trave. Tente novamente.',
        type: 'error',
      });
    }
  }

  async function executarRemoverTrave(idTrave: number, nome: string) {
    try {
      await api.delete(`/trave/${idTrave}`);
      carregarTodasTraves();
      setAlertState({
        open: true,
        title: 'Trave removida',
        message: `A trave "${nome}" foi removida.`,
        type: 'success',
      });
    } catch (erro) {
      console.error('Erro ao remover trave:', erro);
      setAlertState({
        open: true,
        title: 'Erro ao remover trave',
        message: 'Não foi possível remover a trave. Verifique se ela não está em uso.',
        type: 'error',
      });
    }
  }

  function removerTrave(idTrave: number, nome: string) {
    showConfirm(
      'Remover trave',
      `Deseja realmente remover a trave "${nome}"? Esta ação não pode ser desfeita.`,
      () => {
        closeConfirm();
        executarRemoverTrave(idTrave, nome);
      }
    );
  }

  // ── Banho actions ──────────────────────────────────────────────────────────

  async function criarBanho() {
    try {
      await api.post('/banho', {
        nome: novoBanho.nome.trim(),
        descricao: novoBanho.descricao.trim(),
        tempoBanho: parseInt(novoBanho.tempoBanho),
        areaIds: novoBanho.areaIds,
      });
      setModalNovoBanho(false);
      setNovoBanho({ nome: '', descricao: '', tempoBanho: '', areaIds: [] });
      carregarBanhos();
      setAlertState({
        open: true,
        title: 'Banho criado',
        message: `Banho "${novoBanho.nome}" adicionado com sucesso.`,
        type: 'success',
      });
    } catch (erro) {
      console.error('Erro ao criar banho:', erro);
      setAlertState({
        open: true,
        title: 'Erro',
        message: 'Não foi possível criar o banho.',
        type: 'error',
      });
    }
  }

  async function salvarEdicaoBanho() {
    if (!modalEditarBanho.id) return;
    try {
      await api.put(`/banho/${modalEditarBanho.id}`, {
        nome: modalEditarBanho.nome.trim(),
        descricao: modalEditarBanho.descricao.trim(),
        tempoBanho: parseInt(modalEditarBanho.tempoBanho),
        areaIds: modalEditarBanho.areaIds,
      });
      setModalEditarBanho({ open: false, id: null, nome: '', descricao: '', tempoBanho: '', areaIds: [] });
      carregarBanhos();
      setAlertState({
        open: true,
        title: 'Banho atualizado',
        message: 'Banho atualizado com sucesso.',
        type: 'success',
      });
    } catch (erro) {
      console.error('Erro ao editar banho:', erro);
      setAlertState({
        open: true,
        title: 'Erro',
        message: 'Não foi possível atualizar o banho.',
        type: 'error',
      });
    }
  }

  function removerBanho(id: number, nome: string) {
    showConfirm('Remover banho', `Deseja remover o banho "${nome}"?`, async () => {
      closeConfirm();
      try {
        await api.delete(`/banho/${id}`);
        carregarBanhos();
        setAlertState({
          open: true,
          title: 'Banho removido',
          message: `"${nome}" removido.`,
          type: 'success',
        });
      } catch (erro) {
        console.error('Erro ao remover banho:', erro);
        setAlertState({
          open: true,
          title: 'Erro',
          message: 'Não foi possível remover o banho.',
          type: 'error',
        });
      }
    });
  }

  // ── Loading screen ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Cadastros
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Gerencie as traves e os tipos de banho disponíveis no sistema.
        </p>
      </div>

      {/* ── Gerenciamento de Traves ──────────────────────────────────────── */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setSecaoTravesAberta((prev) => !prev)}
            className="flex items-center gap-2 text-lg font-semibold text-slate-800 hover:text-slate-900 transition-colors"
          >
            <span
              className={`transition-transform duration-200 ${
                secaoTravesAberta ? 'rotate-0' : '-rotate-90'
              }`}
            >
              ▾
            </span>
            Traves
            <div className="flex gap-1">
              <span className="inline-flex items-center justify-center text-xs rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 border border-slate-200 font-normal">
                {todasTraves.length}
              </span>
            </div>
          </button>

          {secaoTravesAberta && (
            <button
              type="button"
              onClick={() => {
                setNomeNovaTrave('');
                setModalNovaTrave(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 text-white text-xs font-semibold rounded-md shadow-sm hover:bg-cyan-700 transition-colors"
            >
              <span className="text-sm leading-none">＋</span>
              Nova trave
            </button>
          )}
        </div>

        {secaoTravesAberta && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

            {todasTraves.length === 0 && (
              <div className="col-span-full text-center py-10 text-slate-400 text-sm">
                Nenhuma trave cadastrada. Adicione a primeira trave acima.
              </div>
            )}

            {todasTraves.map((trave) => (
              <div
                key={trave.idTrave}
                className="flex items-center justify-between bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-4 hover:border-slate-200 hover:shadow-md transition-all"
              >
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-slate-800">{trave.nome}</span>
                  <span
                    className={`inline-flex w-fit items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                      trave.emUso
                        ? 'bg-amber-50 text-amber-700 border-amber-100'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    }`}
                  >
                    {trave.emUso ? 'Em uso' : 'Livre'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setModalEditarTrave({
                        open: true,
                        idTrave: trave.idTrave,
                        nome: trave.nome,
                      })
                    }
                    className="px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors"
                  >
                    Editar nome
                  </button>
                  <button
                    type="button"
                    onClick={() => removerTrave(trave.idTrave, trave.nome)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-md bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition-colors"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Gerenciamento de Banhos ──────────────────────────────────────── */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setSecaoBanhosAberta((prev) => !prev)}
            className="flex items-center gap-2 text-lg font-semibold text-slate-800 hover:text-slate-900 transition-colors"
          >
            <span
              className={`transition-transform duration-200 ${
                secaoBanhosAberta ? 'rotate-0' : '-rotate-90'
              }`}
            >
              ▾
            </span>
            Banhos
            <span className="inline-flex items-center justify-center text-xs rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 border border-slate-200 font-normal">
              {banhos.length}
            </span>
          </button>

          {secaoBanhosAberta && (
            <button
              type="button"
              onClick={() => {
                setNovoBanho({ nome: '', descricao: '', tempoBanho: '', areaIds: [] });
                setModalNovoBanho(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 text-white text-xs font-semibold rounded-md shadow-sm hover:bg-cyan-700 transition-colors"
            >
              <span className="text-sm leading-none">＋</span>
              Novo banho
            </button>
          )}
        </div>

        {secaoBanhosAberta && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {banhos.length === 0 && (
              <div className="col-span-full text-center py-10 text-slate-400 text-sm">
                Nenhum banho cadastrado. Adicione o primeiro banho acima.
              </div>
            )}

            {banhos.map((banho) => (
              <div
                key={banho.id}
                className="flex items-start justify-between bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-4 hover:border-slate-200 hover:shadow-md transition-all"
              >
                <div className="flex flex-col gap-1.5 min-w-0 mr-3">
                  <span className="text-sm font-semibold text-slate-800 truncate">
                    {banho.nome}
                  </span>
                  {banho.descricao && (
                    <span className="text-xs text-slate-500 line-clamp-2">
                      {banho.descricao}
                    </span>
                  )}
                  <span className="inline-flex w-fit items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-cyan-50 text-cyan-700 border-cyan-100">
                    {banho.tempoBanho}min
                  </span>
                  {banho.areas.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {banho.areas.map((a) => (
                        <span
                          key={a.id}
                          className="inline-flex w-fit items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-slate-50 text-slate-600 border-slate-200"
                        >
                          {ESTAGIO_LABELS[a.nome]}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setModalEditarBanho({
                        open: true,
                        id: banho.id,
                        nome: banho.nome,
                        descricao: banho.descricao,
                        tempoBanho: String(banho.tempoBanho),
                        areaIds: banho.areas.map((a) => a.id),
                      })
                    }
                    className="px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => removerBanho(banho.id, banho.nome)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-md bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition-colors"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Alert modal ───────────────────────────────────────────────────── */}
      {alertState.open && (
        <Modal
          title={alertState.title}
          onClose={() => setAlertState((prev) => ({ ...prev, open: false }))}
          variant={alertState.type}
          footer={
            <button
              type="button"
              onClick={() => setAlertState((prev) => ({ ...prev, open: false }))}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-white rounded-lg bg-slate-800 hover:bg-slate-900 shadow-sm transition-colors"
            >
              OK
            </button>
          }
        >
          <p className="text-sm text-slate-600">{alertState.message}</p>
        </Modal>
      )}

      {/* ── Confirm modal ─────────────────────────────────────────────────── */}
      {confirmState.open && (
        <Modal
          title={confirmState.title}
          onClose={closeConfirm}
          variant="info"
          footer={
            <>
              <button
                type="button"
                onClick={closeConfirm}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmState.onConfirm}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-white rounded-lg bg-rose-600 hover:bg-rose-700 shadow-sm transition-colors"
              >
                Confirmar
              </button>
            </>
          }
        >
          <p className="text-sm text-slate-600">{confirmState.message}</p>
        </Modal>
      )}

      {/* ── Nova trave modal ──────────────────────────────────────────────── */}
      {modalNovaTrave && (
        <Modal
          title="Nova Trave"
          onClose={() => {
            setModalNovaTrave(false);
            setNomeNovaTrave('');
          }}
          description="Informe o nome para a nova trave."
          footer={
            <>
              <button
                type="button"
                onClick={() => {
                  setModalNovaTrave(false);
                  setNomeNovaTrave('');
                }}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={criarTrave}
                disabled={!nomeNovaTrave.trim()}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-white rounded-lg bg-cyan-600 hover:bg-cyan-700 shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Adicionar
              </button>
            </>
          }
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-700">Nome da trave</label>
            <input
              type="text"
              placeholder="Ex.: Trave A1"
              autoFocus
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/70 focus:border-cyan-500 transition-shadow"
              value={nomeNovaTrave}
              onChange={(e) => setNomeNovaTrave(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') criarTrave();
              }}
            />
          </div>
        </Modal>
      )}

      {/* ── Editar trave modal ────────────────────────────────────────────── */}
      {modalEditarTrave.open && (
        <Modal
          title="Editar Trave"
          onClose={() => setModalEditarTrave({ open: false, idTrave: null, nome: '' })}
          description="Altere o nome da trave abaixo."
          footer={
            <>
              <button
                type="button"
                onClick={() => setModalEditarTrave({ open: false, idTrave: null, nome: '' })}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={salvarEdicaoTrave}
                disabled={!modalEditarTrave.nome.trim()}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-white rounded-lg bg-cyan-600 hover:bg-cyan-700 shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Salvar
              </button>
            </>
          }
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-700">Nome da trave</label>
            <input
              type="text"
              autoFocus
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/70 focus:border-cyan-500 transition-shadow"
              value={modalEditarTrave.nome}
              onChange={(e) =>
                setModalEditarTrave((prev) => ({ ...prev, nome: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') salvarEdicaoTrave();
              }}
            />
          </div>
        </Modal>
      )}

      {/* ── Novo banho modal ──────────────────────────────────────────────── */}
      {modalNovoBanho && (
        <Modal
          title="Novo Banho"
          onClose={() => {
            setModalNovoBanho(false);
            setNovoBanho({ nome: '', descricao: '', tempoBanho: '', areaIds: [] });
          }}
          description="Preencha os dados para cadastrar um novo tipo de banho."
          footer={
            <>
              <button
                type="button"
                onClick={() => {
                  setModalNovoBanho(false);
                  setNovoBanho({ nome: '', descricao: '', tempoBanho: '', areaIds: [] });
                }}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={criarBanho}
                disabled={
                  !novoBanho.nome.trim() ||
                  !novoBanho.tempoBanho ||
                  parseInt(novoBanho.tempoBanho) < 1 ||
                  novoBanho.areaIds.length === 0
                }
                className="px-4 py-2 text-xs sm:text-sm font-medium text-white rounded-lg bg-cyan-600 hover:bg-cyan-700 shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Adicionar
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-700">Nome</label>
              <input
                type="text"
                placeholder="Ex.: Banho Fosfato"
                autoFocus
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/70 focus:border-cyan-500 transition-shadow"
                value={novoBanho.nome}
                onChange={(e) => setNovoBanho((prev) => ({ ...prev, nome: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-700">Descricao</label>
              <input
                type="text"
                placeholder="Ex.: Banho de fosfatizacao quimica"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/70 focus:border-cyan-500 transition-shadow"
                value={novoBanho.descricao}
                onChange={(e) => setNovoBanho((prev) => ({ ...prev, descricao: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-700">Duracao (minutos)</label>
              <input
                type="number"
                min={1}
                placeholder="Ex.: 30"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/70 focus:border-cyan-500 transition-shadow"
                value={novoBanho.tempoBanho}
                onChange={(e) => setNovoBanho((prev) => ({ ...prev, tempoBanho: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-700">Áreas de produção</label>
              <div className="flex flex-col gap-2 rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50/60">
                {areasDisponiveis.map((area) => (
                  <label key={area.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                      checked={novoBanho.areaIds.includes(area.id)}
                      onChange={(e) => {
                        setNovoBanho((prev) => ({
                          ...prev,
                          areaIds: e.target.checked
                            ? [...prev.areaIds, area.id]
                            : prev.areaIds.filter((id) => id !== area.id),
                        }));
                      }}
                    />
                    <span className="text-sm text-slate-700">{ESTAGIO_LABELS[area.nome]}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Editar banho modal ────────────────────────────────────────────── */}
      {modalEditarBanho.open && (
        <Modal
          title="Editar Banho"
          onClose={() =>
            setModalEditarBanho({ open: false, id: null, nome: '', descricao: '', tempoBanho: '', areaIds: [] })
          }
          description="Altere os dados do banho abaixo."
          footer={
            <>
              <button
                type="button"
                onClick={() =>
                  setModalEditarBanho({
                    open: false,
                    id: null,
                    nome: '',
                    descricao: '',
                    tempoBanho: '',
                    areaIds: [],
                  })
                }
                className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={salvarEdicaoBanho}
                disabled={
                  !modalEditarBanho.nome.trim() ||
                  !modalEditarBanho.tempoBanho ||
                  parseInt(modalEditarBanho.tempoBanho) < 1 ||
                  modalEditarBanho.areaIds.length === 0
                }
                className="px-4 py-2 text-xs sm:text-sm font-medium text-white rounded-lg bg-cyan-600 hover:bg-cyan-700 shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Salvar
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-700">Nome</label>
              <input
                type="text"
                autoFocus
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/70 focus:border-cyan-500 transition-shadow"
                value={modalEditarBanho.nome}
                onChange={(e) =>
                  setModalEditarBanho((prev) => ({ ...prev, nome: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-700">Descricao</label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/70 focus:border-cyan-500 transition-shadow"
                value={modalEditarBanho.descricao}
                onChange={(e) =>
                  setModalEditarBanho((prev) => ({ ...prev, descricao: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-700">Duracao (minutos)</label>
              <input
                type="number"
                min={1}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/70 focus:border-cyan-500 transition-shadow"
                value={modalEditarBanho.tempoBanho}
                onChange={(e) =>
                  setModalEditarBanho((prev) => ({ ...prev, tempoBanho: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-700">Áreas de produção</label>
              <div className="flex flex-col gap-2 rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50/60">
                {areasDisponiveis.map((area) => (
                  <label key={area.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                      checked={modalEditarBanho.areaIds.includes(area.id)}
                      onChange={(e) => {
                        setModalEditarBanho((prev) => ({
                          ...prev,
                          areaIds: e.target.checked
                            ? [...prev.areaIds, area.id]
                            : prev.areaIds.filter((id) => id !== area.id),
                        }));
                      }}
                    />
                    <span className="text-sm text-slate-700">{ESTAGIO_LABELS[area.nome]}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
