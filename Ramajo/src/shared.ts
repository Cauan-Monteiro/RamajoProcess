import axios, { type AxiosInstance } from 'axios';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Processo {
  id: number;
  numOS: string;
  createdAt: string;
  finishedAt: string | null;
  tempoTotalMinutos: number | null;
  nomesTraves: string[];
}

export type Estagio = 'PRE_TRATAMENTO' | 'TRATAMENTO' | 'POS_TRATAMENTO';

export interface AreaProducao {
  id: number;
  nome: Estagio;
}

export interface Trave {
  idTrave: number;
  nome: string;
  emUso: boolean;
  estagioAtual: Estagio | null;
  processoAtualId: number | null;
}

export type AlertType = 'success' | 'error' | 'info';

export interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  description?: string;
  variant?: 'default' | AlertType;
  wide?: boolean;
}

export interface TraveEstado {
  traveId: number;
  traveNome: string;
  estagioAtual: Estagio | null;
  emSessao: boolean;
  sessaoId: number | null;
  banhoId: number | null;
  banhoNome: string | null;
  tempoBanho: number | null;
  banhoAreas: string[] | null;
  iniciadoEm: string | null;
}

export interface TraveEmBanho extends TraveEstado {
  processoId: number;
  processoNumOS: string;
}

export interface Banho {
  id: number;
  nome: string;
  descricao: string;
  tempoBanho: number;
  areas: AreaProducao[];
}

export interface SessaoHistorico {
  sessaoId: number;
  traveId: number;
  traveNome: string;
  banhoId: number;
  banhoNome: string;
  tempoBanho: number;
  iniciadoEm: string;
  finalizadoEm: string | null;
  duracaoMinutos: number | null;
}

// ─── Axios instance ───────────────────────────────────────────────────────────

export const api: AxiosInstance = axios.create({
  // baseURL: 'https://ramajoprocess-production.up.railway.app/api',
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Trata strings LocalDateTime sem fuso horário como UTC (Docker roda em UTC)
function parseUtc(s: string): Date {
  return new Date(/Z|[+-]\d{2}:?\d{2}$/.test(s) ? s : s + 'Z');
}

export function formatarTempo(totalMinutos: number): string {
  if (totalMinutos >= 60) {
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    return `${horas}h${minutos}min`;
  }
  if (60 > totalMinutos && totalMinutos >= 1) {
    return `${totalMinutos}min`;
  }
  return 'Menos de 1 minuto';
}

export function calcularProgressoBanho(iniciadoEm: string, tempoBanhoMinutos: number): number {
  const elapsed = (Date.now() - parseUtc(iniciadoEm).getTime()) / 60000;
  return Math.min((elapsed / tempoBanhoMinutos) * 100, 100);
}

export function formatarTempoDecorrido(iniciadoEm: string): string {
  const elapsed = Math.floor((Date.now() - parseUtc(iniciadoEm).getTime()) / 60000);
  if (elapsed >= 60) {
    return `${Math.floor(elapsed / 60)}h${elapsed % 60}min`;
  }
  return `${elapsed}min`;
}
