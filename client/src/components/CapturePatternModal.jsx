import { useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import LearningForm from './LearningForm.jsx';

const CapturePatternModal = ({ isOpen, onClose, onAddSuccess }) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Prevent background scrolling while modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFormSuccess = () => {
    if (onAddSuccess) {
      onAddSuccess();
    }
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#1E293B] border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full p-6 relative overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Capture Pattern</h3>
              <p className="text-xs text-slate-400">Add a new learning takeaway to your spaced repetition schedule</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Reuse LearningForm directly */}
        <LearningForm onAdd={handleFormSuccess} isModal={true} />
      </div>
    </div>
  );
};

export default CapturePatternModal;
