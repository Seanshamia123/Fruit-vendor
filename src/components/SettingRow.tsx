import React from 'react'

type Props = {
  label: string
  children: React.ReactNode
}

const SettingRow: React.FC<Props> = ({ label, children }) => {
  return (
    <div className="w-full border rounded-2xl bg-white p-4 flex items-center justify-between gap-4">
      <div className="text-gray-700 font-medium">{label}</div>
      <div className="min-w-[140px]">{children}</div>
    </div>
  )
}

export default SettingRow

