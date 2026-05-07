'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'error' | 'success';
  isVisible: boolean;
  onClose: () => void;
}

export default function Toast({ message, type = 'error', isVisible, onClose }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="fixed top-6 left-4 right-4 z-50 flex justify-center pointer-events-none"
        >
          <div
            className={`pointer-events-auto px-4 py-3 rounded-xl flex items-center gap-3 max-w-sm w-full border ${
              type === 'error'
                ? 'bg-[#111] border-red-500/20'
                : 'bg-[#111] border-[#CCCC00]/20'
            }`}
          >
            {type === 'error' ? (
              <AlertCircle className="text-red-400 shrink-0" size={16} />
            ) : (
              <CheckCircle2 className="text-[#CCCC00] shrink-0" size={16} />
            )}
            <p className="text-sm font-medium text-[#F0F0F6]">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
