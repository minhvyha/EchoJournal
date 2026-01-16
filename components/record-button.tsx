"use client"

import { Microscope as Microphone } from "lucide-react"

interface RecordButtonProps {
  isRecording: boolean
  onClick: () => void
}

export default function RecordButton({ isRecording, onClick }: RecordButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`relative w-30 h-30 rounded-full flex items-center justify-center transition-all duration-300 ${
        isRecording
          ? "bg-red-500 shadow-lg shadow-red-500/50 scale-105"
          : "bg-slate-200 hover:bg-slate-300 shadow-md hover:shadow-lg"
      }`}
    >
      {isRecording && (
        <>
          <span className="absolute inset-0 rounded-full bg-red-500 animate-pulse opacity-75" />
          <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-50" />
        </>
      )}

      <Microphone
        size={34}
        className={`relative z-10 transition-colors ${isRecording ? "text-white" : "text-slate-600"}`}
      />
    </button>
  )
}
