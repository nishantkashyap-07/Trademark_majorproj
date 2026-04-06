import { useState, useCallback, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useWeb3 } from '@/contexts/Web3Context';
import Navbar from '@/components/Navbar';
import { TrademarkFormData } from '@/types';
import { TRADEMARK_CATEGORIES, ROYALTY_CONSTRAINTS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/utils/constants';
import { uploadFilesToIPFS, uploadMetadataToIPFS, createTrademarkMetadata } from '@/utils/ipfs';
import { registerTrademark } from '@/utils/contracts';
import { ethers } from 'ethers';

export default function RegisterTrademark() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showWalletPrompt, setShowWalletPrompt] = useState(false);

  const steps = [
    { id: 1, name: 'Identity', description: 'Brand details' },
    { id: 2, name: 'Assets', description: 'Upload documents' },
    { id: 3, name: 'Finalize', description: 'Review & Mint' },
  ];

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleInputChange = (field: keyof TrademarkFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.companyName.trim()) errors.companyName = 'Company name is required';
      if (!formData.sloganText.trim()) errors.sloganText = 'Trademark/Slogan is required';
      if (!formData.registrationNumber.trim()) errors.registrationNumber = 'Registration number is required';
      if (!formData.category) errors.category = 'Category is required';
      if (!formData.description.trim()) errors.description = 'Description is required';
    }
    
    if (step === 2) {
      if (formData.files.length === 0) errors.files = 'At least one file is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(s => s + 1);
    } else {
      setError('Please fill in all required fields');
    }
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
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024;
    
    const invalidFiles = fileArray.filter(file => 
      !allowedTypes.includes(file.type) || file.size > maxSize
    );
    
    if (invalidFiles.length > 0) {
      const invalidNames = invalidFiles.map(f => f.name).join(', ');
      setError(`Invalid files: ${invalidNames}. Only JPG, PNG, SVG, PDF under 10MB allowed.`);
      return;
    }
    
    const validFiles = fileArray.filter(file => 
      file.size <= maxSize && allowedTypes.includes(file.type)
    );
    
    setFormData(prev => ({ ...prev, files: validFiles }));
    setPreviewUrls(validFiles.map(file => file.type.startsWith('image/') ? URL.createObjectURL(file) : ''));
    setError('');
  };

  const handleSubmit = async () => {
    // Check if wallet is connected for blockchain operations
    if (!isConnected || !account) {
      setShowWalletPrompt(true);
      return;
    }

    setIsLoading(true);
    setError('');
    setUploadProgress(10);

    try {
      setUploadProgress(20);
      const assetsCID = await uploadFilesToIPFS(formData.files);
      setUploadProgress(50);
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
      setUploadProgress(70);
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
            creatorAddress: account || user?.email || 'unknown',
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

      setUploadProgress(100);
      setSuccess('Asset registered successfully on-chain. Redirecting...');
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err: any) {
      setError(err.message || 'Minting failed. Check network status.');
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-white flex flex-col">
      <Head>
        <title>Register Asset | TrademarkChain</title>
      </Head>

      <Navbar />

      <main className="flex-1 pt-32 pb-20 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="container-custom relative z-20">
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

          <div className="glass-card !p-8 md:!p-12 animate-slide-up relative z-30">
            {currentStep === 1 && (
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Company Entity *</label>
                    <input
                      type="text"
                      className={`premium-input ${validationErrors.companyName ? 'border-red-500' : ''}`}
                      placeholder="e.g. Acme Corporation"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                    />
                    {validationErrors.companyName && (
                      <p className="text-xs text-red-400 ml-1">{validationErrors.companyName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Trademark / Slogan *</label>
                    <input
                      type="text"
                      className={`premium-input ${validationErrors.sloganText ? 'border-red-500' : ''}`}
                      placeholder="e.g. Just Do It"
                      value={formData.sloganText}
                      onChange={(e) => handleInputChange('sloganText', e.target.value)}
                    />
                    {validationErrors.sloganText && (
                      <p className="text-xs text-red-400 ml-1">{validationErrors.sloganText}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Registry ID *</label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        className={`premium-input bg-white/[0.01] cursor-not-allowed ${validationErrors.registrationNumber ? 'border-red-500' : ''}`}
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
                    {validationErrors.registrationNumber && (
                      <p className="text-xs text-red-400 ml-1">{validationErrors.registrationNumber}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Asset Category *</label>
                    <select
                      className={`premium-input appearance-none bg-indigo-500/5 ${validationErrors.category ? 'border-red-500' : ''}`}
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                    >
                      <option value="" disabled className="bg-[#05070a]">Select Category</option>
                      {TRADEMARK_CATEGORIES.map(c => <option key={c} value={c} className="bg-[#05070a]">{c}</option>)}
                    </select>
                    {validationErrors.category && (
                      <p className="text-xs text-red-400 ml-1">{validationErrors.category}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Asset Description *</label>
                  <textarea
                    rows={4}
                    className={`premium-input resize-none ${validationErrors.description ? 'border-red-500' : ''}`}
                    placeholder="Describe the usage and value of this trademark..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                  {validationErrors.description && (
                    <p className="text-xs text-red-400 ml-1">{validationErrors.description}</p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8">
                {validationErrors.files && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold">
                    {validationErrors.files}
                  </div>
                )}
                <div 
                  className={`relative border-2 border-dashed rounded-3xl p-16 text-center transition-all ${
                    dragActive ? 'border-indigo-500 bg-indigo-500/5 scale-[0.99]' : validationErrors.files ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFileUpload(e.dataTransfer.files); }}
                >
                  <div className="w-20 h-20 bg-white/[0.03] rounded-2xl flex items-center justify-center mx-auto mb-6 pointer-events-none">
                    <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2 pointer-events-none">Upload Proof Documents</h3>
                  <p className="text-slate-400 mb-8 max-w-sm mx-auto text-sm pointer-events-none">Upload logos, legal documents, or usage evidence (MAX 10MB each).</p>
                  <input 
                    type="file" 
                    multiple 
                    id="file-upload"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    onChange={(e) => handleFileUpload(e.target.files)} 
                  />
                  <label 
                    htmlFor="file-upload"
                    className="inline-block px-8 py-3 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all cursor-pointer relative z-20"
                  >
                    Select Files
                  </label>
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
                {/* Wallet Connection Prompt */}
                {showWalletPrompt && !isConnected && (
                  <div className="bg-amber-500/10 rounded-2xl p-6 border border-amber-500/20 animate-fade-in">
                    <div className="flex gap-4 mb-6">
                      <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-bold text-amber-200 mb-2">Wallet Connection Required</p>
                        <p className="text-sm text-amber-200/70 leading-relaxed mb-4">
                          To mint your trademark as an NFT on the blockchain, you need to connect your MetaMask wallet. This enables secure ownership and immutable registration.
                        </p>
                        <button
                          onClick={async () => {
                            try {
                              await connect();
                              setShowWalletPrompt(false);
                            } catch (err) {
                              setError('Failed to connect wallet. Please try again.');
                            }
                          }}
                          className="btn-premium !py-3 flex items-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Connect Wallet Now
                        </button>
                      </div>
                    </div>
                  </div>
                )}

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
            
            {isLoading && uploadProgress > 0 && (
              <div className="mt-8">
                <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                  <span>Upload Progress</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-600 to-cyan-500 transition-all duration-500"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="mt-12 flex justify-between items-center">
              <button
                onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
                className={`text-slate-400 font-bold hover:text-white transition-all ${currentStep === 1 ? 'invisible' : ''}`}
              >
                Back
              </button>
              
              {currentStep < 3 ? (
                <button 
                  onClick={handleNextStep}
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
    </div>
  );
}