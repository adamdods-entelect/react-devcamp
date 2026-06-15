const offers = [
  { id: 1, title: 'All Mobile Device Contracts', subtitle: 'Various models available', discount: '25% off' },
  { id: 2, title: 'Home Insurance Bundle', subtitle: 'Protect what matters', discount: '10% off' },
]

function FeaturedBanner({ loading }) {
  if (loading) {
    return (
      <div className="-mx-4 flex animate-pulse gap-4 overflow-x-auto px-4 pb-1 pt-4">
        <div className="h-44 w-[85%] shrink-0 rounded-2xl bg-gray-200" />
        <div className="h-44 w-[85%] shrink-0 rounded-2xl bg-gray-200" />
      </div>
    )
  }

  return (
    <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-1 pt-4">
      {offers.map((offer) => (
        <div
          key={offer.id}
          className="relative flex h-44 w-[85%] shrink-0 flex-col justify-end overflow-hidden rounded-2xl p-4 text-white"
        >
          <img
            src={offer.image || 'https://picsum.photos/300'}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />

          <span className="relative mb-2 w-fit rounded bg-blue-500 px-2 py-1 text-xs font-semibold">
            {offer.discount}
          </span>
          <h2 className="relative text-lg font-bold">{offer.title}</h2>
          <div className="relative mt-1 flex items-center justify-between">
            <p className="text-sm text-gray-200">{offer.subtitle}</p>
            <button className="rounded-full border border-white/60 px-3 py-1 text-xs">
              View offers
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default FeaturedBanner
