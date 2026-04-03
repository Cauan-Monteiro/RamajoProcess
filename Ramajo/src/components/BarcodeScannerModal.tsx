import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import Modal from './Modal';

const SCANNER_ELEMENT_ID = 'barcode-scanner-region';

interface Props {
  onClose: () => void;
  onScan: (code: string) => void;
}

export default function BarcodeScannerModal({ onClose, onScan }: Props) {
  const [erro, setErro] = useState<string | null>(null);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;
  const firedRef = useRef(false);

  useEffect(() => {
    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID, {
      formatsToSupport: [
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.CODE_39,
      ],
      verbose: false,
    });

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 300, height: 120 } },
        (decodedText) => {
          if (firedRef.current) return;
          firedRef.current = true;
          onScanRef.current(decodedText);
        },
        () => {}, // erros de frame individuais ignorados
      )
      .catch(() => {
        setErro('Não foi possível acessar a câmera. Verifique as permissões do navegador.');
      });

    return () => {
      scanner.stop().then(() => scanner.clear()).catch(() => {});
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Modal
      title="Escanear código de barras"
      onClose={onClose}
      variant="info"
      wide
      footer={
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
      }
    >
      {erro ? (
        <p className="text-sm text-rose-600 text-center py-6">{erro}</p>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div id={SCANNER_ELEMENT_ID} className="w-full rounded-lg overflow-hidden" />
          <p className="text-xs text-slate-500 text-center">
            Aponte a câmera para o código de barras da etiqueta.
          </p>
        </div>
      )}
    </Modal>
  );
}
