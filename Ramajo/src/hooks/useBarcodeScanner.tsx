import { useRef, useState } from 'react';
import BarcodeScannerModal from '../components/BarcodeScannerModal';

export function useBarcodeScanner() {
  const [open, setOpen] = useState(false);
  const callbackRef = useRef<((code: string) => void) | undefined>(undefined);

  function openScanner(onScan: (code: string) => void) {
    callbackRef.current = onScan;
    setOpen(true);
  }

  const scannerModal = open ? (
    <BarcodeScannerModal
      onClose={() => setOpen(false)}
      onScan={(code) => {
        callbackRef.current?.(code);
        setOpen(false);
      }}
    />
  ) : null;

  return { openScanner, scannerModal };
}
