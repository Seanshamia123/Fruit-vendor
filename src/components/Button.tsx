import React from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  full?: boolean
}

const base = 'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed'
const variants: Record<Variant, string> = {
  primary: 'bg-amber-400 text-black hover:bg-amber-500 focus:ring-amber-500',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-300',
  ghost: 'bg-transparent text-gray-900 hover:bg-gray-100 border border-gray-300 focus:ring-gray-300',
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', full, className = '', children, ...props }) => {
  return (
    <button
      {...props}
      className={`${base} ${variants[variant]} ${full ? 'w-full' : ''} ${className}`.trim()}
    >
      {children}
    </button>
  )
}

export default Button
