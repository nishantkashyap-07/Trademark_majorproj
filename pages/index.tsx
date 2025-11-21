import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useWeb3 } from '@/contexts/Web3Context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TrademarkCard from '@/components/TrademarkCard';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import { demoSlogans, demoStats } from '@/lib/demo-data';

export default function Home() {
  const { isConnected, connect } = useWeb3();
  const [stats] = useState(demoStats);
  const [featuredSlogans] = useState(demoSlogans.slice(0, 8));

  return (
    <>
      <Head>
        <title>SloganChain - Enterprise Blockchain IP Protection Platform</title>
        <meta name="description" content="Enterprise-grade platform for registering, verifying, and trading slogans as intellectual property NFTs on Polygon blockchain with IPFS storage" />
      </Head>

      <KeyboardShortcuts />

      <div className="min-h-screen bg-white">
        <Navbar />

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gray-950 text-white py-28 selection:bg-white selection:text-indigo-900">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-500/40 via-purple-500/20 to-transparent blur-3xl" />
            <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-blue-500/30 via-cyan-400/10 to-transparent blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-16 px-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-medium uppercase tracking-[0.25em] text-gray-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Real-Time IP Protection on Polygon
              </div>

              <h1 className="mt-8 text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl">
                Own your ideas.
                <span className="block bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Prove it on-chain.
                </span>
              </h1>

              <p className="mt-6 text-base text-gray-300 sm:text-lg">
                SloganChain turns your trademarks and slogans into verifiable on-chain assets. 
                Register once, prove ownership anywhere, and unlock new revenue through a compliant IP marketplace.
              </p>

              <div className="mt-10 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
                {isConnected ? (
                  <>
                    <Link
                      href="/register"
                      className="inline-flex flex-1 items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-gray-950 shadow-lg shadow-white/10 transition hover:bg-gray-100"
                    >
                      Register a Trademark
                    </Link>
                    <Link
                      href="/marketplace"
                      className="inline-flex flex-1 items-center justify-center rounded-full border border-white/20 bg-white/0 px-8 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white hover:text-gray-950"
                    >
                      Open Marketplace
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={connect}
                    className="inline-flex w-full items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-gray-950 shadow-lg shadow-white/10 transition hover:bg-gray-100 sm:w-auto"
                  >
                    Connect Wallet to Get Started
                  </button>
                )}
              </div>

              <div className="mt-10 flex items-center gap-6 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Audited smart contracts
                </div>
                <div className="hidden h-3 w-px bg-gray-700 sm:block" />
                <div className="hidden items-center gap-2 sm:flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  IPFS + Polygon powered
                </div>
              </div>
            </div>

            <div className="max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-gray-300">Live Snapshot</p>
                  <p className="mt-1 text-sm text-gray-400">Demo network metrics for SloganChain</p>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                  Testnet
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-black/30 px-4 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-[0.17em] text-gray-400">Registered IP</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{stats.overview.totalSlogans}</p>
                  <p className="mt-1 text-[11px] text-gray-400">Slogans tokenized</p>
                </div>
                <div className="rounded-2xl bg-black/30 px-4 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-[0.17em] text-gray-400">Verified Assets</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{stats.overview.verifiedSlogans}</p>
                  <p className="mt-1 text-[11px] text-gray-400">On-chain proofs</p>
                </div>
                <div className="rounded-2xl bg-black/20 px-4 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-[0.17em] text-gray-400">Active Users</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{stats.overview.totalUsers}</p>
                  <p className="mt-1 text-[11px] text-gray-400">Creators & buyers</p>
                </div>
                <div className="rounded-2xl bg-black/20 px-4 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-[0.17em] text-gray-400">Verification Rate</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{stats.overview.verificationRate}%</p>
                  <p className="mt-1 text-[11px] text-gray-400">Instant checks</p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-[11px] text-gray-400">
                <span>Designed for enterprises & startups</span>
                <span className="text-gray-300">Polygon • IPFS • EIP-2981</span>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Architecture */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
                Turn trademarks into verifiable on-chain assets
              </h2>
              <p className="text-base md:text-lg text-gray-600">
                SloganChain gives creators and brands a single place to register IP, prove ownership in seconds,
                and monetize rights through a compliant marketplace.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
              <div className="rounded-2xl border border-gray-200 bg-white p-8 text-left">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h6l4 4v10a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">1. Register your IP</h3>
                <p className="text-sm text-gray-600">
                  Upload logos, slogans, or other IP once. We store the asset on IPFS and mint an ERC-721 token on
                  Polygon representing provable ownership.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-8 text-left">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">2. Prove and verify instantly</h3>
                <p className="text-sm text-gray-600">
                  Anyone can verify ownership using the token ID, IPFS hash, or wallet address. No paperwork,
                  no waiting months for a registry response.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-8 text-left">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/10 text-purple-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M5 6h14M7 14h10m-9 4h8" />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">3. Monetize through licensing</h3>
                <p className="text-sm text-gray-600">
                  List your IP in the marketplace, create licensing terms, and receive automated royalty payouts via
                  smart contracts each time your IP is used.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Slogans */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-12">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-gray-500">
                    Marketplace Preview
                  </p>
                  <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2">
                    Featured slogans on chain
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 max-w-xl">
                    A snapshot of recently registered and verified IP assets available to explore and license.
                  </p>
                </div>

                <Link
                  href="/marketplace"
                  className="inline-flex items-center justify-center rounded-full border border-gray-900/10 bg-white px-6 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:border-gray-900/40 hover:shadow-md transition"
                >
                  View full marketplace
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredSlogans.map((slogan) => (
                  <TrademarkCard key={slogan.tokenId} trademark={slogan} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Platform Features */}
        <section className="py-20 bg-white border-t border-gray-100">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto grid gap-12 md:grid-cols-2 items-start">
              <div>
                <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
                  Built for creators, brands, and buyers
                </h2>
                <p className="text-base md:text-lg text-gray-600 mb-8">
                  Whether you are protecting a new brand, managing an existing portfolio, or discovering IP to
                  license, SloganChain keeps the experience simple while blockchain handles the complexity.
                </p>

                <div className="space-y-4 text-sm text-gray-700">
                  <div className="flex gap-3">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <p><strong>Creators & brands</strong> – Register IP, prove priority, and control how your assets
                      can be licensed worldwide.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-500" />
                    <p><strong>Buyers & licensees</strong> – Verify legitimacy in seconds and access transparent
                      on-chain licensing terms.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-500" />
                    <p><strong>Admins</strong> – Review flagged listings, remove abuse, and keep the marketplace
                      compliant for everyone.</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500 mb-2">Registration</p>
                  <p className="text-base font-semibold text-gray-900 mb-2">Guided IP onboarding</p>
                  <p className="text-sm text-gray-600">
                    Simple flows to upload assets, describe ownership, set categories, and mint on Polygon without
                    touching contract code.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500 mb-2">Verification</p>
                  <p className="text-base font-semibold text-gray-900 mb-2">Instant authenticity checks</p>
                  <p className="text-sm text-gray-600">
                    Look up IP by name, owner, or token ID and confirm authenticity through immutable on-chain
                    records.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500 mb-2">Monetization</p>
                  <p className="text-base font-semibold text-gray-900 mb-2">Sales & licensing</p>
                  <p className="text-sm text-gray-600">
                    List assets for sale or license with clear terms. Royalties are handled automatically by
                    smart contracts.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500 mb-2">Governance</p>
                  <p className="text-base font-semibold text-gray-900 mb-2">Future DAO dispute layer</p>
                  <p className="text-sm text-gray-600">
                    Planned community voting and dispute resolution to keep IP decisions transparent and fair.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Specifications */}
        <section className="py-16 bg-gray-950 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-2xl md:text-3xl font-semibold">Built on battle-tested Web3 primitives</h2>
                  <p className="mt-2 text-sm text-gray-300 max-w-xl">
                    A modern stack combining Polygon, IPFS, and Firebase to deliver fast UX with tamper-proof
                    records under the hood.
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-300 mb-3">Blockchain</p>
                  <p className="text-sm text-gray-100 mb-3">Polygon • ERC-721 • EIP-2981</p>
                  <p className="text-xs text-gray-400">
                    Smart contracts on Polygon provide low-fee transactions, NFT ownership, and programmable
                    royalties for every listing.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-300 mb-3">Storage</p>
                  <p className="text-sm text-gray-100 mb-3">IPFS • Filecoin-ready</p>
                  <p className="text-xs text-gray-400">
                    Assets and metadata are stored off-chain on IPFS, with content-addressed hashes recorded on
                    chain for integrity.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-300 mb-3">Application</p>
                  <p className="text-sm text-gray-100 mb-3">Next.js • Tailwind • Firebase</p>
                  <p className="text-xs text-gray-400">
                    A responsive Next.js frontend with Tailwind UI, backed by Firebase for metadata, profiles,
                    and real-time updates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-5xl md:text-6xl font-bold mb-8">
                Ready to Protect Your Brand?
              </h2>
              <p className="text-2xl mb-12 text-gray-100">
                Join thousands of businesses securing their intellectual property on the blockchain
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/register" className="px-12 py-5 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-2xl text-lg">
                  Register Your Slogan
                </Link>
                <Link href="/marketplace" className="px-12 py-5 bg-transparent text-white rounded-xl font-bold border-2 border-white hover:bg-white hover:text-purple-600 transition-all text-lg">
                  Explore Marketplace
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
