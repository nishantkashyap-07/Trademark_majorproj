import { useState, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useWeb3 } from '@/contexts/Web3Context';
import { TrademarkFormData } from '@/types';
import { TRADEMARK_CATEGORIES, ROYALTY_CONSTRAINTS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/utils/constants';
import { uploadFilesToIPFS, uploadMetadataToIPFS, createTrademarkMetadata } from '@/utils/ipfs';
import { registerTrademark, isRegistrationNumberUsed } from '@/utils/contracts';
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
  const [registrationExists, setRegistrationExists] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const steps = [
    { id: 1, name: 'Company Info', description: 'Basic company and trademark details' },
    { id: 2, name: 'Upload Assets', description: 'Upload trademark files and documents' },
    { id: 3, name: 'Review & Submit', description: 'Review information and register on blockchain' },
  ];

  // Handle form input changes
  const handleInputChange = (field: keyof TrademarkFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  // Check if registration number exists
  const checkRegistrationNumber = useCallback(async (regNumber: string) => {
    if (regNumber.length < 3) return;
    
    // Temporarily disabled to avoid RPC errors
    // Check will be done during submission instead
    setRegistrationExists(false);
    
    // try {
    //   const exists = await isRegistrationNumberUsed(regNumber);
    //   setRegistrationExists(exists);
    // } catch (error) {
    //   console.error('Error checking registration number:', error);
    // }
  }, []);

  // Generate unique registration number
  const generateRegistrationNumber = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      // Get current year
      const year = new Date().getFullYear();
      
      // Fetch all trademarks to find the last used number
      const response = await fetch('/api/trademarks');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Failed to fetch trademarks');
      }
      
      // Find the highest number for current year
      const currentYearTrademarks = data.data.filter((tm: any) => {
        const regNum = tm.registrationNumber || '';
        return regNum.startsWith(`TM${year}`);
      });
      
      let maxNumber = 0;
      currentYearTrademarks.forEach((tm: any) => {
        const regNum = tm.registrationNumber || '';
        const match = regNum.match(/TM\d{4}(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNumber) {
            maxNumber = num;
          }
        }
      });
      
      // Generate next number with leading zeros (3 digits)
      const nextNumber = (maxNumber + 1).toString().padStart(3, '0');
      const newRegNumber = `TM${year}${nextNumber}`;
      
      // Set the generated number
      handleInputChange('registrationNumber', newRegNumber);
      
      // Check if it exists (should not, but just in case)
      await checkRegistrationNumber(newRegNumber);
      
    } catch (error: any) {
      console.error('Error generating registration number:', error);
      setError('Failed to generate registration number. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    
    // Validate files
    if (fileArray.length > 5) {
      setError('Maximum 5 files allowed');
      return;
    }
    
    const validFiles = fileArray.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        setError(`File "${file.name}" exceeds 10MB limit`);
        return false;
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError(`File "${file.name}" has unsupported type`);
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length !== fileArray.length) return;
    
    setFormData(prev => ({ ...prev, files: validFiles }));
    
    // Create preview URLs
    const urls = validFiles.map(file => {
      if (file.type.startsWith('image/')) {
        return URL.createObjectURL(file);
      }
      return '';
    });
    setPreviewUrls(urls);
    setError('');
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  // Validate current step
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.companyName.trim()) {
          setError('Company name is required');
          return false;
        }
        if (!formData.sloganText.trim()) {
          setError('Slogan text is required');
          return false;
        }
        if (!formData.registrationNumber.trim()) {
          setError('Registration number is required');
          return false;
        }
        if (registrationExists) {
          setError('Registration number already exists');
          return false;
        }
        if (!formData.category) {
          setError('Category is required');
          return false;
        }
        return true;
      
      case 2:
        if (formData.files.length === 0) {
          setError('At least one file is required');
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  // Handle step navigation
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
      setError('');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!isConnected || !account) {
      setError(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
      return;
    }

    if (!validateStep(2)) return;

    setIsLoading(true);
    setError('');

    try {
      // Step 1: Upload files to IPFS via Pinata
      console.log('Uploading files to IPFS...');
      const assetsCID = await uploadFilesToIPFS(formData.files);
      console.log('Files uploaded successfully. CID:', assetsCID);
      
      // Step 2: Create and upload metadata
      console.log('Creating metadata...');
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
      console.log('Metadata uploaded successfully. CID:', metadataCID);
      
      // Step 2.5: Automatic similarity check
      console.log('Checking for similar trademarks...');
      const similarityCheck = await fetch('/api/check-similarity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ipfsHash: assetsCID,
          trademarkName: formData.sloganText,
          companyName: formData.companyName,
        }),
      });
      
      const similarityResult = await similarityCheck.json();
      console.log('Similarity check result:', similarityResult);
      
      // If exact duplicate found, block registration
      if (similarityResult.isDuplicate) {
        setError(`❌ Duplicate detected: ${similarityResult.message}`);
        setIsLoading(false);
        return;
      }
      
      // If similarities found, show warning but allow to continue
      if (similarityResult.warnings && similarityResult.warnings.length > 0) {
        const warningMsg = `⚠️ Similarity Warning:\n${similarityResult.warnings.join('\n')}\n\nThis will require manual admin review.`;
        console.warn(warningMsg);
        // Show warning but continue with registration
        setError(warningMsg);
        // Clear error after 5 seconds
        setTimeout(() => setError(''), 5000);
      }
      
      // Step 3: Check if we should use blockchain or database only
      const contractsDeployed = process.env.NEXT_PUBLIC_TRADEMARK_CONTRACT_ADDRESS && 
                                process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS;
      
      // Check if we're on the correct network
      let useBlockchain = false;
      if (contractsDeployed) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const network = await provider.getNetwork();
          const currentChainId = Number(network.chainId);
          
          // Only use blockchain if on localhost (31337) or if contracts are actually accessible
          if (currentChainId === 31337) {
            useBlockchain = true;
          } else {
            console.log(`Not on localhost network (current: ${currentChainId}). Skipping blockchain registration.`);
          }
        } catch (networkError) {
          console.warn('Could not check network, skipping blockchain:', networkError);
        }
      }
      
      if (!useBlockchain) {
        // Store in database only (for demo/testing without blockchain)
        console.log('Contracts not deployed. Storing in database only...');
        
        // Construct proper image URL - if single file, CID points directly to it
        const imageUrl = formData.files.length === 1 
          ? `https://gateway.pinata.cloud/ipfs/${assetsCID}`
          : `https://gateway.pinata.cloud/ipfs/${assetsCID}/${formData.files[0].name}`;
        
        console.log('Image URL constructed:', imageUrl);
        console.log('Assets CID:', assetsCID);
        console.log('Number of files:', formData.files.length);
        
        const trademarkData = {
          tokenId: Date.now(), // Temporary ID
          creatorAddress: account,
          sloganText: formData.sloganText, // Use sloganText instead of trademarkName
          companyName: formData.companyName,
          registrationNumber: formData.registrationNumber,
          ipfsHash: assetsCID,
          imageUrl: imageUrl,
          category: formData.category,
          description: formData.description,
          royaltyPercentage: formData.royaltyPercentage,
          tokenURI,
          verified: false,
          verificationStatus: 'pending',
        };
        
        console.log('Trademark data to save:', trademarkData);
        
        const response = await fetch('/api/trademarks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(trademarkData),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          console.error('API Error Response:', data);
          throw new Error(data.error || 'Failed to save trademark to database');
        }
        
        console.log('Trademark saved successfully:', data);
        setSuccess('Trademark registered successfully! Files stored on IPFS. Redirecting to trademark details...');
        
        setTimeout(() => {
          // Redirect to the trademark details page using the document ID
          router.push(`/trademark/${data.data.id}`);
        }, 2000);
        
      } else {
        // Register on blockchain
        console.log('Registering slogan on blockchain...');
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
        
        // Construct proper image URL - if single file, CID points directly to it
        const imageUrl = formData.files.length === 1 
          ? `https://gateway.pinata.cloud/ipfs/${assetsCID}`
          : `https://gateway.pinata.cloud/ipfs/${assetsCID}/${formData.files[0].name}`;
        
        // Also save to database
        const trademarkData = {
          tokenId: result.tokenId,
          creatorAddress: account,
          sloganText: formData.sloganText, // Use sloganText instead of trademarkName
          companyName: formData.companyName,
          registrationNumber: formData.registrationNumber,
          ipfsHash: assetsCID,
          imageUrl: imageUrl,
          category: formData.category,
          description: formData.description,
          royaltyPercentage: formData.royaltyPercentage,
          tokenURI,
          transactionHash: result.transactionHash,
          verified: false,
          verificationStatus: 'pending',
        };
        
        await fetch('/api/trademarks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(trademarkData),
        });
        
        setSuccess(`${SUCCESS_MESSAGES.TRADEMARK_REGISTERED} Token ID: ${result.tokenId}. Redirecting to trademark details...`);
        
        setTimeout(() => {
          // Redirect to marketplace to see all trademarks
          router.push('/marketplace');
        }, 3000);
      }
      
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Failed to register trademark');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <>
        <Head>
          <title>Register Trademark - TrademarkChain</title>
        </Head>

        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
          <div className="max-w-md w-full rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-center shadow-[0_18px_60px_rgba(15,23,42,0.8)]">
            <h1 className="text-2xl font-semibold tracking-tight text-white mb-3">Connect your wallet</h1>
            <p className="text-sm text-slate-300 mb-6">
              Connect MetaMask to start registering and protecting your trademarks on-chain.
            </p>
            <button
              onClick={connect}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 border border-slate-700"
            >
              <span>Connect MetaMask</span>
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Register Trademark - TrademarkChain</title>
      </Head>

      <div className="min-h-screen bg-gray-950">
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.back()}
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  title="Go back"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-white">Trademark Registration</h1>
                  <p className="text-sm text-gray-400 mt-1">Secure your intellectual property on the blockchain</p>
                </div>
              </div>
              <div className="bg-gray-800 px-4 py-2 rounded-xl border border-gray-700">
                <div className="text-xs text-gray-400 mb-1">Connected Wallet</div>
                <div className="text-sm font-mono text-white">
                  {account?.slice(0, 6)}...{account?.slice(-4)}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.id 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'border-gray-300 text-gray-500'
                  }`}>
                    {currentStep > step.id ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-8">
            {/* Step 1: Company Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-6">Company Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your company name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Slogan Text *
                    </label>
                    <input
                      type="text"
                      value={formData.sloganText}
                      onChange={(e) => handleInputChange('sloganText', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your slogan"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Registration Number *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.registrationNumber}
                        readOnly
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 cursor-not-allowed flex-1"
                        placeholder="Click Generate to create"
                      />
                      <button
                        type="button"
                        onClick={generateRegistrationNumber}
                        disabled={isGenerating || formData.registrationNumber !== ''}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {isGenerating ? 'Generating...' : formData.registrationNumber ? 'Generated' : 'Generate'}
                      </button>
                    </div>
                    <p className="text-gray-400 text-xs mt-1">Auto-generated format: TM + Year + Number (e.g., TM2026001)</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select category</option>
                      {TRADEMARK_CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your trademark..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Royalty Percentage: {formData.royaltyPercentage}%
                  </label>
                  <input
                    type="range"
                    min={ROYALTY_CONSTRAINTS.MIN_PERCENTAGE}
                    max={ROYALTY_CONSTRAINTS.MAX_PERCENTAGE}
                    value={formData.royaltyPercentage}
                    onChange={(e) => handleInputChange('royaltyPercentage', Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{ROYALTY_CONSTRAINTS.MIN_PERCENTAGE}%</span>
                    <span>{ROYALTY_CONSTRAINTS.MAX_PERCENTAGE}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: File Upload */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-6">Upload Trademark Assets</h2>
                
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center ${
                    dragActive ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 bg-gray-800/50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-white">
                        Drop files here or click to upload
                      </span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        multiple
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload(e.target.files)}
                      />
                    </label>
                    <p className="mt-1 text-xs text-gray-400">
                      PNG, JPG, SVG, PDF up to 10MB each (max 5 files)
                    </p>
                  </div>
                </div>

                {/* File Previews */}
                {formData.files.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {formData.files.map((file, index) => (
                      <div key={index} className="relative">
                        <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                          {previewUrls[index] ? (
                            <img
                              src={previewUrls[index]}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-gray-300 truncate">{file.name}</p>
                        <button
                          onClick={() => {
                            const newFiles = formData.files.filter((_, i) => i !== index);
                            const newUrls = previewUrls.filter((_, i) => i !== index);
                            setFormData(prev => ({ ...prev, files: newFiles }));
                            setPreviewUrls(newUrls);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-6">Review & Submit</h2>
                
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="font-medium text-white mb-4">Trademark Information</h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-400">Company Name</dt>
                      <dd className="text-sm text-white mt-1">{formData.companyName}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-400">Slogan Text</dt>
                      <dd className="text-sm text-white mt-1">{formData.sloganText}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-400">Registration Number</dt>
                      <dd className="text-sm text-white mt-1">{formData.registrationNumber}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-400">Category</dt>
                      <dd className="text-sm text-white mt-1">{formData.category}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-400">Royalty Percentage</dt>
                      <dd className="text-sm text-white mt-1">{formData.royaltyPercentage}%</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-400">Files Uploaded</dt>
                      <dd className="text-sm text-white mt-1">{formData.files.length} files</dd>
                    </div>
                  </dl>
                  
                  {formData.description && (
                    <div className="mt-4">
                      <dt className="text-sm font-medium text-gray-400">Description</dt>
                      <dd className="text-sm text-white mt-1">{formData.description}</dd>
                    </div>
                  )}
                </div>

                <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4">
                  <div className="flex">
                    <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-300">Important Notice</h3>
                      <p className="text-sm text-yellow-200 mt-1">
                        Once registered on the blockchain, this information cannot be modified. Please review carefully before submitting.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error/Success Messages */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800">{success}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  currentStep === 1
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                    : 'bg-gray-700 text-white hover:bg-gray-600 border border-gray-600'
                }`}
              >
                Previous
              </button>

              {currentStep < 3 ? (
                <button onClick={nextStep} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Registering...' : 'Register Trademark'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}