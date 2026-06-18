function CategoryFilter({ categories, selected, onSelect }) {
  return (
    <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
         className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ${
            selected === cat
              ? 'bg-blue-600 text-white'
              : 'border border-gray-300 text-gray-600'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}

export default CategoryFilter