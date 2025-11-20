// Database service for Firestore operations

import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';

export class DatabaseService {
  // Trademarks Collection
  async createTrademark(data: any) {
    try {
      const trademarkRef = doc(collection(db, 'trademarks'));
      await setDoc(trademarkRef, {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return { success: true, id: trademarkRef.id };
    } catch (error: any) {
      console.error('Create Trademark Error:', error);
      return { success: false, error: error.message };
    }
  }

  async getTrademark(id: string) {
    try {
      const trademarkRef = doc(db, 'trademarks', id);
      const trademarkSnap = await getDoc(trademarkRef);

      if (!trademarkSnap.exists()) {
        return { success: false, error: 'Trademark not found' };
      }

      return {
        success: true,
        data: { id: trademarkSnap.id, ...trademarkSnap.data() },
      };
    } catch (error: any) {
      console.error('Get Trademark Error:', error);
      return { success: false, error: error.message };
    }
  }

  async getTrademarksByOwner(ownerAddress: string) {
    try {
      const q = query(
        collection(db, 'trademarks'),
        where('creatorAddress', '==', ownerAddress.toLowerCase()),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const trademarks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, data: trademarks };
    } catch (error: any) {
      console.error('Get Trademarks By Owner Error:', error);
      return { success: false, error: error.message };
    }
  }

  async updateTrademark(id: string, data: any) {
    try {
      const trademarkRef = doc(db, 'trademarks', id);
      await updateDoc(trademarkRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
      return { success: true };
    } catch (error: any) {
      console.error('Update Trademark Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Users Collection
  async createOrUpdateUser(address: string, data: any) {
    try {
      const userRef = doc(db, 'users', address.toLowerCase());
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        await updateDoc(userRef, {
          ...data,
          updatedAt: Timestamp.now(),
        });
      } else {
        await setDoc(userRef, {
          address: address.toLowerCase(),
          ...data,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }

      return { success: true };
    } catch (error: any) {
      console.error('Create/Update User Error:', error);
      return { success: false, error: error.message };
    }
  }

  async getUser(address: string) {
    try {
      const userRef = doc(db, 'users', address.toLowerCase());
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return { success: false, error: 'User not found' };
      }

      return {
        success: true,
        data: { address: userSnap.id, ...userSnap.data() },
      };
    } catch (error: any) {
      console.error('Get User Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Transactions Collection
  async createTransaction(data: any) {
    try {
      const transactionRef = doc(collection(db, 'transactions'));
      await setDoc(transactionRef, {
        ...data,
        createdAt: Timestamp.now(),
      });
      return { success: true, id: transactionRef.id };
    } catch (error: any) {
      console.error('Create Transaction Error:', error);
      return { success: false, error: error.message };
    }
  }

  async getTransactionsByUser(userAddress: string) {
    try {
      const q = query(
        collection(db, 'transactions'),
        where('fromAddress', '==', userAddress.toLowerCase()),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(q);
      const transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, data: transactions };
    } catch (error: any) {
      console.error('Get Transactions Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Listings Collection
  async createListing(data: any) {
    try {
      const listingRef = doc(collection(db, 'listings'));
      await setDoc(listingRef, {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return { success: true, id: listingRef.id };
    } catch (error: any) {
      console.error('Create Listing Error:', error);
      return { success: false, error: error.message };
    }
  }

  async getActiveListings() {
    try {
      const q = query(
        collection(db, 'listings'),
        where('active', '==', true),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(q);
      const listings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, data: listings };
    } catch (error: any) {
      console.error('Get Active Listings Error:', error);
      return { success: false, error: error.message };
    }
  }

  async updateListing(id: string, data: any) {
    try {
      const listingRef = doc(db, 'listings', id);
      await updateDoc(listingRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
      return { success: true };
    } catch (error: any) {
      console.error('Update Listing Error:', error);
      return { success: false, error: error.message };
    }
  }

  async getListing(id: string) {
    try {
      const listingRef = doc(db, 'listings', id);
      const listingSnap = await getDoc(listingRef);

      if (!listingSnap.exists()) {
        return { success: false, error: 'Listing not found' };
      }

      const listingData = listingSnap.data();
      
      // Get trademark data if tokenId exists
      if (listingData?.tokenId) {
        const q = query(
          collection(db, 'trademarks'),
          where('tokenId', '==', listingData.tokenId),
          limit(1)
        );
        const trademarkSnap = await getDocs(q);
        
        if (!trademarkSnap.empty) {
          const trademarkData = trademarkSnap.docs[0].data();
          return {
            success: true,
            data: {
              id: listingSnap.id,
              ...listingData,
              trademark: trademarkData,
            },
          };
        }
      }

      return {
        success: true,
        data: { id: listingSnap.id, ...listingData },
      };
    } catch (error: any) {
      console.error('Get Listing Error:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteListing(id: string) {
    try {
      const listingRef = doc(db, 'listings', id);
      await deleteDoc(listingRef);
      return { success: true };
    } catch (error: any) {
      console.error('Delete Listing Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Purchase methods
  async createPurchase(data: any) {
    try {
      const purchaseRef = doc(collection(db, 'purchases'));
      await setDoc(purchaseRef, {
        ...data,
        createdAt: Timestamp.now(),
      });
      return { success: true, id: purchaseRef.id, data };
    } catch (error: any) {
      console.error('Create Purchase Error:', error);
      return { success: false, error: error.message };
    }
  }

  // License methods
  async createLicense(data: any) {
    try {
      const licenseRef = doc(collection(db, 'licenses'));
      await setDoc(licenseRef, {
        ...data,
        createdAt: Timestamp.now(),
      });
      return { success: true, id: licenseRef.id, data };
    } catch (error: any) {
      console.error('Create License Error:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserLicenses(address: string) {
    try {
      const q = query(
        collection(db, 'licenses'),
        where('licensee', '==', address.toLowerCase()),
        orderBy('issuedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const licenses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, data: licenses };
    } catch (error: any) {
      console.error('Get User Licenses Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Update trademark owner
  async updateTrademarkOwner(tokenId: number, newOwner: string) {
    try {
      const q = query(
        collection(db, 'trademarks'),
        where('tokenId', '==', tokenId),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const trademarkRef = snapshot.docs[0].ref;
        await updateDoc(trademarkRef, {
          currentOwner: newOwner.toLowerCase(),
          updatedAt: Timestamp.now(),
        });
      }

      return { success: true };
    } catch (error: any) {
      console.error('Update Trademark Owner Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Activity log
  async createActivityLog(data: any) {
    try {
      const activityRef = doc(collection(db, 'activity_logs'));
      await setDoc(activityRef, {
        ...data,
        createdAt: Timestamp.now(),
      });
      return { success: true, id: activityRef.id };
    } catch (error: any) {
      console.error('Create Activity Log Error:', error);
      return { success: false, error: error.message };
    }
  }

  async getRecentActivity(limitCount: number = 50) {
    try {
      const q = query(
        collection(db, 'activity_logs'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, data: activities };
    } catch (error: any) {
      console.error('Get Recent Activity Error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export const dbService = new DatabaseService();

// Export class for testing
export default DatabaseService;