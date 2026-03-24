import type { StoredID, PaymentAccount, UserProfile } from './types';

export const mockUser: UserProfile = {
  firstName: 'Juan',
  lastName: 'Dela Cruz',
  initials: 'JD',
  email: 'juan.delacruz@email.com',
  phone: '09XX XXX 9999',
  memberSince: 'January 2024',
  planType: 'Free',
};

export const mockIDs: StoredID[] = [
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
  {
    id: '3',
    name: 'SSS ID',
    expiryDate: '2028-06-30',
    expiryDisplay: 'Exp: Jun 2028',
    status: 'valid',
    iconEmoji: '🏛️',
    iconColor: '#10B981',
    issuedBy: 'Social Security System',
    cardNumber: '34-5678901-2',
  },
  {
    id: '4',
    name: 'Passport',
    expiryDate: '2029-03-15',
    expiryDisplay: 'Exp: Mar 2029',
    status: 'valid',
    iconEmoji: '📘',
    iconColor: '#6366F1',
    issuedBy: 'DFA Philippines',
    cardNumber: 'P1234567A',
  },
];

export const mockAccounts: PaymentAccount[] = [
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
