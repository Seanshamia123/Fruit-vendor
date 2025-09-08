import React from 'react'
import { useNavigate } from 'react-router-dom'

type TopBarProps = {
  onBack?: () => void
}

const TopBar: React.FC<TopBarProps> = ({ onBack }) => {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) onBack()
    else navigate(-1)
  }

  return (
    <div className="h-12 flex items-center">
      <button
        aria-label="Go back"
        onClick={handleBack}
        className="p-2 rounded-full hover:bg-gray-100"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
    </div>
  )
}

export default TopBar

