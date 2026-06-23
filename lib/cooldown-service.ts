/**
 * CooldownService
 * ───────────────
 * Manages per-wallet registration cooldowns stored in Firestore.
 *
 * Rules (7-day rolling window):
 *   1st registration  → no cooldown
 *   2nd registration  → 12 hours
 *   3rd registration  → 24 hours
 *   4th+ registration → 72 hours
 *   Rejected asset    → 7-day ban (set explicitly by admin reject API)
 */

import { db } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';

const COLLECTION = 'registration_cooldowns';

// Cooldown durations in milliseconds
const COOLDOWN_MS = {
  NONE: 0,
  HOURS_12: 12 * 60 * 60 * 1000,
  HOURS_24: 24 * 60 * 60 * 1000,
  HOURS_72: 72 * 60 * 60 * 1000,
  DAYS_7: 7 * 24 * 60 * 60 * 1000,
};

export interface CooldownStatus {
  allowed: boolean;
  registrationsThisWeek: number;
  cooldownEndsAt: Date | null;
  remainingMs: number;
  remainingFormatted: string;
  isBanned: boolean;
}

function formatDuration(ms: number): string {
  if (ms <= 0) return '0 seconds';
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function calculateCooldownMs(registrationsThisWeek: number): number {
  if (registrationsThisWeek <= 0) return COOLDOWN_MS.NONE;
  if (registrationsThisWeek === 1) return COOLDOWN_MS.HOURS_12; // 12h wait before 2nd registration
  if (registrationsThisWeek === 2) return COOLDOWN_MS.HOURS_24; // 24h wait before 3rd registration
  return COOLDOWN_MS.HOURS_72; // 72h wait for 4th and beyond
}

export class CooldownService {
  /**
   * Get current cooldown status for a wallet address.
   * Does NOT modify any data.
   */
  async getStatus(walletAddress: string): Promise<CooldownStatus> {
    // Feature Flag: Disable cooldowns for testing if env var is not 'true'
    if (process.env.NEXT_PUBLIC_ENABLE_COOLDOWN !== 'true') {
      return {
        allowed: true,
        registrationsThisWeek: 0,
        cooldownEndsAt: null,
        remainingMs: 0,
        remainingFormatted: '',
        isBanned: false,
      };
    }

    const address = walletAddress.toLowerCase();
    const ref = doc(db, COLLECTION, address);
    const snap = await getDoc(ref);

    const now = Date.now();

    if (!snap.exists()) {
      return {
        allowed: true,
        registrationsThisWeek: 0,
        cooldownEndsAt: null,
        remainingMs: 0,
        remainingFormatted: '',
        isBanned: false,
      };
    }

    const data = snap.data();

    // Check 7-day ban (from rejection)
    const banEndsAt: Date | null = data.banEndsAt?.toDate?.() ?? null;
    if (banEndsAt && banEndsAt.getTime() > now) {
      const remainingMs = banEndsAt.getTime() - now;
      return {
        allowed: false,
        registrationsThisWeek: data.registrationsThisWeek ?? 0,
        cooldownEndsAt: banEndsAt,
        remainingMs,
        remainingFormatted: formatDuration(remainingMs),
        isBanned: true,
      };
    }

    // Reset weekly window if more than 7 days have passed
    const weekStartAt: Date = data.weekStartAt?.toDate?.() ?? new Date(0);
    const weekElapsedMs = now - weekStartAt.getTime();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    let registrationsThisWeek: number =
      weekElapsedMs >= sevenDaysMs ? 0 : (data.registrationsThisWeek ?? 0);

    // Check cooldown from last registration
    const lastRegisteredAt: Date | null =
      data.lastRegisteredAt?.toDate?.() ?? null;

    if (lastRegisteredAt && registrationsThisWeek > 0) {
      const cooldownDuration = calculateCooldownMs(registrationsThisWeek);
      const cooldownEndsAt = new Date(
        lastRegisteredAt.getTime() + cooldownDuration
      );

      if (cooldownEndsAt.getTime() > now) {
        const remainingMs = cooldownEndsAt.getTime() - now;
        return {
          allowed: false,
          registrationsThisWeek,
          cooldownEndsAt,
          remainingMs,
          remainingFormatted: formatDuration(remainingMs),
          isBanned: false,
        };
      }
    }

    return {
      allowed: true,
      registrationsThisWeek,
      cooldownEndsAt: null,
      remainingMs: 0,
      remainingFormatted: '',
      isBanned: false,
    };
  }

  /**
   * Record a successful registration for a wallet.
   * Call this AFTER the asset is saved to Firestore.
   */
  async recordRegistration(walletAddress: string): Promise<void> {
    if (process.env.NEXT_PUBLIC_ENABLE_COOLDOWN !== 'true') return;

    const address = walletAddress.toLowerCase();
    const ref = doc(db, COLLECTION, address);
    const snap = await getDoc(ref);
    const now = Timestamp.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    if (!snap.exists()) {
      await setDoc(ref, {
        walletAddress: address,
        registrationsThisWeek: 1,
        weekStartAt: now,
        lastRegisteredAt: now,
        banEndsAt: null,
        updatedAt: now,
      });
      return;
    }

    const data = snap.data();
    const weekStartAt: Date = data.weekStartAt?.toDate?.() ?? new Date(0);
    const weekElapsedMs = Date.now() - weekStartAt.getTime();

    // Reset weekly counter if window has expired
    const newCount =
      weekElapsedMs >= sevenDaysMs
        ? 1
        : (data.registrationsThisWeek ?? 0) + 1;

    const newWeekStart =
      weekElapsedMs >= sevenDaysMs ? now : data.weekStartAt;

    await updateDoc(ref, {
      registrationsThisWeek: newCount,
      weekStartAt: newWeekStart,
      lastRegisteredAt: now,
      updatedAt: now,
    });
  }

  /**
   * Apply a 7-day registration ban to a wallet.
   * Called by the admin reject API.
   */
  async applyRejectionBan(walletAddress: string): Promise<void> {
    const address = walletAddress.toLowerCase();
    const ref = doc(db, COLLECTION, address);
    const snap = await getDoc(ref);

    const banEndsAt = Timestamp.fromDate(
      new Date(Date.now() + COOLDOWN_MS.DAYS_7)
    );
    const now = Timestamp.now();

    if (!snap.exists()) {
      await setDoc(ref, {
        walletAddress: address,
        registrationsThisWeek: 0,
        weekStartAt: now,
        lastRegisteredAt: null,
        banEndsAt,
        updatedAt: now,
      });
    } else {
      await updateDoc(ref, {
        banEndsAt,
        updatedAt: now,
      });
    }
  }
}

export const cooldownService = new CooldownService();
