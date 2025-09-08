import React from 'react'

type Props = {
  step: number
  total: number
}

const Dot = ({ active }: { active: boolean }) => (
  <span
    className={`inline-block h-2 w-2 rounded-full ${active ? 'bg-blue-600' : 'bg-gray-300'}`}
  />
)

const StepperFooter: React.FC<Props> = ({ step, total }) => {
  return (
    <div className="flex flex-col items-center gap-2 text-xs text-gray-500">
      <div className="flex items-center gap-2">
        {Array.from({ length: total }).map((_, idx) => (
          <Dot key={idx} active={idx + 1 === step} />
        ))}
      </div>
      <div>{`Step ${step} of ${total}`}</div>
    </div>
  )
}

export default StepperFooter

