import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'

import ProtectedRoute from './components/ProtectedRoute'
import LoadingPage from './pages/LoadingPage'
import LoginPage from "./pages/LoginPage"
import SignInPage from './pages/SignInPage'
import HomePage from './pages/HomePage'
import ProductPage from './pages/ProductPage'

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) return <LoadingPage />
  return (
    <Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/login/signin" element={<SignInPage />} />

  <Route
    path="/"
    element={
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    }
  />
  <Route
    path="/products/:id"
    element={
      <ProtectedRoute>
        <ProductPage />
      </ProtectedRoute>
    }
  />
</Routes>
  )
}

export default App
