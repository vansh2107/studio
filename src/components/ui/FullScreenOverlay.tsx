'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useCallback, useEffect, useRef } from 'react';

interface FullScreenOverlayProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}

export function FullScreenOverlay({ isOpen, onClose, children }: FullScreenOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose?.();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          className="fixed inset-0 w-screen h-screen flex items-center justify-center p-4"
          style={{
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(16px)',
            zIndex: 99999,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => {
            if (overlayRef.current && e.target === overlayRef.current) {
              onClose?.();
            }
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
