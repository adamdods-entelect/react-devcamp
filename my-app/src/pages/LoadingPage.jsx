import splash from '../assets/splash.png'
import logo from '../assets/logo-login.png'

function LoadingPage() {
  return (
    <div
      className="flex h-svh items-center justify-center overflow-hidden bg-[#0a3a5c]"
      role="status"
      aria-label="Loading InsureTechGuard"
    >
      {/* mobile: full-bleed splash art (sharp at phone size) */}
      <img className="block h-full w-full object-cover md:hidden" src={splash} alt="InsureTechGuard" />

      {/* desktop: logo + wordmark on the brand colour, so the phone-res photo isn't upscaled */}
      <div className="hidden flex-col items-center md:flex">
        <img src={logo} alt="" className="h-20 w-20 object-contain" />
        <p className="mt-4 text-3xl tracking-wide text-white">
          InsureTech<span className="font-bold">Guard</span>
        </p>
      </div>
    </div>
  )
}

export default LoadingPage
