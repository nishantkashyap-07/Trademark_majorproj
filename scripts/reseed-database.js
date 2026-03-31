#!/usr/bin/env node
/**
 * Database Re-seeding Script
 * Clears and re-populates Firebase Firestore with fresh demo data
 * 
 * Usage: node scripts/reseed-database.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDocs, deleteDoc, Timestamp } = require('firebase/firestore');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log('Firebase Config:', {
  projectId: firebaseConfig.projectId,
  hasApiKey: !!firebaseConfig.apiKey,
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Real trademark data with proper structure
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
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
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
    imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
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
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
    royaltyPercentage: 8,
    verified: true,
    verificationStatus: 'verified',
    language: 'English',
    usageContext: 'Packaging and advertising',
  },
];

async function clearCollection(collectionName) {
  console.log(`🗑️  Clearing ${collectionName}...`);
  const snapshot = await getDocs(collection(db, collectionName));
  const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
  console.log(`  ✅ Cleared ${snapshot.size} documents from ${collectionName}`);
}

async function reseedDatabase() {
  console.log('🌱 Starting database re-seeding...\n');

  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await clearCollection('trademarks');
    await clearCollection('users');
    await clearCollection('listings');
    
    console.log('\n📝 Seeding fresh trademarks...');
    for (const trademark of trademarks) {
      const trademarkRef = doc(collection(db, 'trademarks'));
      await setDoc(trademarkRef, {
        ...trademark,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      console.log(`  ✅ Added: ${trademark.sloganText} by ${trademark.companyName}`);
    }

    // Seed Users
    console.log('\n👥 Seeding users...');
    const users = [
      {
        address: '0x742d35cc6634c0532925a3b844bc9e7595f0beb',
        displayName: 'Alice Johnson',
        companyName: 'TechVision Inc.',
        email: 'alice@techvision.com',
        role: 'creator',
        verified: true,
        suspended: false,
        totalTrademarks: 1,
        totalProducts: 0,
        totalSales: 0,
        totalPurchases: 0,
        ratingCount: 0,
      },
      {
        address: '0x8ba1f109551bd432803012645ac136ddd64dba72',
        displayName: 'Bob Smith',
        companyName: 'StyleHub Fashion',
        email: 'bob@stylehub.com',
        role: 'creator',
        verified: true,
        suspended: false,
        totalTrademarks: 1,
        totalProducts: 0,
        totalSales: 0,
        totalPurchases: 0,
        ratingCount: 0,
      },
      {
        address: '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed',
        displayName: 'Carol Williams',
        companyName: 'EcoFresh Foods',
        email: 'carol@ecofresh.com',
        role: 'creator',
        verified: true,
        suspended: false,
        totalTrademarks: 1,
        totalProducts: 0,
        totalSales: 0,
        totalPurchases: 0,
        ratingCount: 0,
      },
    ];

    for (const user of users) {
      const userRef = doc(db, 'users', user.address);
      await setDoc(userRef, {
        ...user,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      console.log(`  ✅ Added: ${user.displayName}`);
    }

    console.log('\n✨ Database re-seeding completed successfully!');
    console.log('\n📈 Summary:');
    console.log(`  - ${trademarks.length} trademarks`);
    console.log(`  - ${users.length} users`);
    console.log('\n💡 Tip: Refresh your browser to see the new data!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error re-seeding database:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

// Run the re-seeding
reseedDatabase();
