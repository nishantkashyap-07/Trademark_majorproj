import { useState } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';

interface ReportModalProps {
  targetId: string;
  targetType: 'trademark' | 'listing' | 'user';
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReportModal({ targetId, targetType, onClose, onSuccess }: ReportModalProps) {
  const { account } = useWeb3();
  const [type, setType] = useState<string>('spam');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const reportTypes = [
    { value: 'spam', label: 'Spam or Misleading' },
    { value: 'fraud', label: 'Fraudulent Activity' },
    { value: 'copyright', label: 'Copyright Infringement' },
    { value: 'inappropriate', label: 'Inappropriate Content' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account) {
      setError('Please connect your wallet');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/reports/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          targetId,
          targetType,
          reason,
          description,
          reporterAddress: account,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(data.error || 'Failed to submit report');
      }
    } catch (error: any) {
      console.error('Error submitting report:', error);
      setError('Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Report {targetType}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="input-field"
              required
            >
              {reportTypes.map(rt => (
                <option key={rt.value} value={rt.value}>{rt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason *
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input-field"
              placeholder="Brief reason for reporting"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Details
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="input-field"
              placeholder="Provide more details about the issue..."
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
