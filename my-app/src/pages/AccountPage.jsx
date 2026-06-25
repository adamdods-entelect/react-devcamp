import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, User, CheckCircle2, Circle } from 'lucide-react'
import TopNav from '../components/home/TopNav'
import BottomNav from '../components/home/BottomNav'
import useAuth from '../hooks/useAuth'
import { getProfile } from '../services/profile'
import { getKycStatus } from '../services/kycStorage'
import { auth } from '../services/firebase'

// Shows last 4 digits of the SA ID, masking the rest.
function maskId(idNumber) {
  if (!idNumber) return null
  const last4 = idNumber.slice(-4)
  return `${'•'.repeat(Math.max(0, idNumber.length - 4))}${last4}`
}

function AccountPage() {
  const navigate = useNavigate()
  const { status, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [kyc, setKyc] = useState(null) // null = loading, else { residence, selfie }

  useEffect(() => {
    let active = true
    getProfile()
      .then((p) => active && setProfile(p))
      .catch(() => active && setProfile(null))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  // Once we know the customer id, check which KYC documents they've uploaded.
  useEffect(() => {
    if (!profile?.id) return
    let active = true
    getKycStatus(profile.id).then((s) => active && setKyc(s))
    return () => {
      active = false
    }
  }, [profile?.id])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Backend profile is the source of truth; fall back to the Firebase user
  // (e.g. a Google session whose backend call failed or isn't provisioned).
  const fbUser = auth.currentUser
  const name =
    [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || fbUser?.displayName || ''
  const email = profile?.username || profile?.email || fbUser?.email || ''
  const isGuest = status === 'guest'

  const details = [
    { label: 'Name', value: name },
    { label: 'Email', value: email },
    { label: 'ID number', value: maskId(profile?.idNumber) },
    { label: 'Customer type', value: profile?.customerType?.name },
  ].filter((d) => d.value)

  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-6 md:pb-8">
        <h1 className="text-2xl font-bold">Account</h1>

        {/* avatar + name header */}
        <div className="mt-6 flex items-center gap-4">
          {fbUser?.photoURL ? (
            <img src={fbUser.photoURL} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <User className="h-8 w-8" />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{name || (isGuest ? 'Guest' : 'Your account')}</p>
            {email && <p className="truncate text-sm text-gray-500">{email}</p>}
          </div>
        </div>

        {/* details */}
        <div className="mt-8">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          ) : isGuest ? (
            <p className="text-sm text-gray-500">
              You&apos;re browsing as a guest. Log in or create an account to see your details.
            </p>
          ) : details.length ? (
            <dl className="divide-y divide-gray-200 rounded-xl border border-gray-200">
              {details.map((d) => (
                <div key={d.label} className="flex items-center justify-between px-4 py-3">
                  <dt className="text-sm text-gray-500">{d.label}</dt>
                  <dd className="max-w-[60%] truncate text-right text-sm font-medium text-gray-900">{d.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-gray-500">We couldn&apos;t load your account details. Please try again later.</p>
          )}
        </div>

        {/* KYC document status */}
        {!isGuest && profile?.id && (
          <div className="mt-8">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">Documents</h2>
              {kyc && !(kyc.residence && kyc.selfie) && (
                <Link to="/kyc" className="text-sm font-semibold text-cyan-600">
                  Verify now
                </Link>
              )}
            </div>
            <dl className="divide-y divide-gray-200 rounded-xl border border-gray-200">
              <DocRow label="Proof of residence" url={kyc?.residence} loading={!kyc} />
              <DocRow label="Selfie" url={kyc?.selfie} loading={!kyc} />
            </dl>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-full border border-red-200 py-3 font-semibold text-red-600"
        >
          <LogOut className="h-5 w-5" />
          Log out
        </button>
      </main>
      <BottomNav />
    </>
  )
}

function DocRow({ label, url, loading }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-gray-700">{label}</span>
      {loading ? (
        <span className="h-4 w-24 animate-pulse rounded bg-gray-100" />
      ) : url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm font-medium text-cyan-600"
        >
          <CheckCircle2 className="h-4 w-4 text-green-600" /> View
        </a>
      ) : (
        <span className="flex items-center gap-1.5 text-sm text-gray-400">
          <Circle className="h-4 w-4" /> Not uploaded
        </span>
      )}
    </div>
  )
}

export default AccountPage
