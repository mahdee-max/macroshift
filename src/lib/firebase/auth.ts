import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "./config";

// --- Local Storage Mock Auth for Offline / Local Dev ---
const LOCAL_USERS_KEY = "macroshift_registered_users";
const LOCAL_SESSION_KEY = "macroshift_active_session";

type AuthListener = (user: User | null) => void;
const listeners: Set<AuthListener> = new Set();

function notifyListeners(user: User | null) {
  listeners.forEach((listener) => listener(user));
}

function getStoredUsers(): Record<string, { email: string; password: string;displayName: string; uid: string }> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function getActiveSession(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setActiveSession(user: User | null) {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(LOCAL_SESSION_KEY);
  }
  notifyListeners(user);
}

function createMockUser(uid: string, email: string, displayName: string): User {
  return {
    uid,
    email,
    displayName,
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: "",
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => "mock-token",
    getIdTokenResult: async () => ({} as any),
    reload: async () => {},
    toJSON: () => ({}),
    phoneNumber: null,
    photoURL: null,
    providerId: "firebase",
  } as unknown as User;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  if (!isFirebaseConfigured) {
    const users = getStoredUsers();
    const lowerEmail = email.toLowerCase().trim();

    if (users[lowerEmail]) {
      const error: any = new Error("Email already registered");
      error.code = "auth/email-already-in-use";
      throw error;
    }

    const uid = `user_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    users[lowerEmail] = { email: lowerEmail, password, displayName, uid };
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));

    const mockUser = createMockUser(uid, lowerEmail, displayName);
    setActiveSession(mockUser);
    return mockUser;
  }

  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  return credential.user;
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<User> {
  if (!isFirebaseConfigured) {
    const users = getStoredUsers();
    const lowerEmail = email.toLowerCase().trim();
    const existing = users[lowerEmail];

    if (!existing || existing.password !== password) {
      const error: any = new Error("Invalid email or password");
      error.code = "auth/invalid-credential";
      throw error;
    }

    const mockUser = createMockUser(existing.uid, existing.email, existing.displayName);
    setActiveSession(mockUser);
    return mockUser;
  }

  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signInWithGoogle(): Promise<User> {
  if (!isFirebaseConfigured) {
    const mockUser = createMockUser("google_user_demo", "demo@macroshift.app", "Google Athlete");
    setActiveSession(mockUser);
    return mockUser;
  }

  const credential = await signInWithPopup(auth, googleProvider);
  return credential.user;
}

export async function signOut(): Promise<void> {
  if (!isFirebaseConfigured) {
    setActiveSession(null);
    return;
  }
  await firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  if (!isFirebaseConfigured) {
    listeners.add(callback);
    // Initial emit
    callback(getActiveSession());
    return () => {
      listeners.delete(callback);
    };
  }

  return onAuthStateChanged(auth, callback);
}
