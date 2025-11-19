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
}

// Export singleton instance
export const dbService = new DatabaseService();

// Export class for testing
export default DatabaseService;