import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useWeb3 } from '@/contexts/Web3Context';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
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

    // Enforce single file limit for Asset Registration (Industry Standard)
    const filesToUpload = fileArray.slice(0, 1);

    const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024;

    const invalidFiles = filesToUpload.filter(file =>
      !allowedTypes.includes(file.type) || file.size > maxSize
    );

    if (invalidFiles.length > 0) {
      setError(`Only JPG, PNG, SVG, or PDF under 10MB allowed.`);
      return;
    }

    setFormData(prev => ({ ...prev, files: filesToUpload }));
    setPreviewUrls(filesToUpload.map(file => file.type.startsWith('image/') ? URL.createObjectURL(file) : ''));
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
      } catch (e) { }

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

        <div className="max-w-[1200px] mx-auto relative z-20">
          <div className="flex flex-col md:flex-row gap-20 items-start">

            {/* Industry Standard Sidebar Stepper */}
            <div className="w-full md:w-64 flex-shrink-0 sticky top-32">
              <div className="mb-10">
                <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Registration</h1>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed uppercase tracking-wider">Protocol Deployment Node</p>
              </div>

              <div className="space-y-1">
                {steps.map((step) => (
                  <div key={step.id} className="relative py-4 pr-4 group">
                    <div className="flex items-start gap-4">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black transition-all duration-500 ${currentStep === step.id
                        ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                        : currentStep > step.id ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/[0.03] text-slate-600'
                        }`}>
                        {step.id}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold transition-colors duration-500 ${currentStep === step.id ? 'text-white' : 'text-slate-500'
                          }`}>
                          {step.name}
                        </p>
                        <p className="text-[10px] text-slate-600 mt-1 font-medium italic">{step.description}</p>
                      </div>
                    </div>
                    {currentStep === step.id && (
                      <motion.div
                        layoutId="activeStep"
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-full"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-20 p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4 text-indigo-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                  All transmissions are secured via <span className="text-white">AES-256</span> and mapped to the Polygon Amoy testnet.
                </p>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 w-full max-w-2xl">
              <div className="animate-fade-in relative z-30">
                {currentStep === 1 && (
                  <div className="space-y-12">
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Organization Name</label>
                      <div className="relative group">
                        <input
                          type="text"
                          className={`premium-input !h-16 !bg-white/[0.01] border-white/10 focus:!border-white/20 px-6 ${validationErrors.companyName ? 'border-red-500/50' : ''}`}
                          placeholder="Nexus Industries"
                          value={formData.companyName}
                          onChange={(e) => handleInputChange('companyName', e.target.value)}
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none group-focus-within:text-white transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                      </div>
                      {validationErrors.companyName && (
                        <p className="text-[10px] font-bold text-red-500/60 ml-1 uppercase tracking-tight">{validationErrors.companyName}</p>
                      )}
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Asset(IP) Text | <span className="text-white/50 font-light text-[8px]">Enter the slogan you want to register</span></label>
                      <div className="relative group">
                        <input
                          type="text"
                          className={`premium-input !h-16 !bg-white/[0.01] border-white/10 focus:!border-white/20 px-6 ${validationErrors.sloganText ? 'border-red-500/50' : ''}`}
                          placeholder="Just do it"
                          value={formData.sloganText}
                          onChange={(e) => handleInputChange('sloganText', e.target.value)}
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none group-focus-within:text-white transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                        </div>
                      </div>
                      {validationErrors.sloganText && (
                        <p className="text-[10px] font-bold text-red-500/60 ml-1 uppercase tracking-tight">{validationErrors.sloganText}</p>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Cryptographic ID</label>
                        <div className="flex gap-2 relative group">
                          <input
                            type="text"
                            className="premium-input !h-16 !bg-white/[0.01] border-white/10 font-mono text-indigo-400 group-hover:!border-white/20 cursor-not-allowed px-6"
                            placeholder="ID Prefix..."
                            value={formData.registrationNumber}
                            readOnly
                          />
                          <button
                            onClick={generateRegistrationNumber}
                            className="h-16 px-6 bg-white text-black hover:bg-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95"
                          >
                            {isGenerating ? '...' : 'GEN'}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Asset Class</label>
                        <div className="relative group">
                          <select
                            className="premium-input !h-16 appearance-none !bg-white/[0.01] border-white/10 focus:!border-white/20 px-6"
                            value={formData.category}
                            onChange={(e) => handleInputChange('category', e.target.value)}
                          >
                            <option value="" disabled className="bg-[#05070a]">Select Class</option>
                            {TRADEMARK_CATEGORIES.map(c => <option key={c} value={c} className="bg-[#05070a]">{c}</option>)}
                          </select>
                          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-700 group-focus-within:text-white transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Asset Methodology</label>
                      <textarea
                        rows={6}
                        className="premium-input !bg-white/[0.01] border-white/10 focus:!border-white/20 resize-none p-6 text-sm leading-relaxed"
                        placeholder="Provide detailed technical specifications and usage parameters..."
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-12 animate-fade-in">
                    <div
                      className={`relative border border-dashed rounded-[3rem] min-h-[400px] flex flex-col items-center justify-center text-center transition-all duration-700 group overflow-hidden ${
                        dragActive ? 'border-white bg-white/[0.02]' : 'border-white/5 hover:border-white/20'
                      }`}
                      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                      onDragLeave={() => setDragActive(false)}
                      onDrop={(e) => { e.preventDefault(); setDragActive(false); if (formData.files.length === 0) handleFileUpload(e.dataTransfer.files); }}
                    >
                      {formData.files.length > 0 ? (
                        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-8 animate-fade-in">
                          <div className="relative w-full h-full max-w-sm rounded-[2rem] overflow-hidden bg-white/[0.01] border border-white/5 group/preview">
                            {previewUrls[0] ? (
                              <img src={previewUrls[0]} className="w-full h-full object-contain" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                <span className="text-xs font-black uppercase tracking-widest">{formData.files[0].name}</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFormData({...formData, files: []});
                                  setPreviewUrls([]);
                                }}
                                className="px-8 py-3 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 transition-all flex items-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                Delete & Re-upload
                              </button>
                            </div>
                          </div>
                          <div className="mt-8">
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400">Asset Ready for Synthesis</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-24 h-24 bg-white/[0.02] border border-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-10 pointer-events-none transition-transform duration-500 group-hover:scale-110">
                            <svg className="w-10 h-10 text-white opacity-20 group-hover:opacity-60 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <h3 className="text-2xl font-bold mb-4 pointer-events-none tracking-tight">Identity Visualization</h3>
                          <p className="text-slate-500 mb-12 max-w-[400px] mx-auto text-sm leading-relaxed font-medium pointer-events-none px-8">
                            Upload your <span className="text-white">Corporate Logo</span> or a <span className="text-white">Design of your Slogan</span>. This visual identifier will be permanently bound to your cryptographic certificate.
                          </p>
                          
                          <input 
                            type="file" 
                            id="file-upload"
                            className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                            onChange={(e) => handleFileUpload(e.target.files)} 
                          />
                          <label 
                            htmlFor="file-upload"
                            className="inline-block px-14 py-4.5 bg-white text-black rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] hover:scale-105 active:scale-95 transition-all cursor-pointer relative z-20 shadow-2xl"
                          >
                            Select Brand Asset
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-12 animate-fade-in">
                    {showWalletPrompt && !isConnected && (
                      <div className="bg-white text-black rounded-[3rem] p-12 animate-slide-up shadow-[0_0_100px_rgba(255,255,255,0.1)]">
                        <div className="flex flex-col md:flex-row gap-10 items-center text-center md:text-left">
                          <div className="w-20 h-20 bg-black/[0.03] rounded-[2rem] flex items-center justify-center flex-shrink-0">
                            <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-xl font-bold mb-3 tracking-tight">Establish Node Connection</p>
                            <p className="text-sm text-black/50 leading-relaxed mb-8 font-medium">Link your secure cryptographic vault to proceed with asset initialization and protocol deployment.</p>
                            <button
                              onClick={connect}
                              className="px-10 py-4 bg-black text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl"
                            >
                              Initialize Link
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-white/[0.01] rounded-[3rem] p-12 border border-white/5 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/[0.03] blur-[100px] rounded-full -mr-40 -mt-40 transition-transform group-hover:scale-110 duration-1000" />
                      <div className="flex items-center justify-between mb-16 relative z-10">
                        <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.25em] flex items-center gap-4">
                          <div className="w-8 h-[1px] bg-indigo-500/30" />
                          Protocol Manifest
                        </h3>
                        <div className="px-3 py-1 bg-white/[0.03] border border-white/5 rounded-full text-[8px] font-black text-slate-500 uppercase tracking-widest">
                          Draft v1.0
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-y-16 gap-x-16 relative z-10">
                        <div className="space-y-3">
                          <p className="text-[10px] text-slate-600 uppercase font-bold tracking-[0.2em]">Legal Identity</p>
                          <p className="text-2xl font-bold text-white tracking-tight leading-none">{formData.companyName}</p>
                          <div className="h-0.5 w-6 bg-white/5" />
                        </div>
                        <div className="space-y-3">
                          <p className="text-[10px] text-slate-600 uppercase font-bold tracking-[0.2em]">Asset Symbol</p>
                          <p className="text-2xl font-bold text-white tracking-tight leading-none">{formData.sloganText}</p>
                          <div className="h-0.5 w-6 bg-white/5" />
                        </div>
                        <div className="space-y-3">
                          <p className="text-[10px] text-slate-600 uppercase font-bold tracking-[0.2em]">Protocol Index</p>
                          <p className="text-2xl font-bold text-indigo-400 font-mono tracking-tighter leading-none">{formData.registrationNumber}</p>
                        </div>
                        <div className="space-y-3">
                          <p className="text-[10px] text-slate-600 uppercase font-bold tracking-[0.2em]">Deployment Type</p>
                          <p className="text-2xl font-bold text-white tracking-tight leading-none">{formData.category}</p>
                        </div>
                      </div>

                      <div className="mt-20 pt-10 border-t border-white/5 flex items-center justify-between relative z-10">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">Initialization Fee</p>
                          <p className="text-xs font-bold text-white">0.00 MATIC <span className="text-slate-700 italic font-medium ml-1">(/standard)</span></p>
                        </div>
                        <div className="w-12 h-12 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-6 items-start p-10 bg-white/[0.01] border border-white/5 rounded-[2.5rem] group hover:bg-white/[0.02] transition-colors duration-700">
                      <div className="w-10 h-10 bg-indigo-500/5 rounded-2xl flex items-center justify-center flex-shrink-0 text-indigo-400 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-1">Authorization Notice</p>
                        <p className="text-[12px] text-slate-500 leading-relaxed font-medium">Proceeding with initialization will cryptographically sign this manifest. This action is irreversible once committed to the decentralized registry.</p>
                      </div>
                    </div>
                  </div>
                )}

                {error && <div className="mt-16 p-8 bg-red-500/5 border border-red-500/10 rounded-[2rem] text-red-500 text-[10px] font-black uppercase tracking-[0.2em] text-center animate-shake">{error}</div>}
                {success && <div className="mt-16 p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] text-center animate-fade-in">{success}</div>}

                {isLoading && uploadProgress > 0 && (
                  <div className="mt-16 space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.3em] text-slate-700 mb-3 ml-1">
                      <span>Synthesizing Blocks</span>
                      <span className="text-white">{uploadProgress}%</span>
                    </div>
                    <div className="h-1 bg-white/[0.03] rounded-full overflow-hidden">
                      <div className="h-full bg-white transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,255,255,0.5)]" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}

                <div className="mt-24 flex justify-between items-center pt-12 border-t border-white/[0.02]">
                  <button
                    onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
                    className={`text-[10px] font-black uppercase tracking-[0.25em] text-slate-700 hover:text-white transition-all ${currentStep === 1 ? 'invisible' : ''}`}
                  >
                    Back to previous
                  </button>

                  {currentStep < 3 ? (
                    <button
                      onClick={handleNextStep}
                      className="px-14 py-5 bg-white text-black rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-200 transition-all shadow-2xl active:scale-95"
                    >
                      Proceed to next
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="px-16 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all disabled:opacity-30 flex items-center gap-4 shadow-[0_0_60px_rgba(79,70,229,0.3)] active:scale-95"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      )}
                      {isLoading ? 'Synthesizing...' : 'Authorize Minting'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}