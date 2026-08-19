import { useState, useEffect } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth'
import { auth, isDemoMode } from '../lib/firebase'
import { traduzirErro } from '../lib/calc'

export interface AppUser {
  uid: string
  email: string | null
  displayName: string | null
}

const DEMO_USER: AppUser = { uid:'demo', email:'demo@irpc.local', displayName:'Modo Demonstração' }

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDemoMode) {
      setUser(DEMO_USER)
      setLoading(false)
      return
    }
    const unsub = onAuthStateChanged(auth!, u => {
      setUser(u ? { uid: u.uid, email: u.email, displayName: u.displayName } : null)
      setLoading(false)
    })
    return unsub
  }, [])

  const login = async (email: string, password: string): Promise<string | null> => {
    if (isDemoMode) { setUser(DEMO_USER); return null }
    try {
      await signInWithEmailAndPassword(auth!, email, password)
      return null
    } catch (e: any) { return traduzirErro(e.code) }
  }

  const register = async (name: string, email: string, password: string): Promise<string | null> => {
    if (isDemoMode) return 'Configure o Firebase para criar contas reais.'
    if (!name.trim()) return 'Informe o nome completo.'
    try {
      const cred = await createUserWithEmailAndPassword(auth!, email, password)
      await updateProfile(cred.user, { displayName: name })
      setUser({ uid: cred.user.uid, email: cred.user.email, displayName: name })
      return null
    } catch (e: any) { return traduzirErro(e.code) }
  }

  const logout = async () => {
    if (isDemoMode) { setUser(null); return }
    await signOut(auth!)
  }

  return { user, loading, isDemoMode, login, register, logout }
}
