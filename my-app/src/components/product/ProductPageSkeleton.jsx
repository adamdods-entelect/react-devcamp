function ProductPageSkeleton() {
  return (
    <main className="mx-auto max-w-5xl animate-pulse">
      {/* top bar: real back arrow + title placeholder */}
      <header className="flex items-center gap-3 p-4">
        <span className="text-xl text-gray-700">←</span>
        <div className="h-4 w-44 rounded bg-gray-200" />
      </header>

      {/* product image */}
      <div className="mx-4 h-72 rounded-2xl bg-gray-200" />

      {/* title (two lines) */}
      <div className="mt-5 space-y-2 px-4">
        <div className="h-5 w-4/5 rounded bg-gray-200" />
        <div className="h-5 w-1/2 rounded bg-gray-200" />
      </div>

      {/* description (three lines) */}
      <div className="mt-5 space-y-2 px-4">
        <div className="h-3 w-11/12 rounded bg-gray-200" />
        <div className="h-3 w-3/5 rounded bg-gray-200" />
        <div className="h-3 w-4/5 rounded bg-gray-200" />
      </div>

      {/* divider */}
      <div className="mx-4 mt-5 border-t border-gray-100" />

      {/* related heading */}
      <div className="mt-5 px-4">
        <div className="h-4 w-3/4 rounded bg-gray-200" />
      </div>

      {/* related cards (horizontal, second one peeking) */}
      <div className="mt-4 flex gap-4 overflow-hidden px-4">
        <div className="shrink-0">
          <div className="h-28 w-52 rounded-2xl bg-gray-200" />
          <div className="mt-2 h-3 w-1/2 rounded bg-gray-200" />
        </div>
        <div className="shrink-0">
          <div className="h-28 w-52 rounded-2xl bg-gray-200" />
          <div className="mt-2 h-3 w-1/2 rounded bg-gray-200" />
        </div>
      </div>

      {/* price placeholder + disabled add-to-cart */}
      <div className="mt-6 flex items-center justify-between border-t border-gray-100 p-4">
        <div className="h-3 w-20 rounded bg-gray-200" />
        <button
          disabled
          className="rounded-full bg-gray-200 px-8 py-3 font-medium text-gray-400"
        >
          Add to cart
        </button>
      </div>
    </main>
  )
}

export default ProductPageSkeleton
