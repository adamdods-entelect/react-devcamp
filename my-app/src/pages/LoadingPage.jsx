import splash from '../assets/splash.png'

function LoadingPage() {
  return (
    <div className="loading-page" role="status" aria-label="Loading InsureTechGuard">
      <img className="loading-image" src={splash} alt="InsureTechGuard" />
    </div>
  )
}

export default LoadingPage
