import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StoredID, PaymentAccount, UserProfile } from './types';

const KEYS = {
  IDS: 'dwallet_ids',
  ACCOUNTS: 'dwallet_accounts',
  USER: 'dwallet_user',
};

// ─── Default Data ───────────────────────────────────────────────
const DEFAULT_USER: UserProfile = {
  firstName: 'Juan',
  lastName: 'Dela Cruz',
  initials: 'JD',
  email: 'juan.delacruz@email.com',
  phone: '09XX XXX 9999',
  memberSince: 'January 2024',
  planType: 'Free',
};

const DEFAULT_IDS: StoredID[] = [
  {
    id: '1',
    name: 'PhilSys ID',
    expiryDate: '2030-12-31',
    expiryDisplay: 'Exp: 2030',
    status: 'valid',
    iconEmoji: '🪪',
    iconColor: '#3B82F6',
    issuedBy: 'PSA Philippines',
  },
  {
    id: '2',
    name: "Driver's License",
    expiryDate: '2025-10-31',
    expiryDisplay: 'Exp: Oct 2025',
    status: 'expiring',
    iconEmoji: '🚗',
    iconColor: '#EF4444',
    issuedBy: 'LTO Philippines',
    cardNumber: 'N01-23-456789',
  },
];

const DEFAULT_ACCOUNTS: PaymentAccount[] = [
  {
    id: '1',
    name: 'GCash',
    phoneNumber: '09XX XXX 1234',
    balance: 2450.0,
    initial: 'G',
    color: '#FFFFFF',
    bgColor: '#3B5BDB',
    isLinked: true,
  },
  {
    id: '2',
    name: 'Maya',
    phoneNumber: '09XX XXX 5678',
    balance: 8100.0,
    initial: 'M',
    color: '#FFFFFF',
    bgColor: '#8B5CF6',
    isLinked: true,
  },
];

// ─── IDs ─────────────────────────────────────────────────────────
export async function loadIDs(): Promise<StoredID[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.IDS);
    if (raw) return JSON.parse(raw);
    await saveIDs(DEFAULT_IDS);
    return DEFAULT_IDS;
  } catch {
    return DEFAULT_IDS;
  }
}

export async function saveIDs(ids: StoredID[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.IDS, JSON.stringify(ids));
  } catch (e) {
    console.error('Failed to save IDs', e);
  }
}

// ─── Accounts ────────────────────────────────────────────────────
export async function loadAccounts(): Promise<PaymentAccount[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.ACCOUNTS);
    if (raw) return JSON.parse(raw);
    await saveAccounts(DEFAULT_ACCOUNTS);
    return DEFAULT_ACCOUNTS;
  } catch {
    return DEFAULT_ACCOUNTS;
  }
}

export async function saveAccounts(accounts: PaymentAccount[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save accounts', e);
  }
}

// ─── User ─────────────────────────────────────────────────────────
export async function loadUser(): Promise<UserProfile> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.USER);
    if (raw) return JSON.parse(raw);
    await saveUser(DEFAULT_USER);
    return DEFAULT_USER;
  } catch {
    return DEFAULT_USER;
  }
}

export async function saveUser(user: UserProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save user', e);
  }
}

// ─── Clear All (for sign out) ─────────────────────────────────────
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([KEYS.IDS, KEYS.ACCOUNTS, KEYS.USER]);
  } catch (e) {
    console.error('Failed to clear data', e);
  }
}