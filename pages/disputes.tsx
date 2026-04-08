import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useWeb3 } from '@/contexts/Web3Context';
import Navbar from '@/components/common/Navbar';
import { Dispute, DisputeStatus, getDisputeDetails, getTotalDisputes, isVoter, voteOnDispute, resolveDispute, formatDisputeStatus, getVotingTimeRemaining } from '@/utils/dao';
import { ethers } from 'ethers';

export default function DisputesPage() {
  const { account, isConnected, connect } = useWeb3();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVoterStatus, setIsVoterStatus] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'resolved'>('active');

  useEffect(() => {
    if (isConnected && account) {
      loadDisputes();
      checkVoterStatus();
    }
  }, [isConnected, account]);

  const loadDisputes = async () => {
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const total = await getTotalDisputes(provider);
      
      const disputeList: Dispute[] = [];
      for (let i = 1; i <= total; i++) {
        const dispute = await getDisputeDetails(provider, i);
        disputeList.push(dispute);
      }
      
      setDisputes(disputeList);
    } catch (error) {
      console.error('Error loading disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkVoterStatus = async () => {
    if (!account) return;
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const status = await isVoter(provider, account);
      setIsVoterStatus(status);
    } catch (error) {
      console.error('Error checking voter status:', error);
    }
  };

  const handleVote = async (disputeId: number, inFavor: boolean) => {
    if (!account) return;
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      await voteOnDispute(signer, disputeId, inFavor);
      alert('Vote cast successfully!');
      loadDisputes();
    } catch (error: any) {
      alert(error.message || 'Failed to cast vote');
    }
  };

  const handleResolve = async (disputeId: number) => {
    if (!account) return;
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      await resolveDispute(signer, disputeId);
      alert('Dispute resolved successfully!');
      loadDisputes();
    } catch (error: any) {
      alert(error.message || 'Failed to resolve dispute');
    }
  };

  const activeDisputes = disputes.filter(d => d.status === DisputeStatus.Voting);
  const resolvedDisputes = disputes.filter(d => d.status === DisputeStatus.Resolved);

  if (!isConnected) {
    return (
      <>
        <Head><title>DAO Disputes | Trademark Platform</title></Head>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-32 pb-20">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Connect Wallet</h1>
            <p className="text-slate-300 mb-8">Connect your wallet to view disputes</p>
            <button onClick={connect} className="btn-premium">Connect Wallet</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head><title>DAO Disputes | Trademark Platform</title></Head>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Trademark Disputes</h1>
            <p className="text-slate-300">Decentralized dispute resolution via DAO voting</p>
            {isVoterStatus && (
              <div className="mt-4 inline-block px-4 py-2 bg-green-500/20 border border-green-500 rounded-lg text-green-400">
                ✓ You are a registered voter
              </div>
            )}
          </div>

          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'active'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Active Disputes ({activeDisputes.length})
            </button>
            <button
              onClick={() => setActiveTab('resolved')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'resolved'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Resolved ({resolvedDisputes.length})
            </button>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {(activeTab === 'active' ? activeDisputes : resolvedDisputes).map((dispute) => (
                <div key={dispute.disputeId} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Dispute #{dispute.disputeId}</h3>
                      <p className="text-slate-400">Token ID: {dispute.tokenId}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-lg font-semibold ${
                      dispute.status === DisputeStatus.Voting ? 'bg-yellow-500/20 text-yellow-400' :
                      dispute.status === DisputeStatus.Resolved ? 'bg-green-500/20 text-green-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {formatDisputeStatus(dispute.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-slate-500 text-sm">Complainant</p>
                      <p className="text-white font-mono text-sm">{dispute.complainant.slice(0, 10)}...</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-sm">Defendant</p>
                      <p className="text-white font-mono text-sm">{dispute.defendant.slice(0, 10)}...</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-slate-500 text-sm mb-2">Reason</p>
                    <p className="text-white">{dispute.reason}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <p className="text-green-400 font-semibold">Votes For</p>
                      <p className="text-2xl font-bold text-white">{dispute.votesFor}</p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                      <p className="text-red-400 font-semibold">Votes Against</p>
                      <p className="text-2xl font-bold text-white">{dispute.votesAgainst}</p>
                    </div>
                  </div>

                  {dispute.status === DisputeStatus.Voting && (
                    <>
                      <p className="text-slate-400 text-sm mb-4">
                        {getVotingTimeRemaining(dispute.votingEndsAt)}
                      </p>
                      {isVoterStatus && (
                        <div className="flex gap-4">
                          <button
                            onClick={() => handleVote(dispute.disputeId, true)}
                            className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all"
                          >
                            Vote For Complainant
                          </button>
                          <button
                            onClick={() => handleVote(dispute.disputeId, false)}
                            className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all"
                          >
                            Vote For Defendant
                          </button>
                        </div>
                      )}
                      {Date.now() / 1000 >= dispute.votingEndsAt && (
                        <button
                          onClick={() => handleResolve(dispute.disputeId)}
                          className="w-full mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all"
                        >
                          Resolve Dispute
                        </button>
                      )}
                    </>
                  )}

                  {dispute.status === DisputeStatus.Resolved && (
                    <div className={`p-4 rounded-lg ${
                      dispute.inFavorOfComplainant
                        ? 'bg-green-500/20 border border-green-500'
                        : 'bg-red-500/20 border border-red-500'
                    }`}>
                      <p className={`font-semibold ${
                        dispute.inFavorOfComplainant ? 'text-green-400' : 'text-red-400'
                      }`}>
                        Resolved in favor of {dispute.inFavorOfComplainant ? 'Complainant' : 'Defendant'}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {(activeTab === 'active' ? activeDisputes : resolvedDisputes).length === 0 && (
                <div className="text-center py-20">
                  <p className="text-slate-400 text-lg">No {activeTab} disputes found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
