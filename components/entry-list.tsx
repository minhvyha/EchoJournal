"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { blendMoodsToHSL, type Mood } from "@/utils/moodColor"

type Sentiment = "positive" | "neutral" | "reflective"

interface Entry {
  id: string
  text: string
  sentiment: Sentiment
  timestamp: string
  moods?: Mood[]
}

interface EntryListProps {
  entries: Entry[]
  onDelete: (id: string) => void
}

const sentimentToMoods: Record<Sentiment, Mood[]> = {
  positive: [
    { label: "joy", score: 0.6 },
    { label: "optimism", score: 0.3 },
    { label: "gratitude", score: 0.1 },
  ],
  neutral: [
    { label: "neutral", score: 0.8 },
    { label: "curiosity", score: 0.2 },
  ],
  reflective: [
    { label: "sadness", score: 0.4 },
    { label: "caring", score: 0.3 },
    { label: "curiosity", score: 0.3 },
  ],
}

export default function EntryList({ entries, onDelete }: EntryListProps) {
  return (
    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
      {entries.map((entry) => {
        const moods = entry.moods ?? sentimentToMoods[entry.sentiment]
        const { h, s, l } = blendMoodsToHSL(moods)

        const lightenedL = Math.min(85, l + 20)
        const bgGradient = `linear-gradient(325deg, hsla(${h}, ${Math.min(s + 10, 70)}%, ${lightenedL}%, 0.3) 0%, hsla(${h}, ${Math.max(s - 10, 20)}%, ${lightenedL + 5}%) 100%)`

        const textColor = "rgb(30, 41, 59)" // slate-800
        const secondaryTextColor = "rgb(71, 85, 105)" // slate-600

        return (
          <Card
            key={entry.id}
            className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 backdrop-blur-md"
            style={{
              background: bgGradient,
            }}
          >
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse at top left, hsla(${h}, ${s}%, ${lightenedL + 10}%, 0.5) 0%, transparent 50%)`,
              }}
            />

            <div className="relative p-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed line-clamp-3" style={{ color: textColor }}>
                    {entry.text}
                  </p>
                  <p className="text-xs mt-2" style={{ color: secondaryTextColor }}>
                    {entry.timestamp}
                  </p>
                </div>
                <Button
                  onClick={() => onDelete(entry.id)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-black/10 transition-colors"
                  style={{
                    color: secondaryTextColor,
                  }}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
