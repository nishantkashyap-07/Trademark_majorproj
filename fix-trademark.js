const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixTrademark() {
  try {
    // Get all trademarks
    const snapshot = await db.collection('trademarks').get();
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // If trademark has tokenId but no transactionHash, add a dummy one
      if (data.tokenId && !data.transactionHash) {
        console.log(`Fixing trademark ${doc.id}: ${data.trademarkName || data.sloganText}`);
        
        await db.collection('trademarks').doc(doc.id).update({
          transactionHash: '0x' + '0'.repeat(64), // Dummy hash
          verified: false,
          verificationStatus: 'pending'
        });
        
        console.log(`✓ Fixed ${doc.id}`);
      }
    }
    
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixTrademark();
