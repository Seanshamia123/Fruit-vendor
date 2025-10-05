import React from 'react'
import styles from './StepperFooter.module.css'

type Props = {
  step: number
  total: number
}

const StepperFooter: React.FC<Props> = ({ step, total }) => (
  <div className={styles.footer}>
    <div className={styles.dots}>
      {Array.from({ length: total }).map((_, index) => (
        <span
          
          key={index}
          className={`${styles.dot} ${index + 1 === step ? styles.dotActive : ''}`}
        />
      ))}
    </div>
    <span>
      Step {step} of {total}
    </span>
  </div>
)

export default StepperFooter

