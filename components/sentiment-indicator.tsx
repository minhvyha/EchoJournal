"use client"

import { Card } from "@/components/ui/card"

type Sentiment = "positive" | "neutral" | "reflective"

interface SentimentIndicatorProps {
  sentiment: Sentiment
}

const sentimentConfig = {
  positive: {
    bg: "bg-emerald-50 border-emerald-200",
    label: "Positive",
    color: "text-emerald-600",
  },
  neutral: {
    bg: "bg-slate-50 border-slate-200",
    label: "Neutral",
    color: "text-slate-600",
  },
  reflective: {
    bg: "bg-purple-50 border-purple-200",
    label: "Reflective",
    color: "text-purple-600",
  },
}

export default function SentimentIndicator({ sentiment }: SentimentIndicatorProps) {
  const config = sentimentConfig[sentiment]

  return (
    <Card className={`border ${config.bg} px-4 py-3`}>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${config.color}`} />
        <span className={`text-sm font-medium ${config.color}`}>{config.label} Sentiment</span>
      </div>
    </Card>
  )
}
