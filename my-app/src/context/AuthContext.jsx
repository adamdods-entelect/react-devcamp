import { createContext, useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../services/firebase'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // read the stored token once, on first render, to decide the starting status
  const [status, setStatus] = useState(() =>
    localStorage.getItem('accessToken') ? 'authenticated' : 'unauthenticated'
  )

  const login = (token) => {
    localStorage.setItem('accessToken', token)
    setStatus('authenticated')
  }

  const loginAsGuest = () => {
    setStatus('guest')
  }

  const logout = async () => {
    localStorage.removeItem('accessToken')
    if (auth.currentUser) await signOut(auth) // clear any Google/Firebase session too
    setStatus('unauthenticated')
  }

  const value = { status, login, loginAsGuest, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
