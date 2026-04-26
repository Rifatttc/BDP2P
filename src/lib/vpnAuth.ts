import { db } from './firebase';
import { collection, query, where, getDocs, doc, setDoc, updateDoc, increment } from 'firebase/firestore';

export interface VpnUser {
  username: string;
  phone: string;
  password_hash: string;
  country?: string;
  mode: 'host' | 'client' | 'none';
  is_online: boolean;
  last_seen?: any;
  wireguard_public_key?: string;
  paired_with?: string;
  my_ip?: string;
  my_city?: string;
  my_isp?: string;
}

export function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return "h_" + Math.abs(hash).toString(36);
}

export function generatePairingCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const ADMIN_PHONE = "01338927171";
const ADMIN_USERNAME = "bdvpn_admin";
const ADMIN_PASSWORD = "bdvpn@2026";

export function isAdminLogin(input: string, password?: string): boolean {
  if (input === ADMIN_PHONE) return true;
  if (input === ADMIN_USERNAME && password === ADMIN_PASSWORD) return true;
  return false;
}

export function getAdminUsernameFromLogin(input: string): string {
  if (input === ADMIN_PHONE) return "Main Admin";
  return "Admin";
}

export function getStoredUser() {
  const user = localStorage.getItem('bdvpn_user');
  return user ? JSON.parse(user) : null;
}

export function setStoredUser(user: any) {
  localStorage.setItem('bdvpn_user', JSON.stringify(user));
}

export function clearStoredUser() {
  localStorage.removeItem('bdvpn_user');
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: 'local_auth', // We are using custom auth stored in localStorage for this app
      email: null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
