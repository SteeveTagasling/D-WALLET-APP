import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  AUTH_USER: 'dwallet_auth_user',
  AUTH_PIN: 'dwallet_auth_pin',
  IS_LOGGED_IN: 'dwallet_logged_in',
};

export interface AuthUser {
  phone: string;
  firstName: string;
  lastName: string;
  registeredAt: string;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.AUTH_USER);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export async function saveAuthUser(user: AuthUser): Promise<void> {
  await AsyncStorage.setItem(KEYS.AUTH_USER, JSON.stringify(user));
}

export async function getPin(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(KEYS.AUTH_PIN);
  } catch { return null; }
}

export async function savePin(pin: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.AUTH_PIN, pin);
}

export async function isLoggedIn(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(KEYS.IS_LOGGED_IN);
    return val === 'true';
  } catch { return false; }
}

export async function setLoggedIn(val: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.IS_LOGGED_IN, val ? 'true' : 'false');
}

export async function signOut(): Promise<void> {
  await AsyncStorage.setItem(KEYS.IS_LOGGED_IN, 'false');
}

export async function clearAuth(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.AUTH_USER, KEYS.AUTH_PIN, KEYS.IS_LOGGED_IN]);
}

// Simulates OTP — generates random 6-digit code and logs it
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}