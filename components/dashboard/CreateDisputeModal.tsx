import { useState } from 'react';
import { createDispute } from '@/utils/dao';
import { uploadMetadataToIPFS } from '@/utils/ipfs';
import { ethers } from 'ethers';

interface CreateDisputeModalProps {
  tokenId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateDisputeModal({ tokenId, onClose, onSuccess }: CreateDisputeModalProps) {
  const [defendant, setDefendant] = useState('');
  const [reason, setReason] = useState('');
  const [evidence, setEvidence] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!defendant || !reason) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      // Upload evidence to IPFS if provided
      let evidenceHash = '';
      if (evidence) {
        // Upload evidence as plain JSON (not using uploadMetadataToIPFS which expects full trademark metadata)
        try {
          const evidenceData = JSON.stringify({
            evidence,
            timestamp: Date.now(),
            tokenId,
            type: 'dispute_evidence'
          });
          
          const blob = new Blob([evidenceData], { type: 'application/json' });
          const file = new File([blob], 'evidence.json', { type: 'application/json' });
          
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await fetch('/api/upload-to-ipfs', {
            method: 'POST',
            body: formData,
          });
          
          const result = await response.json();
          if (result.success) {
            evidenceHash = result.ipfsHash;
          }
        } catch (err) {
          console.error('Failed to upload evidence:', err);
          // Continue without evidence hash
        }
      }

      // Create dispute on blockchain
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const result = await createDispute(
        signer,
        tokenId,
        defendant,
        reason,
        evidenceHash
      );

      alert(`Dispute created successfully! Dispute ID: ${result.disputeId}`);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating dispute:', error);
      alert(error.message || 'Failed to create dispute');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Create Dispute</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Token ID
            </label>
            <input
              type="text"
              value={tokenId}
              disabled
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Defendant Address *
            </label>
            <input
              type="text"
              value={defendant}
              onChange={(e) => setDefendant(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:border-purple-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Reason for Dispute *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe the dispute..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:border-purple-500 focus:outline-none resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Evidence (Optional)
            </label>
            <textarea
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              placeholder="Provide any supporting evidence..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:border-purple-500 focus:outline-none resize-none"
            />
            <p className="text-slate-400 text-sm mt-2">
              Evidence will be stored on IPFS
            </p>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <p className="text-yellow-400 text-sm">
              <strong>Note:</strong> Creating a dispute will initiate a 7-day voting period. 
              DAO members will vote to resolve the dispute.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Dispute'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
