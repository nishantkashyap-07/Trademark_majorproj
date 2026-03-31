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

  async getTrademarks() {
    try {
      const q = query(
        collection(db, 'trademarks'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const trademarks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, data: trademarks };
    } catch (error: any) {
      console.error('Get Trademarks Error:', error);
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

  // Rating methods
  async createRating(data: any) {
    try {
      const ratingRef = doc(collection(db, 'ratings'));
      await setDoc(ratingRef, {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return { success: true, id: ratingRef.id };
    } catch (error: any) {
      console.error('Create Rating Error:', error);
      return { success: false, error: error.message };
    }
  }

  async getRatingsByCreator(creatorAddress: string) {
    try {
      const q = query(
        collection(db, 'ratings'),
        where('creatorAddress', '==', creatorAddress.toLowerCase()),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const ratings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, data: ratings };
    } catch (error: any) {
      console.error('Get Ratings By Creator Error:', error);
      return { success: false, error: error.message };
    }
  }

  async getAverageRating(creatorAddress: string) {
    try {
      const result = await this.getRatingsByCreator(creatorAddress);
      if (!result.success || !result.data || result.data.length === 0) {
        return { success: true, data: { average: 0, count: 0 } };
      }

      const ratings = result.data;
      const sum = ratings.reduce((acc: number, r: any) => acc + r.rating, 0);
      const average = sum / ratings.length;

      return {
        success: true,
        data: {
          average: Math.round(average * 10) / 10,
          count: ratings.length,
        },
      };
    } catch (error: any) {
      console.error('Get Average Rating Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Notification methods
  async createNotification(data: any) {
    try {
      const notificationRef = doc(collection(db, 'notifications'));
      await setDoc(notificationRef, {
        ...data,
        read: false,
        createdAt: Timestamp.now(),
      });
      return { success: true, id: notificationRef.id };
    } catch (error: any) {
      console.error('Create Notification Error:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserNotifications(userId: string, unreadOnly: boolean = false) {
    try {
      let q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId.toLowerCase()),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      if (unreadOnly) {
        q = query(q, where('read', '==', false));
      }

      const snapshot = await getDocs(q);
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, data: notifications };
    } catch (error: any) {
      console.error('Get User Notifications Error:', error);
      return { success: false, error: error.message };
    }
  }

  async markNotificationAsRead(notificationId: string) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: Timestamp.now(),
      });
      return { success: true };
    } catch (error: any) {
      console.error('Mark Notification As Read Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Report methods
  async createReport(data: any) {
    try {
      const reportRef = doc(collection(db, 'reports'));
      await setDoc(reportRef, {
        ...data,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return { success: true, id: reportRef.id };
    } catch (error: any) {
      console.error('Create Report Error:', error);
      return { success: false, error: error.message };
    }
  }

  async getReports(status?: string) {
    try {
      let q = query(
        collection(db, 'reports'),
        orderBy('createdAt', 'desc'),
        limit(100)
      );

      if (status) {
        q = query(q, where('status', '==', status));
      }

      const snapshot = await getDocs(q);
      const reports = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, data: reports };
    } catch (error: any) {
      console.error('Get Reports Error:', error);
      return { success: false, error: error.message };
    }
  }

  async updateReport(reportId: string, data: any) {
    try {
      const reportRef = doc(db, 'reports', reportId);
      await updateDoc(reportRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
      return { success: true };
    } catch (error: any) {
      console.error('Update Report Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Admin Log methods
  async createAdminLog(data: any) {
    try {
      const logRef = doc(collection(db, 'admin_logs'));
      await setDoc(logRef, {
        ...data,
        timestamp: Timestamp.now(),
      });
      return { success: true, id: logRef.id };
    } catch (error: any) {
      console.error('Create Admin Log Error:', error);
      return { success: false, error: error.message };
    }
  }

  async getAdminLogs(limitCount: number = 100) {
    try {
      const q = query(
        collection(db, 'admin_logs'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, data: logs };
    } catch (error: any) {
      console.error('Get Admin Logs Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Category methods
  async getCategories() {
    try {
      const q = query(
        collection(db, 'categories'),
        orderBy('name', 'asc')
      );

      const snapshot = await getDocs(q);
      const categories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, data: categories };
    } catch (error: any) {
      console.error('Get Categories Error:', error);
      return { success: false, error: error.message };
    }
  }

  async updateCategory(categoryId: string, data: any) {
    try {
      const categoryRef = doc(db, 'categories', categoryId);
      await updateDoc(categoryRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
      return { success: true };
    } catch (error: any) {
      console.error('Update Category Error:', error);
      return { success: false, error: error.message };
    }
  }

  async incrementCategoryCount(categoryName: string) {
    try {
      const q = query(
        collection(db, 'categories'),
        where('name', '==', categoryName),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const categoryRef = snapshot.docs[0].ref;
        const currentCount = snapshot.docs[0].data().trademarkCount || 0;
        await updateDoc(categoryRef, {
          trademarkCount: currentCount + 1,
          updatedAt: Timestamp.now(),
        });
      }

      return { success: true };
    } catch (error: any) {
      console.error('Increment Category Count Error:', error);
      return { success: false, error: error.message };
    }
  }

  // User suspension methods
  async suspendUser(address: string, reason: string, adminAddress: string) {
    try {
      const userRef = doc(db, 'users', address.toLowerCase());
      await updateDoc(userRef, {
        suspended: true,
        suspensionReason: reason,
        suspendedAt: Timestamp.now(),
        suspendedBy: adminAddress,
        updatedAt: Timestamp.now(),
      });

      // Create admin log
      await this.createAdminLog({
        adminAddress,
        action: 'suspend_user',
        targetType: 'user',
        targetId: address.toLowerCase(),
        reason,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Suspend User Error:', error);
      return { success: false, error: error.message };
    }
  }

  async unsuspendUser(address: string, adminAddress: string) {
    try {
      const userRef = doc(db, 'users', address.toLowerCase());
      await updateDoc(userRef, {
        suspended: false,
        suspensionReason: null,
        unsuspendedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return { success: true };
    } catch (error: any) {
      console.error('Unsuspend User Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Listing suspension methods
  async suspendListing(listingId: string, reason: string, adminAddress: string) {
    try {
      const listingRef = doc(db, 'listings', listingId);
      await updateDoc(listingRef, {
        suspended: true,
        suspensionReason: reason,
        status: 'suspended',
        suspendedAt: Timestamp.now(),
        suspendedBy: adminAddress,
        updatedAt: Timestamp.now(),
      });

      // Create admin log
      await this.createAdminLog({
        adminAddress,
        action: 'suspend_listing',
        targetType: 'listing',
        targetId: listingId,
        reason,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Suspend Listing Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Trademark verification methods
  async verifyTrademark(tokenId: number, adminAddress: string) {
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
          verified: true,
          verificationStatus: 'verified',
          verifiedBy: adminAddress,
          verifiedAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        // Create admin log
        await this.createAdminLog({
          adminAddress,
          action: 'verify',
          targetType: 'trademark',
          targetId: tokenId.toString(),
        });
      }

      return { success: true };
    } catch (error: any) {
      console.error('Verify Trademark Error:', error);
      return { success: false, error: error.message };
    }
  }

  async rejectTrademark(tokenId: number, reason: string, adminAddress: string) {
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
          verified: false,
          verificationStatus: 'rejected',
          rejectionReason: reason,
          verifiedBy: adminAddress,
          verifiedAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        // Create admin log
        await this.createAdminLog({
          adminAddress,
          action: 'reject',
          targetType: 'trademark',
          targetId: tokenId.toString(),
          reason,
        });
      }

      return { success: true };
    } catch (error: any) {
      console.error('Reject Trademark Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Statistics methods
  async getStats() {
    try {
      const [trademarksSnap, usersSnap, listingsSnap, transactionsSnap] = await Promise.all([
        getDocs(collection(db, 'trademarks')),
        getDocs(collection(db, 'users')),
        getDocs(query(collection(db, 'listings'), where('active', '==', true))),
        getDocs(collection(db, 'transactions')),
      ]);

      return {
        success: true,
        data: {
          totalTrademarks: trademarksSnap.size,
          totalUsers: usersSnap.size,
          activeListings: listingsSnap.size,
          totalTransactions: transactionsSnap.size,
        },
      };
    } catch (error: any) {
      console.error('Get Stats Error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export const dbService = new DatabaseService();

// Export class for testing
export default DatabaseService;