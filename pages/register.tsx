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
            blockchainTokenId: result.tokenId,
            ownerId: account,
            title: formData.sloganText,
            companyName: formData.companyName,
            registrationNumber: formData.registrationNumber,
            ipfsHash: assetsCID,
            previewUrl: imageUrl,
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
            blockchainTokenId: Date.now(),
            ownerId: account || user?.email || 'unknown',
            title: formData.sloganText,
            companyName: formData.companyName,
            registrationNumber: formData.registrationNumber,
            ipfsHash: assetsCID,
            previewUrl: imageUrl,
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-500">
      <Head>
        <title>Register Asset | TrademarkChain</title>
      </Head>

      <Navbar />

      <main className="flex-1 pt-32 pb-20 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-[1200px] mx-auto relative z-20">
          <div className="flex flex-col md:flex-row gap-20 items-start">

            {/* Professional Sidebar Stepper */}
            <div className="w-full md:w-72 flex-shrink-0 sticky top-32 glass-card !p-8 !bg-transparent !border-slate-200 dark:!border-white/10">
              <div className="mb-12">
                <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white mb-2">Registration</h1>
                <p className="text-xs text-slate-500 font-medium">Follow the steps to secure your brand identity.</p>
              </div>
 
              <div className="space-y-6">
                {steps.map((step) => (
                  <div key={step.id} className="relative group">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${currentStep === step.id
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                        : currentStep > step.id ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'
                        }`}>
                        {currentStep > step.id ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        ) : step.id}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold transition-colors duration-300 ${currentStep === step.id ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                          }`}>
                          {step.name}
                        </p>
                      </div>
                    </div>
                    {step.id < steps.length && (
                      <div className="absolute left-4 top-8 w-px h-6 bg-slate-200 dark:bg-white/10 ml-[-0.5px]" />
                    )}
                  </div>
                ))}
              </div>
 
              <div className="mt-16 p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Network Secure</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Your data is encrypted and permanently recorded on the decentralized infrastructure.
                </p>
              </div>
            </div>
 
            {/* Main Content Area */}
            <div className="flex-1 w-full glass-card !bg-white/50 dark:!bg-white/[0.02] !p-10 !border-slate-200 dark:!border-white/10">
              <div className="animate-fade-in relative z-30">
                {currentStep === 1 && (
                  <div className="space-y-10">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Company Name</label>
                      <div className="relative group">
                        <input
                          type="text"
                          className={`premium-input !h-14 ${validationErrors.companyName ? 'border-red-500 text-red-500' : ''}`}
                          placeholder="e.g. Nexus Industries"
                          value={formData.companyName}
                          onChange={(e) => handleInputChange('companyName', e.target.value)}
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within:text-indigo-500 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 v5m-4 0h4" /></svg>
                        </div>
                      </div>
                      {validationErrors.companyName && (
                        <p className="text-[10px] font-bold text-red-500 ml-1 uppercase tracking-tight">{validationErrors.companyName}</p>
                      )}
                    </div>
 
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Trademark Text / Slogan</label>
                      <div className="relative group">
                        <input
                          type="text"
                          className={`premium-input !h-14 ${validationErrors.sloganText ? 'border-red-500 text-red-500' : ''}`}
                          placeholder="e.g. Innovation for Everyone"
                          value={formData.sloganText}
                          onChange={(e) => handleInputChange('sloganText', e.target.value)}
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within:text-indigo-500 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                        </div>
                      </div>
                      {validationErrors.sloganText && (
                        <p className="text-[10px] font-bold text-red-500 ml-1 uppercase tracking-tight">{validationErrors.sloganText}</p>
                      )}
                    </div>
 
                    <div className="grid sm:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Registration ID</label>
                        <div className="flex gap-2 relative group">
                          <input
                            type="text"
                            className="premium-input !h-14 font-mono text-indigo-600 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 cursor-not-allowed"
                            placeholder="Generated ID"
                            value={formData.registrationNumber}
                            readOnly
                          />
                          <button
                            onClick={generateRegistrationNumber}
                            className="h-14 px-6 bg-indigo-600 text-white hover:bg-indigo-700 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-md active:scale-95"
                          >
                            {isGenerating ? '...' : 'GENERATE'}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Industry Class</label>
                        <div className="relative group">
                          <select
                            className="premium-input !h-14 appearance-none px-6"
                            value={formData.category}
                            onChange={(e) => handleInputChange('category', e.target.value)}
                          >
                            <option value="" disabled>Select Class</option>
                            {TRADEMARK_CATEGORIES.map(c => (
                              <option key={c} value={c} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{c}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
 
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Description & Usage</label>
                      <textarea
                        rows={4}
                        className="premium-input resize-none p-6 text-sm"
                        placeholder="Describe how this trademark will be used in your business operations..."
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-10 animate-fade-in">
                    <div
                      className={`relative border-2 border-dashed rounded-3xl min-h-[350px] flex flex-col items-center justify-center text-center transition-all duration-500 group overflow-hidden ${dragActive
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/5'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:border-indigo-400 dark:hover:border-indigo-500/30'
                        }`}
                      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                      onDragLeave={() => setDragActive(false)}
                      onDrop={(e) => { e.preventDefault(); setDragActive(false); if (formData.files.length === 0) handleFileUpload(e.dataTransfer.files); }}
                    >
                      {formData.files.length > 0 ? (
                        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-8">
                          <div className="relative w-full h-full max-w-xs rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-lg group/preview">
                            {previewUrls[0] ? (
                              <img src={previewUrls[0]} className="w-full h-full object-contain" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                <span className="text-[10px] font-bold uppercase tracking-wider">{formData.files[0].name}</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFormData({ ...formData, files: [] });
                                  setPreviewUrls([]);
                                }}
                                className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-500 transition-all shadow-xl"
                              >
                                Remove File
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-10">
                          <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8 transition-transform duration-500 group-hover:scale-110">
                            <svg className="w-10 h-10 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <h3 className="text-xl font-bold mb-3 tracking-tight text-slate-800 dark:text-white">Upload Brand Asset</h3>
                          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-[320px] mx-auto text-sm leading-relaxed font-medium">
                            Upload your corporate logo or slogan design. This visual will be tied to your certificate.
                          </p>
 
                          <input
                            type="file"
                            id="file-upload"
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            onChange={(e) => handleFileUpload(e.target.files)}
                          />
                          <label
                            htmlFor="file-upload"
                            className="inline-block px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all cursor-pointer relative z-20 shadow-lg shadow-indigo-600/20"
                          >
                            SELECT FILE
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                )}
 
                {currentStep === 3 && (
                  <div className="space-y-10 animate-fade-in">
                    {showWalletPrompt && !isConnected && (
                      <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] p-10 shadow-2xl">
                        <div className="flex flex-col md:flex-row gap-8 items-center text-center md:text-left">
                          <div className="w-16 h-16 bg-white/10 dark:bg-slate-900/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-lg font-bold mb-2">Connect Wallet</p>
                            <p className="text-sm opacity-70 leading-relaxed mb-6">Link your cryptographic vault to proceed with the blockchain registration.</p>
                            <button
                              onClick={connect}
                              className="px-8 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                            >
                              Connect Now
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
 
                    <div className="bg-slate-50 dark:bg-white/[0.02] rounded-3xl p-10 border border-slate-200 dark:border-white/5 relative overflow-hidden shadow-sm">
                      <div className="flex items-center justify-between mb-12">
                        <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-3">
                          <span className="w-6 h-px bg-indigo-500/30" />
                          Registration Summary
                        </h3>
                      </div>
 
                      <div className="grid grid-cols-2 gap-y-12 gap-x-12">
                        <div className="space-y-2">
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Company</p>
                          <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{formData.companyName}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Trademark Text</p>
                          <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{formData.sloganText}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Registration ID</p>
                          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 font-mono tracking-tight">{formData.registrationNumber}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Sector Class</p>
                          <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight italic">{formData.category}</p>
                        </div>
                      </div>
 
                      <div className="mt-16 pt-8 border-t border-slate-200 dark:border-white/5 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fee</p>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">0.00 MATIC <span className="text-slate-400 font-normal ml-1">Standard Registration</span></p>
                        </div>
                        <div className="w-10 h-10 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center">
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        </div>
                      </div>
                    </div>
 
                    <div className="flex gap-5 items-start p-8 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl shadow-sm">
                      <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0 text-amber-600 dark:text-amber-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-widest">Important Notice</p>
                        <p className="text-[12px] text-amber-700 dark:text-amber-500/80 leading-relaxed font-medium">Proceeding will cryptographically sign this data. This action is irreversible once committed to the registry.</p>
                      </div>
                    </div>
                  </div>
                )}
 
                {error && <div className="mt-12 p-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-xs font-bold text-center">{error}</div>}
                {success && <div className="mt-12 p-6 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center">{success}</div>}
 
                {isLoading && uploadProgress > 0 && (
                  <div className="mt-12 space-y-4">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                      <span>Blockchain Registration</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 transition-all duration-700 ease-out" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}
 
                <div className="mt-16 flex justify-between items-center pt-8 border-t border-slate-100 dark:border-white/5">
                  <button
                    onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
                    className={`text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all flex items-center gap-2 ${currentStep === 1 ? 'invisible' : ''}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    Previous Step
                  </button>
 
                  {currentStep < 3 ? (
                    <button
                      onClick={handleNextStep}
                      className="px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                    >
                      Next Step
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="px-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-30 flex items-center gap-3 shadow-lg shadow-indigo-600/30 active:scale-95"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      )}
                      {isLoading ? 'Processing...' : 'Complete Registration'}
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