
import React from 'react';
import { XIcon } from './icons/NavIcons'; // Using XIcon for close button

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({ title, children, onClose }) => {
  // Prevent clicks inside the modal content from closing the modal
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out"
      onClick={onClose} // Close when clicking on the overlay
    >
      <div 
        className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-700"
        onClick={handleContentClick} // Stop propagation for content area
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="text-xl font-semibold text-cyan-400">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-100 transition-colors p-1 rounded-full hover:bg-slate-700"
            aria-label="Close modal"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
        <div className="p-4 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium shadow"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
