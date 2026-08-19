// ─── Firebase Config ─────────────────────────────────────────────────────────
// Substitua pelos dados do SEU projeto em console.firebase.google.com
// Enquanto não configurado, o sistema roda em Modo Demonstração (localStorage)
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'

// 1. Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBgUE2MepFG7-7foEgCxYCeNfq2hbNA_4I",
  authDomain: "irpv-v2.firebaseapp.com",
  projectId: "irpv-v2",
  storageBucket: "irpv-v2.firebasestorage.app",
  messagingSenderId: "1019576832388",
  appId: "1:1019576832388:web:cafa541a7d65a5f4278dd1"
}

// 2. Detecta se está em modo demo
export const isDemoMode = firebaseConfig.apiKey === "SUA_API_KEY"

// 3. Inicialização segura do App (evita re-inicialização em reloads do Vite)
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (!isDemoMode) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db };

