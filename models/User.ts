export type UserRole = 'admin' | 'staff' | 'student';

export interface User {
  uid: string;
  authUid: string;
  email: string;
  firstName: string;
  lastName: string;
  cardNumber: string;
  nfcId?: string; // Optional - assigned by admin after approval
  imageUrl?: string;
  role: UserRole;
  department: string;
  isActive: boolean;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  cardNumber: string;
  imageBase64?: string;
  role: UserRole;
  department: string;
}

export interface LoginCredentials {
  cardNumber: string;
  password: string;
}

