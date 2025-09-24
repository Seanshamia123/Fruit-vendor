import React from 'react'
import styles from './Button.module.css'

type Variant = 'primary' | 'secondary' | 'ghost'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  full?: boolean
}

const variantClass: Record<Variant, string> = {
  primary: styles.buttonPrimary,
  secondary: styles.buttonSecondary,
  ghost: styles.buttonGhost,
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', full, className = '', children, ...props }) => {
  const classes = [styles.button, variantClass[variant], full ? styles.buttonFull : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <button {...props} className={classes}>
      {children}
    </button>
  )
}

export default Button
