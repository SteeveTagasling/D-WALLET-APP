export type IDStatus = 'valid' | 'expiring' | 'expired';

export interface StoredID {
  id: string;
  name: string;
  expiryDate: string;
  expiryDisplay: string;
  status: IDStatus;
  iconEmoji: string;
  iconColor: string;
  cardNumber?: string;
  issuedBy?: string;
}

export interface PaymentAccount {
  id: string;
  name: string;
  phoneNumber: string;
  balance: number;
  initial: string;
  color: string;
  bgColor: string;
  isLinked: boolean;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  initials: string;
  email: string;
  phone: string;
  memberSince: string;
  planType: 'Free' | 'Plus' | 'Pro';
}
