import styles from './ActualTargetChart.module.css'

type ActualTargetChartProps = {
  actual: number
  target: number
}

const ActualTargetChart = ({ actual, target }: ActualTargetChartProps) => {
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const actualRatio = Math.min(actual / target, 1)
  const dashOffset = circumference * (1 - actualRatio)
  const progressPercentage = Math.round(actualRatio * 100)
  const progressWidth = 120 * actualRatio

  return (
    <div className={styles.chartContainer}>
      <figure className={styles.figure}>
        <svg className={styles.svg} viewBox="0 0 180 180" role="img" aria-label="Actual vs Target sales">
          <circle className={styles.targetCircle} cx="90" cy="90" r={radius} />
          <circle
            className={styles.actualCircle}
            cx="90"
            cy="90"
            r={radius}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <figcaption className={styles.centerLabel}>KSH {actual.toLocaleString()}</figcaption>
      </figure>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={`${styles.legendSwatch} ${styles.swatchTarget}`} />
          <span>Target</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendSwatch} ${styles.swatchActual}`} />
          <span>Actual</span>
        </div>
        <svg className={styles.progressFigure} viewBox="0 0 120 12" role="presentation" aria-hidden>
          <rect className={styles.progressTrack} x="0" y="2" width="120" height="8" rx="4" />
          <rect className={styles.progressValue} x="0" y="2" width={progressWidth} height="8" rx="4" />
        </svg>
        <span>{progressPercentage}% of target</span>
      </div>
    </div>
  )
}

export default ActualTargetChart
