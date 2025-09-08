import React from 'react'

type ChipProps = {
  label: string
  selected?: boolean
  onClick?: () => void
  className?: string
}

const Chip: React.FC<ChipProps> = ({ label, selected = false, onClick, className = '' }) => {
  const base = 'w-full h-16 rounded-xl border flex items-center justify-center text-sm font-medium transition duration-200 transform select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400'
  const selectedCls = 'bg-amber-400 text-black border-amber-400 shadow-sm scale-[1.02]'
  const normalCls = 'bg-white text-gray-900 border-gray-300 hover:border-gray-400 hover:scale-[1.02]'

  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`${base} ${selected ? selectedCls : normalCls} ${className}`}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

export default Chip
