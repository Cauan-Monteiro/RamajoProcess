import axios, { type AxiosInstance } from 'axios';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Processo {
  id: number;
  numOS: string;
  createdAt: Date;
  finishedAt: Date | null;
  tempoTotalMinutos: number | null;
  nomesTraves: string[];
}

export interface Trave {
  idTrave: number;
  nome: string;
  emUso: boolean;
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

export type Estagio = 'PRE_TRATAMENTO' | 'TRATAMENTO' | 'POS_TRATAMENTO';

export interface TraveEstado {
  traveId: number;
  traveNome: string;
  emBanho: boolean;
  traveBanhoId: number | null;
  banhoId: number | null;
  banhoNome: string | null;
  tempoBanho: number | null;
  banhoEstagio: Estagio | null;
  iniciadoEm: string | null;
  estagioAguardando: Estagio | null;
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
  estagio: Estagio | null;
}

export interface TraveBanhoHistorico {
  traveBanhoId: number;
  traveId: number;
  traveNome: string;
  banhoId: number;
  banhoNome: string;
  tempoBanho: number;
  banhoEstagio: Estagio | null;
  iniciadoEm: string;
  finalizadoEm: string | null;
  duracaoMinutos: number | null;
}

// ─── Axios instance ───────────────────────────────────────────────────────────

export const api: AxiosInstance = axios.create({
  baseURL: 'http://129.148.62.223:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
  const elapsed = (Date.now() - new Date(iniciadoEm).getTime()) / 60000;
  return Math.min((elapsed / tempoBanhoMinutos) * 100, 100);
}

export function formatarTempoDecorrido(iniciadoEm: string): string {
  const elapsed = Math.floor((Date.now() - new Date(iniciadoEm).getTime()) / 60000);
  if (elapsed >= 60) {
    return `${Math.floor(elapsed / 60)}h${elapsed % 60}min`;
  }
  return `${elapsed}min`;
}
