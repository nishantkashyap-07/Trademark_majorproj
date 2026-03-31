#!/usr/bin/env node
/**
 * Fix Image URLs in Firebase
 * Updates all trademarks to have correct imageUrl based on ipfsHash
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');
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

console.log('Connecting to Firebase...');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixImageUrls() {
  console.log('\n🔧 Starting image URL fix...\n');

  try {
    // Get all trademarks
    const trademarksSnapshot = await getDocs(collection(db, 'trademarks'));
    
    if (trademarksSnapshot.empty) {
      console.log('No trademarks found in database.');
      process.exit(0);
    }

    console.log(`Found ${trademarksSnapshot.size} trademarks\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const docSnapshot of trademarksSnapshot.docs) {
      const data = docSnapshot.data();
      const docId = docSnapshot.id;
      
      console.log(`\n📄 Trademark: ${data.sloganText || data.trademarkName || 'Unnamed'}`);
      console.log(`   ID: ${docId}`);
      console.log(`   Current imageUrl: ${data.imageUrl || 'NOT SET'}`);
      console.log(`   IPFS Hash: ${data.ipfsHash || 'NOT SET'}`);

      if (!data.ipfsHash) {
        console.log('   ⚠️  No IPFS hash, skipping...');
        skippedCount++;
        continue;
      }

      // Construct correct image URL
      const correctImageUrl = `https://gateway.pinata.cloud/ipfs/${data.ipfsHash}`;
      
      // Check if update is needed
      if (data.imageUrl === correctImageUrl) {
        console.log('   ✓ Image URL already correct');
        skippedCount++;
        continue;
      }

      // Update the document
      const docRef = doc(db, 'trademarks', docId);
      await updateDoc(docRef, {
        imageUrl: correctImageUrl,
        updatedAt: new Date(),
      });

      console.log(`   ✅ Updated imageUrl to: ${correctImageUrl}`);
      updatedCount++;
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ Image URL fix completed!');
    console.log('='.repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   - Total trademarks: ${trademarksSnapshot.size}`);
    console.log(`   - Updated: ${updatedCount}`);
    console.log(`   - Skipped: ${skippedCount}`);
    console.log('\n💡 Refresh your browser to see the images!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error fixing image URLs:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

// Run the fix
fixImageUrls();
