import React from 'react';
import type { ModalProps } from '../shared';

// ─── Modal component ──────────────────────────────────────────────────────────

const Modal: React.FC<ModalProps> = ({
  title,
  onClose,
  children,
  footer,
  description,
  variant = 'default',
  wide = false,
}) => {
  const variantStyles: Record<
    NonNullable<ModalProps['variant']>,
    {
      border: string;
      headerBg: string;
      titleColor: string;
      iconBg: string;
    }
  > = {
    default: {
      border: 'border-slate-100',
      headerBg: 'bg-slate-50/80',
      titleColor: 'text-slate-900',
      iconBg: 'bg-slate-100 text-slate-500',
    },
    success: {
      border: 'border-emerald-200',
      headerBg: 'bg-emerald-50/80',
      titleColor: 'text-emerald-900',
      iconBg: 'bg-emerald-100 text-emerald-700',
    },
    error: {
      border: 'border-rose-200',
      headerBg: 'bg-rose-50/80',
      titleColor: 'text-rose-900',
      iconBg: 'bg-rose-100 text-rose-700',
    },
    info: {
      border: 'border-cyan-200',
      headerBg: 'bg-cyan-50/80',
      titleColor: 'text-cyan-900',
      iconBg: 'bg-cyan-100 text-cyan-700',
    },
  };

  const current = variantStyles[variant];

  const iconSymbol =
    variant === 'success' ? '✔' : variant === 'error' ? '!' : variant === 'info' ? 'i' : '';

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-4 py-6 bg-slate-900/40 backdrop-blur-sm">
      <div
        className={`w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} bg-white rounded-2xl shadow-xl border ${current.border} overflow-hidden`}
      >
        <div
          className={`flex items-start justify-between px-6 py-4 border-b ${current.headerBg} ${current.border}`}
        >
          <div className="flex items-start gap-3">
            {iconSymbol && (
              <div
                className={`mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${current.iconBg}`}
              >
                {iconSymbol}
              </div>
            )}
            <div className="flex flex-col gap-0.5">
              <h2 className={`text-base font-semibold ${current.titleColor}`}>{title}</h2>
              {description && <p className="text-xs text-slate-500">{description}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-3 inline-flex items-center justify-center w-7 h-7 rounded-full border border-slate-200 text-slate-500 text-xs hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 bg-white">{children}</div>

        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end gap-2">
          {footer}
        </div>
      </div>
    </div>
  );
};

export default Modal;
