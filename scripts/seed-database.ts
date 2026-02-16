#!/usr/bin/env ts-node
/**
 * Database Seeding Script
 * Populates Firebase Firestore with real demo data for presentation
 * 
 * Usage: npx ts-node scripts/seed-database.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Real trademark data
const trademarks = [
  {
    tokenId: 1,
    creatorAddress: '0x742d35cc6634c0532925a3b844bc9e7595f0beb',
    currentOwner: '0x742d35cc6634c0532925a3b844bc9e7595f0beb',
    companyName: 'TechVision Inc.',
    sloganText: 'Innovation Beyond Imagination',
    registrationNumber: 'TM2024001',
    category: 'Technology',
    description: 'Inspiring slogan for AI and cloud computing technology company',
    ipfsHash: 'QmTechVision123',
    royaltyPercentage: 10,
    verified: true,
    verificationStatus: 'verified',
    language: 'English',
    usageContext: 'Brand marketing and advertising campaigns',
  },
  {
    tokenId: 2,
    creatorAddress: '0x8ba1f109551bd432803012645ac136ddd64dba72',
    currentOwner: '0x8ba1f109551bd432803012645ac136ddd64dba72',
    companyName: 'StyleHub Fashion',
    sloganText: 'Wear Your Values',
    registrationNumber: 'TM2024002',
    category: 'Fashion & Apparel',
    description: 'Empowering slogan for sustainable and ethical fashion brand',
    ipfsHash: 'QmStyleHub456',
    royaltyPercentage: 15,
    verified: true,
    verificationStatus: 'verified',
    language: 'English',
    usageContext: 'Product tags and marketing materials',
  },
  {
    tokenId: 3,
    creatorAddress: '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed',
    currentOwner: '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed',
    companyName: 'EcoFresh Foods',
    sloganText: 'Nature\'s Goodness, Delivered Fresh',
    registrationNumber: 'TM2024003',
    category: 'Food & Beverage',
    description: 'Catchy slogan emphasizing organic and locally sourced food products',
    ipfsHash: 'QmEcoFresh789',
    royaltyPercentage: 8,
    verified: true,
    verificationStatus: 'verified',
    language: 'English',
    usageContext: 'Packaging and advertising',
  },
  {
    tokenId: 4,
    creatorAddress: '0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359',
    currentOwner: '0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359',
    companyName: 'HealthPlus Medical',
    sloganText: 'Your Health, Our Priority',
    registrationNumber: 'TM2024004',
    category: 'Healthcare',
    description: 'Reassuring slogan for comprehensive healthcare services',
    ipfsHash: 'QmHealthPlus012',
    royaltyPercentage: 12,
    verified: true,
    verificationStatus: 'verified',
    language: 'English',
    usageContext: 'Hospital signage and promotional materials',
  },
  {
    tokenId: 5,
    creatorAddress: '0x71c7656ec7ab88b098defb751b7401b5f6d8976f',
    currentOwner: '0x71c7656ec7ab88b098defb751b7401b5f6d8976f',
    companyName: 'AutoDrive Motors',
    sloganText: 'Drive the Future Today',
    registrationNumber: 'TM2024005',
    category: 'Automotive',
    description: 'Forward-thinking slogan for electric and autonomous vehicles',
    ipfsHash: 'QmAutoDrive345',
    royaltyPercentage: 10,
    verified: false,
    verificationStatus: 'pending',
    language: 'English',
    usageContext: 'Vehicle branding and commercials',
  },
];

// Real user data
const users = [
  {
    address: '0x742d35cc6634c0532925a3b844bc9e7595f0beb',
    name: 'Alice Johnson',
    email: 'alice@techvision.com',
    role: 'creator',
    verified: true,
    suspended: false,
  },
  {
    address: '0x8ba1f109551bd432803012645ac136ddd64dba72',
    name: 'Bob Smith',
    email: 'bob@stylehub.com',
    role: 'creator',
    verified: true,
    suspended: false,
  },
  {
    address: '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed',
    name: 'Carol Williams',
    email: 'carol@ecofresh.com',
    role: 'creator',
    verified: true,
    suspended: false,
  },
];

// Real marketplace listings
const listings = [
  {
    tokenId: 1,
    seller: '0x742d35cc6634c0532925a3b844bc9e7595f0beb',
    price: '2.5',
    active: true,
    status: 'active',
    listingType: 'sale',
  },
  {
    tokenId: 2,
    seller: '0x8ba1f109551bd432803012645ac136ddd64dba72',
    price: '3.0',
    active: true,
    status: 'active',
    listingType: 'sale',
  },
];

// Categories
const categories = [
  { name: 'Technology', trademarkCount: 1, icon: '💻' },
  { name: 'Fashion & Apparel', trademarkCount: 1, icon: '👗' },
  { name: 'Food & Beverage', trademarkCount: 1, icon: '🍔' },
  { name: 'Healthcare', trademarkCount: 1, icon: '🏥' },
  { name: 'Automotive', trademarkCount: 1, icon: '🚗' },
  { name: 'Education', trademarkCount: 0, icon: '📚' },
  { name: 'Energy', trademarkCount: 0, icon: '⚡' },
  { name: 'Sports & Recreation', trademarkCount: 0, icon: '⚽' },
  { name: 'Home & Garden', trademarkCount: 0, icon: '🏡' },
  { name: 'Beauty & Personal Care', trademarkCount: 0, icon: '💄' },
  { name: 'Travel & Tourism', trademarkCount: 0, icon: '✈️' },
  { name: 'Financial Services', trademarkCount: 0, icon: '💰' },
];

// Activity logs
const activityLogs = [
  {
    type: 'registration',
    tokenId: 1,
    userAddress: '0x742d35cc6634c0532925a3b844bc9e7595f0beb',
    description: 'Trademark registered: Innovation Beyond Imagination',
    timestamp: Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000)),
  },
  {
    type: 'listing',
    tokenId: 1,
    userAddress: '0x742d35cc6634c0532925a3b844bc9e7595f0beb',
    description: 'Listed for sale at 2.5 MATIC',
    timestamp: Timestamp.fromDate(new Date(Date.now() - 1 * 60 * 60 * 1000)),
  },
  {
    type: 'verification',
    tokenId: 1,
    description: 'Trademark verified by admin',
    timestamp: Timestamp.fromDate(new Date(Date.now() - 30 * 60 * 1000)),
  },
];

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Seed Trademarks
    console.log('📝 Seeding trademarks...');
    for (const trademark of trademarks) {
      const trademarkRef = doc(collection(db, 'trademarks'));
      await setDoc(trademarkRef, {
        ...trademark,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      console.log(`  ✅ Added: ${trademark.sloganText}`);
    }

    // Seed Users
    console.log('\n👥 Seeding users...');
    for (const user of users) {
      const userRef = doc(db, 'users', user.address);
      await setDoc(userRef, {
        ...user,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      console.log(`  ✅ Added: ${user.name}`);
    }

    // Seed Listings
    console.log('\n🏪 Seeding marketplace listings...');
    for (const listing of listings) {
      const listingRef = doc(collection(db, 'listings'));
      await setDoc(listingRef, {
        ...listing,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      console.log(`  ✅ Added listing for token #${listing.tokenId}`);
    }

    // Seed Categories
    console.log('\n📂 Seeding categories...');
    for (const category of categories) {
      const categoryRef = doc(collection(db, 'categories'));
      await setDoc(categoryRef, {
        ...category,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      console.log(`  ✅ Added: ${category.name}`);
    }

    // Seed Activity Logs
    console.log('\n📊 Seeding activity logs...');
    for (const activity of activityLogs) {
      const activityRef = doc(collection(db, 'activity_logs'));
      await setDoc(activityRef, activity);
      console.log(`  ✅ Added: ${activity.description}`);
    }

    console.log('\n✨ Database seeding completed successfully!');
    console.log('\n📈 Summary:');
    console.log(`  - ${trademarks.length} trademarks`);
    console.log(`  - ${users.length} users`);
    console.log(`  - ${listings.length} listings`);
    console.log(`  - ${categories.length} categories`);
    console.log(`  - ${activityLogs.length} activity logs`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding
seedDatabase();
