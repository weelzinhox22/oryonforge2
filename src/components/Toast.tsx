'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'error' | 'success';
  isVisible: boolean;
  onClose: () => void;
}

export default function Toast({ message, type = 'error', isVisible, onClose }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -24, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="fixed top-8 left-0 right-0 z-[9999] flex justify-center pointer-events-none px-4"
        >
          <div className="pointer-events-auto bg-[#050505] border border-white/5 px-4 py-3 rounded-xl flex items-center gap-3 shadow-[0_10px_40px_rgba(0,0,0,0.8)] max-w-sm w-full">
            <div className={`flex items-center justify-center shrink-0 ${type === 'success' ? 'text-[#CCCC00]' : 'text-[#F0F0F6]'}`}>
              {type === 'error' ? <AlertCircle size={16} strokeWidth={2} /> : <CheckCircle2 size={16} strokeWidth={2} />}
            </div>

            <div className="flex-1">
              <p className="text-[13px] font-medium text-[#F0F0F6] leading-tight">{message}</p>
            </div>

            <button 
              onClick={onClose}
              className="p-1 rounded-md text-[#606070] hover:text-[#F0F0F6] transition-colors shrink-0"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
