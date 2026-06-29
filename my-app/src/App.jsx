import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'

import ProtectedRoute from './components/ProtectedRoute'
import LoadingPage from './pages/LoadingPage'
import LoginPage from "./pages/LoginPage"
import SignInPage from './pages/SignInPage'
import RegisterPage from './pages/RegisterPage'
import KycPage from './pages/KycPage'
import HomePage from './pages/HomePage'
import ProductPage from './pages/ProductPage'
import ProductGridPage from './pages/ProductGridPage'
import AccountPage from './pages/AccountPage'
import SubscriptionsPage from './pages/SubscriptionsPage'
import CartPage from './pages/CartPage'
import PaymentMethodPage from './pages/checkout/PaymentMethodPage'
import AddCardPage from './pages/checkout/AddCardPage'
import OrderSummaryPage from './pages/checkout/OrderSummaryPage'
import OrderSuccessPage from './pages/checkout/OrderSuccessPage'
import { getNewArrivals } from './utils/productSections'

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
      <Route path="/register" element={<RegisterPage /> } />
      <Route path="/kyc" element={<KycPage />} />

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
      <Route
        path="/recommended"
        element={
          <ProtectedRoute>
            <ProductGridPage title="Recommended to you" eligibleOnly />
          </ProtectedRoute>
        }
      />
      <Route
        path="/new-arrivals"
        element={
          <ProtectedRoute>
            <ProductGridPage title="New arrivals" select={getNewArrivals} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/account"
        element={
          <ProtectedRoute allowGuest={false}>
            <AccountPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscriptions"
        element={
          <ProtectedRoute allowGuest={false}>
            <SubscriptionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute allowGuest={false}>
            <PaymentMethodPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout/add-card"
        element={
          <ProtectedRoute allowGuest={false}>
            <AddCardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout/summary"
        element={
          <ProtectedRoute allowGuest={false}>
            <OrderSummaryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout/success"
        element={
          <ProtectedRoute allowGuest={false}>
            <OrderSuccessPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
