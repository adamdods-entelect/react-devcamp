import { createContext, useState } from 'react'

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

  const logout = () => {
    localStorage.removeItem('accessToken')
    setStatus('unauthenticated')
  }

  const value = { status, login, loginAsGuest, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
