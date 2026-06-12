import splash from '../assets/splash.png'

function LoadingPage() {
  return (
    <div
      className="flex h-svh items-center justify-center overflow-hidden bg-[#0a3a5c]"
      role="status"
      aria-label="Loading InsureTechGuard"
    >
      <img className="block h-full w-full object-cover" src={splash} alt="InsureTechGuard" />
    </div>
  )
}

export default LoadingPage
