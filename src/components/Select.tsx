import React from 'react'

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
}

const Select: React.FC<SelectProps> = ({ label, className = '', children, ...props }) => {
  return (
    <label className="block">
      {label && <div className="text-sm text-gray-600 mb-2">{label}</div>}
      <div className="relative">
        <select
          {...props}
          className={`appearance-none w-full rounded-full bg-amber-400 text-black font-medium px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-amber-500 ${className}`}
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>
    </label>
  )
}

export default Select

