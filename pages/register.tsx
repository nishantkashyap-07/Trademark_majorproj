import { useState, useCallback, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useWeb3 } from '@/contexts/Web3Context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { TrademarkFormData } from '@/types';
import { TRADEMARK_CATEGORIES, ROYALTY_CONSTRAINTS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/utils/constants';
import { uploadFilesToIPFS, uploadMetadataToIPFS, createTrademarkMetadata } from '@/utils/ipfs';
import { registerTrademark } from '@/utils/contracts';
import { ethers } from 'ethers';

export default function RegisterTrademark() {
  const router = useRouter();
  const { account, isConnected, connect } = useWeb3();
  
  const [formData, setFormData] = useState<TrademarkFormData>({
    companyName: '',
    sloganText: '',
    registrationNumber: '',
    category: '',
    description: '',
    royaltyPercentage: ROYALTY_CONSTRAINTS.DEFAULT_PERCENTAGE,
    language: 'English',
    usageContext: '',
    files: [],
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const steps = [
    { id: 1, name: 'Identity', description: 'Brand details' },
    { id: 2, name: 'Assets', description: 'Upload documents' },
    { id: 3, name: 'Finalize', description: 'Review & Mint' },
  ];

  const handleInputChange = (field: keyof TrademarkFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const generateRegistrationNumber = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const year = new Date().getFullYear();
      const response = await fetch('/api/trademarks');
      const data = await response.json();
      
      let maxNumber = 0;
      if (data.success) {
        data.data.forEach((tm: any) => {
          const regNum = tm.registrationNumber || '';
          const match = regNum.match(/TM\d{4}(\d+)/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNumber) maxNumber = num;
          }
        });
      }
      
      const nextNumber = (maxNumber + 1).toString().padStart(3, '0');
      const newRegNumber = `TM${year}${nextNumber}`;
      handleInputChange('registrationNumber', newRegNumber);
    } catch (err) {
      setError('Failed to generate secure ID');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    
    if (fileArray.length > 5) {
      setError('Limit: 5 files maximum');
      return;
    }
    
    const validFiles = fileArray.filter(file => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'application/pdf'];
      return file.size <= 10 * 1024 * 1024 && allowedTypes.includes(file.type);
    });
    
    setFormData(prev => ({ ...prev, files: validFiles }));
    setPreviewUrls(validFiles.map(file => file.type.startsWith('image/') ? URL.createObjectURL(file) : ''));
  };

  const handleSubmit = async () => {
    if (!isConnected || !account) return;
    setIsLoading(true);
    setError('');

    try {
      const assetsCID = await uploadFilesToIPFS(formData.files);
      const metadata = createTrademarkMetadata(
        {
          companyName: formData.companyName,
          sloganText: formData.sloganText,
          registrationNumber: formData.registrationNumber,
          category: formData.category,
          description: formData.description,
        },
        assetsCID,
        formData.files.map(f => f.name)
      );
      
      const metadataCID = await uploadMetadataToIPFS(metadata);
      const tokenURI = `ipfs://${metadataCID}/metadata.json`;
      
      let useBlockchain = false;
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        if (Number(network.chainId) === 31337) useBlockchain = true;
      } catch (e) {}

      const imageUrl = formData.files.length === 1 
        ? `https://gateway.pinata.cloud/ipfs/${assetsCID}`
        : `https://gateway.pinata.cloud/ipfs/${assetsCID}/${formData.files[0].name}`;

      if (useBlockchain) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const result = await registerTrademark(signer, {
          companyName: formData.companyName,
          sloganText: formData.sloganText,
          registrationNumber: formData.registrationNumber,
          ipfsHash: assetsCID,
          category: formData.category,
          royaltyPercentage: formData.royaltyPercentage,
          tokenURI,
        });

        await fetch('/api/trademarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tokenId: result.tokenId,
            creatorAddress: account,
            sloganText: formData.sloganText,
            companyName: formData.companyName,
            registrationNumber: formData.registrationNumber,
            ipfsHash: assetsCID,
            imageUrl,
            category: formData.category,
            description: formData.description,
            royaltyPercentage: formData.royaltyPercentage,
            tokenURI,
            transactionHash: result.transactionHash,
            verified: false,
            verificationStatus: 'pending',
          }),
        });
      } else {
        const response = await fetch('/api/trademarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tokenId: Date.now(),
            creatorAddress: account,
            sloganText: formData.sloganText,
            companyName: formData.companyName,
            registrationNumber: formData.registrationNumber,
            ipfsHash: assetsCID,
            imageUrl,
            category: formData.category,
            description: formData.description,
            royaltyPercentage: formData.royaltyPercentage,
            tokenURI,
            verified: false,
            verificationStatus: 'pending',
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
      }

      setSuccess('Asset registered successfully on-chain. Redirecting...');
      setTimeout(() => router.push('/marketplace'), 2000);
    } catch (err: any) {
      setError(err.message || 'Minting failed. Check network status.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-4">
        <div className="glass-card max-w-md w-full text-center p-12">
          <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          <h1 className="text-3xl font-black mb-4">Authentication Required</h1>
          <p className="text-slate-400 mb-10">Please connect your Web3 wallet to access the intellectual property registry.</p>
          <button onClick={connect} className="btn-premium w-full !py-4">Connect Wallet</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-white flex flex-col">
      <Head>
        <title>Register Asset | TrademarkChain</title>
      </Head>

      <Navbar />

      <main className="flex-1 pt-32 pb-20 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
             <h1 className="text-4xl md:text-5xl font-black mb-4">Register New Asset</h1>
             <p className="text-slate-400">Mint your intellectual property as a verifiable NFT on the Polygon network.</p>
          </div>

          <div className="flex justify-center mb-16">
            <div className="flex items-center gap-4 bg-white/[0.03] p-2 rounded-2xl border border-white/5">
              {steps.map((step, i) => (
                <div key={step.id} className="flex items-center">
                  <div 
                    className={`flex items-center gap-3 px-5 py-2.5 rounded-xl transition-all duration-300 ${
                      currentStep === step.id 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                        : currentStep > step.id ? 'text-indigo-400' : 'text-slate-500'
                    }`}
                  >
                    <span className="text-sm font-black">{step.id}</span>
                    <span className="text-sm font-bold hidden sm:block">{step.name}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-8 h-[2px] bg-white/5 mx-2" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card !p-8 md:!p-12 animate-slide-up">
            {currentStep === 1 && (
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Company Entity</label>
                    <input
                      type="text"
                      className="premium-input"
                      placeholder="e.g. Acme Corporation"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Trademark / Slogan</label>
                    <input
                      type="text"
                      className="premium-input"
                      placeholder="e.g. Just Do It"
                      value={formData.sloganText}
                      onChange={(e) => handleInputChange('sloganText', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Registry ID</label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        className="premium-input bg-white/[0.01] cursor-not-allowed"
                        placeholder="Generate secure ID..."
                        value={formData.registrationNumber}
                        readOnly
                      />
                      <button 
                        onClick={generateRegistrationNumber}
                        disabled={isGenerating || !!formData.registrationNumber}
                        className="px-6 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold transition-all disabled:opacity-30"
                      >
                        {isGenerating ? '...' : 'Gen'}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Asset Category</label>
                    <select
                      className="premium-input appearance-none bg-indigo-500/5"
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                    >
                      <option value="" disabled className="bg-[#05070a]">Select Category</option>
                      {TRADEMARK_CATEGORIES.map(c => <option key={c} value={c} className="bg-[#05070a]">{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Asset Description</label>
                  <textarea
                    rows={4}
                    className="premium-input resize-none"
                    placeholder="Describe the usage and value of this trademark..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8">
                <div 
                  className={`relative border-2 border-dashed rounded-3xl p-16 text-center transition-all ${
                    dragActive ? 'border-indigo-500 bg-indigo-500/5 scale-[0.99]' : 'border-white/10 hover:border-white/20'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFileUpload(e.dataTransfer.files); }}
                >
                  <div className="w-20 h-20 bg-white/[0.03] rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Upload Proof Documents</h3>
                  <p className="text-slate-400 mb-8 max-w-sm mx-auto text-sm">Upload logos, legal documents, or usage evidence (MAX 10MB each).</p>
                  <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e.target.files)} />
                  <button className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all">Select Files</button>
                </div>

                {formData.files.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                    {formData.files.map((file, i) => (
                      <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02]">
                        {previewUrls[i] ? (
                          <img src={previewUrls[i]} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500">DOC</div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                           <button onClick={() => {
                             const fn = [...formData.files]; fn.splice(i, 1);
                             const pu = [...previewUrls]; pu.splice(i, 1);
                             setFormData({...formData, files: fn}); setPreviewUrls(pu);
                           }} className="p-2 bg-red-500 rounded-lg">DEL</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="bg-indigo-500/5 rounded-3xl p-8 border border-indigo-500/10 mb-8">
                  <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-6">Execution Summary</h3>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Company</p>
                      <p className="font-bold text-white truncate">{formData.companyName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Asset Slogan</p>
                      <p className="font-bold text-white truncate">{formData.sloganText}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Protocol ID</p>
                      <p className="font-bold text-indigo-300 font-mono">{formData.registrationNumber}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Category</p>
                      <span className="status-badge status-badge-purple !py-0.5">{formData.category}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-500/10 rounded-2xl p-6 border border-amber-500/20 flex gap-4">
                   <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.45l8.28 14.55H3.72L12 5.45zM11 16h2v2h-2v-2zm0-7h2v5h-2V9z"/></svg>
                   </div>
                   <div>
                      <p className="text-sm font-bold text-amber-200">Final Blockchain Confirmation</p>
                      <p className="text-xs text-amber-200/60 leading-relaxed mt-1">
                        Once written to the Polygon network, this registration is immutable. Ensure all details are legally accurate before proceeding with the transaction.
                      </p>
                   </div>
                </div>
              </div>
            )}

            {error && <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold animate-shake">{error}</div>}
            {success && <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm font-bold animate-fade-in">{success}</div>}

            <div className="mt-12 flex justify-between items-center">
              <button
                onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
                className={`text-slate-400 font-bold hover:text-white transition-all ${currentStep === 1 ? 'invisible' : ''}`}
              >
                Back
              </button>
              
              {currentStep < 3 ? (
                <button 
                  onClick={() => setCurrentStep(s => s + 1)}
                  className="btn-premium !px-10"
                >
                  Continue
                </button>
              ) : (
                <button 
                  onClick={handleSubmit} 
                  disabled={isLoading}
                  className="btn-premium !px-12 flex items-center gap-3"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : null}
                  {isLoading ? 'Processing...' : 'Mint Asset NFT'}
                </button>
              )}
            </div>
          </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}